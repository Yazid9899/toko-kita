import { Layout } from "@/components/Layout";
import { useBulkArriveProcurements, useProcurements } from "@/hooks/use-procurements";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Check, Copy, Loader2, Package, Search } from "lucide-react";
import { useMemo, useState } from "react";

function formatVariantOptionValues(variant: { optionValues: { attributeId: number; optionValue: string }[]; sku?: string }) {
  const values = [...variant.optionValues]
    .sort((a, b) => a.attributeId - b.attributeId)
    .map((selection) => selection.optionValue);

  if (values.length === 0) {
    return variant.sku || "Default";
  }

  return values.join(" - ");
}

export default function Purchases() {
  const { data: procurements, isLoading } = useProcurements();
  const { mutate: bulkArrive, isPending: isBulkPurchasing } = useBulkArriveProcurements();
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});
  const [copiedPurchaseId, setCopiedPurchaseId] = useState<number | null>(null);

  const toBuyItems = useMemo(
    () => (procurements ?? []).filter((item) => item.status === "TO_BUY"),
    [procurements],
  );
  const purchasedItems = useMemo(
    () => (procurements ?? []).filter((item) => item.status !== "TO_BUY"),
    [procurements],
  );
  const filteredPurchasedItems = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return purchasedItems;

    return purchasedItems.filter((item) => {
      const text = [
        item.purchaseNumber,
        item.variant.sku,
        formatVariantOptionValues(item.variant),
        item.order?.orderNumber,
        item.order?.customer?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(keyword);
    });
  }, [searchQuery, purchasedItems]);

  const filteredToBuyItems = useMemo(() => {
    const keyword = purchaseSearch.trim().toLowerCase();
    if (!keyword) return toBuyItems;

    return toBuyItems.filter((item) => {
      const text = [
        item.purchaseNumber,
        item.variant.sku,
        formatVariantOptionValues(item.variant),
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

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Purchases</h1>
          <p className="page-subtitle">Bought transactions and items to buy</p>
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
              <DialogDescription>Select one or more items and mark them as purchased.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={purchaseSearch}
                  onChange={(event) => setPurchaseSearch(event.target.value)}
                  placeholder="Search purchase number, SKU, variant, order, or customer"
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
                      <div key={item.id} className="grid grid-cols-12 gap-3 px-4 py-2 items-center">
                        <div className="col-span-1">
                          <Checkbox
                            checked={!!selectedIds[item.id]}
                            onCheckedChange={(value) =>
                              setSelectedIds((prev) => ({ ...prev, [item.id]: Boolean(value) }))
                            }
                          />
                        </div>
                        <div className="col-span-5">
                          <p className="text-sm font-medium text-slate-800">{formatVariantOptionValues(item.variant)}</p>
                          <p className="text-xs text-slate-500">{item.variant.sku}</p>
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

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search purchase no, SKU, item, reference..."
            className="h-10 pl-9"
            data-testid="input-search-purchases"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <Card className="overflow-hidden border border-slate-100 shadow-sm rounded-2xl xl:col-span-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#5C6AC4]" />
            </div>
          ) : filteredPurchasedItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500">No purchase transactions found</p>
            </div>
          ) : (
            <Table className="min-w-[860px]">
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Purchase No</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Supplier / Reference</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Item Summary</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Qty / Total</TableHead>
                  <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchasedItems.map((item) => {
                  const hasCost = typeof item.capitalCostCents === "number";
                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-slate-50/60"
                      data-testid={`purchase-transaction-row-${item.id}`}
                    >
                      <TableCell className="px-4 py-2 align-middle">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-slate-800">{item.purchaseNumber ?? "-"}</p>
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Purchased
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle text-sm text-slate-600">
                        {item.createdAt ? format(new Date(item.createdAt), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        <p className="text-sm font-medium text-slate-800">{item.order?.customer?.name ?? "-"}</p>
                        <p className="text-xs text-slate-500">{item.order?.orderNumber ?? "Manual"}</p>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        <p className="text-sm font-medium text-slate-800">{formatVariantOptionValues(item.variant)}</p>
                        <p className="text-xs text-slate-500">{item.variant.sku}</p>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        <p className="text-sm font-semibold text-[#00848E]">{Number(item.neededQty)} unit</p>
                        <p className="text-xs text-slate-500">
                          {hasCost ? `${item.capitalCurrency ?? "IDR"} ${Number(item.capitalCostCents).toLocaleString()}` : "-"}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right align-middle">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-700"
                          disabled={!item.purchaseNumber}
                          onClick={() => {
                            if (!item.purchaseNumber) return;
                            navigator.clipboard.writeText(item.purchaseNumber);
                            setCopiedPurchaseId(item.id);
                            setTimeout(() => setCopiedPurchaseId((current) => (current === item.id ? null : current)), 1200);
                          }}
                          data-testid={`button-copy-purchase-number-${item.id}`}
                        >
                          {copiedPurchaseId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="overflow-hidden border border-slate-100 shadow-sm rounded-2xl xl:col-span-4">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <p className="text-sm font-semibold text-slate-800">To Buy</p>
            <p className="text-xs text-slate-500">{toBuyCount} pending item{toBuyCount === 1 ? "" : "s"}</p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#5C6AC4]" />
            </div>
          ) : toBuyItems.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-slate-500">No items to buy</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
              {toBuyItems.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-3 transition-colors hover:bg-slate-50/60"
                  data-testid={`to-buy-item-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{formatVariantOptionValues(item.variant)}</p>
                      <p className="text-xs text-slate-500 truncate">{item.variant.sku || "-"}</p>
                      <p className="mt-1 text-xs text-slate-500 truncate">
                        {item.order?.orderNumber ? `${item.order.orderNumber} - ${item.order?.customer?.name ?? "-"}` : "Manual"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-[#00848E]">{Number(item.neededQty)}x</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
