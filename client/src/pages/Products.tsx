import { Layout } from "@/components/Layout";
import { useProducts, useCreateProduct, useCreateVariant } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, insertProductVariantSchema, type InsertProductVariant } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Box, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// --- CREATE PRODUCT FORM ---
function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateProduct();
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: { name: "", description: "", unitType: "QUANTITY" }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data, { onSuccess }))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl><Input placeholder="e.g. T-Shirt" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Input placeholder="Optional..." {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Type</FormLabel>
              <FormControl>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="QUANTITY">Quantity (pcs)</option>
                  <option value="WEIGHT">Weight (kg/gr)</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Product
        </Button>
      </form>
    </Form>
  );
}

// --- CREATE VARIANT FORM ---
function VariantForm({ productId, onSuccess }: { productId: number; onSuccess: () => void }) {
  const { mutate, isPending } = useCreateVariant();
  // We need to manage dynamic attributes manually or just provide a JSON editor.
  // For simplicity, let's hardcode a few common attribute fields or just use a text input for attributes JSON.
  // In a real app, this would be a dynamic key-value pair builder.
  const form = useForm({
    resolver: zodResolver(insertProductVariantSchema.omit({ productId: true })),
    defaultValues: {
      variantName: "",
      barcodeOrSku: "",
      defaultPrice: 0,
      stockOnHand: 0,
      attributes: {}, // This is JSONB
      allowPreorder: false
    }
  });

  // Helper to construct variant name and attributes from simple inputs
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  const handleSubmit = (data: any) => {
    // Construct attributes
    const attributes = { color, size };
    // Auto-generate name if empty
    const variantName = data.variantName || `${color} ${size}`.trim() || "Default";
    
    mutate({ 
      productId, 
      data: { ...data, variantName, attributes } 
    }, { onSuccess });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <FormItem>
              <FormLabel>Color (Attribute)</FormLabel>
              <Input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Red" />
           </FormItem>
           <FormItem>
              <FormLabel>Size/Series (Attribute)</FormLabel>
              <Input value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. XL" />
           </FormItem>
        </div>

        <FormField
          control={form.control}
          name="variantName"
          render={({ field }) => (
             <FormItem>
                <FormLabel>Display Name (Auto-generated if empty)</FormLabel>
                <FormControl><Input {...field} placeholder={`${color} ${size}`} /></FormControl>
             </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="defaultPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stockOnHand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Stock</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Add Variant
        </Button>
      </form>
    </Form>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function Products() {
  const { data: products, isLoading } = useProducts();
  const [addProductOpen, setAddProductOpen] = useState(false);
  
  // Track open states for product collapsible
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const toggleItem = (id: number) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // State for Add Variant Dialog
  const [activeProductId, setActiveProductId] = useState<number | null>(null);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage products and stock levels.</p>
        </div>
        <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Product</DialogTitle></DialogHeader>
            <ProductForm onSuccess={() => setAddProductOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
        ) : products?.map((product) => (
          <Card key={product.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <Collapsible open={openItems[product.id]} onOpenChange={() => toggleItem(product.id)}>
              <div className="p-6 flex items-center justify-between bg-card">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.variants.length} Variants • {product.unitType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Dialog open={activeProductId === product.id} onOpenChange={(open) => setActiveProductId(open ? product.id : null)}>
                    <DialogTrigger asChild>
                       <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" /> Add Variant</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Variant to {product.name}</DialogTitle></DialogHeader>
                      <VariantForm productId={product.id} onSuccess={() => setActiveProductId(null)} />
                    </DialogContent>
                  </Dialog>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {openItems[product.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              
              <CollapsibleContent>
                <div className="border-t border-border bg-muted/20 px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {product.variants.map(variant => (
                      <div key={variant.id} className="bg-background rounded-lg p-4 border border-border flex flex-col justify-between shadow-sm">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-medium">{variant.variantName}</h4>
                             <span className={`text-xs px-2 py-1 rounded-full ${Number(variant.stockOnHand) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {Number(variant.stockOnHand) > 0 ? 'In Stock' : 'Out of Stock'}
                             </span>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>SKU: {variant.barcodeOrSku || '-'}</p>
                            <p>Price: Rp {Number(variant.defaultPrice).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-dashed border-border flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Stock: {Number(variant.stockOnHand)}</span>
                          <Button variant="ghost" size="sm" className="h-6 text-xs">Edit</Button>
                        </div>
                      </div>
                    ))}
                    {product.variants.length === 0 && (
                      <div className="col-span-full text-center py-4 text-muted-foreground text-sm italic">
                        No variants yet. Add one to start selling.
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
