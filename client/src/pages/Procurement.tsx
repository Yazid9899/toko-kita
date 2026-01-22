import { Layout } from "@/components/Layout";
import { useProcurements, useUpdateProcurement } from "@/hooks/use-procurements";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ShoppingBag, Package, Truck, Clock } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Procurement() {
  const { data: procurements, isLoading } = useProcurements();
  const { mutate: updateStatus, isPending } = useUpdateProcurement();
  const [filter, setFilter] = useState("ALL");

  const handleUpdate = (id: number, status: "ORDERED" | "ARRIVED") => {
    updateStatus({ id, status });
  };

  const filteredProcurements = procurements?.filter(p => {
    if (filter === "ALL") return true;
    return p.status === filter;
  });

  const toBuyCount = procurements?.filter(p => p.status === "TO_BUY").length || 0;
  const orderedCount = procurements?.filter(p => p.status === "ORDERED").length || 0;

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="page-title">Procurement</h1>
        <p className="page-subtitle">Manage restocking for preorder items</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00848E] to-[#00A3AE] flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-500">To Buy</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{toBuyCount}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-md">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-500">Ordered</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{orderedCount}</p>
        </div>
        <div className="stat-card hidden md:block">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-500">Completed</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{procurements?.filter(p => p.status === "ARRIVED").length || 0}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
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
      </div>

      {/* Procurement List */}
      <div className="premium-card p-0 overflow-hidden">
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
            <p className="text-sm text-slate-400 mt-1">
              {filter === "TO_BUY" ? "All items have been ordered!" : "Nothing matches this filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">Item</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-3">For Order</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            {/* Rows */}
            {filteredProcurements?.map((item) => (
              <div 
                key={item.id} 
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center transition-colors ${item.status === 'ARRIVED' ? 'bg-slate-50/50 opacity-70' : 'hover:bg-slate-50/60'}`}
                data-testid={`procurement-row-${item.id}`}
              >
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    item.status === 'TO_BUY' ? 'bg-gradient-to-br from-[#00848E]/10 to-[#00A3AE]/10' :
                    item.status === 'ORDERED' ? 'bg-amber-100' : 'bg-emerald-100'
                  }`}>
                    {item.status === 'TO_BUY' && <ShoppingBag className="w-5 h-5 text-[#00848E]" />}
                    {item.status === 'ORDERED' && <Truck className="w-5 h-5 text-amber-600" />}
                    {item.status === 'ARRIVED' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{item.variant.variantName}</p>
                    <p className="text-sm text-slate-500 md:hidden">Qty: {Number(item.neededQty)}</p>
                  </div>
                </div>
                <div className="md:col-span-2 hidden md:block">
                  <span className="text-xl font-bold text-[#00848E]">{Number(item.neededQty)}</span>
                  <span className="text-sm text-slate-400 ml-1">units</span>
                </div>
                <div className="md:col-span-3">
                  <p className="font-medium text-slate-700">{item.order.orderNumber}</p>
                  <p className="text-sm text-slate-500">{item.order.customer.name}</p>
                </div>
                <div className="md:col-span-1">
                  <StatusBadge status={item.status} type="procurement" />
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  {item.status === 'TO_BUY' && (
                    <Button 
                      variant="outline" 
                      className="rounded-xl border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50"
                      onClick={() => handleUpdate(item.id, 'ORDERED')}
                      disabled={isPending}
                      data-testid={`button-mark-ordered-${item.id}`}
                    >
                      <Truck className="w-4 h-4 mr-2" /> Ordered
                    </Button>
                  )}
                  {item.status === 'ORDERED' && (
                    <Button 
                      variant="outline" 
                      className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleUpdate(item.id, 'ARRIVED')}
                      disabled={isPending}
                      data-testid={`button-mark-arrived-${item.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Arrived
                    </Button>
                  )}
                  {item.status === 'ARRIVED' && (
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(item.updatedAt), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
