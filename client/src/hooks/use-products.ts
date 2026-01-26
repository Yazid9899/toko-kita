import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBrand, type InsertProduct, type ProductWithRelations } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useProducts() {
  return useQuery<ProductWithRelations[]>({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

export function useProduct(id: number) {
  return useQuery<ProductWithRelations>({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch product");
      return api.products.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await fetch(api.products.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create product");
      return api.products.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Success", description: "Product created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProduct> }) => {
      const url = buildUrl(api.products.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update product");
      return api.products.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.products.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Success", description: "Product updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, data }: { productId: number; data: {
      sku: string;
      unit?: string;
      stockOnHand?: number;
      allowPreorder?: boolean;
      currency?: string;
      priceCents: number;
      selections: { attributeId: number; optionId: number }[];
    } }) => {
      const url = buildUrl(api.variants.create.path, { productId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const message = await res.text();
        try {
          const data = JSON.parse(message);
          throw new Error(data.message || "Failed to create variant");
        } catch {
          throw new Error(message || "Failed to create variant");
        }
      }
      return api.variants.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [api.products.get.path, productId] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] }); // Update list too as it might show variants
      toast({ title: "Success", description: "Variant added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, productId, data }: { id: number; productId: number; data: {
      sku?: string;
      unit?: string;
      stockOnHand?: number;
      allowPreorder?: boolean;
      currency?: string;
      priceCents?: number;
      selections?: { attributeId: number; optionId: number }[];
    } }) => {
      const url = buildUrl(api.variants.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const message = await res.text();
        try {
          const parsed = JSON.parse(message);
          throw new Error(parsed.message || "Failed to update variant");
        } catch {
          throw new Error(message || "Failed to update variant");
        }
      }
      return api.variants.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [api.products.get.path, productId] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Success", description: "Variant updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.variants.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete variant");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      // Note: Ideally we'd also invalidate the specific product, but we don't have productId here easily without passing it.
      // Invalidating the list is a safe bet, or we can just refetch everything.
      queryClient.invalidateQueries({ queryKey: [api.products.get.path] });
      toast({ title: "Success", description: "Variant deleted" });
    }
  });
}

export function useBrands() {
  return useQuery({
    queryKey: [api.brands.list.path],
    queryFn: async () => {
      const res = await fetch(api.brands.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch brands");
      return api.brands.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertBrand) => {
      const res = await fetch(api.brands.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create brand");
      return api.brands.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.brands.list.path] });
      toast({ title: "Success", description: "Brand created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBrand> }) => {
      const url = buildUrl(api.brands.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update brand");
      return api.brands.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.brands.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Success", description: "Brand updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useCreateAttribute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, data }: { productId: number; data: { name: string; code: string; sortOrder?: number; isActive?: boolean } }) => {
      const url = buildUrl(api.attributes.create.path, { productId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create attribute");
      return api.attributes.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [api.products.get.path, productId] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Success", description: "Attribute created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateAttribute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, productId, data }: { id: number; productId: number; data: { name?: string; code?: string; sortOrder?: number; isActive?: boolean } }) => {
      const url = buildUrl(api.attributes.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update attribute");
      return api.attributes.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [api.products.get.path, productId] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Success", description: "Attribute updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useCreateAttributeOption() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, attributeId, data }: { productId: number; attributeId: number; data: { value: string; sortOrder?: number; isActive?: boolean } }) => {
      const url = buildUrl(api.attributeOptions.create.path, { attributeId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create option");
      return api.attributeOptions.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [api.products.get.path, productId] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Success", description: "Option created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateAttributeOption() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, productId, data }: { id: number; productId: number; data: { value?: string; sortOrder?: number; isActive?: boolean } }) => {
      const url = buildUrl(api.attributeOptions.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update option");
      return api.attributeOptions.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: [api.products.get.path, productId] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Success", description: "Option updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
