import { Layout } from "@/components/Layout";
import { useProducts, useCreateProduct, useCreateVariant, useBrands, useCreateBrand, useCreateAttribute, useCreateAttributeOption } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Package, ChevronDown, ChevronUp, Box, Tag, Layers } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatPrice, formatVariantLabel, getVariantPrice } from "@/lib/variant-utils";

function BrandForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateBrand();
  const form = useForm({
    defaultValues: { name: "", slug: "" }
  });

  const handleSubmit = (data: { name: string; slug: string }) => {
    mutate(
      { name: data.name.trim(), slug: data.slug.trim() },
      { onSuccess }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Brand Name</Label>
          <Input placeholder="e.g. Legatto" {...form.register("name", { required: true })} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Slug</Label>
          <Input placeholder="e.g. legatto" {...form.register("slug", { required: true })} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" />
        </div>
        <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-[#5C6AC4] to-[#6B7AC8] hover:opacity-90 font-semibold shadow-[0_4px_15px_rgba(92,106,196,0.3)]" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Brand
        </Button>
      </form>
    </Form>
  );
}

function ProductForm({ onSuccess, brands }: { onSuccess: () => void; brands: { id: number; name: string }[] }) {
  const { mutate, isPending } = useCreateProduct();
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: { name: "", description: "", brandId: brands[0]!.id, type: "apparel" }
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
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Brand</FormLabel>
              <FormControl>
                <div className="relative">
                  <select
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#5C6AC4] focus:ring-2 focus:ring-[#5C6AC4]/20 appearance-none"
                    data-testid="select-brand"
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Type</FormLabel>
              <FormControl>
                <div className="relative">
                  <select {...field} className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#5C6AC4] focus:ring-2 focus:ring-[#5C6AC4]/20 appearance-none" data-testid="select-product-type">
                    <option value="apparel">Apparel</option>
                    <option value="accessory">Accessory</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
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

function VariantForm({
  productId,
  attributes,
  onSuccess,
}: {
  productId: number;
  attributes: {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
    options: { id: number; value: string; isActive: boolean }[];
  }[];
  onSuccess: () => void;
}) {
  const { mutate, isPending } = useCreateVariant();
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("piece");
  const [price, setPrice] = useState(0);
  const [stockOnHand, setStockOnHand] = useState(0);
  const [allowPreorder, setAllowPreorder] = useState(false);
  const [selections, setSelections] = useState<Record<number, number>>({});

  const activeAttributes = useMemo(
    () => attributes.filter((attribute) => attribute.isActive),
    [attributes]
  );

  const hasOptions = activeAttributes.every(
    (attribute) =>
      attribute.options.some((option) => option.isActive)
  );
  const selectionsReady = activeAttributes.every(
    (attribute) => selections[attribute.id]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectionList = activeAttributes.map((attribute) => ({
      attributeId: attribute.id,
      optionId: selections[attribute.id],
    }));

    mutate(
      {
        productId,
        data: {
          sku,
          unit,
          stockOnHand,
          allowPreorder,
          priceCents: Math.max(0, Math.round(price)),
          currency: "IDR",
          selections: selectionList,
        },
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
      <div className="space-y-5 overflow-y-auto pr-2">
        {activeAttributes.length === 0 ? (
          <div className="text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4">
            Add at least one attribute with options before creating variants.
          </div>
        ) : (
          <div className="space-y-4">
            {activeAttributes.map((attribute) => (
              <div key={attribute.id} className="space-y-2">
                <Label className="text-slate-700 font-medium">{attribute.name}</Label>
                <div className="relative">
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#5C6AC4] focus:ring-2 focus:ring-[#5C6AC4]/20 appearance-none"
                    value={selections[attribute.id] ?? ""}
                    onChange={(event) =>
                      setSelections((prev) => ({
                        ...prev,
                        [attribute.id]: Number(event.target.value),
                      }))
                    }
                    data-testid={`select-attribute-${attribute.id}`}
                  >
                    <option value="">Select {attribute.name}</option>
                    {attribute.options
                      .filter((option) => option.isActive)
                      .map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.value}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">SKU</Label>
          <Input value={sku} onChange={(event) => setSku(event.target.value)} placeholder="e.g. LEGATTO-BLK-M" className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#5C6AC4]" data-testid="input-variant-sku" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Unit</Label>
            <Input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="piece" className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#5C6AC4]" data-testid="input-variant-unit" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Price (Rp)</Label>
            <Input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#5C6AC4]" data-testid="input-variant-price" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Initial Stock</Label>
            <Input type="number" value={stockOnHand} onChange={(event) => setStockOnHand(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#5C6AC4]" data-testid="input-variant-stock" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Allow Preorder</Label>
            <div className="relative">
              <select
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#5C6AC4] focus:ring-2 focus:ring-[#5C6AC4]/20 appearance-none"
                value={allowPreorder ? "yes" : "no"}
                onChange={(event) => setAllowPreorder(event.target.value === "yes")}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 pt-4 bg-white/95 backdrop-blur">
        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00848E] to-[#00A3AE] hover:opacity-90 font-semibold shadow-[0_4px_15px_rgba(0,132,142,0.3)]"
          disabled={
            isPending ||
            !sku ||
            !hasOptions ||
            !selectionsReady ||
            activeAttributes.length === 0
          }
          data-testid="button-add-variant"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Add Variant
        </Button>
      </div>
    </form>
  );
}

function AttributeForm({
  productId,
  nextSortOrder,
  onSuccess,
}: {
  productId: number;
  nextSortOrder: number;
  onSuccess: () => void;
}) {
  const { mutate, isPending } = useCreateAttribute();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sortOrder, setSortOrder] = useState(nextSortOrder);

  useEffect(() => {
    setSortOrder(nextSortOrder);
  }, [nextSortOrder]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(
      {
        productId,
        data: {
          name,
          code,
          sortOrder,
          isActive: true,
        },
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium">Attribute Name</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Color" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" />
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium">Code</Label>
        <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. color" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" />
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium">Sort Order</Label>
        <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" />
      </div>
      <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-[#5C6AC4] to-[#6B7AC8] hover:opacity-90 font-semibold shadow-[0_4px_15px_rgba(92,106,196,0.3)]" disabled={isPending || !name || !code}>
        {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Add Attribute
      </Button>
    </form>
  );
}

function OptionForm({
  productId,
  attributeId,
  nextSortOrder,
  onSuccess,
}: {
  productId: number;
  attributeId: number;
  nextSortOrder: number;
  onSuccess: () => void;
}) {
  const { mutate, isPending } = useCreateAttributeOption();
  const [value, setValue] = useState("");
  const [sortOrder, setSortOrder] = useState(nextSortOrder);

  useEffect(() => {
    setSortOrder(nextSortOrder);
  }, [nextSortOrder]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(
      {
        productId,
        attributeId,
        data: {
          value,
          sortOrder,
          isActive: true,
        },
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium">Option Value</Label>
        <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="e.g. Black" className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" />
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium">Sort Order</Label>
        <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" />
      </div>
      <Button type="submit" className="w-full h-10 rounded-xl bg-gradient-to-r from-[#00848E] to-[#00A3AE] hover:opacity-90 font-semibold shadow-[0_4px_15px_rgba(0,132,142,0.3)]" disabled={isPending || !value}>
        {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Add Option
      </Button>
    </form>
  );
}

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { data: brands } = useBrands();
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [activeAttributeProductId, setActiveAttributeProductId] = useState<number | null>(null);
  const [activeOptionAttributeId, setActiveOptionAttributeId] = useState<number | null>(null);
  const hasBrands = (brands?.length || 0) > 0;

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
            {!hasBrands ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Create a brand before adding products.</p>
                <Button className="w-full h-11 rounded-xl" onClick={() => { setAddProductOpen(false); setAddBrandOpen(true); }}>
                  Create Brand
                </Button>
              </div>
            ) : (
              <ProductForm brands={brands || []} onSuccess={() => setAddProductOpen(false)} />
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={addBrandOpen} onOpenChange={setAddBrandOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 text-slate-600">
              <Plus className="w-4 h-4 mr-2" /> Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create Brand</DialogTitle>
              <DialogDescription>Add a brand to organize your products.</DialogDescription>
            </DialogHeader>
            <BrandForm onSuccess={() => setAddBrandOpen(false)} />
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
                          {product.brand?.name || "No brand"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                          <Tag className="w-4 h-4" />
                          {product.type}
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
                      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-hidden rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">Add Variant to {product.name}</DialogTitle>
                          <DialogDescription>Create a new variant with different attributes.</DialogDescription>
                        </DialogHeader>
                        <VariantForm productId={product.id} attributes={product.attributes} onSuccess={() => setActiveProductId(null)} />
                      </DialogContent>
                    </Dialog>
                    <Dialog open={activeAttributeProductId === product.id} onOpenChange={(open) => setActiveAttributeProductId(open ? product.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:border-[#5C6AC4] hover:text-[#5C6AC4] hover:bg-[#5C6AC4]/5">
                          <Plus className="w-4 h-4 mr-2" /> Add Attribute
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[480px] rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">Add Attribute</DialogTitle>
                          <DialogDescription>Define attributes like Color or Size.</DialogDescription>
                        </DialogHeader>
                        <AttributeForm productId={product.id} nextSortOrder={product.attributes.length + 1} onSuccess={() => setActiveAttributeProductId(null)} />
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
                  <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Attributes</h4>
                      {product.attributes.length === 0 ? (
                        <p className="text-sm text-slate-400">No attributes yet. Add one to build variants.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.attributes.map((attribute) => (
                            <div key={attribute.id} className="bg-white rounded-xl border border-slate-200/80 p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-slate-800">{attribute.name}</p>
                                  <p className="text-xs text-slate-400">{attribute.code}</p>
                                </div>
                                <Dialog open={activeOptionAttributeId === attribute.id} onOpenChange={(open) => setActiveOptionAttributeId(open ? attribute.id : null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="rounded-lg text-xs">
                                      <Plus className="w-3 h-3 mr-1" /> Add Option
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[420px] rounded-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-lg font-bold">Add Option</DialogTitle>
                                      <DialogDescription>Add a value for {attribute.name}.</DialogDescription>
                                    </DialogHeader>
                                    <OptionForm productId={product.id} attributeId={attribute.id} nextSortOrder={attribute.options.length + 1} onSuccess={() => setActiveOptionAttributeId(null)} />
                                  </DialogContent>
                                </Dialog>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {attribute.options.length === 0 ? (
                                  <span className="text-xs text-slate-400">No options yet</span>
                                ) : (
                                  attribute.options.map((option) => (
                                    <span key={option.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                      {option.value}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.variants.map(variant => {
                        const stockNum = Number(variant.stockOnHand);
                        const isInStock = stockNum > 0;
                        const price = getVariantPrice(variant, "IDR");
                        return (
                          <div key={variant.id} className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all" data-testid={`variant-card-${variant.id}`}>
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-slate-800">{formatVariantLabel(variant)}</h4>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isInStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {isInStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-sm text-slate-500">
                              <p>SKU: {variant.sku || '-'}</p>
                              <p className="font-medium text-slate-700">Rp {formatPrice(price?.priceCents ?? 0)}</p>
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
