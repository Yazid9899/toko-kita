import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export type CreateProcurementInput = {
  purchaseNumber?: string;
  orderId?: number;
  productVariantId: number;
  neededQty: number;
  capitalCostCents?: number;
  capitalCurrency?: string;
  status?: "TO_BUY" | "ARRIVED";
  notes?: string;
  additionalCosts?: Array<{ type: string; amount: number }>;
  extraCapital?: number;
  grandTotalCapital?: number;
};

export function useProcurements() {
  return useQuery({
    queryKey: [api.procurements.list.path],
    queryFn: async () => {
      const res = await fetch(api.procurements.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch procurement list");
      return api.procurements.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProcurement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateProcurementInput) => {
      const res = await fetch(api.procurements.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          status: data.status ?? "ARRIVED",
          capitalCurrency: data.capitalCurrency ?? "IDR",
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create purchase");
      return api.procurements.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.procurements.list.path] });
      toast({ title: "Success", description: "Purchase added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useCreateBulkProcurements() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (items: CreateProcurementInput[]) => {
      const created = await Promise.all(
        items.map(async (data) => {
          const res = await fetch(api.procurements.create.path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              status: data.status ?? "ARRIVED",
              capitalCurrency: data.capitalCurrency ?? "IDR",
            }),
            credentials: "include",
          });

          if (!res.ok) throw new Error("Failed to create purchase");
          return api.procurements.create.responses[201].parse(await res.json());
        })
      );

      return created;
    },
    onSuccess: (_, items) => {
      queryClient.invalidateQueries({ queryKey: [api.procurements.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({
        title: "Success",
        description: `Purchased ${items.length} item${items.length > 1 ? "s" : ""}`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateProcurement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: "TO_BUY" | "ARRIVED"; notes?: string }) => {
      const url = buildUrl(api.procurements.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update procurement status");
      return api.procurements.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.procurements.list.path] });
      // Might also affect product stock if we implemented that logic backend side, so invalidating products is safe
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Success", description: "Status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useBulkArriveProcurements() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      input:
        | number[]
        | {
            ids: number[];
            notes?: string;
            additionalCosts?: Array<{ type: string; amount: number }>;
            extraCapital?: number;
            grandTotalCapital?: number;
          },
    ) => {
      const ids = Array.isArray(input) ? input : input.ids;
      const notes = Array.isArray(input) ? undefined : input.notes;
      // TODO: Persist additional capital metadata after procurement purchase API supports it.
      await Promise.all(
        ids.map(async (id) => {
          const url = buildUrl(api.procurements.update.path, { id });
          const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ARRIVED", notes }),
            credentials: "include",
          });
          if (!res.ok) throw new Error("Failed to update procurement status");
          return api.procurements.update.responses[200].parse(await res.json());
        }),
      );
    },
    onSuccess: (_, input) => {
      const ids = Array.isArray(input) ? input : input.ids;
      queryClient.invalidateQueries({ queryKey: [api.procurements.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({
        title: "Success",
        description: `Purchased ${ids.length} item${ids.length > 1 ? "s" : ""}`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
