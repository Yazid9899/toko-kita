import { Layout } from "@/components/Layout";
import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Package, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { baseStatusBadgeClasses, formatStatusLabel, getStatusBadgeStyles } from "@/components/StatusBadge";
import { format } from "date-fns";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const { mutate: updateOrder } = useUpdateOrder();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  
  const filters = statusFilter === "ALL" 
    ? {} 
    : statusFilter === "UNPAID" 
      ? { status: "NOT_PAID" }
      : statusFilter === "PACKING"
        ? { packingStatus: "PACKING" }
        : {};

  const { data: orders, isLoading } = useOrders(filters);

  const paymentOptions = [
    { value: "NOT_PAID", label: "Not Paid" },
    { value: "DOWN_PAYMENT", label: "Down Payment" },
    { value: "PAID", label: "Paid" },
  ];

  const packingOptions = [
    { value: "NOT_READY", label: "Not Ready" },
    { value: "PACKING", label: "Packing" },
    { value: "PACKED", label: "Packed" },
  ];

  const paymentTransitions: Record<string, string[]> = {
    NOT_PAID: ["DOWN_PAYMENT", "PAID"],
    DOWN_PAYMENT: ["PAID"],
    PAID: [],
  };

  const packingTransitions: Record<string, string[]> = {
    NOT_READY: ["PACKING"],
    PACKING: ["PACKED"],
    PACKED: [],
  };

  const getAllowedTargets = (current: string, transitions: Record<string, string[]>, all: string[]) =>
    transitions[current] ?? all;

  const handleStatusChange = (
    orderId: number,
    field: "paymentStatus" | "packingStatus",
    nextStatus: string,
  ) => {
    const key = `${orderId}-${field}`;
    setUpdatingKey(key);
    updateOrder(
      { id: orderId, data: { [field]: nextStatus } },
      {
        onSettled: () => {
          setUpdatingKey((current) => (current === key ? null : current));
        },
      },
    );
  };

  const renderStatusDropdown = (
    orderId: number,
    field: "paymentStatus" | "packingStatus",
    currentStatus: string,
  ) => {
    const options = field === "paymentStatus" ? paymentOptions : packingOptions;
    const allowedTargets = getAllowedTargets(
      currentStatus,
      field === "paymentStatus" ? paymentTransitions : packingTransitions,
      options.map((option) => option.value),
    );
    const isUpdating = updatingKey === `${orderId}-${field}`;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              baseStatusBadgeClasses,
              getStatusBadgeStyles(currentStatus),
              "gap-1.5 pr-2 pl-3 transition hover:opacity-90",
              isUpdating && "opacity-70 cursor-wait",
            )}
            onClick={(event) => {
              event.stopPropagation();
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            disabled={isUpdating}
            data-testid={`button-status-${field}-${orderId}`}
          >
            <span>{formatStatusLabel(currentStatus)}</span>
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <DropdownMenuLabel className="text-xs uppercase tracking-wide text-slate-400">
            {field === "paymentStatus" ? "Payment Status" : "Packing Status"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((option) => {
            const isDisabled =
              option.value === currentStatus || !allowedTargets.includes(option.value);
            return (
              <DropdownMenuItem
                key={option.value}
                disabled={isDisabled || isUpdating}
                onClick={(event) => event.stopPropagation()}
                onSelect={() => handleStatusChange(orderId, field, option.value)}
                className="flex items-center gap-2"
                data-testid={`menuitem-${field}-${option.value}-${orderId}`}
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    getStatusBadgeStyles(option.value),
                  )}
                />
                <span className="text-sm">{option.label}</span>
                {option.value === currentStatus ? (
                  <span className="ml-auto text-xs text-slate-400">Current</span>
                ) : null}
              </DropdownMenuItem>
            );
          })}
          {allowedTargets.length === 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-slate-400">
                No further transitions
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Track and fulfill customer orders</p>
        </div>
        <Link href="/orders/new">
          <Button variant="default" data-testid="button-new-order">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <Tabs defaultValue="ALL" onValueChange={setStatusFilter}>
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-100/80 p-1.5 text-slate-500">
            <TabsTrigger value="ALL" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-[#5C6AC4] data-[state=active]:shadow-sm" data-testid="tab-all-orders">
              All Orders
            </TabsTrigger>
            <TabsTrigger value="UNPAID" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm" data-testid="tab-unpaid">
              Unpaid
            </TabsTrigger>
            <TabsTrigger value="PACKING" className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-[#00848E] data-[state=active]:shadow-sm" data-testid="tab-packing">
              To Pack
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders List */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#5C6AC4]" />
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-2">No orders found</p>
            <Link href="/orders/new">
              <Button variant="default">Create your first order</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-3">Order</div>
              <div className="col-span-1">xxxxDate</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-1">Items</div>
              <div className="col-span-2">Payment</div>
              <div className="col-span-2">Status</div>
            </div>
            {/* Order Rows */}
            {orders?.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50/60 transition-colors cursor-pointer items-center" data-testid={`order-row-${order.id}`}>
                  <div className="lg:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5C6AC4]/10 to-[#00848E]/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-[#5C6AC4]" />
                    </div>
                    <span className="font-bold text-[#5C6AC4]">{order.orderNumber}</span>
                  </div>
                  <div className="lg:col-span-1 hidden lg:flex items-center gap-2 text-slate-600">
                    
                    <span className="text-sm">{format(new Date(order.createdAt), "MMM d")}</span>
                  </div>
                  <div className="lg:col-span-3">
                    <p className="font-medium text-slate-800">{order.customer.name}</p>
                    <p className="text-sm text-slate-500 lg:hidden">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div className="lg:col-span-1 hidden lg:block">
                    <span className="text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-medium">{order.items.length}</span>
                  </div>
                  <div className="lg:col-span-2">
                    {renderStatusDropdown(order.id, "paymentStatus", order.paymentStatus)}
                  </div>
                  <div className="lg:col-span-2 flex items-center gap-2">
                    {renderStatusDropdown(order.id, "packingStatus", order.packingStatus)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
}

