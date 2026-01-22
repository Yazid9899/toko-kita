import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

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

export function useUpdateProcurement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: "TO_BUY" | "ORDERED" | "ARRIVED"; notes?: string }) => {
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
