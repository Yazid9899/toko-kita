import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, pgEnum, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export Auth Models
export * from "./models/auth";

// --- ENUMS ---
export const customerTypeEnum = pgEnum("customer_type", ["PERSONAL", "RESELLER"]);
export const unitTypeEnum = pgEnum("unit_type", ["QUANTITY", "WEIGHT"]);
export const paymentTypeEnum = pgEnum("payment_type", ["MANUAL_TRANSFER", "FULL_SHOPEE", "SPLIT_SHOPEE"]);
export const paymentStatusEnum = pgEnum("payment_status", ["NOT_PAID", "DOWN_PAYMENT", "PAID"]);
export const packingStatusEnum = pgEnum("packing_status", ["NOT_READY", "PACKING", "PACKED"]);
export const procurementStatusEnum = pgEnum("procurement_status", ["TO_BUY", "ORDERED", "ARRIVED"]);

// --- CUSTOMERS ---
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  addressLine: text("address_line").notNull(),
  kecamatan: text("kecamatan").notNull(),
  cityOrKabupaten: text("city_or_kabupaten").notNull(),
  postCode: text("post_code").notNull(),
  note: text("note"),
  customerType: customerTypeEnum("customer_type").default("PERSONAL").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;


// --- PRODUCTS ---
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  defaultPrice: decimal("default_price", { precision: 10, scale: 2 }), // Optional base price
  unitType: unitTypeEnum("unit_type").default("QUANTITY").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  defaultPrice: z.number().optional().nullable(), // Handle decimal as number in Zod
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;


// --- PRODUCT VARIANTS ---
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  variantName: text("variant_name").notNull(), // Generated, e.g., "Grand-Prix / Blue"
  attributes: jsonb("attributes").notNull(), // { series: "Grand-Prix", color: "Blue" }
  barcodeOrSku: text("barcode_or_sku"),
  defaultPrice: decimal("default_price", { precision: 10, scale: 2 }), // Variant specific price
  stockOnHand: decimal("stock_on_hand", { precision: 10, scale: 2 }).default("0").notNull(), // Decimal for weight items
  allowPreorder: boolean("allow_preorder").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductVariantSchema = createInsertSchema(productVariants).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  defaultPrice: z.number().optional().nullable(),
  stockOnHand: z.number().default(0),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;


// --- ORDERS ---
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // TK-000001
  customerId: integer("customer_id").notNull().references(() => customers.id),
  paymentType: paymentTypeEnum("payment_type").default("MANUAL_TRANSFER").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("NOT_PAID").notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("0").notNull(),
  packingStatus: packingStatusEnum("packing_status").default("NOT_READY").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  orderNumber: true, // Generated backend side
  createdAt: true, 
  updatedAt: true 
}).extend({
  deliveryFee: z.number().default(0),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;


// --- ORDER ITEMS ---
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productVariantId: integer("product_variant_id").notNull().references(() => productVariants.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(), // Snapshot price
  isPreorder: boolean("is_preorder").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ 
  id: true, 
  createdAt: true,
  isPreorder: true // Calculated backend side
}).extend({
  quantity: z.number(),
  unitPrice: z.number(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;


// --- PROCUREMENT (TO BUY) ---
export const procurements = pgTable("procurements", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productVariantId: integer("product_variant_id").notNull().references(() => productVariants.id),
  neededQty: decimal("needed_qty", { precision: 10, scale: 2 }).notNull(),
  status: procurementStatusEnum("status").default("TO_BUY").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProcurementSchema = createInsertSchema(procurements).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  neededQty: z.number(),
});

export type Procurement = typeof procurements.$inferSelect;
export type InsertProcurement = z.infer<typeof insertProcurementSchema>;


// --- RELATIONS ---
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  orderItems: many(orderItems),
  procurements: many(procurements),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
  procurements: many(procurements), // Link orders to their procurement needs
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export const procurementsRelations = relations(procurements, ({ one }) => ({
  order: one(orders, {
    fields: [procurements.orderId],
    references: [orders.id],
  }),
  variant: one(productVariants, {
    fields: [procurements.productVariantId],
    references: [productVariants.id],
  }),
}));
