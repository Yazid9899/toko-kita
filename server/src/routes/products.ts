import { Router, type Request } from "express";
import { z } from "zod";
import { db } from "../db";
import { products, productAttributes } from "../../../shared/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";
import { buildWhere, ownerFilter } from "../utils/ownership";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

const attributeSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  sortOrder: z.number().int().optional()
});

const findProduct = async (productId: string, req: Request) => {
  const whereClause = buildWhere(
    eq(products.id, productId),
    ownerFilter(req, products.ownerUserId)
  );

  const [product] = await db.select().from(products).where(whereClause!).limit(1);
  return product;
};

// Example: { "name": "Classic Tee", "description": "Short sleeve" }
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = productSchema.parse(req.body);

    const existing = await db
      .select()
      .from(products)
      .where(buildWhere(eq(products.name, body.name), ownerFilter(req, products.ownerUserId))!)
      .limit(1);

    if (existing.length) {
      throw new HttpError(409, "Product name already exists", "PRODUCT_EXISTS");
    }

    const [created] = await db
      .insert(products)
      .values({
        ownerUserId: req.user!.id,
        name: body.name,
        description: body.description ?? null
      })
      .returning();

    if (!created) {
      throw new HttpError(500, "Failed to create product");
    }

    res.status(201).json({ product: created });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const whereClause = ownerFilter(req, products.ownerUserId);
    const list = whereClause
      ? await db.select().from(products).where(whereClause)
      : await db.select().from(products);

    res.json({ products: list });
  })
);

// Example: { "name": "Material", "code": "material", "sortOrder": 1 }
router.post(
  "/:productId/attributes",
  asyncHandler(async (req, res) => {
    const body = attributeSchema.parse(req.body);
    const product = await findProduct(req.params.productId, req);
    if (!product) {
      throw new HttpError(404, "Product not found", "NOT_FOUND");
    }
    if (product.ownerUserId !== req.user!.id) {
      throw new HttpError(403, "Forbidden", "FORBIDDEN");
    }

    const [created] = await db
      .insert(productAttributes)
      .values({
        ownerUserId: req.user!.id,
        productId: product.id,
        name: body.name,
        code: body.code ?? null,
        sortOrder: body.sortOrder ?? 0,
        isActive: true
      })
      .returning();

    if (!created) {
      throw new HttpError(500, "Failed to create attribute");
    }

    res.status(201).json({ attribute: created });
  })
);

export default router;
