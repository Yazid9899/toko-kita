import { Layout } from "@/components/Layout";
import { useOrders } from "@/hooks/use-orders";
import { useProcurements } from "@/hooks/use-procurements";
import { 
  CreditCard, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function StatCard({ title, value, icon: Icon, description, loading, color = "primary" }: any) {
  const colorClasses: Record<string, string> = {
    primary: "from-[#5C6AC4] to-[#6B7AC8]",
    teal: "from-[#00848E] to-[#00A3AE]",
    amber: "from-amber-500 to-amber-400",
    green: "from-emerald-500 to-emerald-400"
  };

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-[#5C6AC4] transition-colors" />
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24 mb-2" />
      ) : (
        <>
          <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
          <p className="text-sm text-slate-500">{description}</p>
        </>
      )}
      <p className="text-xs font-medium text-slate-400 mt-3 uppercase tracking-wider">{title}</p>
    </div>
  );
}

export default function Dashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: procurements, isLoading: procurementsLoading } = useProcurements();

  const unpaidOrders = orders?.filter(o => o.paymentStatus !== "PAID").length || 0;
  const toPackOrders = orders?.filter(o => o.packingStatus === "PACKING" || (o.paymentStatus === "PAID" && o.packingStatus === "NOT_READY")).length || 0;
  const toBuyItems = procurements?.filter(p => p.status === "TO_BUY").length || 0;
  const totalRevenue = orders?.reduce((sum, o) => {
    const itemsTotal = o.items.reduce((iSum, item) => iSum + Number(item.unitPrice) * Number(item.quantity), 0);
    return sum + itemsTotal + Number(o.deliveryFee);
  }, 0) || 0;

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your business performance</p>
        </div>
        <Link href="/orders/new">
          <Button className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#5C6AC4] to-[#6B7AC8] font-semibold shadow-[0_4px_15px_rgba(92,106,196,0.3)]" data-testid="button-create-order">
            Create New Order
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
          color="primary"
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
        <div className="lg:col-span-4 premium-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#5C6AC4] rounded-lg" data-testid="link-view-all-orders">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {ordersLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-3">
              {orders?.slice(0, 5).map(order => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200" data-testid={`order-row-${order.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5C6AC4]/10 to-[#00848E]/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#5C6AC4]" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{order.orderNumber}</span>
                        <span className="text-sm text-slate-500">{order.customer.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.paymentStatus} />
                      <span className="text-sm text-slate-400 w-16 text-right">
                        {format(new Date(order.createdAt), "MMM d")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {(!orders || orders.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500">No orders yet</p>
                  <Link href="/orders/new">
                    <Button variant="link" className="text-[#5C6AC4] mt-2">Create your first order</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Urgent Procurement */}
        <div className="lg:col-span-3 premium-card border-l-4 border-l-[#00848E]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00848E] to-[#00A3AE] flex items-center justify-center shadow-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Urgent Procurement</h2>
              <p className="text-sm text-slate-500">Items that need restocking</p>
            </div>
          </div>
          {procurementsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-3">
              {procurements?.filter(p => p.status === "TO_BUY").slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-[#00848E]/5 rounded-xl border border-[#00848E]/10" data-testid={`procurement-row-${p.id}`}>
                  <div>
                    <p className="font-medium text-slate-800">{p.variant.variantName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">For {p.order.orderNumber}</p>
                  </div>
                  <span className="text-sm font-bold text-[#00848E] bg-[#00848E]/10 px-3 py-1.5 rounded-full">{Number(p.neededQty)} needed</span>
                </div>
              ))}
              {(!procurements || procurements.filter(p => p.status === "TO_BUY").length === 0) && (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-7 h-7 text-emerald-500" />
                  </div>
                  <p className="text-slate-600 font-medium">All stocked up!</p>
                  <p className="text-sm text-slate-400 mt-1">No items need restocking</p>
                </div>
              )}
            </div>
          )}
          {procurements && procurements.filter(p => p.status === "TO_BUY").length > 0 && (
            <Link href="/procurement">
              <Button variant="outline" className="w-full mt-4 rounded-xl border-[#00848E]/30 text-[#00848E] hover:bg-[#00848E]/5" data-testid="link-view-all-procurement">
                View All Procurement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
