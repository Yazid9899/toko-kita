import { Layout } from "@/components/Layout";
import { useProcurements, useUpdateProcurement } from "@/hooks/use-procurements";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ShoppingBag, Package, Truck, Search, Undo2, type LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ProcurementStatus = "TO_BUY" | "ORDERED" | "ARRIVED";

const CARD_BASE_CLASS = "border border-slate-100 shadow-sm rounded-2xl";
const TAB_TRIGGER_CLASS =
  "rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm";
const ACTION_BUTTON_CLASS = "h-8 rounded-md border-slate-200 text-xs";
const UNDO_BUTTON_CLASS = "h-8 w-8 p-0";

const STATUS_META: Record<ProcurementStatus, { label: string; dotClass: string; textClass: string }> = {
  TO_BUY: { label: "To Buy", dotClass: "bg-teal-500", textClass: "text-teal-700" },
  ORDERED: { label: "Ordered", dotClass: "bg-amber-500", textClass: "text-amber-700" },
  ARRIVED: { label: "Arrived", dotClass: "bg-emerald-500", textClass: "text-emerald-700" },
};

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  className,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  iconClassName: string;
  className?: string;
}) {
  return (
    <Card className={cn(CARD_BASE_CLASS, "p-5", className)}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconClassName)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-slate-500">{title}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
    </Card>
  );
}

export default function Procurement() {
  const { data: procurements, isLoading } = useProcurements();
  const { mutate: updateStatus, isPending } = useUpdateProcurement();
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const getProcurementItemLabel = (item: any) => {
    const options = Array.isArray(item?.variant?.optionValues) ? item.variant.optionValues : [];
    const productName = String(item?.variant?.productName ?? "").trim();
    const optionPart = options
      .map((selection: any) => selection?.optionValue ?? selection?.value)
      .filter(Boolean)
      .join(" - ");

    if (optionPart) return productName ? `${productName} - ${optionPart}` : optionPart;
    return productName || String(item?.variant?.sku ?? "Default");
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

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Procurement</h1>
          <p className="page-subtitle">Manage restocking for preorder items</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="To Buy"
          value={toBuyCount}
          icon={ShoppingBag}
          iconClassName="bg-teal-50 text-teal-600"
        />
        <SummaryCard
          title="Ordered"
          value={orderedCount}
          icon={Truck}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <SummaryCard
          title="Completed"
          value={arrivedCount}
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
          className="hidden md:block"
        />
      </div>

      <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <Tabs defaultValue="ALL" onValueChange={setFilter}>
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-100/80 p-1.5 text-slate-500">
            <TabsTrigger
              value="ALL"
              className={cn(TAB_TRIGGER_CLASS, "data-[state=active]:text-slate-900")}
              data-testid="tab-all-procurement"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="TO_BUY"
              className={cn(TAB_TRIGGER_CLASS, "data-[state=active]:text-[#00848E]")}
              data-testid="tab-to-buy"
            >
              To Buy
            </TabsTrigger>
            <TabsTrigger
              value="ORDERED"
              className={cn(TAB_TRIGGER_CLASS, "data-[state=active]:text-amber-600")}
              data-testid="tab-ordered"
            >
              Ordered
            </TabsTrigger>
            <TabsTrigger
              value="ARRIVED"
              className={cn(TAB_TRIGGER_CLASS, "data-[state=active]:text-emerald-600")}
              data-testid="tab-arrived"
            >
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

      <Card className={cn(CARD_BASE_CLASS, "overflow-hidden")}>
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
              {searchQuery
                ? "No matching procurement items"
                : filter === "TO_BUY"
                  ? "All items have been ordered!"
                  : "Nothing matches this filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Item</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-3">For Order</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            {filteredProcurements?.map((item) => {
              const statusMeta = STATUS_META[item.status as ProcurementStatus] ?? {
                label: String(item.status),
                dotClass: "bg-slate-400",
                textClass: "text-slate-600",
              };

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-3 px-6 py-4 hover:bg-slate-50/60 transition-colors items-center"
                  data-testid={`procurement-row-${item.id}`}
                >
                  <div className="lg:col-span-5 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{getProcurementItemLabel(item)}</p>
                    <p className="text-xs text-slate-500 truncate">{item.variant?.sku ? item.variant.sku : "No SKU"}</p>
                  </div>
                  <div className="lg:col-span-1 text-left lg:text-center">
                    <span className="text-sm font-semibold text-slate-800">{Number(item.neededQty)}</span>
                  </div>
                  <div className="lg:col-span-3 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.order.orderNumber}</p>
                    <p className="text-xs text-slate-500 truncate">{item.order.customer.name}</p>
                  </div>
                  <div className="lg:col-span-1">
                    <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium", statusMeta.textClass)}>
                      <span className={cn("h-2 w-2 rounded-full", statusMeta.dotClass)} />
                      <span>{statusMeta.label}</span>
                    </div>
                  </div>
                  <div className="lg:col-span-2 flex items-center justify-start lg:justify-end gap-2">
                    {item.status === "TO_BUY" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={ACTION_BUTTON_CLASS}
                        onClick={() => updateStatus({ id: item.id, status: "ORDERED" })}
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
                          className={UNDO_BUTTON_CLASS}
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
                          className={ACTION_BUTTON_CLASS}
                          onClick={() => updateStatus({ id: item.id, status: "ARRIVED" })}
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
                          className={UNDO_BUTTON_CLASS}
                          onClick={() => updateStatus({ id: item.id, status: "TO_BUY" })}
                          disabled={isPending}
                          data-testid={`button-mark-to-buy-${item.id}`}
                          aria-label="Undo to To Buy"
                          title="Undo to To Buy"
                        >
                          <Undo2 className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-xs text-slate-400">{format(new Date(item.updatedAt), "MMM d")}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Layout>
  );
}
