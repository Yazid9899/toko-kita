import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "../server/db";
import {
  customers,
  orders,
  orderItems,
  productVariants,
  variantPrices,
  type InsertOrder,
} from "../shared/schema";

type OrderSeedItem = {
  sku: string;
  quantity: number;
  unitPrice?: number;
};

type OrderSeed = {
  customerId: number;
  paymentType?: InsertOrder["paymentType"];
  paymentStatus?: InsertOrder["paymentStatus"];
  packingStatus?: InsertOrder["packingStatus"];
  discount?: number;
  notes?: string;
  items: OrderSeedItem[];
};

const CURRENCY = "IDR";

// TODO: Replace demo data with realistic orders or load from a fixture/CSV.
const seeds: OrderSeed[] = [
  {
    customerId: 1,
    paymentStatus: "PAID",
    packingStatus: "PACKING",
    discount: 10000,
    notes: "Sample paid order",
    items: [
      { sku: "LGH-PU-S-BK", quantity: 1 },
      { sku: "LGH-NY-S-BK", quantity: 2 },
    ],
  },
  {
    customerId: 1,
    paymentStatus: "DOWN_PAYMENT",
    packingStatus: "NOT_READY",
    discount: 0,
    notes: "Pending packing, partial payment",
    items: [{ sku: "LGH-PU-M-BE", quantity: 1 }],
  },
];

async function generateOrderNumber(): Promise<string> {
  const all = await db.select().from(orders);
  const next = all.length + 1;
  return `TK-${String(next).padStart(6, "0")}`;
}

async function resolveCustomer(customerId: number) {
  const existing = await db.select().from(customers).where(eq(customers.id, customerId));
  if (!existing.length) {
    throw new Error(`Customer with id ${customerId} not found. Seed customers first.`);
  }
  return existing[0];
}

async function resolveVariant(sku: string) {
  const variantRows = await db.select().from(productVariants).where(eq(productVariants.sku, sku));
  if (!variantRows.length) throw new Error(`Variant with SKU ${sku} not found.`);
  const variant = variantRows[0];

  const priceRows = await db
    .select()
    .from(variantPrices)
    .where(and(eq(variantPrices.variantId, variant.id), eq(variantPrices.currency, CURRENCY)));

  const priceCents = priceRows[0]?.priceCents ?? 0;
  return { variant, priceCents };
}

async function seedOrder(seed: OrderSeed) {
  const customer = await resolveCustomer(seed.customerId);
  const orderNumber = await generateOrderNumber();

  const [createdOrder] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerId: customer.id,
      paymentType: seed.paymentType ?? "MANUAL_TRANSFER",
      paymentStatus: seed.paymentStatus ?? "NOT_PAID",
      packingStatus: seed.packingStatus ?? "NOT_READY",
      discount: seed.discount ?? 0,
      notes: seed.notes,
    })
    .returning();

  for (const item of seed.items) {
    const { variant, priceCents } = await resolveVariant(item.sku);
    const unitPrice = item.unitPrice ?? priceCents;

    await db.insert(orderItems).values({
      orderId: createdOrder.id,
      productVariantId: variant.id,
      quantity: item.quantity,
      unitPrice,
    });

    // Basic stock decrement to keep demo data roughly consistent.
    const currentStock = Number(variant.stockOnHand);
    const newStock = Math.max(0, currentStock - item.quantity);
    await db
      .update(productVariants)
      .set({ stockOnHand: newStock.toString(), updatedAt: new Date() })
      .where(eq(productVariants.id, variant.id));
  }

  console.log(`Seeded order ${orderNumber} for customer ${customer.name}`);
}

async function main() {
  try {
    for (const seed of seeds) {
      await seedOrder(seed);
    }
    console.log(`Seeded ${seeds.length} orders.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed orders:", error);
    process.exit(1);
  }
}

main();
