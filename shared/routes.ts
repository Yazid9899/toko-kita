import { z } from "zod";
import { 
  insertCustomerSchema, customers, 
  insertBrandSchema, brands,
  insertProductSchema, products,
  insertProductAttributeSchema, productAttributes,
  insertAttributeOptionSchema, attributeOptions,
  insertProductVariantSchema, productVariants,
  type ProductWithRelations,
  type ProductVariantWithRelations,
  insertOrderSchema, orders,
  insertOrderItemSchema, orderItems,
  insertProcurementSchema, procurements,
  customerTypeEnum, paymentTypeEnum, paymentStatusEnum, packingStatusEnum, procurementStatusEnum
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Extended schemas for API
export const createOrderWithItemsSchema = insertOrderSchema.extend({
  items: z.array(insertOrderItemSchema.omit({ orderId: true })),
});

export const api = {
  brands: {
    list: {
      method: 'GET' as const,
      path: '/api/brands',
      responses: {
        200: z.array(z.custom<typeof brands.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/brands',
      input: insertBrandSchema,
      responses: {
        201: z.custom<typeof brands.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/brands/:id',
      input: insertBrandSchema.partial(),
      responses: {
        200: z.custom<typeof brands.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  customers: {
    list: {
      method: 'GET' as const,
      path: '/api/customers',
      input: z.object({
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof customers.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/customers/:id',
      responses: {
        200: z.custom<typeof customers.$inferSelect & { orders: typeof orders.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/customers',
      input: insertCustomerSchema,
      responses: {
        201: z.custom<typeof customers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/customers/:id',
      input: insertCustomerSchema.partial(),
      responses: {
        200: z.custom<typeof customers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/customers/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<ProductWithRelations>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<ProductWithRelations>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id',
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  attributes: {
    create: {
      method: 'POST' as const,
      path: '/api/products/:productId/attributes',
      input: insertProductAttributeSchema.omit({ productId: true }),
      responses: {
        201: z.custom<typeof productAttributes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/attributes/:id',
      input: insertProductAttributeSchema.partial().omit({ productId: true }),
      responses: {
        200: z.custom<typeof productAttributes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  attributeOptions: {
    create: {
      method: 'POST' as const,
      path: '/api/attributes/:attributeId/options',
      input: insertAttributeOptionSchema.omit({ attributeId: true }),
      responses: {
        201: z.custom<typeof attributeOptions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/attribute-options/:id',
      input: insertAttributeOptionSchema.partial().omit({ attributeId: true }),
      responses: {
        200: z.custom<typeof attributeOptions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  variants: {
    create: {
      method: 'POST' as const,
      path: '/api/products/:productId/variants',
      input: z.object({
        sku: z.string(),
        unit: z.string().optional(),
        stockOnHand: z.number().optional(),
        allowPreorder: z.boolean().optional(),
        currency: z.string().optional(),
        priceCents: z.number(),
        selections: z.array(z.object({
          attributeId: z.number(),
          optionId: z.number(),
        })).min(1),
      }),
      responses: {
        201: z.custom<ProductVariantWithRelations>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/variants/:id',
      input: z.object({
        sku: z.string().optional(),
        unit: z.string().optional(),
        stockOnHand: z.number().optional(),
        allowPreorder: z.boolean().optional(),
        currency: z.string().optional(),
        priceCents: z.number().optional(),
        selections: z.array(z.object({
          attributeId: z.number(),
          optionId: z.number(),
        })).optional(),
      }),
      responses: {
        200: z.custom<ProductVariantWithRelations>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
        method: 'DELETE' as const,
        path: '/api/variants/:id',
        responses: {
          204: z.void(),
          404: errorSchemas.notFound,
        },
      },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      input: z.object({
        status: z.enum(paymentStatusEnum.enumValues).optional(),
        packingStatus: z.enum(packingStatusEnum.enumValues).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect & { customer: typeof customers.$inferSelect, items: typeof orderItems.$inferSelect[] }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id',
      responses: {
        200: z.custom<typeof orders.$inferSelect & { 
          customer: typeof customers.$inferSelect, 
          items: (typeof orderItems.$inferSelect & { variant: ProductVariantWithRelations })[],
          procurements: (typeof procurements.$inferSelect & { variant: ProductVariantWithRelations })[]
        }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: createOrderWithItemsSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
        method: 'PUT' as const,
        path: '/api/orders/:id',
        input: insertOrderSchema.partial(),
        responses: {
          200: z.custom<typeof orders.$inferSelect>(),
          404: errorSchemas.notFound,
        },
    }
  },
  procurements: {
    list: {
      method: 'GET' as const,
      path: '/api/procurements',
      input: z.object({
        status: z.enum(procurementStatusEnum.enumValues).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof procurements.$inferSelect & { 
            variant: ProductVariantWithRelations,
            order: typeof orders.$inferSelect & { customer: typeof customers.$inferSelect }
        }>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/procurements/:id',
      input: z.object({
        status: z.enum(procurementStatusEnum.enumValues),
        notes: z.string().optional()
      }),
      responses: {
        200: z.custom<typeof procurements.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
