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
  customerPhone: string;
  paymentType?: InsertOrder["paymentType"];
  paymentStatus?: InsertOrder["paymentStatus"];
  packingStatus?: InsertOrder["packingStatus"];
  discount?: number;
  notes?: string;
  items: OrderSeedItem[];
};

const CURRENCY = "IDR";

const seeds: OrderSeed[] = [
 {
  customerPhone: "082110922802",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "diel miel",
  items: [
    { sku: "LGH-NY-L-RBL", quantity: 2 },
  ],
},
{
  customerPhone: "085777065752",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "tania Amelia",
  items: [
    { sku: "LGH-NY-L-RBL", quantity: 2 },
    { sku: "LGH-NY-L-BRA", quantity: 1 },
  ],
},
{
  customerPhone: "085224148940",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Juwita. R",
  items: [
    { sku: "LGH-NY-L-GY", quantity: 1 },
  ],
},
{
  customerPhone: "081393544955",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "tuty",
  items: [
    { sku: "LGH-PU-L-BK", quantity: 1 },
  ],
},
{
  customerPhone: "08122771873",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "tia",
  items: [
    { sku: "LGH-PU-S-SI", quantity: 1 },
  ],
},
{
  customerPhone: "082182902626",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "zelwia",
  items: [
    { sku: "LGH-PU-L-BK", quantity: 1 },
  ],
},
{
  customerPhone: "08567625690",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "nia ikrimah",
  items: [
    { sku: "LGH-NY-S-BE", quantity: 1 },
  ],
},
{
  customerPhone: "081314149869",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "irma avianti",
  items: [
    { sku: "LGH-NY-S-NV", quantity: 1 },
  ],
},
{
  customerPhone: "082246550007",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "anengsih",
  items: [
    { sku: "LGH-PU-S-SI", quantity: 1 },
  ],
},
{
  customerPhone: "081533444119",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "meli ginting",
  items: [
    { sku: "LGH-NY-M-NV", quantity: 1 },
  ],
},
{
  customerPhone: "089601873423",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "asfarina ayu",
  items: [
    { sku: "LGH-PU-S-BK", quantity: 1 },
  ],
},
{
  customerPhone: "081297777035",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Ningsih Musef",
  items: [
    { sku: "LGH-NY-S-GY", quantity: 1 },
  ],
},
{
  customerPhone: "08127975599",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "yanti Pt bangun mitra makmur",
  items: [
    { sku: "LGH-PU-M-BE", quantity: 1 },
    { sku: "LGH-NY-M-GY", quantity: 1 },
  ],
},
{
  customerPhone: "08113201455",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Agnes Angelin",
  items: [
    { sku: "LGH-NY-L-PPI", quantity: 1 },
  ],
},
{
  customerPhone: "085947419081",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Yenny",
  items: [
    { sku: "LGH-LW-BPK-BR", quantity: 1 },
    { sku: "LGH-LW-BAG-BR", quantity: 2 },
  ],
},
{
  customerPhone: "089631489110",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Neera Puri",
  items: [
    { sku: "LGH-NY-L-LBR", quantity: 1 },
  ],
},
{
  customerPhone: "085373602025",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Regina Yulandari",
  items: [
    { sku: "LGH-NY-L-BE", quantity: 1 },
  ],
},
{
  customerPhone: "081316622044",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Firly",
  items: [
    { sku: "LGH-NY-L-BK", quantity: 1 },
    { sku: "LGH-NY-M-BK", quantity: 1 },
  ],
},
{
  customerPhone: "081380169903",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Hefi Setiawati",
  items: [
    { sku: "LGH-PU-S-SI", quantity: 1 },
    { sku: "LGH-NY-L-OLV", quantity: 1 },
    { sku: "LGH-NY-M-NV", quantity: 1 },
  ],
},
{
  customerPhone: "082141886821",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "viniazizah",
  items: [
    { sku: "LGH-NY-S-IVB", quantity: 1 },
  ],
},
{
  customerPhone: "085719725050",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Siti Rahayu",
  items: [
    { sku: "LGH-NY-S-PI/BR", quantity: 1 },
  ],
},
{
  customerPhone: "081322392639",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Nabila eka putri",
  items: [
    { sku: "LGH-NY-S-IVB", quantity: 1 },
    { sku: "LGH-NY-S-BE", quantity: 1 },
  ],
},
{
  customerPhone: "085882958749",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "sulis",
  items: [
    { sku: "LGH-NY-BPK-BK", quantity: 1 },
  ],
},
{
  customerPhone: "08989929424",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Nikchy",
  items: [
    { sku: "LGH-NY-L-BK", quantity: 1 },
  ],
},
{
  customerPhone: "085811587899",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Vina",
  items: [
    { sku: "LGH-NY-MC-BK", quantity: 1 },
  ],
},
{
  customerPhone: "081229026226",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 180000,
  notes: "Hana Tan",
  items: [
    { sku: "LGH-NY-M-NV", quantity: 1 },
    { sku: "LGH-NY-M-BRA", quantity: 1 },
    { sku: "LGH-NY-S-LGA", quantity: 1 },
    { sku: "LGH-NY-L-BK", quantity: 1 },
    { sku: "LGH-NY-L-SGY", quantity: 1 },
    { sku: "LGH-NY-L-NV", quantity: 1 },
  ],
},
{
  customerPhone: "081320741718",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Yurie Wulandari",
  items: [
    { sku: "LGH-NY-L-BKB", quantity: 1 },
  ],
},
{
  customerPhone: "085714659496",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Sri Yulia Rinawati",
  items: [
    { sku: "LGH-NY-S-IV", quantity: 1 },
  ],
},
{
  customerPhone: "08112002400",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Tita Eka Fuspita",
  items: [
    { sku: "LGH-NY-L-GY", quantity: 1 },
  ],
},
{
  customerPhone: "081349195519",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Dupit Malinda",
  items: [
    { sku: "LGH-NY-L-PPI", quantity: 1 },
  ],
},
{
  customerPhone: "081382373971",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Cytra Primasari",
  items: [
    { sku: "LGH-NY-M-OLV", quantity: 1 },
  ],
},
{
  customerPhone: "085920665649",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Noviyanti",
  items: [
    { sku: "LGH-NY-S-BK", quantity: 1 },
  ],
},
{
  customerPhone: "08122618485",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Devi Eddie",
  items: [
    { sku: "LGH-NY-S-MGR/IV", quantity: 1 },
  ],
},
{
  customerPhone: "082189551739",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Titi Tamira",
  items: [
    { sku: "LGH-NY-M-PPI", quantity: 1 },
  ],
},
{
  customerPhone: "08170680662",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Safrida (ika)",
  items: [
    { sku: "LGH-NY-S-IVB", quantity: 1 },
  ],
},
{
  customerPhone: "081235070878",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 335000,
  notes: "Micel, stella (gift)",
  items: [
    { sku: "LGH-NY-CABIN-BK", quantity: 1 },
    { sku: "LGH-NY-CABIN-NV", quantity: 1 },
    { sku: "LGH-NY-L-RBL", quantity: 1 },
    { sku: "LGH-PU-M-BL", quantity: 1 },
    { sku: "LGH-NY-M-RBL", quantity: 1 },
    { sku: "LGH-NY-S-IVB", quantity: 1 },
  ],
},
{
  customerPhone: "082340588483",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "soraya",
  items: [
    { sku: "LGH-NY-M-OLV", quantity: 1 },
  ],
},
{
  customerPhone: "081344443075",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Yanna",
  items: [
    { sku: "LGH-NY-BPK-BK", quantity: 1 },
    { sku: "LGH-NY-S-BK", quantity: 1 },
  ],
},
{
  customerPhone: "081575222095",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Tri Winarni",
  items: [
    { sku: "LGH-NY-S-BRA", quantity: 1 },
  ],
},
{
  customerPhone: "082159155151",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Eva noprrianti",
  items: [
    { sku: "LGH-NY-S-DG/NV", quantity: 1 },
  ],
},
{
  customerPhone: "081295193991",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Hani Iskandar",
  items: [
    { sku: "LGH-NY-M-BE", quantity: 1 },
  ],
},
{
  customerPhone: "08118035365",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Syifa Fauziah",
  items: [
    { sku: "LGH-NY-BPK-NV", quantity: 1 },
  ],
},
{
  customerPhone: "081296046476",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "nuri pratama",
  items: [
    { sku: "LGH-LW-BAG-BR", quantity: 1 },
  ],
},
{
  customerPhone: "087894185471",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 2060000,
  notes: "KARTIKA",
  items: [
    { sku: "LGH-NY-CABIN-NV", quantity: 1 },
    { sku: "LGH-NY-S-LB/DB", quantity: 10 },
    { sku: "LGH-NY-S-PI/BR", quantity: 5 },
    { sku: "LGH-NY-S-DG/NV", quantity: 10 },
    { sku: "LGH-NY-S-MGR/IV", quantity: 4 },
    { sku: "LGH-NY-S-PI/GY", quantity: 3 },
    { sku: "LGH-NY-S-IVB", quantity: 2 },
    { sku: "LGH-NY-S-LGA", quantity: 6 },
    { sku: "LGH-NY-M-MUS", quantity: 1 },
    { sku: "LGH-NY-M-IVB", quantity: 2 },
    { sku: "LGH-NY-M-ICY", quantity: 2 },
    { sku: "LGH-NY-L-ICY", quantity: 2 },
    { sku: "LGH-NY-MC-LV", quantity: 1 },
    { sku: "LGH-NY-S-BRA", quantity: 2 },
    { sku: "LGH-NY-S-GY", quantity: 2 },
    { sku: "LGH-NY-M-BK", quantity: 2 },
    { sku: "LGH-NY-M-NV", quantity: 3 },
    { sku: "LGH-PU-M-SI", quantity: 2 },
    { sku: "LGH-NY-L-BE", quantity: 5 },
    { sku: "LGH-NY-L-PPI", quantity: 1 },
    { sku: "LGH-NY-L-PIA", quantity: 1 },
    { sku: "LGH-NY-L-LV", quantity: 2 },
    { sku: "LGH-NY-L-PUA", quantity: 1 },
  ],
},
{
  customerPhone: "260123RGVXKQUF",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "ftrmsyf",
  items: [
    { sku: "LGH-NY-L-BE", quantity: 1 },
  ],
},
{
  customerPhone: "260129B817AM92",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "indirabungac",
  items: [
    { sku: "LGH-NY-L-NV", quantity: 1 },
  ],
},
{
  customerPhone: "260120J2N0RQFX",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "hellopandahehe",
  items: [
    { sku: "LGH-NY-L-LBR", quantity: 1 },
  ],
},
{
  customerPhone: "260118CB5U5KKJ",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "bundadazame",
  items: [
    { sku: "LGH-NY-L-LV", quantity: 1 },
  ],
},
{
  customerPhone: "260201HTP4YK5V",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "dear_cha",
  items: [
    { sku: "LGH-NY-L-BE", quantity: 1 },
  ],
},
{
  customerPhone: "081322731173",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Diana Rakhmawaty Eddy",
  items: [
    { sku: "LGH-NY-M-PUA", quantity: 1 },
  ],
},
{
  customerPhone: "081288062394",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "indriyani",
  items: [
    { sku: "LGH-NY-M-BRA", quantity: 1 },
  ],
},
{
  customerPhone: "087889897736",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "Indri Indrayani",
  items: [
    { sku: "LGH-NY-BPO-BK", quantity: 1 },
  ],
},
{
  customerPhone: "08122861874",
  paymentStatus: "PAID",
  packingStatus: "PACKED",
  discount: 0,
  notes: "ida setyawati",
  items: [
    { sku: "LGH-NY-S-LBR", quantity: 1 },
  ],
},
];

async function generateOrderNumber(): Promise<string> {
  const all = await db.select().from(orders);
  const next = all.length + 1;
  return `TK-${String(next).padStart(6, "0")}`;
}

async function resolveCustomer(phone: string) {
  const existing = await db.select().from(customers).where(eq(customers.phoneNumber, phone));
  if (!existing.length) {
        throw new Error(`Customer with phone ${phone} not found. Seed customers first.`);
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
  const customer = await resolveCustomer(seed.customerPhone);
  const orderNumber = await generateOrderNumber();

  const [createdOrder] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerId: customer.id,
      paymentType: seed.paymentType ?? "MANUAL_TRANSFER",
      paymentStatus: seed.paymentStatus ?? "NOT_PAID",
      packingStatus: seed.packingStatus ?? "NOT_READY",
      discount: (seed.discount ?? 0).toString(),
      notes: seed.notes,
    })
    .returning();

  for (const item of seed.items) {
    const { variant, priceCents } = await resolveVariant(item.sku);
    const unitPrice = item.unitPrice ?? priceCents;

    await db.insert(orderItems).values({
      orderId: createdOrder.id,
      productVariantId: variant.id,
      quantity: item.quantity.toString(),
      unitPrice: unitPrice.toString(),
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
