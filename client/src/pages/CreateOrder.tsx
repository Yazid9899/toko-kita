import { Layout } from "@/components/Layout";
import { useCreateOrder } from "@/hooks/use-orders";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, Plus, Search, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function CreateOrder() {
  const [, setLocation] = useLocation();
  const { mutate: createOrder, isPending } = useCreateOrder();
  
  // Step 1: Customer Selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const { data: customers } = useCustomers();
  
  // Step 2: Items
  const { data: products } = useProducts();
  const [items, setItems] = useState<Array<{
    productVariantId: number;
    name: string;
    quantity: number;
    unitPrice: number;
  }>>([]);
  
  const [notes, setNotes] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Helper to add item
  const addItem = (variantId: number, variantName: string, price: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.productVariantId === variantId);
      if (existing) {
        return prev.map(i => i.productVariantId === variantId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productVariantId: variantId, name: variantName, quantity: 1, unitPrice: price }];
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

  return (
    <Layout>
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
         <span className="hover:text-foreground cursor-pointer" onClick={() => setLocation("/orders")}>Orders</span>
         <ChevronRight className="w-4 h-4" />
         <span className="font-semibold text-foreground">New Order</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Customer & Products */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Label className="text-base font-semibold mb-4 block">1. Select Customer</Label>
              <select 
                className="w-full p-2 border rounded-md"
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                value={selectedCustomerId || ""}
              >
                <option value="">-- Choose Customer --</option>
                {customers?.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phoneNumber})</option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Label className="text-base font-semibold mb-4 block">2. Add Items</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {products?.map(product => (
                  <div key={product.id} className="border rounded-lg p-4 bg-muted/20">
                    <h4 className="font-medium text-sm mb-2">{product.name}</h4>
                    <div className="space-y-2">
                      {product.variants.map(variant => (
                        <div key={variant.id} className="flex justify-between items-center text-sm bg-background p-2 rounded border shadow-sm">
                          <div>
                            <span className="block font-medium">{variant.variantName}</span>
                            <span className="text-xs text-muted-foreground">Rp {Number(variant.defaultPrice).toLocaleString()}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => addItem(variant.id, `${product.name} - ${variant.variantName}`, Number(variant.defaultPrice))}
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 shadow-lg border-primary/20">
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              
              <div className="flex-1 space-y-4 mb-6">
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic text-center py-8">No items added.</p>
                ) : (
                  items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2 text-sm border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">@ {item.unitPrice.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          className="w-12 border rounded px-1 py-0.5 text-center"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(idx, parseFloat(e.target.value))}
                        />
                        <button onClick={() => removeItem(idx)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Rp {(items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Delivery Fee</span>
                  <Input 
                    type="number" 
                    className="w-24 h-8 text-right" 
                    value={deliveryFee} 
                    onChange={e => setDeliveryFee(Number(e.target.value))} 
                  />
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg text-primary">
                  <span>Total</span>
                  <span>Rp {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea 
                    placeholder="e.g. Leave at gate" 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="resize-none h-20"
                  />
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                  disabled={!selectedCustomerId || items.length === 0 || isPending}
                  onClick={handleSubmit}
                >
                  {isPending ? <Loader2 className="animate-spin" /> : "Confirm Order"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
