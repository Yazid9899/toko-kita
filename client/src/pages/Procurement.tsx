import { Layout } from "@/components/Layout";
import { useBulkArriveProcurements, useProcurements, useUpdateProcurement } from "@/hooks/use-procurements";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, ShoppingBag, Package, Clock, Search } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { formatVariantLabel } from "@/lib/variant-utils";

export default function Procurement() {
  const { data: procurements, isLoading } = useProcurements();
  const { mutate: updateStatus, isPending } = useUpdateProcurement();
  const { mutate: bulkArrive, isPending: isBulkPurchasing } = useBulkArriveProcurements();
  const [filter, setFilter] = useState("TO_BUY");
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});

  const filteredProcurements = procurements?.filter((item) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  const toBuyItems = useMemo(
    () => (procurements ?? []).filter((item) => item.status === "TO_BUY"),
    [procurements],
  );

  const filteredToBuyItems = useMemo(() => {
    const keyword = purchaseSearch.trim().toLowerCase();
    if (!keyword) return toBuyItems;

    return toBuyItems.filter((item) => {
      const text = [
        item.variant.sku,
        formatVariantLabel(item.variant),
        item.order?.orderNumber,
        item.order?.customer?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(keyword);
    });
  }, [purchaseSearch, toBuyItems]);

  const allFilteredSelected =
    filteredToBuyItems.length > 0 && filteredToBuyItems.every((item) => selectedIds[item.id]);
  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  const toggleAllFiltered = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      for (const item of filteredToBuyItems) {
        next[item.id] = checked;
      }
      return next;
    });
  };

  const handleBulkPurchase = () => {
    const ids = Object.entries(selectedIds)
      .filter(([, checked]) => checked)
      .map(([id]) => Number(id));

    if (ids.length === 0) return;

    bulkArrive(ids, {
      onSuccess: () => {
        setPurchaseOpen(false);
        setSelectedIds({});
        setPurchaseSearch("");
      },
    });
  };

  const toBuyCount = procurements?.filter((item) => item.status === "TO_BUY").length || 0;
  const arrivedCount = procurements?.filter((item) => item.status === "ARRIVED").length || 0;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Procurement</h1>
          <p className="page-subtitle">List of order-driven items that need to be purchased</p>
        </div>

        <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-purchase-items" disabled={toBuyCount === 0}>
              Purchase Items
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>Purchase To Buy Items</DialogTitle>
              <DialogDescription>Select one or more items and mark them as arrived.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={purchaseSearch}
                  onChange={(event) => setPurchaseSearch(event.target.value)}
                  placeholder="Search SKU, variant, order, or customer"
                  className="pl-9"
                  data-testid="input-purchase-search"
                />
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <div className="col-span-1">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={(value) => toggleAllFiltered(Boolean(value))}
                    />
                  </div>
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-4">Reference</div>
                </div>
                <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                  {filteredToBuyItems.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-slate-500">No to-buy items found.</div>
                  ) : (
                    filteredToBuyItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center">
                        <div className="col-span-1">
                          <Checkbox
                            checked={!!selectedIds[item.id]}
                            onCheckedChange={(value) =>
                              setSelectedIds((prev) => ({ ...prev, [item.id]: Boolean(value) }))
                            }
                          />
                        </div>
                        <div className="col-span-5">
                          <p className="text-sm font-medium text-slate-800">{item.variant.sku}</p>
                        </div>
                        <div className="col-span-2 text-center text-sm font-semibold text-[#00848E]">
                          {Number(item.neededQty)}
                        </div>
                        <div className="col-span-4">
                          <p className="text-sm font-medium text-slate-700">{item.order?.orderNumber ?? "Manual"}</p>
                          <p className="text-xs text-slate-500">{item.order?.customer?.name ?? "-"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPurchaseOpen(false)} disabled={isBulkPurchasing}>
                Cancel
              </Button>
              <Button
                onClick={handleBulkPurchase}
                disabled={isBulkPurchasing || selectedCount === 0}
                data-testid="button-confirm-purchase-items"
              >
                {isBulkPurchasing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Purchase Selected ({selectedCount})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00848E] to-[#00A3AE] flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-500">To Buy</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{toBuyCount}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-500">Arrived</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{arrivedCount}</p>
        </Card>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="TO_BUY" onValueChange={setFilter}>
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-100/80 p-1.5 text-slate-500">
            <TabsTrigger value="TO_BUY" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-[#00848E] data-[state=active]:shadow-sm" data-testid="tab-to-buy">
              To Buy
            </TabsTrigger>
            <TabsTrigger value="ALL" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm" data-testid="tab-all-procurement">
              All
            </TabsTrigger>
            <TabsTrigger value="ARRIVED" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm" data-testid="tab-arrived">
              Arrived
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#00848E]" />
          </div>
        ) : filteredProcurements?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-slate-600 font-medium">No items to display</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">Item</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-3">Reference</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {filteredProcurements?.map((item) => (
              <div
                key={item.id}
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center transition-colors ${item.status === "ARRIVED" ? "bg-slate-50/50" : "hover:bg-slate-50/60"}`}
                data-testid={`procurement-row-${item.id}`}
              >
                <div className="md:col-span-4">
                  <div>
                    <p className="font-semibold text-slate-800">{item.variant.sku}</p>
                  </div>
                </div>

                <div className="md:col-span-2 hidden md:block">
                  <span className="text-xl font-bold text-[#00848E]">{Number(item.neededQty)}</span>
                  <span className="text-sm text-slate-400 ml-1">units</span>
                </div>

                <div className="md:col-span-3">
                  <p className="font-medium text-slate-700">{item.order?.orderNumber ?? "Manual"}</p>
                  <p className="text-sm text-slate-500">{item.order?.customer?.name ?? "-"}</p>
                </div>

                <div className="md:col-span-1">
                  <StatusBadge status={item.status} type="procurement" />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  {item.status === "TO_BUY" ? (
                    <Button
                      variant="outline"
                      className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => updateStatus({ id: item.id, status: "ARRIVED" })}
                      disabled={isPending}
                      data-testid={`button-mark-arrived-${item.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Arrived
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(item.updatedAt), "MMM d")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
}
