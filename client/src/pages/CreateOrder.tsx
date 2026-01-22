import { Layout } from "@/components/Layout";
import { useCreateOrder } from "@/hooks/use-orders";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Plus, ChevronRight, UserPlus, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type InsertCustomer } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

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
                <Input placeholder="e.g. John Doe" {...field} className="premium-input" data-testid="input-customer-name" />
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
                  <Input placeholder="0812..." {...field} className="premium-input" data-testid="input-customer-phone" />
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
                <FormControl>
                  <select 
                    {...field}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:bg-white focus:border-[#5C6AC4] focus:ring-2 focus:ring-[#5C6AC4]/20 transition-all duration-200"
                    data-testid="select-customer-type"
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="RESELLER">Reseller</option>
                  </select>
                </FormControl>
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
                <Input placeholder="Street address..." {...field} className="premium-input" data-testid="input-customer-address" />
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
                  <Input {...field} className="premium-input" data-testid="input-customer-kecamatan" />
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
                  <Input {...field} className="premium-input" data-testid="input-customer-city" />
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
                  <Input {...field} className="premium-input" data-testid="input-customer-postcode" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-[#5C6AC4] to-[#6B7AC8] hover:opacity-90 font-semibold shadow-[0_4px_15px_rgba(92,106,196,0.3)]" disabled={isPending} data-testid="button-submit-customer">
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
          <div className="premium-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">1. Select Customer</h3>
                <p className="text-sm text-slate-500 mt-0.5">Choose an existing customer or add a new one</p>
              </div>
              <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-dashed border-slate-300 text-slate-600 hover:border-[#5C6AC4] hover:text-[#5C6AC4] hover:bg-[#5C6AC4]/5" data-testid="button-add-customer-shortcut">
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
            <select 
              className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4] focus:ring-2 focus:ring-[#5C6AC4]/20 transition-all duration-200 text-slate-800 font-medium"
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              value={selectedCustomerId || ""}
              data-testid="select-customer"
            >
              <option value="">-- Choose Customer --</option>
              {customers?.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phoneNumber})</option>
              ))}
            </select>
          </div>

          {/* Products Card */}
          <div className="premium-card">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900">2. Add Items</h3>
              <p className="text-sm text-slate-500 mt-0.5">Select products and variants to add to order</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {products?.map(product => (
                <div key={product.id} className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <h4 className="font-semibold text-slate-800 text-sm mb-3">{product.name}</h4>
                  <div className="space-y-2">
                    {product.variants.map(variant => {
                      const stock = Number(variant.stockOnHand);
                      const isLowStock = stock === 0;
                      return (
                        <div key={variant.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all">
                          <div className="flex-1">
                            <span className="block font-medium text-slate-700">{variant.variantName}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">Rp {Number(variant.defaultPrice).toLocaleString()}</span>
                              {isLowStock && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                                  <AlertCircle className="w-3 h-3" />
                                  Preorder
                                </span>
                              )}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="rounded-lg bg-[#5C6AC4] hover:bg-[#4B59B3] text-white font-medium h-8 px-4"
                            onClick={() => addItem(variant.id, `${product.name} - ${variant.variantName}`, Number(variant.defaultPrice), stock)}
                            data-testid={`button-add-variant-${variant.id}`}
                          >
                            Add
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {(!products || products.length === 0) && (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  No products available. Add products first.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="lg:col-span-1">
          <div className="premium-card sticky top-24 border-2 border-[#5C6AC4]/20">
            <h3 className="font-bold text-xl text-slate-900 mb-5">Order Summary</h3>
            
            <div className="space-y-3 mb-6 max-h-[280px] overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm">No items added yet</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">@ Rp {item.unitPrice.toLocaleString()}</p>
                      {item.quantity > item.stock && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Preorder: {item.quantity - item.stock} units</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        className="w-14 h-8 border border-slate-200 rounded-lg px-2 text-center text-sm font-medium focus:border-[#5C6AC4] focus:ring-1 focus:ring-[#5C6AC4]/20"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(idx, parseFloat(e.target.value) || 1)}
                        data-testid={`input-quantity-${idx}`}
                      />
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
                <span className="text-slate-500">Delivery Fee</span>
                <Input 
                  type="number" 
                  className="w-28 h-9 text-right rounded-lg border-slate-200 font-medium" 
                  value={deliveryFee} 
                  onChange={e => setDeliveryFee(Number(e.target.value))}
                  data-testid="input-delivery-fee"
                />
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
          </div>
        </div>
      </div>
    </Layout>
  );
}
