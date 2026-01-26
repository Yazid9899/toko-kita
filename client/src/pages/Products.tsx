import { Layout } from "@/components/Layout";
import { useProducts, useCreateProduct, useCreateVariant, useBrands, useCreateBrand, useCreateAttribute, useCreateAttributeOption, useUpdateProduct, useUpdateBrand, useUpdateVariant, useUpdateAttribute, useUpdateAttributeOption } from "@/hooks/use-products";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Package, ChevronDown, ChevronUp, Box, Tag, Layers, Pencil, Sparkles, Shapes, PenLine, MoreHorizontal } from "lucide-react";
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
        <p className="text-xs text-slate-500">Brands help group products for quick filtering and reporting.</p>
        <div className="space-y-2">
          <Label className="text-slate-700 text-sm font-semibold">Brand Name</Label>
          <Input placeholder="e.g. Legatto" {...form.register("name", { required: true })} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 text-sm font-semibold">Slug</Label>
          <Input placeholder="e.g. legatto" {...form.register("slug", { required: true })} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
          <p className="text-xs text-slate-400">Lowercase, no spaces. Used for URLs.</p>
        </div>
        <Button type="submit" className="w-full h-11 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm disabled:opacity-60" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Brand
        </Button>
      </form>
    </Form>
  );
}

