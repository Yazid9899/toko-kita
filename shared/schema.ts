import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum, varchar, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// --- ENUMS ---
export const customerTypeEnum = pgEnum("customer_type", ["PERSONAL", "RESELLER"]);
export const paymentTypeEnum = pgEnum("payment_type", ["MANUAL_TRANSFER", "FULL_SHOPEE", "SPLIT_SHOPEE"]);
export const paymentStatusEnum = pgEnum("payment_status", ["NOT_PAID", "DOWN_PAYMENT", "PAID"]);
export const packingStatusEnum = pgEnum("packing_status", ["NOT_READY", "PACKING", "PACKED"]);
export const procurementStatusEnum = pgEnum("procurement_status", ["TO_BUY", "ORDERED", "ARRIVED"]);
export const productTypeEnum = pgEnum("product_type", ["apparel", "accessory"]);

// --- BRANDS ---
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;

// --- ADMIN USERS ---
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;

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
  brandId: integer("brand_id").notNull().references(() => brands.id),
  name: text("name").notNull(),
  description: text("description"),
  type: productTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// --- PRODUCT ATTRIBUTES ---
export const productAttributes = pgTable("product_attributes", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  name: text("name").notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  productCodeUnique: uniqueIndex("product_attribute_code_unique").on(table.productId, table.code),
}));

export const insertProductAttributeSchema = createInsertSchema(productAttributes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProductAttribute = typeof productAttributes.$inferSelect;
export type InsertProductAttribute = z.infer<typeof insertProductAttributeSchema>;

// --- ATTRIBUTE OPTIONS ---
export const attributeOptions = pgTable("attribute_options", {
  id: serial("id").primaryKey(),
  attributeId: integer("attribute_id").notNull().references(() => productAttributes.id),
  value: text("value").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAttributeOptionSchema = createInsertSchema(attributeOptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AttributeOption = typeof attributeOptions.$inferSelect;
export type InsertAttributeOption = z.infer<typeof insertAttributeOptionSchema>;

// --- PRODUCT VARIANTS ---
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  sku: text("sku").notNull().unique(),
  variantKey: text("variant_key").notNull(),
  unit: text("unit").default("piece").notNull(),
  stockOnHand: decimal("stock_on_hand", { precision: 10, scale: 2 }).default("0").notNull(),
  allowPreorder: boolean("allow_preorder").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  productVariantKeyUnique: uniqueIndex("product_variant_key_unique").on(table.productId, table.variantKey),
}));

export const insertProductVariantSchema = createInsertSchema(productVariants).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  stockOnHand: z.number().default(0),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;

// --- VARIANT OPTION VALUES ---
export const variantOptionValues = pgTable("variant_option_values", {
  variantId: integer("variant_id").notNull().references(() => productVariants.id),
  attributeId: integer("attribute_id").notNull().references(() => productAttributes.id),
  optionId: integer("option_id").notNull().references(() => attributeOptions.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.variantId, table.attributeId] }),
}));

export type VariantOptionValue = typeof variantOptionValues.$inferSelect;

// --- VARIANT PRICES ---
export const variantPrices = pgTable("variant_prices", {
  variantId: integer("variant_id").notNull().references(() => productVariants.id),
  currency: varchar("currency", { length: 3 }).notNull(),
  priceCents: integer("price_cents").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.variantId, table.currency] }),
}));

export type VariantPrice = typeof variantPrices.$inferSelect;

export type ProductAttributeWithOptions = ProductAttribute & {
  options: AttributeOption[];
};

export type ProductVariantOption = {
  attributeId: number;
  optionId: number;
  attributeName: string;
  attributeCode: string;
  optionValue: string;
};

export type ProductVariantWithRelations = ProductVariant & {
  optionValues: ProductVariantOption[];
  prices: VariantPrice[];
};

export type ProductWithRelations = Product & {
  brand: Brand;
  attributes: ProductAttributeWithOptions[];
  variants: ProductVariantWithRelations[];
};


// --- ORDERS ---
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // TK-000001
  customerId: integer("customer_id").notNull().references(() => customers.id),
  paymentType: paymentTypeEnum("payment_type").default("MANUAL_TRANSFER").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("NOT_PAID").notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0").notNull(),
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
  discount: z.number().default(0),
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
  attributes: many(productAttributes),
  variants: many(productVariants),
}));

export const productAttributesRelations = relations(productAttributes, ({ one, many }) => ({
  product: one(products, {
    fields: [productAttributes.productId],
    references: [products.id],
  }),
  options: many(attributeOptions),
}));

export const attributeOptionsRelations = relations(attributeOptions, ({ one }) => ({
  attribute: one(productAttributes, {
    fields: [attributeOptions.attributeId],
    references: [productAttributes.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  optionValues: many(variantOptionValues),
  prices: many(variantPrices),
  orderItems: many(orderItems),
  procurements: many(procurements),
}));

export const variantOptionValuesRelations = relations(variantOptionValues, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantOptionValues.variantId],
    references: [productVariants.id],
  }),
  attribute: one(productAttributes, {
    fields: [variantOptionValues.attributeId],
    references: [productAttributes.id],
  }),
  option: one(attributeOptions, {
    fields: [variantOptionValues.optionId],
    references: [attributeOptions.id],
  }),
}));

export const variantPricesRelations = relations(variantPrices, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantPrices.variantId],
    references: [productVariants.id],
  }),
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
