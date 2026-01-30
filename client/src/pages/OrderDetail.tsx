import { Layout } from "@/components/Layout";
import { useOrder, useUpdateOrder } from "@/hooks/use-orders";
import { useRoute } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Printer,
  Loader2,
  ArrowLeft,
  Package,
  CreditCard,
  ChevronRight,
  User,
  MapPin,
  Phone,
  FileText,
  Pencil,
  RotateCcw,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema } from "@shared/schema";
import { useUpdateCustomer } from "@/hooks/use-customers";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { formatVariantLabel } from "@/lib/variant-utils";

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const id = Number(params?.id);
  const { data: order, isLoading } = useOrder(id);
  const { mutate: updateOrder } = useUpdateOrder();
  const { mutate: updateCustomer } = useUpdateCustomer();
  const { toast } = useToast();
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      addressLine: "",
      kecamatan: "",
      cityOrKabupaten: "",
      postCode: "",
      customerType: "RETAIL",
    },
  });

  useEffect(() => {
    if (order?.customer) {
      form.reset(order.customer);
    }
  }, [order?.customer, form]);

  if (isLoading)
    return (
      <Layout>
        <div className="flex justify-center pt-20">
          <Loader2 className="animate-spin w-8 h-8 text-[#5C6AC4]" />
        </div>
      </Layout>
    );

  if (!order)
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-slate-500">Order not found</p>
        </div>
      </Layout>
    );

  const onCustomerSubmit = (data: any) => {
    updateCustomer(
      { id: order.customerId, data },
      {
        onSuccess: () => {
          setIsEditingCustomer(false);
          toast({
            title: "Customer updated",
            description: "Customer information has been successfully updated.",
          });
        },
      }
    );
  };

  const totalAmount =
    order.items.reduce(
      (sum: number, item: any) => sum + Number(item.quantity) * Number(item.unitPrice),
      0,
    ) + Number(order.deliveryFee);

  const handleStatusUpdate = (
    field: "paymentStatus" | "packingStatus",
    value: string,
    isUndo = false,
  ) => {
    const previousValue = order[field];
    updateOrder(
      { id, data: { [field]: value } },
      {
        onSuccess: () => {
          if (!isUndo) {
            toast({
              title: "Status updated",
              description: `Order ${field === "paymentStatus" ? "payment" : "packing"} updated to ${value.replace("_", " ")}`,
              action: (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 rounded-lg border-slate-200"
                  onClick={() => handleStatusUpdate(field, previousValue, true)}
                >
                  <RotateCcw className="w-3 h-3" />
                  Undo
                </Button>
              ),
            });
          }
        },
      },
    );
  };

  return (
    <Layout>
      <TooltipProvider>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/orders">
            <span className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
              Orders
            </span>
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="font-semibold text-slate-800">
            {order.orderNumber}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/orders">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-slate-200"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">
                  {order.orderNumber}
                </h1>
                <StatusBadge status={order.paymentStatus} />
                <StatusBadge status={order.packingStatus} />
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Created on{" "}
                {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="rounded-xl border-slate-200 text-slate-600"
            data-testid="button-print"
          >
            <Printer className="w-4 h-4 mr-2" /> Print Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-slate-900 mb-5">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-slate-50/50 rounded-xl border border-slate-100"
                    data-testid={`order-item-${item.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5C6AC4]/10 to-[#00848E]/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-[#5C6AC4]" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {formatVariantLabel(item.variant)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {item.isPreorder && (
                            <span className="text-amber-600 font-semibold mr-2">
                              [Preorder]
                            </span>
                          )}
                          SKU: {item.variant.sku || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">
                        {Number(item.quantity)} x Rp{" "}
                        {Number(item.unitPrice).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-500">
                        Rp{" "}
                        {(
                          Number(item.quantity) * Number(item.unitPrice)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-6 bg-slate-100" />
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-700">
                    Rp{" "}
                    {(totalAmount - Number(order.deliveryFee)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery</span>
                  <span className="text-slate-700">
                    Rp {Number(order.deliveryFee).toLocaleString()}
                  </span>
                </div>
                <Separator className="bg-slate-100" />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-lg text-slate-900">Total</span>
                  <span className="font-bold text-xl text-[#5C6AC4]">
                    Rp {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {order.procurements.length > 0 && (
              <div className="card border-l-4 border-l-amber-500">
                <h2 className="text-lg font-bold text-amber-700 mb-4">
                  Procurement Items (To Buy)
                </h2>
                <div className="space-y-3">
                  {order.procurements.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-100"
                      data-testid={`procurement-item-${p.id}`}
                    >
                      <span className="font-medium text-slate-800">
                        {formatVariantLabel(p.variant)}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-amber-700">
                          {Number(p.neededQty)} needed
                        </span>
                        <StatusBadge status={p.status} type="procurement" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Customer & Workflow */}
          <div className="space-y-6">
            {/* Customer Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Customer
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-[#5C6AC4]"
                  onClick={() => setIsEditingCustomer(!isEditingCustomer)}
                >
                  {isEditingCustomer ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Edit2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {!isEditingCustomer ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5C6AC4] to-[#00848E] flex items-center justify-center text-white font-bold text-lg">
                      {order.customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">
                        {order.customer.name}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.customer.customerType === "RESELLER"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.customer.customerType}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {order.customer.phoneNumber}
                    </div>
                    <div className="flex items-start gap-3 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p>{order.customer.addressLine}</p>
                        <p>
                          {order.customer.kecamatan}, {order.customer.cityOrKabupaten}
                        </p>
                        <p>{order.customer.postCode}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onCustomerSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-9 rounded-lg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-9 rounded-lg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addressLine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Address</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-9 rounded-lg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="kecamatan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Kecamatan</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-9 rounded-lg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cityOrKabupaten"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">City/Kabupaten</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-9 rounded-lg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Post Code</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-9 rounded-lg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-9 rounded-lg bg-[#5C6AC4] hover:bg-[#4A57A0]"
                    >
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </form>
                </Form>
              )}
            </div>
            {order.notes && (
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </div>
                <p className="text-sm text-amber-800">{order.notes}</p>
              </div>
            )}

            {/* Workflow Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Workflow
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Pencil className="w-3 h-3" />
                  Select to update
                </div>
              </div>

              {/* Payment Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5C6AC4]/10 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-[#5C6AC4]" />
                  </div>
                  <span className="font-semibold text-slate-800">Payment</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "rounded-xl font-semibold transition-all cursor-pointer h-9",
                          order.paymentStatus === "NOT_PAID"
                            ? "bg-white text-red-600 shadow-sm border border-red-100 hover:bg-white"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
                        )}
                        onClick={() =>
                          handleStatusUpdate("paymentStatus", "NOT_PAID")
                        }
                        data-testid="button-status-unpaid"
                      >
                        Unpaid
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Click to change status</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "rounded-xl font-semibold transition-all cursor-pointer h-9",
                          order.paymentStatus === "PAID"
                            ? "bg-white text-emerald-600 shadow-sm border border-emerald-100 hover:bg-white"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
                        )}
                        onClick={() => handleStatusUpdate("paymentStatus", "PAID")}
                        data-testid="button-status-paid"
                      >
                        Paid
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Click to change status</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <Separator className="bg-slate-100 mb-6" />

              {/* Packing Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00848E]/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-[#00848E]" />
                  </div>
                  <span className="font-semibold text-slate-800">Packing</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "rounded-xl font-semibold text-xs transition-all cursor-pointer h-9",
                          order.packingStatus === "NOT_READY"
                            ? "bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-white"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-500",
                        )}
                        onClick={() =>
                          handleStatusUpdate("packingStatus", "NOT_READY")
                        }
                        data-testid="button-status-not-ready"
                      >
                        Not Ready
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Click to change status</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "rounded-xl font-semibold text-xs transition-all cursor-pointer h-9",
                          order.packingStatus === "PACKING"
                            ? "bg-white text-[#5C6AC4] shadow-sm border border-[#5C6AC4]/20 hover:bg-white"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-500",
                        )}
                        onClick={() =>
                          handleStatusUpdate("packingStatus", "PACKING")
                        }
                        data-testid="button-status-packing"
                      >
                        Packing
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Click to change status</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "rounded-xl font-semibold text-xs transition-all cursor-pointer h-9",
                          order.packingStatus === "PACKED"
                            ? "bg-white text-blue-600 shadow-sm border border-blue-200 hover:bg-white"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-500",
                        )}
                        onClick={() =>
                          handleStatusUpdate("packingStatus", "PACKED")
                        }
                        data-testid="button-status-packed"
                      >
                        Packed
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Click to change status</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </Layout>
  );
}

