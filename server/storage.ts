import { db } from "./db";
import { 
  customers, products, productVariants, orders, orderItems, procurements,
  type Customer, type InsertCustomer,
  type Product, type InsertProduct,
  type ProductVariant, type InsertProductVariant,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Procurement, type InsertProcurement,
  type InsertProductVariant as InsertVariant,
} from "@shared/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // Customers
  getCustomers(search?: string): Promise<Customer[]>;
  getCustomer(id: number): Promise<(Customer & { orders: Order[] }) | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;

  // Products
  getProducts(): Promise<(Product & { variants: ProductVariant[] })[]>;
  getProduct(id: number): Promise<(Product & { variants: ProductVariant[] }) | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;

  // Variants
  createVariant(variant: InsertVariant): Promise<ProductVariant>;
  updateVariant(id: number, variant: Partial<InsertVariant>): Promise<ProductVariant>;
  deleteVariant(id: number): Promise<void>;
  getVariant(id: number): Promise<ProductVariant | undefined>;

  // Orders
  getOrders(status?: string, packingStatus?: string): Promise<(Order & { customer: Customer, items: OrderItem[] })[]>;
  getOrder(id: number): Promise<(Order & { 
    customer: Customer, 
    items: (OrderItem & { variant: ProductVariant })[],
    procurements: (Procurement & { variant: ProductVariant })[] 
  }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;

  // Order Items
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Procurement
  getProcurements(status?: string): Promise<(Procurement & { 
    variant: ProductVariant,
    order: Order & { customer: Customer }
  })[]>;
  createProcurement(procurement: InsertProcurement): Promise<Procurement>;
  updateProcurement(id: number, procurement: Partial<InsertProcurement>): Promise<Procurement>;
}

export class DatabaseStorage implements IStorage {
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

  // --- Products ---
  async getProducts(): Promise<(Product & { variants: ProductVariant[] })[]> {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    const allVariants = await db.select().from(productVariants);

    // Group variants by product
    const variantsByProduct = new Map<number, ProductVariant[]>();
    allVariants.forEach(v => {
      const existing = variantsByProduct.get(v.productId) || [];
      existing.push(v);
      variantsByProduct.set(v.productId, existing);
    });

    return allProducts.map(p => ({
      ...p,
      variants: variantsByProduct.get(p.id) || []
    }));
  }

  async getProduct(id: number): Promise<(Product & { variants: ProductVariant[] }) | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;

    const variants = await db.select().from(productVariants).where(eq(productVariants.productId, id));
    return { ...product, variants };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Cast defaultPrice to string for numeric/decimal field compatibility
    const data = { ...product, defaultPrice: product.defaultPrice?.toString() };
    const [newProduct] = await db.insert(products).values(data).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const data = { ...product, defaultPrice: product.defaultPrice?.toString() };
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  // --- Variants ---
  async createVariant(variant: InsertVariant): Promise<ProductVariant> {
     const data = { 
       ...variant, 
       defaultPrice: variant.defaultPrice?.toString(),
       stockOnHand: variant.stockOnHand?.toString()
     };
    const [newVariant] = await db.insert(productVariants).values(data).returning();
    return newVariant;
  }

  async updateVariant(id: number, variant: Partial<InsertVariant>): Promise<ProductVariant> {
    const data = { 
       ...variant, 
       defaultPrice: variant.defaultPrice?.toString(),
       stockOnHand: variant.stockOnHand?.toString()
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
    items: (OrderItem & { variant: ProductVariant })[],
    procurements: (Procurement & { variant: ProductVariant })[] 
  }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId));
    
    const items = await db.select({
      item: orderItems,
      variant: productVariants
    })
    .from(orderItems)
    .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
    .where(eq(orderItems.orderId, id));

    const procurementList = await db.select({
        procurement: procurements,
        variant: productVariants
    })
    .from(procurements)
    .leftJoin(productVariants, eq(procurements.productVariantId, productVariants.id))
    .where(eq(procurements.orderId, id));

    return { 
      ...order, 
      customer, 
      items: items.map(i => ({ ...i.item, variant: i.variant! })),
      procurements: procurementList.map(p => ({ ...p.procurement, variant: p.variant! }))
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
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
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
    variant: ProductVariant,
    order: Order & { customer: Customer }
  })[]> {
    let query = db.select({
      procurement: procurements,
      variant: productVariants,
      order: orders,
      customer: customers
    })
    .from(procurements)
    .innerJoin(productVariants, eq(procurements.productVariantId, productVariants.id))
    .innerJoin(orders, eq(procurements.orderId, orders.id))
    .innerJoin(customers, eq(orders.customerId, customers.id));

    if (status) {
      query = query.where(eq(procurements.status, status as any)) as any;
    }

    const result = await query.orderBy(desc(procurements.createdAt));

    return result.map(row => ({
      ...row.procurement,
      variant: row.variant,
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
