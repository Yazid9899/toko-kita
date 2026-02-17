import "dotenv/config";
import {
  brands,
  products,
  productAttributes,
  attributeOptions,
  productVariants,
  variantOptionValues,
  variantPrices,
  procurements,
  type Product,
  type ProductAttribute,
  type AttributeOption,
} from "../shared/schema";
import { db } from "../server/db";
import { and, eq, isNull } from "drizzle-orm";

type AttributeDef = {
  code: string;
  name: string;
  sortOrder: number;
  options: string[];
};

type VariantDef = {
  material: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  procurement_qty: number;
};

const CURRENCY = "IDR";
const UNIT = "piece";
const PRODUCT_NAME = "Legatto-LGH";
const PRODUCT_DESCRIPTION = "Legatto handbag line";
const PROCUREMENT_SEED_NOTE = "seed:product-variant-base-stock";
const procurementCapitalCentsBySku: Record<string, number> = {
  "LGH-PU-S-SI": 379300,
  "LGH-PU-S-BK": 379300,
  "LGH-PU-M-SI": 509200,
  "LGH-PU-M-BL": 509200,
  "LGH-PU-M-BE": 509200,
  "LGH-PU-L-BL": 519200,
  "LGH-PU-L-BK": 519200,
  "LGH-NY-S-PPI": 313900,
  "LGH-NY-S-PI/GY": 542800,
  "LGH-NY-S-PI/BR": 542800,
  "LGH-NY-S-OLV": 313900,
  "LGH-NY-S-NV": 313900,
  "LGH-NY-S-MGR/IV": 542800,
  "LGH-NY-S-MGR": 313900,
  "LGH-NY-S-LGA": 313900,
  "LGH-NY-S-LBR": 313900,
  "LGH-NY-S-LB/DB": 542800,
  "LGH-NY-S-IVB": 313900,
  "LGH-NY-S-IV": 313900,
  "LGH-NY-S-GY": 313900,
  "LGH-NY-S-DG/NV": 542800,
  "LGH-NY-S-BRA": 313900,
  "LGH-NY-S-BK": 313900,
  "LGH-NY-S-BE": 313900,
  "LGH-NY-M-SGY": 389300,
  "LGH-NY-M-RBL": 389300,
  "LGH-NY-M-PUA": 389300,
  "LGH-NY-M-PPI": 389300,
  "LGH-NY-M-OLV": 389300,
  "LGH-NY-M-NV": 389300,
  "LGH-NY-M-MUS": 389300,
  "LGH-NY-M-LBR": 389300,
  "LGH-NY-M-IVB": 389300,
  "LGH-NY-M-ICY": 389300,
  "LGH-NY-M-GY": 389300,
  "LGH-NY-MC-LV": 319800,
  "LGH-NY-MC-BK": 319800,
  "LGH-NY-M-BRA": 389300,
  "LGH-NY-M-BK": 389300,
  "LGH-NY-M-BE": 389300,
  "LGH-NY-L-SGY": 399300,
  "LGH-NY-L-RBL": 399300,
  "LGH-NY-L-PUA": 399300,
  "LGH-NY-L-PPI": 399300,
  "LGH-NY-L-PIA": 399300,
  "LGH-NY-L-OLV": 399300,
  "LGH-NY-L-NV": 399300,
  "LGH-NY-L-LV": 399300,
  "LGH-NY-L-LBR": 399300,
  "LGH-NY-L-ICY": 399300,
  "LGH-NY-L-GY": 399300,
  "LGH-NY-L-BRA": 399300,
  "LGH-NY-L-BKB": 399300,
  "LGH-NY-L-BK": 399300,
  "LGH-NY-L-BE": 399300,
  "LGH-NY-CABIN-NV": 1024700,
  "LGH-NY-CABIN-BK": 1024700,
  "LGH-NY-BPO-BK": 970200,
  "LGH-NY-BPO-NV": 970200,
  "LGH-NY-BPK-BK": 610500,
  "LGH-NY-BPK-BE": 610500,
  "LGH-LW-BPK-BR": 654100,
  "LGH-LW-BAG-BR": 507850,
};

