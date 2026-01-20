import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { attributeOptions, productAttributes } from "../../../shared/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";
import { buildWhere, ownerFilter } from "../utils/ownership";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const attributeUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    code: z.string().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, "No changes provided");

const optionCreateSchema = z.object({
  value: z.string().min(1),
  sortOrder: z.number().int().optional()
});

const optionUpdateSchema = z
  .object({
    value: z.string().min(1).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, "No changes provided");

// Example: { "name": "Material", "sortOrder": 2, "isActive": false }
router.patch(
  "/attributes/:attributeId",
  asyncHandler(async (req, res) => {
    const body = attributeUpdateSchema.parse(req.body);

    const whereClause = buildWhere(
      eq(productAttributes.id, req.params.attributeId),
      ownerFilter(req, productAttributes.ownerUserId)
    );

    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.code !== undefined) update.code = body.code;
    if (body.sortOrder !== undefined) update.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) update.isActive = body.isActive;

    const [updated] = await db
      .update(productAttributes)
      .set(update)
      .where(whereClause!)
      .returning();

    if (!updated) {
      throw new HttpError(404, "Attribute not found", "NOT_FOUND");
    }

    res.json({ attribute: updated });
  })
);

// Example: { "value": "Nylon", "sortOrder": 1 }
router.post(
  "/attributes/:attributeId/options",
  asyncHandler(async (req, res) => {
    const body = optionCreateSchema.parse(req.body);

    const attributeWhere = buildWhere(
      eq(productAttributes.id, req.params.attributeId),
      ownerFilter(req, productAttributes.ownerUserId)
    );

    const [attribute] = await db
      .select()
      .from(productAttributes)
      .where(attributeWhere!)
      .limit(1);

    if (!attribute) {
      throw new HttpError(404, "Attribute not found", "NOT_FOUND");
    }
    if (attribute.ownerUserId !== req.user!.id) {
      throw new HttpError(403, "Forbidden", "FORBIDDEN");
    }

    const existing = await db
      .select()
      .from(attributeOptions)
      .where(buildWhere(eq(attributeOptions.attributeId, attribute.id), eq(attributeOptions.value, body.value))!)
      .limit(1);

    if (existing.length) {
      throw new HttpError(409, "Option already exists", "OPTION_EXISTS");
    }

    const [created] = await db
      .insert(attributeOptions)
      .values({
        ownerUserId: attribute.ownerUserId,
        attributeId: attribute.id,
        value: body.value,
        sortOrder: body.sortOrder ?? 0,
        isActive: true
      })
      .returning();

    if (!created) {
      throw new HttpError(500, "Failed to create option");
    }

    res.status(201).json({ option: created });
  })
);

// Example: { "value": "Cotton", "isActive": false }
router.patch(
  "/options/:optionId",
  asyncHandler(async (req, res) => {
    const body = optionUpdateSchema.parse(req.body);

    const whereClause = buildWhere(
      eq(attributeOptions.id, req.params.optionId),
      ownerFilter(req, attributeOptions.ownerUserId)
    );

    const update: Record<string, unknown> = {};
    if (body.value !== undefined) update.value = body.value;
    if (body.sortOrder !== undefined) update.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) update.isActive = body.isActive;

    const [updated] = await db.update(attributeOptions).set(update).where(whereClause!).returning();

    if (!updated) {
      throw new HttpError(404, "Option not found", "NOT_FOUND");
    }

    res.json({ option: updated });
  })
);

export default router;
