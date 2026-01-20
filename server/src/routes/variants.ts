import { Router } from "express";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import {
  attributeOptions,
  productAttributes,
  products,
  variantOptionValues,
  variantPrices,
  variants
} from "../../../shared/schema";
import { db } from "../db";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";
import { buildWhere, ownerFilter } from "../utils/ownership";
import { buildVariantKey } from "../utils/variantKey";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const selectionSchema = z.object({
  attributeId: z.string().min(1),
  optionId: z.string().min(1)
});

const variantSchema = z.object({
  sku: z.string().min(1),
  unit: z.string().min(1).optional(),
  selections: z.array(selectionSchema).min(1)
});

const priceSchema = z
  .object({
    personalCents: z.number().int().min(0).optional(),
    resellerCents: z.number().int().min(0).optional()
  })
  .refine((data) => Object.keys(data).length > 0, "No price updates provided");

const findProduct = async (productId: string, req: Parameters<typeof router.post>[1]) => {
  const whereClause = buildWhere(eq(products.id, productId), ownerFilter(req, products.ownerUserId));
  const [product] = await db.select().from(products).where(whereClause!).limit(1);
  return product;
};

const findVariant = async (variantId: string, req: Parameters<typeof router.post>[1]) => {
  const whereClause = buildWhere(eq(variants.id, variantId), ownerFilter(req, variants.ownerUserId));
  const [variant] = await db.select().from(variants).where(whereClause!).limit(1);
  return variant;
};

// Example:
// { "sku": "TEE-RED-S", "unit": "piece", "selections": [{"attributeId":"...","optionId":"..."}] }
router.post(
  "/products/:productId/variants",
  asyncHandler(async (req, res) => {
    const body = variantSchema.parse(req.body);

    const product = await findProduct(req.params.productId, req);
    if (!product) {
      throw new HttpError(404, "Product not found", "NOT_FOUND");
    }
    if (product.ownerUserId !== req.user!.id) {
      throw new HttpError(403, "Forbidden", "FORBIDDEN");
    }

    const attributeIds = body.selections.map((item) => item.attributeId);
    const optionIds = body.selections.map((item) => item.optionId);

    const uniqueAttributeIds = Array.from(new Set(attributeIds));
    if (uniqueAttributeIds.length !== attributeIds.length) {
      throw new HttpError(400, "Duplicate attribute selections", "INVALID_SELECTIONS");
    }

    const attributes = await db
      .select()
      .from(productAttributes)
      .where(
        buildWhere(
          eq(productAttributes.productId, product.id),
          inArray(productAttributes.id, uniqueAttributeIds),
          eq(productAttributes.isActive, true),
          ownerFilter(req, productAttributes.ownerUserId)
        )!
      );

    if (attributes.length !== uniqueAttributeIds.length) {
      throw new HttpError(400, "Invalid attributes", "INVALID_SELECTIONS");
    }

    const options = await db
      .select()
      .from(attributeOptions)
      .where(
        buildWhere(
          inArray(attributeOptions.id, optionIds),
          eq(attributeOptions.isActive, true),
          ownerFilter(req, attributeOptions.ownerUserId)
        )!
      );

    if (options.length !== optionIds.length) {
      throw new HttpError(400, "Invalid options", "INVALID_SELECTIONS");
    }

    const optionById = new Map(options.map((option) => [option.id, option]));

    for (const selection of body.selections) {
      const option = optionById.get(selection.optionId);
      if (!option || option.attributeId !== selection.attributeId) {
        throw new HttpError(400, "Option does not match attribute", "INVALID_SELECTIONS");
      }
    }

    let variantKey: string;
    try {
      variantKey = buildVariantKey(body.selections);
    } catch (error) {
      throw new HttpError(400, (error as Error).message, "INVALID_SELECTIONS");
    }

    const existingSku = await db
      .select()
      .from(variants)
      .where(buildWhere(eq(variants.sku, body.sku), ownerFilter(req, variants.ownerUserId))!)
      .limit(1);

    if (existingSku.length) {
      throw new HttpError(409, "SKU already exists", "SKU_EXISTS");
    }

    const existingVariant = await db
      .select()
      .from(variants)
      .where(
        buildWhere(
          eq(variants.productId, product.id),
          eq(variants.variantKey, variantKey),
          ownerFilter(req, variants.ownerUserId)
        )!
      )
      .limit(1);

    if (existingVariant.length) {
      throw new HttpError(409, "Variant already exists", "VARIANT_EXISTS");
    }

    const created = await db.transaction(async (tx) => {
      const [variant] = await tx
        .insert(variants)
        .values({
          ownerUserId: req.user!.id,
          productId: product.id,
          sku: body.sku,
          unit: body.unit ?? "piece",
          variantKey
        })
        .returning();

      if (!variant) {
        throw new HttpError(500, "Failed to create variant");
      }

      await tx.insert(variantOptionValues).values(
        body.selections.map((selection) => ({
          variantId: variant.id,
          attributeId: selection.attributeId,
          optionId: selection.optionId,
          ownerUserId: req.user!.id
        }))
      );

      return variant;
    });

    res.status(201).json({ variant: created });
  })
);

// Example: { "personalCents": 1999, "resellerCents": 1499 }
router.put(
  "/variants/:variantId/prices",
  asyncHandler(async (req, res) => {
    const body = priceSchema.parse(req.body);

    const variant = await findVariant(req.params.variantId, req);
    if (!variant) {
      throw new HttpError(404, "Variant not found", "NOT_FOUND");
    }

    const ownerUserId = variant.ownerUserId;

    const updated = await db.transaction(async (tx) => {
      const results: Array<{ customerType: string; priceCents: number }> = [];

      if (body.personalCents !== undefined) {
        await tx
          .insert(variantPrices)
          .values({
            ownerUserId,
            variantId: variant.id,
            customerType: "personal",
            priceCents: body.personalCents
          })
          .onConflictDoUpdate({
            target: [variantPrices.variantId, variantPrices.customerType],
            set: { priceCents: body.personalCents, updatedAt: new Date() }
          });
        results.push({ customerType: "personal", priceCents: body.personalCents });
      }

      if (body.resellerCents !== undefined) {
        await tx
          .insert(variantPrices)
          .values({
            ownerUserId,
            variantId: variant.id,
            customerType: "reseller",
            priceCents: body.resellerCents
          })
          .onConflictDoUpdate({
            target: [variantPrices.variantId, variantPrices.customerType],
            set: { priceCents: body.resellerCents, updatedAt: new Date() }
          });
        results.push({ customerType: "reseller", priceCents: body.resellerCents });
      }

      return results;
    });

    res.json({ prices: updated });
  })
);

export default router;
