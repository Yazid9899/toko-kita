import { db } from "./db";
import { 
  brands, customers, products, productAttributes, attributeOptions,
  productVariants, variantOptionValues, variantPrices,
  orders, orderItems, procurements,
  type Brand, type InsertBrand,
  type Customer, type InsertCustomer,
  type Product, type InsertProduct,
  type ProductAttribute, type InsertProductAttribute,
  type AttributeOption, type InsertAttributeOption,
  type ProductVariant, type InsertProductVariant,
  type ProductVariantOption, type ProductVariantWithRelations,
  type ProductWithRelations, type ProductAttributeWithOptions,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Procurement, type InsertProcurement,
} from "@shared/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";

function mapAttributesWithOptions(
  attributes: ProductAttribute[],
  options: AttributeOption[]
): Map<number, ProductAttributeWithOptions[]> {
  const optionsByAttribute = new Map<number, AttributeOption[]>();
  options.forEach((option) => {
    const existing = optionsByAttribute.get(option.attributeId) || [];
    existing.push(option);
    optionsByAttribute.set(option.attributeId, existing);
  });

  const attributesByProduct = new Map<number, ProductAttributeWithOptions[]>();
  attributes.forEach((attribute) => {
    const existing = attributesByProduct.get(attribute.productId) || [];
    const attributeOptions = optionsByAttribute.get(attribute.id) || [];
    attributeOptions.sort((a, b) => a.sortOrder - b.sortOrder);
    existing.push({ ...attribute, options: attributeOptions });
    attributesByProduct.set(attribute.productId, existing);
  });

  for (const list of attributesByProduct.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return attributesByProduct;
}

function normalizeKeyPart(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function buildVariantKey(selections: ProductVariantOption[]): string {
  const sorted = [...selections].sort((a, b) => a.attributeId - b.attributeId);
  return sorted
    .map((selection) =>
      `${normalizeKeyPart(selection.attributeCode)}:${normalizeKeyPart(
        selection.optionValue
      )}`
    )
    .join("|");
}

async function resolveVariantSelections(
  productId: number,
  selections: { attributeId: number; optionId: number }[]
): Promise<{ resolved: ProductVariantOption[]; variantKey: string }> {
  const attributeIds = Array.from(new Set(selections.map((s) => s.attributeId)));
  if (attributeIds.length !== selections.length) {
    throw new Error("Each variant must have one option per attribute.");
  }

  const attributes = await db
    .select()
    .from(productAttributes)
    .where(eq(productAttributes.productId, productId));

  const attributeById = new Map(attributes.map((attribute) => [attribute.id, attribute]));
  const missingAttribute = selections.find(
    (selection) => !attributeById.has(selection.attributeId)
  );
  if (missingAttribute) {
    throw new Error("Selection contains an attribute that does not belong to the product.");
  }

  const optionIds = selections.map((selection) => selection.optionId);
  const options = optionIds.length
    ? await db
        .select()
        .from(attributeOptions)
        .where(inArray(attributeOptions.id, optionIds))
    : [];
  const optionById = new Map(options.map((option) => [option.id, option]));

  const resolved: ProductVariantOption[] = selections.map((selection) => {
    const attribute = attributeById.get(selection.attributeId)!;
    const option = optionById.get(selection.optionId);
    if (!option) {
      throw new Error("Selection contains an option that does not exist.");
    }
    if (option.attributeId !== attribute.id) {
      throw new Error("Selection contains an option that does not belong to its attribute.");
    }
    if (!attribute.isActive || !option.isActive) {
      throw new Error("Selection includes an inactive attribute or option.");
    }
    return {
      attributeId: attribute.id,
      optionId: option.id,
      attributeName: attribute.name,
      attributeCode: attribute.code,
      optionValue: option.value,
    };
  });

  return { resolved, variantKey: buildVariantKey(resolved) };
}

async function mapVariantsWithRelations(
  variants: ProductVariant[]
): Promise<Map<number, ProductVariantWithRelations>> {
  if (variants.length === 0) return new Map();

  const variantIds = variants.map((v) => v.id);
  const optionValues = await db
    .select()
    .from(variantOptionValues)
    .where(inArray(variantOptionValues.variantId, variantIds));

  const attributeIds = Array.from(
    new Set(optionValues.map((value) => value.attributeId))
  );
  const optionIds = Array.from(
    new Set(optionValues.map((value) => value.optionId))
  );

  const [attributes, options, prices] = await Promise.all([
    attributeIds.length
      ? db
          .select()
          .from(productAttributes)
          .where(inArray(productAttributes.id, attributeIds))
      : Promise.resolve([]),
    optionIds.length
      ? db
          .select()
          .from(attributeOptions)
          .where(inArray(attributeOptions.id, optionIds))
      : Promise.resolve([]),
    db
      .select()
      .from(variantPrices)
      .where(inArray(variantPrices.variantId, variantIds)),
  ]);

  const attributeById = new Map(attributes.map((attribute) => [attribute.id, attribute]));
  const optionById = new Map(options.map((option) => [option.id, option]));

  const pricesByVariant = new Map<number, typeof prices>();
  prices.forEach((price) => {
    const existing = pricesByVariant.get(price.variantId) || [];
    existing.push(price);
    pricesByVariant.set(price.variantId, existing);
  });

  const optionValuesByVariant = new Map<number, ProductVariantOption[]>();
  optionValues.forEach((value) => {
    const attribute = attributeById.get(value.attributeId);
    const option = optionById.get(value.optionId);
    if (!attribute || !option) return;
    const existing = optionValuesByVariant.get(value.variantId) || [];
    existing.push({
      attributeId: value.attributeId,
      optionId: value.optionId,
      attributeName: attribute.name,
      attributeCode: attribute.code,
      optionValue: option.value,
    });
    optionValuesByVariant.set(value.variantId, existing);
  });

  const variantMap = new Map<number, ProductVariantWithRelations>();
  variants.forEach((variant) => {
    const selectionList = optionValuesByVariant.get(variant.id) || [];
    selectionList.sort((a, b) => a.attributeId - b.attributeId);
    variantMap.set(variant.id, {
      ...variant,
      optionValues: selectionList,
      prices: pricesByVariant.get(variant.id) || [],
    });
  });

  return variantMap;
}

export interface IStorage {
  // Brands
  getBrands(): Promise<Brand[]>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: number, brand: Partial<InsertBrand>): Promise<Brand>;

  // Customers
  getCustomers(search?: string): Promise<Customer[]>;
  getCustomer(id: number): Promise<(Customer & { orders: Order[] }) | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<boolean>;

  // Products
  getProducts(): Promise<ProductWithRelations[]>;
  getProduct(id: number): Promise<ProductWithRelations | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;

  // Attributes
  createAttribute(attribute: InsertProductAttribute): Promise<ProductAttribute>;
  updateAttribute(id: number, attribute: Partial<InsertProductAttribute>): Promise<ProductAttribute>;
  createAttributeOption(option: InsertAttributeOption): Promise<AttributeOption>;
  updateAttributeOption(id: number, option: Partial<InsertAttributeOption>): Promise<AttributeOption>;

  // Variants
  createVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  createVariantWithSelections(params: {
    productId: number;
    sku: string;
    unit?: string;
    stockOnHand?: number;
    allowPreorder?: boolean;
    selections: { attributeId: number; optionId: number }[];
    currency: string;
    priceCents: number;
  }): Promise<ProductVariantWithRelations>;
  updateVariantDetails(id: number, data: {
    sku?: string;
    unit?: string;
    stockOnHand?: number;
    allowPreorder?: boolean;
    selections?: { attributeId: number; optionId: number }[];
    currency?: string;
    priceCents?: number;
  }): Promise<ProductVariantWithRelations>;
  updateVariant(id: number, variant: Partial<InsertProductVariant>): Promise<ProductVariant>;
  deleteVariant(id: number): Promise<void>;
  getVariant(id: number): Promise<ProductVariant | undefined>;

  // Orders
  getOrders(status?: string, packingStatus?: string): Promise<(Order & { customer: Customer, items: OrderItem[] })[]>;
  getOrder(id: number): Promise<(Order & { 
    customer: Customer, 
    items: (OrderItem & { variant: ProductVariantWithRelations })[],
    procurements: (Procurement & { variant: ProductVariantWithRelations })[] 
  }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;

  // Order Items
  createOrderItem(item: InsertOrderItem & { isPreorder?: boolean }): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Procurement
  getProcurements(status?: string): Promise<(Procurement & { 
    variant: ProductVariantWithRelations,
    order: Order & { customer: Customer }
  })[]>;
  createProcurement(procurement: InsertProcurement): Promise<Procurement>;
  updateProcurement(id: number, procurement: Partial<InsertProcurement>): Promise<Procurement>;
}

export class DatabaseStorage implements IStorage {
  // --- Brands ---
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands).orderBy(desc(brands.createdAt));
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [newBrand] = await db.insert(brands).values(brand).returning();
    return newBrand;
  }

  async updateBrand(id: number, brand: Partial<InsertBrand>): Promise<Brand> {
    const [updated] = await db.update(brands).set(brand).where(eq(brands.id, id)).returning();
    return updated;
  }

  // --- Customers ---
  async getCustomers(search?: string): Promise<Customer[]> {
    let query = db.select().from(customers);
    
    if (search) {
      query = query.where(
        sql`${customers.name} ILIKE ${`%${search}%`} OR ${customers.phoneNumber} ILIKE ${`%${search}%`}`
      ) as any;
    }
    
    return await query.orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<(Customer & { orders: Order[] }) | undefined> {
    const customer = await db.select().from(customers).where(eq(customers.id, id));
    if (!customer.length) return undefined;

    const customerOrders = await db.select().from(orders).where(eq(orders.customerId, id)).orderBy(desc(orders.createdAt));
    
    return { ...customer[0], orders: customerOrders };
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, update: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db.update(customers).set(update).where(eq(customers.id, id)).returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const customerOrders = await db.select().from(orders).where(eq(orders.customerId, id));
    if (customerOrders.length > 0) {
      throw new Error("Cannot delete customer with existing orders");
    }
    const result = await db.delete(customers).where(eq(customers.id, id)).returning();
    return result.length > 0;
  }

  // --- Products ---
  async getProducts(): Promise<ProductWithRelations[]> {
    const [allProducts, allBrands, allAttributes, allOptions, allVariants] = await Promise.all([
      db.select().from(products).orderBy(desc(products.createdAt)),
      db.select().from(brands),
      db.select().from(productAttributes),
      db.select().from(attributeOptions),
      db.select().from(productVariants),
    ]);

    const brandById = new Map(allBrands.map((brand) => [brand.id, brand]));
    const attributesByProduct = mapAttributesWithOptions(allAttributes, allOptions);
    const variantsByProduct = new Map<number, ProductVariant[]>();
    allVariants.forEach((variant) => {
      const existing = variantsByProduct.get(variant.productId) || [];
      existing.push(variant);
      variantsByProduct.set(variant.productId, existing);
    });

    const variantRelations = await mapVariantsWithRelations(allVariants);

    return allProducts.map((product) => ({
      ...product,
      brand: brandById.get(product.brandId)!,
      attributes: attributesByProduct.get(product.id) || [],
      variants: (variantsByProduct.get(product.id) || []).map(
        (variant) => variantRelations.get(variant.id)!
      ),
    }));
  }

  async getProduct(id: number): Promise<ProductWithRelations | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;

    const [brand, attributes, variants] = await Promise.all([
      db.select().from(brands).where(eq(brands.id, product.brandId)),
      db
        .select()
        .from(productAttributes)
        .where(eq(productAttributes.productId, product.id)),
      db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id)),
    ]);

    const attributeIds = attributes.map((attribute) => attribute.id);
    const options = attributeIds.length
      ? await db
          .select()
          .from(attributeOptions)
          .where(inArray(attributeOptions.attributeId, attributeIds))
      : [];

    const attributesWithOptions = mapAttributesWithOptions(attributes, options);
    const variantRelations = await mapVariantsWithRelations(variants);

    return {
      ...product,
      brand: brand[0],
      attributes: attributesWithOptions.get(product.id) || [],
      variants: variants.map((variant) => variantRelations.get(variant.id)!),
    };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }

  // --- Attributes ---
  async createAttribute(attribute: InsertProductAttribute): Promise<ProductAttribute> {
    const [newAttribute] = await db.insert(productAttributes).values(attribute).returning();
    return newAttribute;
  }

  async updateAttribute(id: number, attribute: Partial<InsertProductAttribute>): Promise<ProductAttribute> {
    const [updated] = await db
      .update(productAttributes)
      .set(attribute)
      .where(eq(productAttributes.id, id))
      .returning();
    return updated;
  }

  async createAttributeOption(option: InsertAttributeOption): Promise<AttributeOption> {
    const [newOption] = await db.insert(attributeOptions).values(option).returning();
    return newOption;
  }

  async updateAttributeOption(id: number, option: Partial<InsertAttributeOption>): Promise<AttributeOption> {
    const [updated] = await db
      .update(attributeOptions)
      .set(option)
      .where(eq(attributeOptions.id, id))
      .returning();
    return updated;
  }

  // --- Variants ---
  async createVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const data = {
      ...variant,
      stockOnHand: variant.stockOnHand?.toString(),
    };
    const [newVariant] = await db.insert(productVariants).values(data).returning();
    return newVariant;
  }

  async createVariantWithSelections(params: {
    productId: number;
    sku: string;
    unit?: string;
    stockOnHand?: number;
    allowPreorder?: boolean;
    selections: { attributeId: number; optionId: number }[];
    currency: string;
    priceCents: number;
  }): Promise<ProductVariantWithRelations> {
    const {
      productId,
      sku,
      unit,
      stockOnHand,
      allowPreorder,
      selections,
      currency,
      priceCents,
    } = params;

    const { resolved, variantKey } = await resolveVariantSelections(
      productId,
      selections
    );

    const newVariant = await db.transaction(async (tx) => {
      const [variant] = await tx
        .insert(productVariants)
        .values({
          productId,
          sku,
          variantKey,
          unit: unit || "piece",
          stockOnHand: stockOnHand?.toString() ?? "0",
          allowPreorder: allowPreorder ?? false,
        })
        .returning();

      await tx.insert(variantOptionValues).values(
        resolved.map((selection) => ({
          variantId: variant.id,
          attributeId: selection.attributeId,
          optionId: selection.optionId,
        }))
      );

      await tx.insert(variantPrices).values({
        variantId: variant.id,
        currency,
        priceCents,
      });

      return variant;
    });

    const relations = await mapVariantsWithRelations([newVariant]);
    return relations.get(newVariant.id)!;
  }

  async updateVariantDetails(id: number, data: {
    sku?: string;
    unit?: string;
    stockOnHand?: number;
    allowPreorder?: boolean;
    selections?: { attributeId: number; optionId: number }[];
    currency?: string;
    priceCents?: number;
  }): Promise<ProductVariantWithRelations> {
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, id));
    if (!variant) {
      throw new Error("Variant not found");
    }

    const updateData: Partial<InsertProductVariant> = {
      sku: data.sku ?? variant.sku,
      unit: data.unit ?? variant.unit,
      stockOnHand: data.stockOnHand ?? Number(variant.stockOnHand),
      allowPreorder: data.allowPreorder ?? variant.allowPreorder,
    };

    let variantKey = variant.variantKey;
    let resolvedSelections: ProductVariantOption[] | null = null;
    if (data.selections) {
      const resolved = await resolveVariantSelections(variant.productId, data.selections);
      variantKey = resolved.variantKey;
      resolvedSelections = resolved.resolved;
    }

    const currency = data.currency ?? "IDR";

    const updatedVariant = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(productVariants)
        .set({
          ...updateData,
          stockOnHand: updateData.stockOnHand?.toString(),
          variantKey,
        })
        .where(eq(productVariants.id, id))
        .returning();

      if (resolvedSelections) {
        await tx
          .delete(variantOptionValues)
          .where(eq(variantOptionValues.variantId, id));
        await tx.insert(variantOptionValues).values(
          resolvedSelections.map((selection) => ({
            variantId: id,
            attributeId: selection.attributeId,
            optionId: selection.optionId,
          }))
        );
      }

      if (typeof data.priceCents === "number") {
        await tx
          .insert(variantPrices)
          .values({ variantId: id, currency, priceCents: data.priceCents })
          .onConflictDoUpdate({
            target: [variantPrices.variantId, variantPrices.currency],
            set: { priceCents: data.priceCents },
          });
      }

      return updated;
    });

    const relations = await mapVariantsWithRelations([updatedVariant]);
    return relations.get(updatedVariant.id)!;
  }

  async updateVariant(id: number, variant: Partial<InsertProductVariant>): Promise<ProductVariant> {
    const data = {
      ...variant,
      stockOnHand: variant.stockOnHand?.toString(),
    };
    const [updated] = await db.update(productVariants).set(data).where(eq(productVariants.id, id)).returning();
    return updated;
  }

  async deleteVariant(id: number): Promise<void> {
    await db.delete(productVariants).where(eq(productVariants.id, id));
  }
  
  async getVariant(id: number): Promise<ProductVariant | undefined> {
      const [v] = await db.select().from(productVariants).where(eq(productVariants.id, id));
      return v;
  }

  // --- Orders ---
  async getOrders(status?: string, packingStatus?: string): Promise<(Order & { customer: Customer, items: OrderItem[] })[]> {
    let query = db.select().from(orders);

    if (status) {
      query = query.where(eq(orders.paymentStatus, status as any)) as any;
    }
    if (packingStatus) {
      query = query.where(eq(orders.packingStatus, packingStatus as any)) as any;
    }

    const allOrders = await query.orderBy(desc(orders.createdAt));
    
    // Fetch related data
    // Optimisation: Could use JOINs but simple relation fetch is fine for now
    const result: (Order & { customer: Customer, items: OrderItem[] })[] = [];
    
    for (const order of allOrders) {
      const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId));
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      result.push({ ...order, customer, items });
    }

    return result;
  }

  async getOrder(id: number): Promise<(Order & { 
    customer: Customer, 
    items: (OrderItem & { variant: ProductVariantWithRelations })[],
    procurements: (Procurement & { variant: ProductVariantWithRelations })[] 
  }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId));
    
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    const procurementList = await db.select().from(procurements).where(eq(procurements.orderId, id));

    const variantIds = Array.from(
      new Set([
        ...items.map((item) => item.productVariantId),
        ...procurementList.map((procurement) => procurement.productVariantId),
      ])
    );
    const variants = variantIds.length
      ? await db
          .select()
          .from(productVariants)
          .where(inArray(productVariants.id, variantIds))
      : [];
    const variantRelations = await mapVariantsWithRelations(variants);

    return { 
      ...order, 
      customer, 
      items: items.map((item) => ({
        ...item,
        variant: variantRelations.get(item.productVariantId)!,
      })),
      procurements: procurementList.map((procurement) => ({
        ...procurement,
        variant: variantRelations.get(procurement.productVariantId)!,
      }))
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const data = { ...order, deliveryFee: order.deliveryFee?.toString() };
    const [newOrder] = await db.insert(orders).values(data).returning();
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order> {
    const data = { ...order, deliveryFee: order.deliveryFee?.toString() };
    const [updated] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return updated;
  }

  // --- Order Items ---
  async createOrderItem(item: InsertOrderItem & { isPreorder?: boolean }): Promise<OrderItem> {
    const data = { 
        ...item, 
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString()
    };
    const [newItem] = await db.insert(orderItems).values(data).returning();
    return newItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // --- Procurements ---
  async getProcurements(status?: string): Promise<(Procurement & { 
    variant: ProductVariantWithRelations,
    order: Order & { customer: Customer }
  })[]> {
    let query = db.select({
      procurement: procurements,
      order: orders,
      customer: customers
    })
    .from(procurements)
    .innerJoin(orders, eq(procurements.orderId, orders.id))
    .innerJoin(customers, eq(orders.customerId, customers.id));

    if (status) {
      query = query.where(eq(procurements.status, status as any)) as any;
    }

    const result = await query.orderBy(desc(procurements.createdAt));
    const variantIds = Array.from(new Set(result.map(row => row.procurement.productVariantId)));
    const variants = variantIds.length
      ? await db
          .select()
          .from(productVariants)
          .where(inArray(productVariants.id, variantIds))
      : [];
    const variantRelations = await mapVariantsWithRelations(variants);

    return result.map(row => ({
      ...row.procurement,
      variant: variantRelations.get(row.procurement.productVariantId)!,
      order: {
        ...row.order,
        customer: row.customer
      }
    }));
  }

  async createProcurement(procurement: InsertProcurement): Promise<Procurement> {
    const data = { ...procurement, neededQty: procurement.neededQty.toString() };
    const [newProcurement] = await db.insert(procurements).values(data).returning();
    return newProcurement;
  }

  async updateProcurement(id: number, procurement: Partial<InsertProcurement>): Promise<Procurement> {
      // If updating neededQty, cast it
      const data: any = { ...procurement };
      if (procurement.neededQty) data.neededQty = procurement.neededQty.toString();
      
      const [updated] = await db.update(procurements).set(data).where(eq(procurements.id, id)).returning();
      return updated;
  }
}

export const storage = new DatabaseStorage();
