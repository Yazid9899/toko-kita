import { Layout } from "@/components/Layout";
import { useProducts, useCreateProduct, useCreateVariant, useBrands, useCreateBrand, useCreateAttribute, useCreateAttributeOption, useUpdateProduct, useUpdateBrand, useUpdateVariant, useUpdateAttribute, useUpdateAttributeOption, useDeleteVariant } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
import { Loader2, Plus, Package, ChevronDown, ChevronUp, Box, Tag, Layers, Pencil, Sparkles, PenLine, MoreHorizontal, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatPrice, getVariantPrice } from "@/lib/variant-utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const COLOR_HEX_MAP: Record<string, string> = {
  black: "#111827",
  beige: "#D6C3A1",
  blue: "#2563EB",
  gray: "#6B7280",
  "light gray": "#9CA3AF",
  olive: "#6B8E23",
  navy: "#1E3A8A",
  "light brown": "#B08968",
  "dark brown": "#5C4033",
  brown: "#8B5E3C",
  "icy blue": "#93C5FD",
  lavender: "#A78BFA",
  "pale pink": "#F9A8D4",
  purple: "#8B5CF6",
  ivory: "#F5F1E8",
  "ivory handle brown": "#C2A184",
  mustard: "#CA8A04",
  mint: "#6EE7B7",
  peach: "#FDBA74",
  "silver gray": "#94A3B8",
  "rare blue": "#3B82F6",
  "mint/ivory": "#BDE6D5",
  "dark green/navy": "#14532D",
  "pink/brown": "#C97A87",
  "pink/gray": "#C08497",
  "blue/dark brown": "#355E8A",
  silver: "#9CA3AF",
  "black handle brown": "#4B352A",
};

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
        <p className="text-sm text-muted-foreground">Brands help group products for quick filtering and reporting.</p>
        <div className="space-y-2">
          <Label>Brand Name</Label>
          <Input placeholder="e.g. Legatto" {...form.register("name", { required: true })} />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input placeholder="e.g. legatto" {...form.register("slug", { required: true })} />
          <p className="text-xs text-muted-foreground">Lowercase, no spaces. Used for URLs.</p>
        </div>
        <Button type="submit" variant="default" className="w-full" disabled={isPending}>
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
        <Label>Brand Name</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input value={slug} onChange={(event) => setSlug(event.target.value)} />
      </div>
      <Button type="submit" variant="default" className="w-full" disabled={isPending || !name || !slug}>
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
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. T-Shirt" {...field} data-testid="input-product-name" />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Optional..." {...field} value={field.value || ""} data-testid="input-product-desc" />
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
              <FormLabel>Brand</FormLabel>
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <FormControl>
                  <SelectTrigger className="h-11 rounded-xl" data-testid="select-brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="h-11 rounded-xl" data-testid="select-product-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="default" className="w-full" disabled={isPending} data-testid="button-create-product">
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
  const [priceInput, setPriceInput] = useState("");
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

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("id-ID");
  };

  const parseCurrencyInput = (value: string) => Number(value.replace(/\D/g, "")) || 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectionList = activeAttributes.map((attribute) => ({
      attributeId: attribute.id,
      optionId: selections[attribute.id],
    }));
    const priceCents = parseCurrencyInput(priceInput);

    mutate(
      {
        productId,
        data: {
          sku,
          unit,
          stockOnHand,
          allowPreorder,
          priceCents: Math.max(0, Math.round(priceCents)),
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
          <div className="text-sm text-muted-foreground bg-muted/40 border border-dashed border-border rounded-xl p-4">
            Add at least one attribute with options before creating variants.
          </div>
        ) : (
          <div className="space-y-4">
            {activeAttributes.map((attribute) => (
              <div key={attribute.id} className="space-y-2">
                <Label>{attribute.name}</Label>
                <Select
                  value={selections[attribute.id] ? String(selections[attribute.id]) : undefined}
                  onValueChange={(value) =>
                    setSelections((prev) => ({
                      ...prev,
                      [attribute.id]: Number(value),
                    }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl" data-testid={`select-attribute-${attribute.id}`}>
                    <SelectValue placeholder={`Select ${attribute.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {attribute.options
                      .filter((option) => option.isActive)
                      .map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.value}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
        <Label>SKU</Label>
        <Input value={sku} onChange={(event) => setSku(event.target.value)} placeholder="e.g. LEGATTO-BLK-M" data-testid="input-variant-sku" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Unit</Label>
          <Input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="piece" data-testid="input-variant-unit" />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                value={priceInput}
                onChange={(event) => setPriceInput(formatCurrencyInput(event.target.value))}
                className="pl-8 text-right"
                data-testid="input-variant-price"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Initial Stock</Label>
          <Input type="number" value={stockOnHand} onChange={(event) => setStockOnHand(Number(event.target.value))} data-testid="input-variant-stock" />
          </div>
          <div className="space-y-2">
            <Label>Allow Preorder</Label>
            <Select value={allowPreorder ? "yes" : "no"} onValueChange={(value) => setAllowPreorder(value === "yes")}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 pt-4 bg-white/95 backdrop-blur">
        <Button
          type="submit"
          variant="default" className="w-full"
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
        <Label>Product Name</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={description} onChange={(event) => setDescription(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Brand</Label>
        <Select value={String(brandId)} onValueChange={(value) => setBrandId(Number(value))}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={String(brand.id)}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(value) => setType(value as "apparel" | "accessory")}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apparel">Apparel</SelectItem>
            <SelectItem value="accessory">Accessory</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" variant="default" className="w-full" disabled={isPending || !name}>
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
        <Label>Attribute Name</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Color" />
      </div>
      <div className="space-y-2">
        <Label>Code</Label>
        <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. color" />
        <p className="text-xs text-muted-foreground">Stable key used for variant logic.</p>
      </div>
      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
      </div>
      <Button type="submit" variant="default" className="w-full" disabled={isPending || !name || !code}>
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
        <Label>Option Value</Label>
        <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="e.g. Black" />
      </div>
      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
      </div>
      <Button variant="default" className="w-full" disabled={isPending || !value}>
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
        <Label>Attribute Name</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Code</Label>
        <Input value={code} onChange={(event) => setCode(event.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sort Order</Label>
          <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Active</Label>
          <Select value={isActive ? "yes" : "no"} onValueChange={(value) => setIsActive(value === "yes")}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Active</SelectItem>
              <SelectItem value="no">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" variant="default" className="w-full" disabled={isPending || !name || !code}>
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
        <Label>Option Value</Label>
        <Input value={value} onChange={(event) => setValue(event.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sort Order</Label>
          <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Active</Label>
          <Select value={isActive ? "yes" : "no"} onValueChange={(value) => setIsActive(value === "yes")}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Active</SelectItem>
              <SelectItem value="no">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" variant="default" className="w-full" disabled={isPending || !value}>
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
  const [priceInput, setPriceInput] = useState("");
  const [stockOnHand, setStockOnHand] = useState(Number(variant.stockOnHand));
  const [allowPreorder, setAllowPreorder] = useState(variant.allowPreorder);
  const [selections, setSelections] = useState<Record<number, number>>({});

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("id-ID");
  };

  const parseCurrencyInput = (value: string) => Number(value.replace(/\D/g, "")) || 0;

  useEffect(() => {
    const nextSelections: Record<number, number> = {};
    variant.optionValues.forEach((ov) => {
      nextSelections[ov.attributeId] = ov.optionId;
    });
    setSelections(nextSelections);
    setSku(variant.sku);
    setUnit(variant.unit);
    const nextPrice = variant.prices.find((p) => p.currency === "IDR")?.priceCents ?? 0;
    setPriceInput(nextPrice ? Number(nextPrice).toLocaleString("id-ID") : "");
    setStockOnHand(Number(variant.stockOnHand));
    setAllowPreorder(variant.allowPreorder);
  }, [variant]);

  const selectionsReady = attributes.every((attribute) => selections[attribute.id]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const priceCents = parseCurrencyInput(priceInput);
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
          priceCents: Math.max(0, Math.round(priceCents)),
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
                <Label>{attribute.name}</Label>
                <Select
                  value={selectedOption ? String(selectedOption) : undefined}
                  onValueChange={(value) =>
                    setSelections((prev) => ({
                      ...prev,
                      [attribute.id]: Number(value),
                    }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder={`Select ${attribute.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <Label>SKU</Label>
          <Input value={sku} onChange={(event) => setSku(event.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Unit</Label>
            <Input value={unit} onChange={(event) => setUnit(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                value={priceInput}
                onChange={(event) => setPriceInput(formatCurrencyInput(event.target.value))}
                className="pl-8 text-right"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Stock</Label>
            <Input type="number" value={stockOnHand} onChange={(event) => setStockOnHand(Number(event.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Allow Preorder</Label>
            <Select value={allowPreorder ? "yes" : "no"} onValueChange={(value) => setAllowPreorder(value === "yes")}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 pt-4 bg-white/95 backdrop-blur">
        <Button type="submit" variant="default" className="w-full" disabled={isPending || !sku || !selectionsReady}>
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Variant
        </Button>
      </div>
    </form>
  );
}

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { data: brands } = useBrands();
  const { mutate: updateAttribute } = useUpdateAttribute();
  const { mutate: deleteVariant, isPending: isDeletingVariant } = useDeleteVariant();
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
  const [expandedOptionRows, setExpandedOptionRows] = useState<Record<number, boolean>>({});
  const [variantFilters, setVariantFilters] = useState<Record<number, Record<number, number | "all">>>({});
  const [deleteAttributeTarget, setDeleteAttributeTarget] = useState<{
    productId: number;
    attributeId: number;
    name: string;
  } | null>(null);
  const [deleteVariantTarget, setDeleteVariantTarget] = useState<{
    id: number;
    sku: string;
  } | null>(null);
  const hasBrands = (brands?.length || 0) > 0;

  const toggleItem = (id: number) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteAttribute = (productId: number, attributeId: number) => {
    updateAttribute({ id: attributeId, productId, data: { isActive: false } });
  };

  const setVariantFilter = (productId: number, attributeId: number, value: number | "all") => {
    setVariantFilters((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [attributeId]: value,
      },
    }));
  };

  const toggleOptionRow = (attributeId: number) => {
    setExpandedOptionRows((prev) => ({
      ...prev,
      [attributeId]: !prev[attributeId],
    }));
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage products and stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
            <DialogTrigger asChild>
              <Button variant="default" data-testid="button-add-product">
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
                  <p className="text-sm text-muted-foreground">Create a brand before adding products.</p>
                  <Button className="w-full" onClick={() => { setAddProductOpen(false); setAddBrandOpen(true); }}>
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
              <Button variant="outline">
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

      <AlertDialog open={!!deleteAttributeTarget} onOpenChange={(open) => !open && setDeleteAttributeTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attribute?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the attribute from the product. You can re-enable it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-attribute">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteAttributeTarget) return;
                handleDeleteAttribute(deleteAttributeTarget.productId, deleteAttributeTarget.attributeId);
                setDeleteAttributeTarget(null);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              data-testid="button-confirm-delete-attribute"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!deleteVariantTarget} onOpenChange={(open) => !open && setDeleteVariantTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove variant <span className="font-semibold">{deleteVariantTarget?.sku || "-"}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-variant">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteVariantTarget) return;
                deleteVariant(deleteVariantTarget.id, {
                  onSuccess: () => setDeleteVariantTarget(null),
                });
              }}
              disabled={isDeletingVariant}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              data-testid="button-confirm-delete-variant"
            >
              {isDeletingVariant ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Products Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#5C6AC4]" />
          </div>
        ) : products?.length === 0 ? (
          <Card className="rounded-2xl border border-slate-100 shadow-sm text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-2">No products yet</p>
            <Button variant="default" onClick={() => setAddProductOpen(true)}>Add your first product</Button>
          </Card>
        ) : (
          products?.map((product) => (
            <Card key={product.id} className="overflow-hidden border border-slate-100 shadow-sm rounded-2xl" data-testid={`product-card-${product.id}`}>
              <Collapsible open={openItems[product.id]} onOpenChange={() => toggleItem(product.id)}>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-800">{product.name}</h3>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Layers className="w-3.5 h-3.5" />
                          {product.variants.length} variants
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Tag className="w-3.5 h-3.5" />
                          {product.brand?.name || "No brand"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Tag className="w-3.5 h-3.5" />
                          {product.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Dialog open={activeAttributeProductId === product.id} onOpenChange={(open) => setActiveAttributeProductId(open ? product.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="default">
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
                        <Button variant="outline" data-testid={`button-add-variant-${product.id}`}>
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
                        <Button variant="ghost" size="icon" aria-label="More options">
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
                      <Button variant="ghost" size="icon" data-testid={`button-toggle-product-${product.id}`}>
                        {openItems[product.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                
                <CollapsibleContent>
                  <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 space-y-5">
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
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" /> Attributes
                      </h4>
                      {product.attributes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No attributes yet. Add one to build variants.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {product.attributes.map((attribute) => {
                            const isUsedByVariant = product.variants.some((variant) =>
                              variant.optionValues.some((value) => value.attributeId === attribute.id)
                            );
                            return (
                              <Card key={attribute.id} className="border border-slate-100 shadow-sm rounded-xl">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-800">{attribute.name}</p>
                                    <p className="text-xs text-muted-foreground">{attribute.code}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Dialog open={activeOptionAttributeId === attribute.id} onOpenChange={(open) => setActiveOptionAttributeId(open ? attribute.id : null)}>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label="Add option"
                                          title="Add option"
                                          data-testid={`button-add-option-${attribute.id}`}
                                        >
                                          <Plus className="w-4 h-4" />
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
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" aria-label="Attribute actions">
                                          <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setActiveEditAttributeId(attribute.id)}>
                                          <Pencil className="w-4 h-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => setDeleteAttributeTarget({ productId: product.id, attributeId: attribute.id, name: attribute.name })}
                                          disabled={isUsedByVariant}
                                          className="text-rose-600 focus:text-rose-600"
                                          data-testid={`menu-delete-attribute-${attribute.id}`}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                <Dialog open={activeEditAttributeId === attribute.id} onOpenChange={(open) => setActiveEditAttributeId(open ? attribute.id : null)}>
                                  <DialogContent className="sm:max-w-[450px] rounded-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-lg font-bold">Edit Attribute</DialogTitle>
                                      <DialogDescription>Update attribute details.</DialogDescription>
                                    </DialogHeader>
                                    <AttributeEditForm productId={product.id} attribute={attribute} onSuccess={() => setActiveEditAttributeId(null)} />
                                  </DialogContent>
                                </Dialog>
                                <div
                                  className={cn(
                                    "mt-2.5 flex gap-2",
                                    expandedOptionRows[attribute.id] ? "flex-wrap" : "flex-nowrap overflow-hidden",
                                  )}
                                >
                                  {attribute.options.length === 0 ? (
                                    <span className="text-xs text-muted-foreground">No options yet</span>
                                  ) : (
                                    (expandedOptionRows[attribute.id] ? attribute.options : attribute.options.slice(0, 6)).map((option) => (
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
                                  {attribute.options.length > 6 && !expandedOptionRows[attribute.id] && (
                                    <button
                                      type="button"
                                      onClick={() => toggleOptionRow(attribute.id)}
                                      className="shrink-0 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100"
                                    >
                                      +{attribute.options.length - 6} more
                                    </button>
                                  )}
                                  {attribute.options.length > 6 && expandedOptionRows[attribute.id] && (
                                    <button
                                      type="button"
                                      onClick={() => toggleOptionRow(attribute.id)}
                                      className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100"
                                    >
                                      Show less
                                    </button>
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {product.attributes.length > 0 && (
                        <Card className="px-4 py-3 border border-slate-100 shadow-sm rounded-xl">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Filter variants
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {product.attributes.map((attribute) => (
                              <div key={attribute.id} className="space-y-1">
                                <Label className="text-xs text-slate-500">{attribute.name}</Label>
                                <Select
                                  value={String(variantFilters[product.id]?.[attribute.id] ?? "all")}
                                  onValueChange={(value) => {
                                    setVariantFilter(product.id, attribute.id, value === "all" ? "all" : Number(value));
                                  }}
                                >
                                  <SelectTrigger className="h-9 rounded-lg text-xs">
                                    <SelectValue placeholder="All" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {attribute.options
                                      .filter((option) => option.isActive)
                                      .map((option) => (
                                        <SelectItem key={option.id} value={String(option.id)}>
                                          {option.value}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}
                      {(() => {
                        const filteredVariants = product.variants.filter((variant) =>
                          product.attributes.every((attribute) => {
                            const selected = variantFilters[product.id]?.[attribute.id];
                            if (!selected || selected === "all") return true;
                            return variant.optionValues.some(
                              (value) => value.attributeId === attribute.id && value.optionId === selected
                            );
                          })
                        );

                        const getAttributeValue = (variant: any, keys: string[]) => {
                          const found = variant.optionValues.find((value: any) => {
                            const attributeName = String(value.attributeName ?? "").toLowerCase();
                            return keys.some((key) => attributeName.includes(key));
                          });
                          return found?.optionValue ?? "-";
                        };

                        if (filteredVariants.length === 0) {
                          return (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                              <Box className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                              <p>{product.variants.length === 0 ? "No variants yet. Add one to start selling." : "No variants match current filters."}</p>
                            </div>
                          );
                        }

                        return (
                          <Card className="overflow-hidden border border-slate-100 shadow-sm rounded-xl">
                            <div className="divide-y divide-slate-100">
                              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <div className="col-span-6">Variant</div>
                                <div className="col-span-1">Color</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-2 text-center">Stock</div>
                                <div className="col-span-1 text-right">Action</div>
                              </div>
                              {filteredVariants.map((variant) => {
                                const stockNum = Number(variant.stockOnHand);
                                const price = getVariantPrice(variant, "IDR");
                                const material = getAttributeValue(variant, ["material", "bahan"]);
                                const size = getAttributeValue(variant, ["size", "ukuran"]);
                                const colorFromAttribute = getAttributeValue(variant, ["color", "colour", "warna"]);
                                const variantName = [material, size, colorFromAttribute].map((v) => v || "-").join(" - ");
                                const inferredFromLabel = variantName
                                  .split(" - ")
                                  .map((part) => part.trim())
                                  .filter((part) => part.length > 0 && part !== "-")
                                  .at(-1);
                                const colorNameCandidate =
                                  colorFromAttribute && colorFromAttribute !== "-" ? colorFromAttribute : inferredFromLabel;
                                const colorHex = colorNameCandidate ? COLOR_HEX_MAP[colorNameCandidate.toLowerCase()] : undefined;
                                const displayColorName = colorHex ? colorNameCandidate : "Unknown";
                                const displayColorHex = colorHex ?? "#94A3B8";
                                const slashColorParts = (colorNameCandidate ?? "")
                                  .split("/")
                                  .map((part) => part.trim().toLowerCase())
                                  .filter((part) => part.length > 0);
                                const leftHex = slashColorParts.length === 2 ? COLOR_HEX_MAP[slashColorParts[0]] : undefined;
                                const rightHex = slashColorParts.length === 2 ? COLOR_HEX_MAP[slashColorParts[1]] : undefined;
                                const dualColorBackground =
                                  leftHex && rightHex
                                    ? `linear-gradient(90deg, ${leftHex} 0 50%, ${rightHex} 50% 100%)`
                                    : undefined;

                                return (
                                  <div
                                    key={variant.id}
                                    className="group grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors items-center"
                                    data-testid={`variant-card-${variant.id}`}
                                  >
                                    <div className="lg:col-span-6">
                                      <p className="lg:hidden mb-0.5 text-[11px] uppercase tracking-wide text-slate-400">Variant</p>
                                      <p className="text-sm font-medium text-slate-800">{variantName}</p>
                                      <p className="text-xs text-slate-500">{variant.sku || "-"}</p>
                                    </div>
                                    <div className="lg:col-span-1">
                                      <p className="lg:hidden mb-0.5 text-[11px] uppercase tracking-wide text-slate-400">Color</p>
                                      <span
                                        className="inline-block h-4 w-4 rounded-full border border-slate-300"
                                        style={
                                          dualColorBackground
                                            ? { backgroundImage: dualColorBackground }
                                            : { backgroundColor: displayColorHex }
                                        }
                                        title={displayColorName}
                                        aria-label={displayColorName}
                                      />
                                    </div>
                                    <div className="lg:col-span-2 lg:text-right">
                                      <p className="lg:hidden mb-0.5 text-[11px] uppercase tracking-wide text-slate-400">Price</p>
                                      <p className="text-sm font-medium text-slate-800">Rp {formatPrice(price?.priceCents ?? 0)}</p>
                                    </div>
                                    <div className="lg:col-span-2 lg:text-center">
                                      <p className="lg:hidden mb-0.5 text-[11px] uppercase tracking-wide text-slate-400">Stock</p>
                                      <p
                                        className={cn(
                                          "text-sm font-medium",
                                          stockNum === 0
                                            ? "text-orange-500"
                                            : stockNum <= 2
                                              ? "text-amber-600"
                                              : "text-slate-700",
                                        )}
                                      >
                                        {stockNum}
                                      </p>
                                    </div>
                                    <div className="lg:col-span-1 lg:text-right">
                                      <p className="lg:hidden mb-0.5 text-[11px] uppercase tracking-wide text-slate-400">Action</p>
                                      <div className="flex items-center justify-start gap-1 lg:justify-end opacity-100 lg:opacity-40 lg:group-hover:opacity-100 transition-opacity">
                                        <Dialog open={activeEditVariantId === variant.id} onOpenChange={(open) => setActiveEditVariantId(open ? variant.id : null)}>
                                          <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700" data-testid={`button-edit-variant-${variant.id}`} aria-label="Edit variant">
                                              <Pencil className="h-4 w-4" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-hidden rounded-2xl">
                                            <DialogHeader>
                                              <DialogTitle className="text-xl font-bold">Edit Variant</DialogTitle>
                                              <DialogDescription>Update variant details and selections.</DialogDescription>
                                            </DialogHeader>
                                            <VariantEditForm productId={product.id} variant={variant} attributes={product.attributes} onSuccess={() => setActiveEditVariantId(null)} />
                                          </DialogContent>
                                        </Dialog>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-slate-500 hover:text-rose-600"
                                          onClick={() => setDeleteVariantTarget({ id: variant.id, sku: variant.sku || "-" })}
                                          data-testid={`button-delete-variant-${variant.id}`}
                                          aria-label="Delete variant"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </Card>
                        );
                      })()}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}








