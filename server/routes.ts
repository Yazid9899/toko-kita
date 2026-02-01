import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, createOrderWithItemsSchema } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup (local JWT)
  await setupAuth(app);
  registerAuthRoutes(app);

  // --- BRANDS ---
  app.get(api.brands.list.path, async (_req, res) => {
    const brands = await storage.getBrands();
    res.json(brands);
  });

  app.post(api.brands.create.path, async (req, res) => {
    try {
      const input = api.brands.create.input.parse(req.body);
      const brand = await storage.createBrand(input);
      res.status(201).json(brand);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });

  app.put(api.brands.update.path, async (req, res) => {
    try {
      const input = api.brands.update.input.parse(req.body);
      const brand = await storage.updateBrand(Number(req.params.id), input);
      res.json(brand);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });

  // --- CUSTOMERS ---
  app.get(api.customers.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const customers = await storage.getCustomers(search);
    res.json(customers);
  });

  app.get(api.customers.get.path, async (req, res) => {
    const customer = await storage.getCustomer(Number(req.params.id));
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  });

  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer(input);
      res.status(201).json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });

  app.put(api.customers.update.path, async (req, res) => {
    try {
      const input = api.customers.update.input.parse(req.body);
      const customer = await storage.updateCustomer(Number(req.params.id), input);
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      res.json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });

  app.delete(api.customers.delete.path, async (req, res) => {
    try {
      const deleted = await storage.deleteCustomer(Number(req.params.id));
      if (!deleted) return res.status(404).json({ message: "Customer not found" });
      res.status(204).send();
    } catch (err: any) {
      if (err.message === "Cannot delete customer with existing orders") {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  });

  // --- PRODUCTS ---
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    try {
        const input = api.products.update.input.parse(req.body);
        const product = await storage.updateProduct(Number(req.params.id), input);
        res.json(product);
    } catch (err) {
        if (err instanceof z.ZodError) res.status(400).json(err.errors);
        else throw err;
    }
  });

  // --- ATTRIBUTES ---
  app.post(api.attributes.create.path, async (req, res) => {
    try {
      const input = api.attributes.create.input.parse(req.body);
      const attribute = await storage.createAttribute({
        ...input,
        productId: Number(req.params.productId),
      });
      res.status(201).json(attribute);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });

  app.put(api.attributes.update.path, async (req, res) => {
    try {
      const input = api.attributes.update.input.parse(req.body);
      const attribute = await storage.updateAttribute(Number(req.params.id), input);
      res.json(attribute);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });

  // --- ATTRIBUTE OPTIONS ---
  app.post(api.attributeOptions.create.path, async (req, res) => {
    try {
      const input = api.attributeOptions.create.input.parse(req.body);
      const option = await storage.createAttributeOption({
        ...input,
        attributeId: Number(req.params.attributeId),
      });
      res.status(201).json(option);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });

  app.put(api.attributeOptions.update.path, async (req, res) => {
    try {
      const input = api.attributeOptions.update.input.parse(req.body);
      const option = await storage.updateAttributeOption(Number(req.params.id), input);
      res.json(option);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });

  // --- VARIANTS ---
  app.post(api.variants.create.path, async (req, res) => {
    try {
        const input = api.variants.create.input.parse(req.body);
        const variant = await storage.createVariantWithSelections({
          productId: Number(req.params.productId),
          sku: input.sku,
          unit: input.unit,
          stockOnHand: input.stockOnHand,
          allowPreorder: input.allowPreorder,
          selections: input.selections,
          currency: input.currency ?? "IDR",
          priceCents: input.priceCents,
        });
        res.status(201).json(variant);
    } catch (err) {
        if (err instanceof z.ZodError) res.status(400).json(err.errors);
        else if (err instanceof Error) res.status(400).json({ message: err.message });
        else throw err;
    }
  });

  app.put(api.variants.update.path, async (req, res) => {
    try {
      const input = api.variants.update.input.parse(req.body);
      const variant = await storage.updateVariantDetails(Number(req.params.id), input);
      res.json(variant);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else if (err instanceof Error) res.status(400).json({ message: err.message });
      else throw err;
    }
  });

  app.delete(api.variants.delete.path, async (req, res) => {
      try {
          await storage.deleteVariant(Number(req.params.id));
          res.status(204).send();
      } catch (err) {
          res.status(404).json({ message: "Variant not found" });
      }
  });

  // --- ORDERS ---
  app.get(api.orders.list.path, async (req, res) => {
    const { status, packingStatus } = req.query;
    const orders = await storage.getOrders(status as string, packingStatus as string);
    res.json(orders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      // 1. Create Order
      const { items, ...orderData } = createOrderWithItemsSchema.parse(req.body);
      
      // Auto-generate order number (Simple timestamp + random suffix or sequential in real apps)
      // Ideally this should be more robust, but for this scale:
      const count = (await storage.getOrders()).length + 1;
      const orderNumber = `TK-${String(count).padStart(6, '0')}`;
      
      const newOrder = await storage.createOrder({
        ...orderData,
        orderNumber,
      });

      // 2. Process Items
      for (const item of items) {
        const variant = await storage.getVariant(item.productVariantId);
        if (!variant) continue; // Should probably throw error

        const currentStock = Number(variant.stockOnHand);
        const requestQty = item.quantity;
        
        let isPreorder = false;
        
        // Stock Logic
        if (requestQty > currentStock) {
            // Insufficient stock -> Preorder & Procurement
            isPreorder = true;
            
            // Calculate needed amount. 
            // If stock > 0, we take it all and order the rest? 
            // Or if allowPreorder is true, maybe we just mark the whole item as preorder?
            // "If ordered qty exceeds stockOnHand ... mark item as preorder" -> Implies whole item is preorder status
            // "create/update To Buy entry with neededQty"
            
            const neededQty = requestQty - Math.max(0, currentStock); // Simplification: assume we use existing stock
            
            await storage.createProcurement({
                orderId: newOrder.id,
                productVariantId: item.productVariantId,
                neededQty,
                status: 'TO_BUY'
            });

            // Update variant stock to 0 (or negative? Let's keep it 0 and use procurement to track deficit)
            if (currentStock > 0) {
                 await storage.updateVariant(variant.id, { stockOnHand: 0 });
            }

        } else {
            // Sufficient stock
            await storage.updateVariant(variant.id, { stockOnHand: currentStock - requestQty });
        }

        await storage.createOrderItem({
            ...item,
            orderId: newOrder.id,
            isPreorder
        });
      }

      // Return full order object
      const fullOrder = await storage.getOrder(newOrder.id);
      res.status(201).json(fullOrder);

    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.orders.update.path, async (req, res) => {
    try {
        const input = api.orders.update.input.parse(req.body);
        const order = await storage.updateOrder(Number(req.params.id), input);
        res.json(order);
    } catch (err) {
        if (err instanceof z.ZodError) res.status(400).json(err.errors);
        else throw err;
    }
  });

  // --- PROCUREMENTS ---
  app.get(api.procurements.list.path, async (req, res) => {
    const status = req.query.status as string | undefined;
    const procurements = await storage.getProcurements(status);
    res.json(procurements);
  });

  app.put(api.procurements.update.path, async (req, res) => {
    try {
        const input = api.procurements.update.input.parse(req.body);
        
        // If status changing to ARRIVED, logic to update stock?
        // "When ProcurementItem marked ARRIVED: increase stockOnHand (optional) OR prompt admin..."
        // Let's do auto-increment for simplicity in this MVP
        if (input.status === 'ARRIVED') {
            const procurement = (await storage.getProcurements()).find(p => p.id === Number(req.params.id));
            if (procurement && procurement.status !== 'ARRIVED') {
                 // It wasn't arrived before, so now we add stock
                 const variant = await storage.getVariant(procurement.productVariantId);
                 if (variant) {
                     await storage.updateVariant(variant.id, {
                         stockOnHand: Number(variant.stockOnHand) + Number(procurement.neededQty)
                     });
                 }
            }
        }

        const procurement = await storage.updateProcurement(Number(req.params.id), input);
        res.json(procurement);
    } catch (err) {
        if (err instanceof z.ZodError) res.status(400).json(err.errors);
        else throw err;
    }
  });


  return httpServer;
}
