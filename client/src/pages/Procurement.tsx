import { Layout } from "@/components/Layout";
import { useProcurements, useUpdateProcurement } from "@/hooks/use-procurements";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ShoppingBag, Package, Truck, Search, Undo2 } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { formatVariantLabel } from "@/lib/variant-utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function Procurement() {
  const { data: procurements, isLoading } = useProcurements();
  const { mutate: updateStatus, isPending } = useUpdateProcurement();
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpdate = (id: number, status: "ORDERED" | "ARRIVED") => {
    updateStatus({ id, status });
  };

  const getProcurementItemLabel = (item: any) => {
    const options = Array.isArray(item?.variant?.optionValues) ? item.variant.optionValues : [];
    const productName = String(item?.variant?.productName ?? "").trim();
    const optionPart = options
      .map((selection: any) => selection?.optionValue)
      .filter(Boolean)
      .join(" - ");

    if (optionPart) {
      return productName ? `${productName} - ${optionPart}` : optionPart;
    }

    return formatVariantLabel(item.variant);
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProcurements = procurements?.filter((item) => {
    const statusMatches = filter === "ALL" ? true : item.status === filter;
    if (!statusMatches) return false;
    if (!normalizedSearch) return true;

    const itemLabel = getProcurementItemLabel(item).toLowerCase();
    const sku = String(item.variant?.sku ?? "").toLowerCase();
    const orderNumber = String(item.order?.orderNumber ?? "").toLowerCase();
    const customerName = String(item.order?.customer?.name ?? "").toLowerCase();

    return (
      itemLabel.includes(normalizedSearch) ||
      sku.includes(normalizedSearch) ||
      orderNumber.includes(normalizedSearch) ||
      customerName.includes(normalizedSearch)
    );
  });

  const toBuyCount = procurements?.filter((p) => p.status === "TO_BUY").length || 0;
  const orderedCount = procurements?.filter((p) => p.status === "ORDERED").length || 0;
  const arrivedCount = procurements?.filter((p) => p.status === "ARRIVED").length || 0;

  const getStatusDotClass = (status: string) => {
    if (status === "ARRIVED") return "bg-emerald-500";
    if (status === "ORDERED") return "bg-amber-500";
    if (status === "TO_BUY") return "bg-teal-500";
    return "bg-slate-400";
  };

  const getStatusLabelClass = (status: string) => {
    if (status === "ARRIVED") return "text-emerald-700";
    if (status === "ORDERED") return "text-amber-700";
    if (status === "TO_BUY") return "text-teal-700";
    return "text-slate-600";
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Procurement</h1>
          <p className="page-subtitle">Manage restocking for preorder items</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="border border-slate-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-slate-500">To Buy</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 leading-none">{toBuyCount}</p>
        </Card>
        <Card className="border border-slate-100 shadow-sm rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-slate-500">Ordered</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 leading-none">{orderedCount}</p>
        </Card>
        <Card className="border border-slate-100 shadow-sm rounded-2xl p-5 hidden md:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-slate-500">Completed</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 leading-none">{arrivedCount}</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <Tabs defaultValue="ALL" onValueChange={setFilter}>
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-100/80 p-1.5 text-slate-500">
            <TabsTrigger value="ALL" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm" data-testid="tab-all-procurement">
              All
            </TabsTrigger>
            <TabsTrigger value="TO_BUY" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-[#00848E] data-[state=active]:shadow-sm" data-testid="tab-to-buy">
              To Buy
            </TabsTrigger>
            <TabsTrigger value="ORDERED" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm" data-testid="tab-ordered">
              Ordered
            </TabsTrigger>
            <TabsTrigger value="ARRIVED" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm" data-testid="tab-arrived">
              Arrived
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-full lg:w-[360px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search item, SKU, order..."
              className="h-10 pl-9"
              data-testid="input-search-procurement"
            />
          </div>
        </div>
      </div>

      {/* Procurement List */}
      <Card className="overflow-hidden border border-slate-100 shadow-sm rounded-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#00848E]" />
          </div>
        ) : filteredProcurements?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-1">No items to display</p>
            <p className="text-sm text-slate-400">
              {searchQuery ? "No matching procurement items" : filter === "TO_BUY" ? "All items have been ordered!" : "Nothing matches this filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Item</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-3">For Order</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            {/* Rows */}
            {filteredProcurements?.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 px-6 py-4 hover:bg-slate-50/60 transition-colors items-center"
                data-testid={`procurement-row-${item.id}`}
              >
                <div className="lg:col-span-5 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{getProcurementItemLabel(item)}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {item.variant?.sku ? item.variant.sku : "No SKU"}
                  </p>
                </div>
                <div className="lg:col-span-1 text-left lg:text-center">
                  <span className="text-sm font-semibold text-slate-800">{Number(item.neededQty)}</span>
                </div>
                <div className="lg:col-span-3 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.order.orderNumber}</p>
                  <p className="text-xs text-slate-500 truncate">{item.order.customer.name}</p>
                </div>
                <div className="lg:col-span-1">
                  <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium", getStatusLabelClass(item.status))}>
                    <span className={cn("h-2 w-2 rounded-full", getStatusDotClass(item.status))} />
                    <span>{item.status === "TO_BUY" ? "To Buy" : item.status === "ORDERED" ? "Ordered" : "Arrived"}</span>
                  </div>
                </div>
                <div className="lg:col-span-2 flex items-center justify-start lg:justify-end gap-2">
                  {item.status === "TO_BUY" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-md border-slate-200 text-xs"
                      onClick={() => handleUpdate(item.id, "ORDERED")}
                      disabled={isPending}
                      data-testid={`button-mark-ordered-${item.id}`}
                    >
                      Ordered
                    </Button>
                  )}
                  {item.status === "ORDERED" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateStatus({ id: item.id, status: "TO_BUY" })}
                        disabled={isPending}
                        data-testid={`button-mark-to-buy-${item.id}`}
                        aria-label="Undo to To Buy"
                        title="Undo to To Buy"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-md border-slate-200 text-xs"
                        onClick={() => handleUpdate(item.id, "ARRIVED")}
                        disabled={isPending}
                        data-testid={`button-mark-arrived-${item.id}`}
                      >
                        Arrived
                      </Button>
                    </>
                  )}
                  {item.status === "ARRIVED" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateStatus({ id: item.id, status: "TO_BUY" })}
                        disabled={isPending}
                        data-testid={`button-mark-to-buy-${item.id}`}
                        aria-label="Undo to To Buy"
                        title="Undo to To Buy"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-xs text-slate-400">
                        {format(new Date(item.updatedAt), "MMM d")}
                      </span>
                    </>
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