const attributes: AttributeDef[] = [
  {
    code: "material",
    name: "Material",
    sortOrder: 1,
    options: ["Nylon", "PU Leather", "Light Weight"],
  },
  {
    code: "size",
    name: "Size",
    sortOrder: 2,
    options: ["Small", "Medium", "Large", "Micro", "Cabin", "BackPack", "BackPack Oval", "Bag" ],
  },
  {
    code: "color",
    name: "Color",
    sortOrder: 3,
    options: [
  "Black",
  "Beige",
  "Blue",
  "Gray",
  "Light Gray",
  "Olive",
  "Navy",
  "Light Brown",
  "Dark Brown",
  "Brown",
  "Icy Blue",
  "Lavender",
  "Pale Pink",
  "Purple",
  "Ivory",
  "Ivory handle brown",
  "Mustard",
  "Mint",
  "Peach",
  "Silver Gray",
  "Rare Blue",
  "Mint/Ivory",
  "Dark Green/Navy",
  "Pink/Brown",
  "Pink/Gray",
  "Blue/Dark Brown",
  "Silver",
  "Black handle brown",
],
  },
];

const variants: VariantDef[] = [
  // ───────── SMALL / PU ─────────
  { material: "PU Leather", size: "Small", color: "Silver", sku: "LGH-PU-S-SI", price: 665000, procurement_qty: 4 },
  { material: "PU Leather", size: "Small", color: "Black", sku: "LGH-PU-S-BK", price: 665000, procurement_qty: 1 },

  // ───────── MEDIUM / PU ─────────
  { material: "PU Leather", size: "Medium", color: "Silver", sku: "LGH-PU-M-SI", price: 780000, procurement_qty: 2 },
  { material: "PU Leather", size: "Medium", color: "Blue", sku: "LGH-PU-M-BL", price: 780000, procurement_qty: 2 },
  { material: "PU Leather", size: "Medium", color: "Beige", sku: "LGH-PU-M-BE", price: 780000, procurement_qty: 1 },

  // ───────── LARGE / PU ─────────
  { material: "PU Leather", size: "Large", color: "Blue", sku: "LGH-PU-L-BL", price: 800000, procurement_qty: 1 },
  { material: "PU Leather", size: "Large", color: "Black", sku: "LGH-PU-L-BK", price: 800000, procurement_qty: 2 },

  // ───────── SMALL / NYLON ─────────
  { material: "Nylon", size: "Small", color: "Pink/Gray", sku: "LGH-NY-S-PI/GY", price: 750000, procurement_qty: 3 },
  { material: "Nylon", size: "Small", color: "Pale Pink", sku: "LGH-NY-S-PPI", price: 590000, procurement_qty: 1 },
  { material: "Nylon", size: "Small", color: "Pink/Brown", sku: "LGH-NY-S-PI/BR", price: 750000, procurement_qty: 7 },
  { material: "Nylon", size: "Small", color: "Olive", sku: "LGH-NY-S-OLV", price: 590000, procurement_qty: 7 },
  { material: "Nylon", size: "Small", color: "Navy", sku: "LGH-NY-S-NV", price: 590000, procurement_qty: 4 },
  { material: "Nylon", size: "Small", color: "Mint/Ivory", sku: "LGH-NY-S-MGR/IV", price: 750000, procurement_qty: 5 },
  { material: "Nylon", size: "Small", color: "Mint", sku: "LGH-NY-S-MGR", price: 590000, procurement_qty: 0 },
  { material: "Nylon", size: "Small", color: "Light Gray", sku: "LGH-NY-S-LGA", price: 590000, procurement_qty: 7 },
  { material: "Nylon", size: "Small", color: "Light Brown", sku: "LGH-NY-S-LBR", price: 590000, procurement_qty: 1 },
  { material: "Nylon", size: "Small", color: "Blue/Dark Brown", sku: "LGH-NY-S-LB/DB", price: 750000, procurement_qty: 11 },
  { material: "Nylon", size: "Small", color: "Ivory handle brown", sku: "LGH-NY-S-IVB", price: 590000, procurement_qty: 6 },
  { material: "Nylon", size: "Small", color: "Ivory", sku: "LGH-NY-S-IV", price: 590000, procurement_qty: 1 },
  { material: "Nylon", size: "Small", color: "Gray", sku: "LGH-NY-S-GY", price: 590000, procurement_qty: 7 },
  { material: "Nylon", size: "Small", color: "Dark Green/Navy", sku: "LGH-NY-S-DG/NV", price: 750000, procurement_qty: 11 },
  { material: "Nylon", size: "Small", color: "Dark Brown", sku: "LGH-NY-S-BRA", price: 590000, procurement_qty: 2 },
  { material: "Nylon", size: "Small", color: "Black", sku: "LGH-NY-S-BK", price: 590000, procurement_qty: 10 },
  { material: "Nylon", size: "Small", color: "Beige", sku: "LGH-NY-S-BE", price: 590000, procurement_qty: 11 },

  // ───────── MEDIUM / NYLON ─────────
  { material: "Nylon", size: "Medium", color: "Silver Gray", sku: "LGH-NY-M-SGY", price: 680000, procurement_qty: 0 },
  { material: "Nylon", size: "Medium", color: "Rare Blue", sku: "LGH-NY-M-RBL", price: 680000, procurement_qty: 1 },
  { material: "Nylon", size: "Medium", color: "Pale Pink", sku: "LGH-NY-M-PPI", price: 680000, procurement_qty: 3 },
  { material: "Nylon", size: "Medium", color: "Olive", sku: "LGH-NY-M-OLV", price: 680000, procurement_qty: 2 },
  { material: "Nylon", size: "Medium", color: "Navy", sku: "LGH-NY-M-NV", price: 680000, procurement_qty: 6 },
  { material: "Nylon", size: "Medium", color: "Mustard", sku: "LGH-NY-M-MUS", price: 680000, procurement_qty: 1 },
  { material: "Nylon", size: "Medium", color: "Light Brown", sku: "LGH-NY-M-LBR", price: 680000, procurement_qty: 8 },
  { material: "Nylon", size: "Medium", color: "Ivory handle brown", sku: "LGH-NY-M-IVB", price: 680000, procurement_qty: 2 },
  { material: "Nylon", size: "Medium", color: "Icy Blue", sku: "LGH-NY-M-ICY", price: 680000, procurement_qty: 2 },
  { material: "Nylon", size: "Medium", color: "Gray", sku: "LGH-NY-M-GY", price: 680000, procurement_qty: 6 },
  { material: "Nylon", size: "Medium", color: "Dark Brown", sku: "LGH-NY-M-BRA", price: 680000, procurement_qty: 2 },
  { material: "Nylon", size: "Medium", color: "Black", sku: "LGH-NY-M-BK", price: 680000, procurement_qty: 8 },
  { material: "Nylon", size: "Medium", color: "Beige", sku: "LGH-NY-M-BE", price: 680000, procurement_qty: 2 },
  { material: "Nylon", size: "Medium", color: "Purple", sku: "LGH-NY-M-PUA", price: 680000, procurement_qty: 1 },

  // ───────── MICRO / NYLON ─────────
  { material: "Nylon", size: "Micro", color: "Lavender", sku: "LGH-NY-MC-LV", price: 566000, procurement_qty: 1 },
  { material: "Nylon", size: "Micro", color: "Black", sku: "LGH-NY-MC-BK", price: 566000, procurement_qty: 2 },

  // ───────── LARGE / NYLON ─────────
  { material: "Nylon", size: "Large", color: "Silver Gray", sku: "LGH-NY-L-SGY", price: 690000, procurement_qty: 1 },
  { material: "Nylon", size: "Large", color: "Rare Blue", sku: "LGH-NY-L-RBL", price: 690000, procurement_qty: 3 },
  { material: "Nylon", size: "Large", color: "Pale Pink", sku: "LGH-NY-L-PPI", price: 690000, procurement_qty: 3 },
  { material: "Nylon", size: "Large", color: "Purple", sku: "LGH-NY-L-PUA", price: 690000, procurement_qty: 1 },
  { material: "Nylon", size: "Large", color: "Peach", sku: "LGH-NY-L-PIA", price: 690000, procurement_qty: 1 },
  { material: "Nylon", size: "Large", color: "Olive", sku: "LGH-NY-L-OLV", price: 690000, procurement_qty: 10 },
  { material: "Nylon", size: "Large", color: "Navy", sku: "LGH-NY-L-NV", price: 690000, procurement_qty: 12 },
  { material: "Nylon", size: "Large", color: "Lavender", sku: "LGH-NY-L-LV", price: 690000, procurement_qty: 3 },
  { material: "Nylon", size: "Large", color: "Light Brown", sku: "LGH-NY-L-LBR", price: 690000, procurement_qty: 8 },
  { material: "Nylon", size: "Large", color: "Icy Blue", sku: "LGH-NY-L-ICY", price: 690000, procurement_qty: 2 },
  { material: "Nylon", size: "Large", color: "Gray", sku: "LGH-NY-L-GY", price: 690000, procurement_qty: 11 },
  { material: "Nylon", size: "Large", color: "Dark Brown", sku: "LGH-NY-L-BRA", price: 690000, procurement_qty: 2 },
  { material: "Nylon", size: "Large", color: "Black handle brown", sku: "LGH-NY-L-BKB", price: 690000, procurement_qty: 1 },
  { material: "Nylon", size: "Large", color: "Black", sku: "LGH-NY-L-BK", price: 690000, procurement_qty: 13 },
  { material: "Nylon", size: "Large", color: "Beige", sku: "LGH-NY-L-BE", price: 690000, procurement_qty: 11 },

  // ───────── CABIN / NYLON ─────────
  { material: "Nylon", size: "Cabin", color: "Navy", sku: "LGH-NY-CABIN-NV", price: 1280000, procurement_qty: 2 },
  { material: "Nylon", size: "Cabin", color: "Black", sku: "LGH-NY-CABIN-BK", price: 1280000, procurement_qty: 1 },

  // ───────── BACKPACK / NYLON ─────────
  { material: "Nylon", size: "BackPack Oval", color: "Black", sku: "LGH-NY-BPO-BK", price: 850000, procurement_qty: 1 },
  { material: "Nylon", size: "BackPack Oval", color: "Navy", sku: "LGH-NY-BPO-NV", price: 850000, procurement_qty: 1 },
  { material: "Nylon", size: "BackPack", color: "Navy", sku: "LGH-NY-BPK-NV", price: 790000, procurement_qty: 0 },
  { material: "Nylon", size: "BackPack", color: "Black", sku: "LGH-NY-BPK-BK", price: 790000, procurement_qty: 2 },
  { material: "Nylon", size: "BackPack", color: "Beige", sku: "LGH-NY-BPK-BE", price: 790000, procurement_qty: 1 },

  // ───────── LIGHT WEIGHT ─────────
  { material: "Light Weight", size: "BackPack", color: "Brown", sku: "LGH-LW-BPK-BR", price: 830000, procurement_qty: 1 },
  { material: "Light Weight", size: "Bag", color: "Brown", sku: "LGH-LW-BAG-BR", price: 695000, procurement_qty: 3 },
];