function BrandEditForm({
  brand,
  onSuccess,
}: {
  brand: { id: number; name: string; slug: string };
  onSuccess: () => void;
}) {
  const { mutate, isPending } = useUpdateBrand();
  const [name, setName] = useState(brand.name);
  const [slug, setSlug] = useState(brand.slug);

  useEffect(() => {
    setName(brand.name);
    setSlug(brand.slug);
  }, [brand]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate({ id: brand.id, data: { name: name.trim(), slug: slug.trim() } }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Brand Name</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Slug</Label>
        <Input value={slug} onChange={(event) => setSlug(event.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <Button type="submit" className="w-full h-11 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm disabled:opacity-60" disabled={isPending || !name || !slug}>
        {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Brand
      </Button>
    </form>
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
              <FormLabel className="text-slate-700 text-sm font-semibold">Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. T-Shirt" {...field} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" data-testid="input-product-name" />
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
              <FormLabel className="text-slate-700 text-sm font-semibold">Description</FormLabel>
              <FormControl>
                <Input placeholder="Optional..." {...field} value={field.value || ""} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" data-testid="input-product-desc" />
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
              <FormLabel className="text-slate-700 text-sm font-semibold">Brand</FormLabel>
              <FormControl>
                <div className="relative">
                  <select
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 appearance-none"
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
              <FormLabel className="text-slate-700 text-sm font-semibold">Type</FormLabel>
              <FormControl>
                <div className="relative">
                  <select {...field} className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 appearance-none" data-testid="select-product-type">
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
        <Button type="submit" className="w-full h-11 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm disabled:opacity-60" disabled={isPending} data-testid="button-create-product">
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
                <Label className="text-slate-700 text-sm font-semibold">{attribute.name}</Label>
                <div className="relative">
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 appearance-none"
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
        <Label className="text-slate-700 text-sm font-semibold">SKU</Label>
        <Input value={sku} onChange={(event) => setSku(event.target.value)} placeholder="e.g. LEGATTO-BLK-M" className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" data-testid="input-variant-sku" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 text-sm font-semibold">Unit</Label>
          <Input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="piece" className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" data-testid="input-variant-unit" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 text-sm font-semibold">Price (Rp)</Label>
          <Input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" data-testid="input-variant-price" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 text-sm font-semibold">Initial Stock</Label>
          <Input type="number" value={stockOnHand} onChange={(event) => setStockOnHand(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" data-testid="input-variant-stock" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 text-sm font-semibold">Allow Preorder</Label>
            <div className="relative">
            <select
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 appearance-none"
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
          className="w-full h-11 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm disabled:opacity-60"
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

function ProductEditForm({
  product,
  brands,
  onSuccess,
}: {
  product: { id: number; name: string; description?: string | null; brandId: number; type: "apparel" | "accessory" };
  brands: { id: number; name: string }[];
  onSuccess: () => void;
}) {
  const { mutate, isPending } = useUpdateProduct();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [brandId, setBrandId] = useState(product.brandId);
  const [type, setType] = useState(product.type);

  useEffect(() => {
    setName(product.name);
    setDescription(product.description ?? "");
    setBrandId(product.brandId);
    setType(product.type);
  }, [product]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(
      {
        id: product.id,
        data: {
          name: name.trim(),
          description: description.trim() || null,
          brandId,
          type,
        },
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Product Name</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Description</Label>
        <Input value={description} onChange={(event) => setDescription(event.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Brand</Label>
        <div className="relative">
          <select
            value={brandId}
            onChange={(event) => setBrandId(Number(event.target.value))}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 appearance-none"
          >
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Type</Label>
        <div className="relative">
          <select
            value={type}
            onChange={(event) => setType(event.target.value as "apparel" | "accessory")}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 appearance-none"
          >
            <option value="apparel">Apparel</option>
            <option value="accessory">Accessory</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <Button type="submit" className="w-full h-11 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm disabled:opacity-60" disabled={isPending || !name}>
        {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Product
      </Button>
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
        <Label className="text-slate-700 text-sm font-semibold">Attribute Name</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Color" className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Code</Label>
        <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. color" className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
        <p className="text-xs text-slate-400">Stable key used for variant logic.</p>
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Sort Order</Label>
        <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <Button type="submit" className="w-full h-11 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm disabled:opacity-60" disabled={isPending || !name || !code}>
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
        <Label className="text-slate-700 text-sm font-semibold">Option Value</Label>
        <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="e.g. Black" className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Sort Order</Label>
        <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <Button type="submit" className="w-full h-10 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm disabled:opacity-60" disabled={isPending || !value}>
        {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Add Option
      </Button>
    </form>
  );
}

function AttributeEditForm({
  productId,
  attribute,
  onSuccess,
}: {
  productId: number;
  attribute: { id: number; name: string; code: string; sortOrder: number; isActive: boolean };
  onSuccess: () => void;
}) {
  const { mutate, isPending } = useUpdateAttribute();
  const [name, setName] = useState(attribute.name);
  const [code, setCode] = useState(attribute.code);
  const [sortOrder, setSortOrder] = useState(attribute.sortOrder);
  const [isActive, setIsActive] = useState(attribute.isActive);

  useEffect(() => {
    setName(attribute.name);
    setCode(attribute.code);
    setSortOrder(attribute.sortOrder);
    setIsActive(attribute.isActive);
  }, [attribute]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(
      {
        id: attribute.id,
        productId,
        data: { name, code, sortOrder, isActive },
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Attribute Name</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Code</Label>
        <Input value={code} onChange={(event) => setCode(event.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700 text-sm font-semibold">Sort Order</Label>
          <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 text-sm font-semibold">Active</Label>
          <div className="relative">
            <select
              value={isActive ? "yes" : "no"}
              onChange={(event) => setIsActive(event.target.value === "yes")}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 appearance-none"
            >
              <option value="yes">Active</option>
              <option value="no">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full h-11 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm disabled:opacity-60" disabled={isPending || !name || !code}>
        {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Attribute
      </Button>
    </form>
  );
}

function OptionEditForm({
  productId,
  option,
  onSuccess,
}: {
  productId: number;
  option: { id: number; value: string; sortOrder: number; isActive: boolean };
  onSuccess: () => void;
}) {
  const { mutate, isPending } = useUpdateAttributeOption();
  const [value, setValue] = useState(option.value);
  const [sortOrder, setSortOrder] = useState(option.sortOrder);
  const [isActive, setIsActive] = useState(option.isActive);

  useEffect(() => {
    setValue(option.value);
    setSortOrder(option.sortOrder);
    setIsActive(option.isActive);
  }, [option]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(
      {
        id: option.id,
        productId,
        data: { value, sortOrder, isActive },
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-slate-700 text-sm font-semibold">Option Value</Label>
        <Input value={value} onChange={(event) => setValue(event.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700 text-sm font-semibold">Sort Order</Label>
          <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 text-sm font-semibold">Active</Label>
          <div className="relative">
            <select
              value={isActive ? "yes" : "no"}
              onChange={(event) => setIsActive(event.target.value === "yes")}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 appearance-none"
            >
              <option value="yes">Active</option>
              <option value="no">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full h-10 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm disabled:opacity-60" disabled={isPending || !value}>
        {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Option
      </Button>
    </form>
  );
}

function VariantEditForm({
  productId,
  variant,
  attributes,
  onSuccess,
}: {
  productId: number;
  variant: {
    id: number;
    sku: string;
    unit: string;
    stockOnHand: string | number;
    allowPreorder: boolean;
    prices: { currency: string; priceCents: number }[];
    optionValues: { attributeId: number; optionId: number }[];
  };
  attributes: {
    id: number;
    name: string;
    options: { id: number; value: string; isActive: boolean }[];
  }[];
  onSuccess: () => void;
}) {
  const { mutate, isPending } = useUpdateVariant();
  const [sku, setSku] = useState(variant.sku);
  const [unit, setUnit] = useState(variant.unit);
  const [price, setPrice] = useState(variant.prices.find((p) => p.currency === "IDR")?.priceCents ?? 0);
  const [stockOnHand, setStockOnHand] = useState(Number(variant.stockOnHand));
  const [allowPreorder, setAllowPreorder] = useState(variant.allowPreorder);
  const [selections, setSelections] = useState<Record<number, number>>({});

  useEffect(() => {
    const nextSelections: Record<number, number> = {};
    variant.optionValues.forEach((ov) => {
      nextSelections[ov.attributeId] = ov.optionId;
    });
    setSelections(nextSelections);
    setSku(variant.sku);
    setUnit(variant.unit);
    setPrice(variant.prices.find((p) => p.currency === "IDR")?.priceCents ?? 0);
    setStockOnHand(Number(variant.stockOnHand));
    setAllowPreorder(variant.allowPreorder);
  }, [variant]);

  const selectionsReady = attributes.every((attribute) => selections[attribute.id]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(
      {
        id: variant.id,
        productId,
        data: {
          sku,
          unit,
          stockOnHand,
          allowPreorder,
          currency: "IDR",
          priceCents: Math.max(0, Math.round(price)),
          selections: attributes.map((attribute) => ({
            attributeId: attribute.id,
            optionId: selections[attribute.id],
          })),
        },
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
      <div className="space-y-5 overflow-y-auto pr-2">
        <div className="space-y-4">
          {attributes.map((attribute) => {
            const selectedOption = selections[attribute.id];
            const options = attribute.options.filter(
              (option) => option.isActive || option.id === selectedOption
            );
            return (
              <div key={attribute.id} className="space-y-2">
                <Label className="text-slate-700 font-medium">{attribute.name}</Label>
                <div className="relative">
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 appearance-none"
                    value={selectedOption ?? ""}
                    onChange={(event) =>
                      setSelections((prev) => ({
                        ...prev,
                        [attribute.id]: Number(event.target.value),
                      }))
                    }
                  >
                    <option value="">Select {attribute.name}</option>
                    {options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">SKU</Label>
          <Input value={sku} onChange={(event) => setSku(event.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Unit</Label>
            <Input value={unit} onChange={(event) => setUnit(event.target.value)} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Price (Rp)</Label>
            <Input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Stock</Label>
            <Input type="number" value={stockOnHand} onChange={(event) => setStockOnHand(Number(event.target.value))} className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Allow Preorder</Label>
            <div className="relative">
              <select
                value={allowPreorder ? "yes" : "no"}
                onChange={(event) => setAllowPreorder(event.target.value === "yes")}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm shadow-sm transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 appearance-none"
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
        <Button type="submit" className="w-full h-11 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm disabled:opacity-60" disabled={isPending || !sku || !selectionsReady}>
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Variant
        </Button>
      </div>
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
  const [activeEditProductId, setActiveEditProductId] = useState<number | null>(null);
  const [activeEditBrandId, setActiveEditBrandId] = useState<number | null>(null);
  const [activeEditAttributeId, setActiveEditAttributeId] = useState<number | null>(null);
  const [activeEditOptionId, setActiveEditOptionId] = useState<number | null>(null);
  const [activeEditVariantId, setActiveEditVariantId] = useState<number | null>(null);
  const hasBrands = (brands?.length || 0) > 0;

  const toggleItem = (id: number) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#3B82F6]/15 to-[#06B6D4]/15 flex items-center justify-center">
              <Shapes className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Inventory</h1>
              <p className="text-sm text-slate-500">Manage products and stock levels</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm" data-testid="button-add-product">
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
              <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800">
                <Sparkles className="w-4 h-4 mr-2" /> Add Brand
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
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin w-8 h-8 text-[#3B82F6]" />
          </div>
        ) : products?.length === 0 ? (
          <div className="premium-card text-center py-16 border border-slate-100 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-2">No products yet</p>
            <Button variant="link" className="text-[#3B82F6]" onClick={() => setAddProductOpen(true)}>Add your first product</Button>
          </div>
        ) : (
          products?.map((product) => (
            <div key={product.id} className="premium-card p-0 overflow-hidden border border-slate-100 shadow-sm" data-testid={`product-card-${product.id}`}>
              <Collapsible open={openItems[product.id]} onOpenChange={() => toggleItem(product.id)}>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B82F6]/12 to-[#06B6D4]/12 flex items-center justify-center">
                      <Package className="w-7 h-7 text-[#3B82F6]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
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
                    <Dialog open={activeAttributeProductId === product.id} onOpenChange={(open) => setActiveAttributeProductId(open ? product.id : null)}>
                      <DialogTrigger asChild>
                        <Button className="rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] font-semibold shadow-sm">
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
                    <Dialog open={activeProductId === product.id} onOpenChange={(open) => setActiveProductId(open ? product.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#3B82F6]/5" data-testid={`button-add-variant-${product.id}`}>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100" aria-label="More options">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setActiveEditProductId(product.id)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit Product
                        </DropdownMenuItem>
                        {product.brand && (
                          <DropdownMenuItem onClick={() => setActiveEditBrandId(product.brand.id)}>
                            <PenLine className="w-4 h-4 mr-2" /> Edit Brand
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100" data-testid={`button-toggle-product-${product.id}`}>
                        {openItems[product.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                
                <CollapsibleContent>
                  <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-5 space-y-6">
                    <Dialog open={activeEditProductId === product.id} onOpenChange={(open) => setActiveEditProductId(open ? product.id : null)}>
                      <DialogContent className="sm:max-w-[520px] rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">Edit Product</DialogTitle>
                          <DialogDescription>Update product details.</DialogDescription>
                        </DialogHeader>
                        <ProductEditForm product={product} brands={brands || []} onSuccess={() => setActiveEditProductId(null)} />
                      </DialogContent>
                    </Dialog>
                    {product.brand && (
                      <Dialog open={activeEditBrandId === product.brand.id} onOpenChange={(open) => setActiveEditBrandId(open ? product.brand.id : null)}>
                        <DialogContent className="sm:max-w-[480px] rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Edit Brand</DialogTitle>
                            <DialogDescription>Update brand details.</DialogDescription>
                          </DialogHeader>
                          <BrandEditForm brand={product.brand} onSuccess={() => setActiveEditBrandId(null)} />
                        </DialogContent>
                      </Dialog>
                    )}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" /> Attributes
                      </h4>
                      {product.attributes.length === 0 ? (
                        <p className="text-sm text-slate-400">No attributes yet. Add one to build variants.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.attributes.map((attribute) => (
                            <div key={attribute.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-slate-800">{attribute.name}</p>
                                  <p className="text-xs text-slate-400">{attribute.code}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Dialog open={activeEditAttributeId === attribute.id} onOpenChange={(open) => setActiveEditAttributeId(open ? attribute.id : null)}>
                                    <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="rounded-lg text-xs">
                                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                                    </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[450px] rounded-2xl">
                                      <DialogHeader>
                                        <DialogTitle className="text-lg font-bold">Edit Attribute</DialogTitle>
                                        <DialogDescription>Update attribute details.</DialogDescription>
                                      </DialogHeader>
                                      <AttributeEditForm productId={product.id} attribute={attribute} onSuccess={() => setActiveEditAttributeId(null)} />
                                    </DialogContent>
                                  </Dialog>
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
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {attribute.options.length === 0 ? (
                                  <span className="text-xs text-slate-400">No options yet</span>
                                ) : (
                                  attribute.options.map((option) => (
                                    <Dialog key={option.id} open={activeEditOptionId === option.id} onOpenChange={(open) => setActiveEditOptionId(open ? option.id : null)}>
                                    <DialogTrigger asChild>
                                      <button type="button" className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full hover:bg-slate-200 transition-colors shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]">
                                        {option.value}
                                      </button>
                                    </DialogTrigger>
                                      <DialogContent className="sm:max-w-[420px] rounded-2xl">
                                        <DialogHeader>
                                          <DialogTitle className="text-lg font-bold">Edit Option</DialogTitle>
                                          <DialogDescription>Update option details.</DialogDescription>
                                        </DialogHeader>
                                        <OptionEditForm productId={product.id} option={option} onSuccess={() => setActiveEditOptionId(null)} />
                                      </DialogContent>
                                    </Dialog>
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
                          <div key={variant.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all" data-testid={`variant-card-${variant.id}`}>
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-slate-800">{formatVariantLabel(variant)}</h4>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isInStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {isInStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-sm text-slate-500">
                              <p>SKU: {variant.sku || '-'}</p>
                              <p className="font-medium text-slate-700">Rp {formatPrice(price?.priceCents ?? 0)}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-600">{stockNum} in stock</span>
                              <Dialog open={activeEditVariantId === variant.id} onOpenChange={(open) => setActiveEditVariantId(open ? variant.id : null)}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-[#3B82F6] rounded-lg" data-testid={`button-edit-variant-${variant.id}`}>Edit</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-hidden rounded-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Edit Variant</DialogTitle>
                                    <DialogDescription>Update variant details and selections.</DialogDescription>
                                  </DialogHeader>
                                  <VariantEditForm productId={product.id} variant={variant} attributes={product.attributes} onSuccess={() => setActiveEditVariantId(null)} />
                                </DialogContent>
                              </Dialog>
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
