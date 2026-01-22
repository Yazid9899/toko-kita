import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrders } from "@/hooks/use-orders";
import { useProcurements } from "@/hooks/use-procurements";
import { 
  CreditCard, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Link } from "wouter";

function StatCard({ title, value, icon: Icon, description, loading }: any) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: procurements, isLoading: procurementsLoading } = useProcurements();

  // Stats Logic
  const unpaidOrders = orders?.filter(o => o.paymentStatus !== "PAID").length || 0;
  const toPackOrders = orders?.filter(o => o.packingStatus === "PACKING" || (o.paymentStatus === "PAID" && o.packingStatus === "NOT_READY")).length || 0;
  const toBuyItems = procurements?.filter(p => p.status === "TO_BUY").length || 0;
  const totalRevenue = orders?.reduce((sum, o) => {
    // Basic calculation for items
    const itemsTotal = o.items.reduce((iSum, item) => iSum + Number(item.unitPrice) * Number(item.quantity), 0);
    return sum + itemsTotal + Number(o.deliveryFee);
  }, 0) || 0;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your business performance.</p>
        </div>
        <Link href="/orders/new">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20">
            Create New Order
          </button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`Rp ${totalRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          description="All time revenue"
          loading={ordersLoading}
        />
        <StatCard 
          title="Unpaid Orders" 
          value={unpaidOrders} 
          icon={CreditCard} 
          description="Requires payment follow-up"
          loading={ordersLoading}
        />
        <StatCard 
          title="To Pack" 
          value={toPackOrders} 
          icon={Package} 
          description="Orders ready for packing"
          loading={ordersLoading}
        />
        <StatCard 
          title="To Buy" 
          value={toBuyItems} 
          icon={ShoppingBag} 
          description="Items needed for stock"
          loading={procurementsLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {orders?.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{order.orderNumber}</span>
                      <span className="text-sm text-muted-foreground">{order.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.paymentStatus} />
                      <div className="text-sm text-muted-foreground w-20 text-right">
                        {format(new Date(order.createdAt), "MMM d")}
                      </div>
                    </div>
                  </div>
                ))}
                {(!orders || orders.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">No orders yet.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm border-l-4 border-l-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-secondary" />
              Urgent Procurement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {procurementsLoading ? (
               <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-4">
                {procurements?.filter(p => p.status === "TO_BUY").slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{p.variant.variantName}</p>
                      <p className="text-xs text-muted-foreground">For Order {p.order.orderNumber}</p>
                    </div>
                    <span className="text-sm font-bold text-secondary">{Number(p.neededQty)} Needed</span>
                  </div>
                ))}
                 {(!procurements || procurements.filter(p => p.status === "TO_BUY").length === 0) && (
                  <div className="text-center text-muted-foreground py-8">Everything is stocked!</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
