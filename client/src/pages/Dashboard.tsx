import { Layout } from "@/components/Layout";
import { useOrders } from "@/hooks/use-orders";
import { useProcurements } from "@/hooks/use-procurements";
import { 
  CreditCard, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  ArrowRight,
  Store
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatStatusLabel } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

function StatCard({ title, value, icon: Icon, description, loading, color = "slate" }: any) {
  const colorClasses: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <Card className="border border-slate-100 shadow-sm rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClasses[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24 mb-2" />
      ) : (
        <>
          <div className="text-3xl font-bold text-slate-900 leading-none">{value}</div>
          <p className="text-sm text-slate-500 mt-2">{description}</p>
        </>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: procurements, isLoading: procurementsLoading } = useProcurements();
  const [, navigate] = useLocation();

  const unpaidOrders = orders?.filter(o => o.paymentStatus !== "PAID").length || 0;
  const toPackOrders = orders?.filter(o => o.packingStatus === "PACKING" || (o.paymentStatus === "PAID" && o.packingStatus === "NOT_READY")).length || 0;
  const toBuyItems = procurements?.filter(p => p.status === "TO_BUY").length || 0;
  const urgentProcurements = procurements?.filter((p) => p.status === "TO_BUY") || [];
  const totalRevenue = orders?.reduce((sum, o) => {
    const itemsTotal = o.items.reduce((iSum, item) => iSum + Number(item.unitPrice) * Number(item.quantity), 0);
    const orderTotal = Math.max(0, itemsTotal - Number(o.discount));
    return sum + orderTotal;
  }, 0) || 0;

  const getStatusDotClass = (status: string) => {
    if (status === "PAID" || status === "ARRIVED") return "bg-emerald-500";
    if (status === "DOWN_PAYMENT" || status === "ORDERED") return "bg-amber-500";
    if (status === "NOT_PAID") return "bg-rose-500";
    if (status === "PACKED") return "bg-sky-500";
    if (status === "PACKING") return "bg-indigo-500";
    if (status === "TO_BUY") return "bg-teal-500";
    return "bg-slate-400";
  };

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

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your business performance</p>
        </div>
        <Link href="/orders/new">
          <Button variant="default" data-testid="button-create-order">
            Create New Order
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`Rp ${totalRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          description="All time earnings"
          loading={ordersLoading}
          color="green"
        />
        <StatCard 
          title="Unpaid Orders" 
          value={unpaidOrders} 
          icon={CreditCard} 
          description="Awaiting payment"
          loading={ordersLoading}
          color="amber"
        />
        <StatCard 
          title="To Pack" 
          value={toPackOrders} 
          icon={Package} 
          description="Ready for packing"
          loading={ordersLoading}
          color="slate"
        />
        <StatCard 
          title="To Buy" 
          value={toBuyItems} 
          icon={ShoppingBag} 
          description="Items to restock"
          loading={procurementsLoading}
          color="teal"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="lg:col-span-4 overflow-hidden border border-slate-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600" data-testid="link-view-all-orders">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div>
            {ordersLoading ? (
              <div className="space-y-3">
                <div className="p-4 space-y-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            ) : (
              <>
                {orders && orders.length > 0 && (
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Order</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer hover:bg-slate-50/60"
                          data-testid={`order-row-${order.id}`}
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <TableCell className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-800">{order.orderNumber}</p>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <p className="flex items-center gap-1.5 text-sm text-slate-700">
                              {order.customer.name}
                              {order.customer.customerType === "RESELLER" && (
                                <Store className="h-3.5 w-3.5 text-amber-600" aria-label="Reseller" />
                              )}
                            </p>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                              <span className={cn("h-2 w-2 rounded-full", getStatusDotClass(order.paymentStatus))} />
                              {formatStatusLabel(order.paymentStatus)}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right text-xs text-slate-500">
                            {format(new Date(order.createdAt), "MMM d")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {(!orders || orders.length === 0) && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500">No orders yet</p>
                    <Link href="/orders/new">
                      <Button variant="secondary" className="mt-2">Create your first order</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Urgent Procurement */}
        <Card className="lg:col-span-3 overflow-hidden border border-slate-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Urgent Procurement</h2>
              <p className="text-xs text-slate-500">Items that need restocking</p>
            </div>
            <Link href="/procurement">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600" data-testid="link-view-all-procurement">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div>
            {procurementsLoading ? (
              <div className="space-y-3">
                <div className="p-4 space-y-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            ) : (
              <>
                {urgentProcurements.length > 0 && (
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Item</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">For Order</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {urgentProcurements.slice(0, 5).map((p) => (
                        <TableRow
                          key={p.id}
                          className="cursor-pointer hover:bg-slate-50/60"
                          data-testid={`procurement-row-${p.id}`}
                          onClick={() => navigate("/procurement")}
                        >
                          <TableCell className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-800 truncate">{getProcurementItemLabel(p)}</p>
                            <p className="text-xs text-slate-500 truncate">{p.variant.sku || "No SKU"}</p>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <p className="text-sm text-slate-700">{p.order.orderNumber}</p>
                            <p className="text-xs text-slate-500">{p.order.customer.name}</p>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                            {Number(p.neededQty)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {urgentProcurements.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Package className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium">All stocked up</p>
                    <p className="text-sm text-slate-400 mt-1">No items need restocking</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}

