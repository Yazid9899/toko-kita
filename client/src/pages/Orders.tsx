import { Layout } from "@/components/Layout";
import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, ChevronDown, Loader2, Store, Search } from "lucide-react";
import { formatStatusLabel } from "@/components/StatusBadge";
import { formatPrice } from "@/lib/variant-utils";
import { format } from "date-fns";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const [searchQuery, setSearchQuery] = useState("");
  const { mutate: updateOrder } = useUpdateOrder();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [, navigate] = useLocation();
  
  const filters = statusFilter === "ALL" 
    ? {} 
    : statusFilter === "UNPAID" 
      ? { status: "NOT_PAID" }
      : statusFilter === "PACKING"
        ? { packingStatus: "PACKING" }
        : {};

  const { data: orders, isLoading } = useOrders(filters);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredOrders = orders?.filter((order: any) => {
    if (!normalizedSearch) return true;
    const orderNumber = String(order.orderNumber ?? "").toLowerCase();
    const customerName = String(order.customer?.name ?? "").toLowerCase();
    const phoneNumber = String(order.customer?.phoneNumber ?? "").toLowerCase();
    return (
      orderNumber.includes(normalizedSearch) ||
      customerName.includes(normalizedSearch) ||
      phoneNumber.includes(normalizedSearch)
    );
  });

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

  const getPhonePreview = (phoneNumber?: string | null) => {
    if (!phoneNumber) return "-";
    const normalized = phoneNumber.trim();
    if (normalized.length <= 5) return normalized;
    return `${normalized.slice(0, 5)}...`;
  };

  const renderStatusDropdown = (
    order: any,
    field: "paymentStatus" | "packingStatus",
    currentStatus: string,
  ) => {
    const getStatusDotClass = (status: string) => {
      if (status === "PAID" || status === "ARRIVED") return "bg-emerald-500";
      if (status === "DOWN_PAYMENT" || status === "ORDERED") return "bg-amber-500";
      if (status === "NOT_PAID") return "bg-rose-500";
      if (status === "PACKED") return "bg-sky-500";
      if (status === "PACKING") return "bg-indigo-500";
      if (status === "TO_BUY") return "bg-teal-500";
      return "bg-slate-400";
    };

    const options = field === "paymentStatus" ? paymentOptions : packingOptions;
    const isUpdating = updatingKey === `${order.id}-${field}`;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-7 w-28 items-center justify-between rounded-md border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50",
              isUpdating && "opacity-70 cursor-wait",
            )}
            onClick={(event) => {
              event.stopPropagation();
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            data-testid={`button-status-${field}-${order.id}`}
          >
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", getStatusDotClass(currentStatus))} />
              <span className="truncate">{formatStatusLabel(currentStatus)}</span>
            </span>
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ChevronDown className="h-3 w-3" />
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
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={(event) => event.stopPropagation()}
                onSelect={() => handleStatusChange(order.id, field, option.value)}
                className="flex items-center gap-2"
                data-testid={`menuitem-${field}-${option.value}-${order.id}`}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    getStatusDotClass(option.value),
                  )}
                />
                <span className="text-sm text-slate-700">{option.label}</span>
                {option.value === currentStatus ? (
                  <span className="ml-auto text-xs text-slate-400">Current</span>
                ) : null}
              </DropdownMenuItem>
            );
          })}
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
      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search order, customer, phone..."
            className="h-10 pl-9"
            data-testid="input-search-orders"
          />
        </div>
      </div>

      {/* Orders List */}
      <Card className="overflow-hidden border border-slate-100 shadow-sm rounded-2xl">
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
        ) : filteredOrders?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500">No matching orders</p>
          </div>
        ) : (
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Order</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Items</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Order Progress</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.map((order: any) => {
                const subtotal =
                  order.subtotal ??
                  order.items.reduce(
                    (sum: number, item: any) => sum + Number(item.unitPrice) * Number(item.quantity),
                    0,
                  );
                const total = order.total ?? Math.max(0, subtotal - Number(order.discount ?? 0));
                const hasToBuy =
                  order.hasPendingProcurement || order.items.some((item: any) => item.isPreorder);

                return (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-slate-50/60"
                    data-testid={`order-row-${order.id}`}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-slate-800">{order.orderNumber}</p>
                        <p className="text-xs text-slate-500">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                        {order.customer.name}
                        {order.customer.customerType === "RESELLER" && (
                          <Store className="h-4 w-4 text-amber-600" aria-label="Reseller" />
                        )}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigator.clipboard.writeText(order.customer.phoneNumber ?? "");
                        }}
                        className="text-sm text-slate-500 transition hover:text-slate-700"
                        title="Click to copy phone"
                      >
                        {getPhonePreview(order.customer.phoneNumber)}
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span>{order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
                        {hasToBuy && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            To buy
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="flex items-center justify-start gap-1.5">
                        <div className="flex items-center">
                          {renderStatusDropdown(order, "paymentStatus", order.paymentStatus)}
                        </div>
                        <div className="flex items-center">
                          {renderStatusDropdown(order, "packingStatus", order.packingStatus)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="text-sm font-semibold text-slate-800">
                        Rp {formatPrice(total)}
                      </div>
                      {Number(order.discount ?? 0) > 0 && (
                        <p className="text-[11px] text-emerald-600">Disc {Number(order.discount).toLocaleString()}</p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </Layout>
  );
}
