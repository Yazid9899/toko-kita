import { Layout } from "@/components/Layout";
import { useOrders } from "@/hooks/use-orders";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Prepare filters for hook
  const filters = statusFilter === "ALL" 
    ? {} 
    : statusFilter === "UNPAID" 
      ? { status: "NOT_PAID" }
      : statusFilter === "PACKING"
        ? { packingStatus: "PACKING" }
        : {};

  const { data: orders, isLoading } = useOrders(filters);

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Track and fulfill customer orders.</p>
        </div>
        <Link href="/orders/new">
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        <Tabs defaultValue="ALL" onValueChange={setStatusFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
            <TabsTrigger value="ALL">All Orders</TabsTrigger>
            <TabsTrigger value="UNPAID">Unpaid</TabsTrigger>
            <TabsTrigger value="PACKING">To Pack</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Packing</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow><TableCell colSpan={7} className="text-center py-10">Loading...</TableCell></TableRow>
              ) : orders?.length === 0 ? (
                 <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No orders found matching filters.</TableCell></TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <TableCell className="font-medium text-primary">{order.orderNumber}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell><StatusBadge status={order.paymentStatus} /></TableCell>
                    <TableCell><StatusBadge status={order.packingStatus} /></TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">Details</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
