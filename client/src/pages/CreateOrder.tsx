import { Layout } from "@/components/Layout";
import { useCreateOrder } from "@/hooks/use-orders";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useLocation } from "wouter";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2, Plus, ChevronRight, UserPlus, AlertCircle, ShoppingBag, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type InsertCustomer } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatVariantLabel, getVariantPrice } from "@/lib/variant-utils";

function QuickCustomerForm({ onSuccess }: { onSuccess: (customerId: number) => void }) {
  const { mutate, isPending } = useCreateCustomer();
  const { toast } = useToast();
  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      addressLine: "",
      kecamatan: "",
      cityOrKabupaten: "",
      postCode: "",
      customerType: "PERSONAL"
    }
  });

  function onSubmit(data: InsertCustomer) {
    mutate(data, {
      onSuccess: (newCustomer: any) => {
        form.reset();
        toast({ title: "Customer created!", description: `${data.name} has been added.` });
        onSuccess(newCustomer.id);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Doe" {...field} data-testid="input-customer-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium">Phone</FormLabel>
                <FormControl>
                  <Input placeholder="0812..." {...field} data-testid="input-customer-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
          name="customerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="h-11 rounded-xl" data-testid="select-customer-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                  <SelectItem value="RESELLER">Reseller</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <FormField
          control={form.control}
          name="addressLine"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste full address here..."
                  {...field}
                  className="min-h-[96px] resize-y"
                  data-testid="input-customer-address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="kecamatan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium text-xs">Kecamatan</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-kecamatan" />
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
                <FormLabel className="text-slate-700 font-medium text-xs">City</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-city" />
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
                <FormLabel className="text-slate-700 font-medium text-xs">Post Code</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-postcode" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-customer">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          Create Customer
        </Button>
      </form>
    </Form>
  );
}

export default function CreateOrder() {
  const [, setLocation] = useLocation();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { data: customers } = useCustomers();
  
  const { data: products } = useProducts();
  const [items, setItems] = useState<Array<{
    productVariantId: number;
    name: string;
    quantity: number;
    unitPrice: number;
    stock: number;
  }>>([]);
  
  const [notes, setNotes] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState("");
  const [variantSearch, setVariantSearch] = useState("");
  const [variantProductFilter, setVariantProductFilter] = useState<number | "all">("all");
  const [variantStockFilter, setVariantStockFilter] = useState<"all" | "in" | "out">("all");
  const canAddItems = !!selectedCustomerId;

  const variantRows = useMemo(() => {
    if (!products) return [];
    return products.flatMap((product) =>
      product.variants.map((variant) => ({
        product,
        variant,
        label: formatVariantLabel(variant),
      }))
    );
  }, [products]);

  const filteredVariants = useMemo(() => {
    const query = variantSearch.trim().toLowerCase();
    return variantRows.filter(({ product, variant, label }) => {
      if (variantProductFilter !== "all" && product.id !== variantProductFilter) return false;
      const stock = Number(variant.stockOnHand);
      if (variantStockFilter === "in" && stock <= 0) return false;
      if (variantStockFilter === "out" && stock > 0) return false;
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        label.toLowerCase().includes(query) ||
        (variant.sku || "").toLowerCase().includes(query)
      );
    });
  }, [variantRows, variantSearch, variantProductFilter, variantStockFilter]);

  const addItem = (variantId: number, variantName: string, price: number, stock: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.productVariantId === variantId);
      if (existing) {
        return prev.map(i => i.productVariantId === variantId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productVariantId: variantId, name: variantName, quantity: 1, unitPrice: price, stock }];
    });
  };

  const updateQuantity = (idx: number, qty: number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: Math.max(1, qty) } : item));
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) + deliveryFee;
  };

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("id-ID");
  };

  const handleDeliveryFeeChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    setDeliveryFeeInput(formatted);
    const numeric = Number(value.replace(/\D/g, "")) || 0;
    setDeliveryFee(numeric);
  };

  const handleSubmit = () => {
    if (!selectedCustomerId) return;
    createOrder({
      customerId: selectedCustomerId,
      notes,
      deliveryFee,
      items: items.map(i => ({
        productVariantId: i.productVariantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      }))
    }, {
      onSuccess: () => setLocation("/orders")
    });
  };

  const handleCustomerCreated = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setAddCustomerOpen(false);
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <span className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" onClick={() => setLocation("/orders")}>Orders</span>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="font-semibold text-slate-800">New Order</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">1. Select Customer</h3>
                <p className="text-sm text-slate-500 mt-0.5">Choose an existing customer or add a new one</p>
              </div>
              <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-add-customer-shortcut">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Add New Customer</DialogTitle>
                    <DialogDescription>Quickly add a new customer to use in this order.</DialogDescription>
                  </DialogHeader>
                  <QuickCustomerForm onSuccess={handleCustomerCreated} />
                </DialogContent>
              </Dialog>
            </div>
            <Select
              value={selectedCustomerId ? String(selectedCustomerId) : undefined}
              onValueChange={(value) => setSelectedCustomerId(Number(value))}
            >
              <SelectTrigger className="h-11 rounded-xl" data-testid="select-customer">
                <SelectValue placeholder="Choose customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.name} ({customer.phoneNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Products Card */}
          <Card className={canAddItems ? undefined : "opacity-60"}>
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900">2. Add Items</h3>
              <p className="text-sm text-slate-500 mt-0.5">Search and add variants to this order</p>
            </div>
            {!canAddItems && (
              <div className="mb-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Select a customer first to unlock items.
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr_0.6fr] gap-3 mb-4">
              <div className="relative">
                <Input
                  placeholder="Search product, variant, SKU..."
                  value={variantSearch}
                  onChange={(event) => setVariantSearch(event.target.value)}
                  className="pl-10"
                  disabled={!canAddItems}
                  data-testid="input-search-variants"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <Select
                value={String(variantProductFilter)}
                onValueChange={(value) =>
                  setVariantProductFilter(value === "all" ? "all" : Number(value))
                }
                disabled={!canAddItems}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm" data-testid="select-filter-product">
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={variantStockFilter}
                onValueChange={(value) => setVariantStockFilter(value as "all" | "in" | "out")}
                disabled={!canAddItems}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm" data-testid="select-filter-stock">
                  <SelectValue placeholder="All stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stock</SelectItem>
                  <SelectItem value="in">In stock</SelectItem>
                  <SelectItem value="out">Preorder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredVariants.map(({ product, variant, label }) => {
                const stock = Number(variant.stockOnHand);
                const isLowStock = stock === 0;
                const price = getVariantPrice(variant, "IDR")?.priceCents ?? 0;
                const chipLimit = 4;
                const visibleChips = variant.optionValues.slice(0, chipLimit);
                const overflowCount = Math.max(0, variant.optionValues.length - visibleChips.length);
                return (
                  <div
                    key={variant.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                          <p className="text-xs text-slate-500 truncate">SKU: {variant.sku || "-"}</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">Rp {formatPrice(price)}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 max-h-14 overflow-hidden">
                        {visibleChips.map((chip) => (
                          <span
                            key={`${variant.id}-${chip.attributeId}`}
                            className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 max-w-[200px]"
                            title={`${chip.attributeName}: ${chip.optionValue}`}
                          >
                            <span className="truncate">{chip.attributeName}: {chip.optionValue}</span>
                          </span>
                        ))}
                        {overflowCount > 0 && (
                          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 border border-dashed border-slate-200">
                            +{overflowCount} more
                          </span>
                        )}
                        {variant.optionValues.length === 0 && (
                          <span className="text-xs text-slate-400">No attributes</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-600">
                            <AlertCircle className="w-3 h-3" /> Preorder
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                            {stock} in stock
                          </span>
                        )}
                        <span className="text-slate-400 truncate">Variant: {label}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-9 px-5 rounded-xl bg-[#5C6AC4] hover:bg-[#4B59B3] text-white font-semibold"
                      onClick={() => addItem(variant.id, `${product.name} - ${label}`, price, stock)}
                      data-testid={`button-add-variant-${variant.id}`}
                      disabled={!canAddItems}
                    >
                      Add
                    </Button>
                  </div>
                );
              })}
              {(!products || products.length === 0) && (
                <div className="text-center py-12 text-slate-400">
                  No products available. Add products first.
                </div>
              )}
              {products && products.length > 0 && filteredVariants.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  No variants match your filters.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky border-2 border-[#5C6AC4]/20">
            <h3 className="font-bold text-xl text-slate-900 mb-5">Order Summary</h3>
            
            <div className="space-y-3 mb-6 max-h-[320px] overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm">No items added yet</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">@ Rp {formatPrice(item.unitPrice)}</p>
                      {item.quantity > item.stock && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Preorder: {item.quantity - item.stock} units</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white">
                        <button
                          type="button"
                          className="h-8 w-8 text-slate-500 hover:text-[#5C6AC4]"
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          data-testid={`button-qty-minus-${idx}`}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          className="w-12 h-8 border-x border-slate-200 text-center text-sm font-semibold focus:outline-none"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(idx, parseFloat(e.target.value) || 1)}
                          data-testid={`input-quantity-${idx}`}
                        />
                        <button
                          type="button"
                          className="h-8 w-8 text-slate-500 hover:text-[#5C6AC4]"
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          data-testid={`button-qty-plus-${idx}`}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(idx)} 
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`button-remove-item-${idx}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-800">Rp {(items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <Label className="text-slate-500">Delivery Fee</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    Rp
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0 (e.g. 10,000)"
                    className="w-36 h-9 text-right rounded-lg border-slate-200 font-medium pl-8"
                    value={deliveryFeeInput}
                    onChange={(e) => handleDeliveryFeeChange(e.target.value)}
                    data-testid="input-delivery-fee"
                  />
                </div>
              </div>
              <Separator className="bg-slate-100" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-slate-900">Total</span>
                <span className="font-bold text-xl text-[#5C6AC4]">Rp {calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Notes (Optional)</Label>
                <Textarea 
                  placeholder="e.g. Leave at gate" 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="resize-none h-20 rounded-xl border-slate-200 focus:border-[#5C6AC4] focus:ring-2 focus:ring-[#5C6AC4]/20"
                  data-testid="input-order-notes"
                />
              </div>
              
              <Button 
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#5C6AC4] to-[#6B7AC8] hover:opacity-90 text-lg font-bold shadow-[0_6px_20px_rgba(92,106,196,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedCustomerId || items.length === 0 || isPending}
                onClick={handleSubmit}
                data-testid="button-confirm-order"
              >
                {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                Confirm Order
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}


