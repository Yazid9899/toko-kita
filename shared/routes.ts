import { z } from "zod";
import { 
  insertCustomerSchema, customers, 
  insertProductSchema, products,
  insertProductVariantSchema, productVariants,
  insertOrderSchema, orders,
  insertOrderItemSchema, orderItems,
  insertProcurementSchema, procurements,
  unitTypeEnum, customerTypeEnum, paymentTypeEnum, paymentStatusEnum, packingStatusEnum, procurementStatusEnum
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
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect & { variants: typeof productVariants.$inferSelect[] }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect & { variants: typeof productVariants.$inferSelect[] }>(),
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
  variants: {
    create: {
      method: 'POST' as const,
      path: '/api/products/:productId/variants',
      input: insertProductVariantSchema.omit({ productId: true }),
      responses: {
        201: z.custom<typeof productVariants.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/variants/:id',
      input: insertProductVariantSchema.partial().omit({ productId: true }),
      responses: {
        200: z.custom<typeof productVariants.$inferSelect>(),
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
          items: (typeof orderItems.$inferSelect & { variant: typeof productVariants.$inferSelect })[],
          procurements: (typeof procurements.$inferSelect & { variant: typeof productVariants.$inferSelect })[]
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
            variant: typeof productVariants.$inferSelect,
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
