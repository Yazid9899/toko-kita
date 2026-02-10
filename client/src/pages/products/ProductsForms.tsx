import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import {
  useCreateAttribute,
  useCreateAttributeOption,
  useCreateBrand,
  useCreateProduct,
  useCreateVariant,
  useUpdateAttribute,
  useUpdateAttributeOption,
  useUpdateBrand,
  useUpdateProduct,
  useUpdateVariant,
} from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

export function BrandForm({ onSuccess }: { onSuccess: () => void }) {
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

export function BrandEditForm({
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

export function ProductForm({ onSuccess, brands }: { onSuccess: () => void; brands: { id: number; name: string }[] }) {
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

export function VariantForm({
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

export function ProductEditForm({
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

export function AttributeForm({
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

export function OptionForm({
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

export function AttributeEditForm({
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

export function OptionEditForm({
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

export function VariantEditForm({
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
