import { Layout } from "@/components/Layout";
import { useProducts, useCreateProduct, useCreateVariant } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, insertProductVariantSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Package, ChevronDown, ChevronUp, Box, Tag, Layers } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateProduct();
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: { name: "", description: "", unitType: "QUANTITY" }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data, { onSuccess }))} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. T-Shirt" {...field} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-product-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Description</FormLabel>
              <FormControl>
                <Input placeholder="Optional..." {...field} value={field.value || ""} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-product-desc" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Unit Type</FormLabel>
              <FormControl>
                <select {...field} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:bg-white focus:border-[#5C6AC4] focus:ring-2 focus:ring-[#5C6AC4]/20 transition-all" data-testid="select-unit-type">
                  <option value="QUANTITY">Quantity (pcs)</option>
                  <option value="WEIGHT">Weight (kg/gr)</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-[#5C6AC4] to-[#6B7AC8] hover:opacity-90 font-semibold shadow-[0_4px_15px_rgba(92,106,196,0.3)]" disabled={isPending} data-testid="button-create-product">
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Product
        </Button>
      </form>
    </Form>
  );
}

function VariantForm({ productId, onSuccess }: { productId: number; onSuccess: () => void }) {
  const { mutate, isPending } = useCreateVariant();
  const form = useForm({
    resolver: zodResolver(insertProductVariantSchema.omit({ productId: true })),
    defaultValues: {
      variantName: "",
      barcodeOrSku: "",
      defaultPrice: 0,
      stockOnHand: 0,
      attributes: {},
      allowPreorder: false
    }
  });

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  const handleSubmit = (data: any) => {
    const attributes = { color, size };
    const variantName = data.variantName || `${color} ${size}`.trim() || "Default";
    
    mutate({ 
      productId, 
      data: { ...data, variantName, attributes } 
    }, { onSuccess });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <FormLabel className="text-slate-700 font-medium">Color</FormLabel>
            <Input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Red" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-variant-color" />
          </FormItem>
          <FormItem>
            <FormLabel className="text-slate-700 font-medium">Size</FormLabel>
            <Input value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. XL" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-variant-size" />
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="variantName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Display Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder={`${color} ${size}` || "Auto-generated"} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-variant-name" />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="defaultPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium">Price (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-variant-price" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stockOnHand"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium">Initial Stock</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-variant-stock" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00848E] to-[#00A3AE] hover:opacity-90 font-semibold shadow-[0_4px_15px_rgba(0,132,142,0.3)]" disabled={isPending} data-testid="button-add-variant">
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Add Variant
        </Button>
      </form>
    </Form>
  );
}

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const [activeProductId, setActiveProductId] = useState<number | null>(null);

  const toggleItem = (id: number) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage products and stock levels</p>
        </div>
        <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#5C6AC4] to-[#6B7AC8] font-semibold shadow-[0_4px_15px_rgba(92,106,196,0.3)]" data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Product</DialogTitle>
              <DialogDescription>Add a new product to your inventory.</DialogDescription>
            </DialogHeader>
            <ProductForm onSuccess={() => setAddProductOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin w-8 h-8 text-[#5C6AC4]" />
          </div>
        ) : products?.length === 0 ? (
          <div className="premium-card text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-2">No products yet</p>
            <Button variant="link" className="text-[#5C6AC4]" onClick={() => setAddProductOpen(true)}>Add your first product</Button>
          </div>
        ) : (
          products?.map((product) => (
            <div key={product.id} className="premium-card p-0 overflow-hidden" data-testid={`product-card-${product.id}`}>
              <Collapsible open={openItems[product.id]} onOpenChange={() => toggleItem(product.id)}>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#5C6AC4]/10 to-[#00848E]/10 flex items-center justify-center">
                      <Package className="w-7 h-7 text-[#5C6AC4]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                          <Layers className="w-4 h-4" />
                          {product.variants.length} variants
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                          <Tag className="w-4 h-4" />
                          {product.unitType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Dialog open={activeProductId === product.id} onOpenChange={(open) => setActiveProductId(open ? product.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:border-[#00848E] hover:text-[#00848E] hover:bg-[#00848E]/5" data-testid={`button-add-variant-${product.id}`}>
                          <Plus className="w-4 h-4 mr-2" /> Add Variant
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">Add Variant to {product.name}</DialogTitle>
                          <DialogDescription>Create a new variant with different attributes.</DialogDescription>
                        </DialogHeader>
                        <VariantForm productId={product.id} onSuccess={() => setActiveProductId(null)} />
                      </DialogContent>
                    </Dialog>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-600" data-testid={`button-toggle-product-${product.id}`}>
                        {openItems[product.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                
                <CollapsibleContent>
                  <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.variants.map(variant => {
                        const stockNum = Number(variant.stockOnHand);
                        const isInStock = stockNum > 0;
                        return (
                          <div key={variant.id} className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all" data-testid={`variant-card-${variant.id}`}>
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-slate-800">{variant.variantName}</h4>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isInStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {isInStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-sm text-slate-500">
                              <p>SKU: {variant.barcodeOrSku || '-'}</p>
                              <p className="font-medium text-slate-700">Rp {Number(variant.defaultPrice).toLocaleString()}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-600">{stockNum} in stock</span>
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-[#5C6AC4] rounded-lg" data-testid={`button-edit-variant-${variant.id}`}>Edit</Button>
                            </div>
                          </div>
                        );
                      })}
                      {product.variants.length === 0 && (
                        <div className="col-span-full text-center py-8 text-slate-400">
                          <Box className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                          <p>No variants yet. Add one to start selling.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