function normalizeKeyPart(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function buildVariantKey(selections: { attributeCode: string; optionValue: string }[]): string {
  const sorted = [...selections].sort((a, b) => a.attributeCode.localeCompare(b.attributeCode));
  return sorted
    .map(({ attributeCode, optionValue }) => `${normalizeKeyPart(attributeCode)}:${normalizeKeyPart(optionValue)}`)
    .join("|");
}

async function upsertBrand(): Promise<number> {
  const existing = await db.select().from(brands).where(eq(brands.slug, "anello"));
  if (existing.length) return existing[0].id;

  const [created] = await db
    .insert(brands)
    .values({ name: "Anello", slug: "anello" })
    .returning();
  return created.id;
}

async function upsertProduct(brandId: number): Promise<Product> {
  const existing = await db
    .select()
    .from(products)
    .where(and(eq(products.brandId, brandId), eq(products.name, PRODUCT_NAME)));

  if (existing.length) {
    const [updated] = await db
      .update(products)
      .set({
        description: PRODUCT_DESCRIPTION,
        type: "accessory",
        updatedAt: new Date(),
      })
      .where(eq(products.id, existing[0].id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(products)
    .values({
      brandId,
      name: PRODUCT_NAME,
      description: PRODUCT_DESCRIPTION,
      type: "accessory",
    })
    .returning();
  return created;
}

async function upsertAttributes(productId: number): Promise<Map<string, ProductAttribute>> {
  const map = new Map<string, ProductAttribute>();

  for (const attr of attributes) {
    const existing = await db
      .select()
      .from(productAttributes)
      .where(and(eq(productAttributes.productId, productId), eq(productAttributes.code, attr.code)));

    if (existing.length) {
      const [updated] = await db
        .update(productAttributes)
        .set({
          name: attr.name,
          sortOrder: attr.sortOrder,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(productAttributes.id, existing[0].id))
        .returning();
      map.set(attr.code, updated);
    } else {
      const [created] = await db
        .insert(productAttributes)
        .values({
          productId,
          name: attr.name,
          code: attr.code,
          sortOrder: attr.sortOrder,
          isActive: true,
        })
        .returning();
      map.set(attr.code, created);
    }
  }

  return map;
}

async function upsertOptions(
  attributesMap: Map<string, ProductAttribute>
): Promise<Map<string, Map<string, AttributeOption>>> {
  const result = new Map<string, Map<string, AttributeOption>>();

  for (const attr of attributes) {
    const attrRecord = attributesMap.get(attr.code)!;
    const optionMap = new Map<string, AttributeOption>();
    attr.options.forEach((opt, idx) => optionMap.set(opt, null as unknown as AttributeOption));

    for (const [index, value] of attr.options.entries()) {
      const existing = await db
        .select()
        .from(attributeOptions)
        .where(and(eq(attributeOptions.attributeId, attrRecord.id), eq(attributeOptions.value, value)));

      if (existing.length) {
        const [updated] = await db
          .update(attributeOptions)
          .set({
            sortOrder: index,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(attributeOptions.id, existing[0].id))
          .returning();
        optionMap.set(value, updated);
      } else {
        const [created] = await db
          .insert(attributeOptions)
          .values({
            attributeId: attrRecord.id,
            value,
            sortOrder: index,
            isActive: true,
          })
          .returning();
        optionMap.set(value, created);
      }
    }

    result.set(attr.code, optionMap);
  }

  return result;
}

async function upsertVariant(
  productId: number,
  attrMap: Map<string, ProductAttribute>,
  optionMap: Map<string, Map<string, AttributeOption>>,
  variant: VariantDef
): Promise<{ status: "inserted" | "updated"; variantId: number }> {
  const materialAttr = attrMap.get("material")!;
  const sizeAttr = attrMap.get("size")!;
  const colorAttr = attrMap.get("color")!;

  const materialOpt = optionMap.get("material")!.get(variant.material);
  const sizeOpt = optionMap.get("size")!.get(variant.size);
  const colorOpt = optionMap.get("color")!.get(variant.color);

  if (!materialOpt || !sizeOpt || !colorOpt) {
    throw new Error(`Missing option for variant ${variant.sku}`);
  }

  const variantKey = buildVariantKey([
    { attributeCode: materialAttr.code, optionValue: materialOpt.value },
    { attributeCode: sizeAttr.code, optionValue: sizeOpt.value },
    { attributeCode: colorAttr.code, optionValue: colorOpt.value },
  ]);

  const existing = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.productId, productId), eq(productVariants.variantKey, variantKey)));

  let variantId: number;
  let status: "inserted" | "updated";

  if (existing.length) {
    const [updated] = await db
      .update(productVariants)
      .set({
        sku: variant.sku,
        unit: UNIT,
        stockOnHand: "0",
        allowPreorder: false,
        updatedAt: new Date(),
      })
      .where(eq(productVariants.id, existing[0].id))
      .returning();
    variantId = updated.id;
    status = "updated";

    await db.delete(variantOptionValues).where(eq(variantOptionValues.variantId, variantId));
  } else {
    const [created] = await db
      .insert(productVariants)
      .values({
        productId,
        sku: variant.sku,
        variantKey,
        unit: UNIT,
        stockOnHand: "0",
        allowPreorder: false,
      })
      .returning();
    variantId = created.id;
    status = "inserted";
  }

  await db.insert(variantOptionValues).values([
    { variantId, attributeId: materialAttr.id, optionId: materialOpt.id },
    { variantId, attributeId: sizeAttr.id, optionId: sizeOpt.id },
    { variantId, attributeId: colorAttr.id, optionId: colorOpt.id },
  ]);

  await db
    .insert(variantPrices)
    .values({
      variantId,
      currency: CURRENCY,
      priceCents: variant.price,
    })
    .onConflictDoUpdate({
      target: [variantPrices.variantId, variantPrices.currency],
      set: { priceCents: variant.price },
    });

  return { status, variantId };
}

async function upsertSeedProcurement(
  variantId: number,
  qty: number,
  capitalCostCents?: number,
): Promise<void> {
  const normalizedCapitalCostCents = typeof capitalCostCents === "number" ? capitalCostCents : null;

  const existing = await db
    .select()
    .from(procurements)
    .where(
      and(
        eq(procurements.productVariantId, variantId),
        isNull(procurements.orderId),
        eq(procurements.notes, PROCUREMENT_SEED_NOTE),
      ),
    );

  if (qty <= 0) {
    if (existing.length > 0) {
      await db.delete(procurements).where(eq(procurements.id, existing[0].id));
    }
    await db
      .update(productVariants)
      .set({ stockOnHand: "0", updatedAt: new Date() })
      .where(eq(productVariants.id, variantId));
    return;
  }

  if (existing.length > 0) {
    await db
      .update(procurements)
      .set({
        neededQty: qty.toString(),
        capitalCostCents: normalizedCapitalCostCents,
        capitalCurrency: CURRENCY,
        status: "ARRIVED",
        notes: PROCUREMENT_SEED_NOTE,
        updatedAt: new Date(),
      })
      .where(eq(procurements.id, existing[0].id));
    await db
      .update(productVariants)
      .set({ stockOnHand: qty.toString(), updatedAt: new Date() })
      .where(eq(productVariants.id, variantId));
    return;
  }

  await db.insert(procurements).values({
    orderId: null,
    productVariantId: variantId,
    neededQty: qty.toString(),
    capitalCostCents: normalizedCapitalCostCents,
    capitalCurrency: CURRENCY,
    status: "ARRIVED",
    notes: PROCUREMENT_SEED_NOTE,
  });
  await db
    .update(productVariants)
    .set({ stockOnHand: qty.toString(), updatedAt: new Date() })
    .where(eq(productVariants.id, variantId));
}

async function main() {
  try {
    const brandId = await upsertBrand();
    const product = await upsertProduct(brandId);

    const attrMap = await upsertAttributes(product.id);
    const optionMap = await upsertOptions(attrMap);

    let inserted = 0;
    let updated = 0;

    for (const v of variants) {
      const { status, variantId } = await upsertVariant(product.id, attrMap, optionMap, v);
      if (status === "inserted") inserted += 1;
      else updated += 1;
      await upsertSeedProcurement(variantId, v.procurement_qty, procurementCapitalCentsBySku[v.sku]);
    }

    console.log(`Seeded product "${PRODUCT_NAME}" (id=${product.id}) for brand ${brandId}. Variants inserted: ${inserted}, updated: ${updated}.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed products:", error);
    process.exit(1);
  }
}

await main();

