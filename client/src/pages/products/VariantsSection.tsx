import { useMemo, useState } from "react";
import { Box, Download, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatPrice, getVariantPrice } from "@/lib/variant-utils";

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

export type VariantFilterValue = number | "all";

const getVariantAttributeValue = (variant: any, keys: string[]): string => {
  const found = variant.optionValues.find((value: any) => {
    const attributeName = String(value.attributeName ?? "").toLowerCase();
    return keys.some((key) => attributeName.includes(key));
  });
  return String(found?.optionValue ?? "-");
};

const filterVariantsBySelections = (
  variants: any[],
  attributes: any[],
  filters: Record<number, VariantFilterValue> | undefined,
) =>
  variants.filter((variant) =>
    attributes.every((attribute) => {
      const selected = filters?.[attribute.id];
      if (!selected || selected === "all") return true;
      return variant.optionValues.some(
        (value: any) => value.attributeId === attribute.id && value.optionId === selected
      );
    })
  );

const resolveVariantColorDisplay = (colorNameCandidate?: string) => {
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

  return {
    displayColorName,
    swatchStyle: dualColorBackground
      ? { backgroundImage: dualColorBackground }
      : { backgroundColor: displayColorHex },
  };
};

type SortDirection = "asc" | "desc" | null;
type VariantSortKey = "variant" | "color" | "price" | "stock";

function sortData<T>(
  data: T[],
  sortKey: VariantSortKey | null,
  sortDirection: SortDirection,
  getSortValue: (item: T, key: VariantSortKey) => string | number,
) {
  if (!sortKey || !sortDirection) return data;

  return data
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aVal = getSortValue(a.item, sortKey);
      const bVal = getSortValue(b.item, sortKey);

      let result = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        result = aVal - bVal;
      } else {
        result = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: "base" });
      }

      if (result === 0) return a.index - b.index;
      return sortDirection === "asc" ? result : -result;
    })
    .map((entry) => entry.item);
}

function SortIndicator({ direction }: { direction: SortDirection }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] leading-none">
      <span className={cn(direction === "asc" ? "text-slate-700" : "text-slate-300")}>{"\u25B2"}</span>
      <span className={cn(direction === "desc" ? "text-slate-700" : "text-slate-300")}>{"\u25BC"}</span>
    </span>
  );
}
function SortableHeader({
  label,
  isActive,
  direction,
  onClick,
  align = "left",
}: {
  label: string;
  isActive: boolean;
  direction: SortDirection;
  onClick: () => void;
  align?: "left" | "center" | "right";
}) {
  const alignClass = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex w-full items-center gap-2 rounded-md px-1 py-1 cursor-pointer transition-colors hover:bg-slate-100/70",
        alignClass,
        isActive ? "text-slate-700" : "text-slate-500",
      )}
      onClick={onClick}
    >
      <span>{label}</span>
      <SortIndicator direction={direction} />
    </button>
  );
}

export function VariantFiltersCard({
  productId,
  attributes,
  activeFilters,
  onSetVariantFilter,
}: {
  productId: number;
  attributes: any[];
  activeFilters: Record<number, VariantFilterValue> | undefined;
  onSetVariantFilter: (productId: number, attributeId: number, value: VariantFilterValue) => void;
}) {
  if (attributes.length === 0) return null;

  return (
    <Card className="px-4 py-3 border border-slate-100 shadow-sm rounded-xl">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Filter variants
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {attributes.map((attribute) => (
          <div key={attribute.id} className="space-y-1">
            <Label className="text-xs text-slate-500">{attribute.name}</Label>
            <Select
              value={String(activeFilters?.[attribute.id] ?? "all")}
              onValueChange={(value) => {
                onSetVariantFilter(productId, attribute.id, value === "all" ? "all" : Number(value));
              }}
            >
              <SelectTrigger className="h-9 rounded-lg text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {attribute.options
                  .filter((option: any) => option.isActive)
                  .map((option: any) => (
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
  );
}

export function VariantsTable({
  productId,
  variants,
  attributes,
  activeFilters,
  activeEditVariantId,
  setActiveEditVariantId,
  onDeleteVariant,
  VariantEditFormComponent,
}: {
  productId: number;
  variants: any[];
  attributes: any[];
  activeFilters: Record<number, VariantFilterValue> | undefined;
  activeEditVariantId: number | null;
  setActiveEditVariantId: (id: number | null) => void;
  onDeleteVariant: (id: number, sku: string) => void;
  VariantEditFormComponent: React.ComponentType<{
    productId: number;
    variant: any;
    attributes: any[];
    onSuccess: () => void;
  }>;
}) {
  const [sortKey, setSortKey] = useState<VariantSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const filteredVariants = filterVariantsBySelections(variants, attributes, activeFilters);
  const variantPresentationMap = useMemo(() => {
    return new Map<number, { variantName: string; colorName: string }>(
      filteredVariants.map((variant) => {
        const material = getVariantAttributeValue(variant, ["material", "bahan"]);
        const size = getVariantAttributeValue(variant, ["size", "ukuran"]);
        const colorFromAttribute = getVariantAttributeValue(variant, ["color", "colour", "warna"]);
        const variantName = [material, size, colorFromAttribute].map((v) => v || "-").join(" - ");
        const inferredFromLabel = variantName
          .split(" - ")
          .map((part) => part.trim())
          .filter((part) => part.length > 0 && part !== "-")
          .at(-1);
        const colorName = colorFromAttribute && colorFromAttribute !== "-" ? colorFromAttribute : inferredFromLabel ?? "";
        return [variant.id, { variantName, colorName }];
      }),
    );
  }, [filteredVariants]);

  const sortedFilteredVariants = useMemo(
    () =>
      sortData(filteredVariants, sortKey, sortDirection, (variant, key) => {
        const view = variantPresentationMap.get(variant.id);
        if (key === "price") return Number(getVariantPrice(variant, "IDR")?.priceCents ?? 0);
        if (key === "stock") return Number(variant.stockOnHand ?? 0);
        if (key === "color") return view?.colorName ?? "";
        return view?.variantName ?? "";
      }),
    [filteredVariants, sortDirection, sortKey, variantPresentationMap],
  );

  const cycleSort = (nextKey: VariantSortKey) => {
    if (sortKey !== nextKey) {
      setSortKey(nextKey);
      setSortDirection("asc");
      return;
    }
    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }
    if (sortDirection === "desc") {
      setSortKey(null);
      setSortDirection(null);
      return;
    }
    setSortDirection("asc");
  };

  const escapeCsv = (value: string | number) => {
    const text = String(value ?? "");
    const escaped = text.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const handleDownloadCsv = () => {
    if (sortedFilteredVariants.length === 0) return;

    const headers = ["Variant name", "SKU", "Color", "Price", "Stock"];
    const rows = sortedFilteredVariants.map((variant) => {
      const mapped = variantPresentationMap.get(variant.id);
      const variantName = mapped?.variantName ?? "";
      const colorName = mapped?.colorName ?? "";
      const sku = variant.sku ?? "";
      const price = Number(getVariantPrice(variant, "IDR")?.priceCents ?? 0);
      const stock = Number(variant.stockOnHand ?? 0);

      return [variantName, sku, colorName, price, stock].map(escapeCsv).join(",");
    });

    const csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const filename = `variants-${yyyy}-${mm}-${dd}.csv`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm rounded-xl">
      <div className="flex items-center justify-end gap-3 border-b border-slate-100 px-4 py-3">
        {sortedFilteredVariants.length === 0 ? (
          <p className="text-xs text-slate-500">No data</p>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className="h-9"
          onClick={handleDownloadCsv}
          disabled={sortedFilteredVariants.length === 0}
          data-testid={`button-download-variants-csv-${productId}`}
        >
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>
      {sortedFilteredVariants.length === 0 ? (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          <Box className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p>{variants.length === 0 ? "No variants yet. Add one to start selling." : "No variants match current filters."}</p>
        </div>
      ) : (
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <SortableHeader
                  label="Variant"
                  isActive={sortKey === "variant"}
                  direction={sortKey === "variant" ? sortDirection : null}
                  onClick={() => cycleSort("variant")}
                />
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <SortableHeader
                  label="Color"
                  isActive={sortKey === "color"}
                  direction={sortKey === "color" ? sortDirection : null}
                  onClick={() => cycleSort("color")}
                />
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                <SortableHeader
                  label="Price"
                  align="right"
                  isActive={sortKey === "price"}
                  direction={sortKey === "price" ? sortDirection : null}
                  onClick={() => cycleSort("price")}
                />
              </TableHead>
              <TableHead className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                <SortableHeader
                  label="Stock"
                  align="center"
                  isActive={sortKey === "stock"}
                  direction={sortKey === "stock" ? sortDirection : null}
                  onClick={() => cycleSort("stock")}
                />
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFilteredVariants.map((variant) => {
            const stockNum = Number(variant.stockOnHand);
            const price = getVariantPrice(variant, "IDR");
            const mapped = variantPresentationMap.get(variant.id);
            const variantName = mapped?.variantName ?? "-";
            const colorFromAttribute = mapped?.colorName ?? "-";
            const inferredFromLabel = variantName
              .split(" - ")
              .map((part) => part.trim())
              .filter((part) => part.length > 0 && part !== "-")
              .at(-1);
            const colorNameCandidate =
              colorFromAttribute && colorFromAttribute !== "-" ? colorFromAttribute : inferredFromLabel;
            const colorDisplay = resolveVariantColorDisplay(colorNameCandidate);

            return (
              <TableRow
                key={variant.id}
                className="group hover:bg-slate-50/60"
                data-testid={`variant-card-${variant.id}`}
              >
                <TableCell className="px-6 py-4 align-middle">
                  <p className="lg:hidden mb-0.5 text-[11px] uppercase tracking-wide text-slate-400">Variant</p>
                  <p className="text-sm font-medium text-slate-800">{variantName}</p>
                  <p className="text-xs text-slate-500">{variant.sku || "-"}</p>
                </TableCell>
                <TableCell className="px-6 py-4 align-middle">
                  <p className="lg:hidden mb-0.5 text-[11px] uppercase tracking-wide text-slate-400">Color</p>
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-slate-300"
                    style={colorDisplay.swatchStyle}
                    title={colorDisplay.displayColorName}
                    aria-label={colorDisplay.displayColorName}
                  />
                </TableCell>
                <TableCell className="px-6 py-4 text-right align-middle">
                  <p className="lg:hidden mb-0.5 text-[11px] uppercase tracking-wide text-slate-400">Price</p>
                  <p className="text-sm font-medium text-slate-800">Rp {formatPrice(price?.priceCents ?? 0)}</p>
                </TableCell>
                <TableCell className="px-6 py-4 text-center align-middle">
                  <p className="lg:hidden mb-0.5 text-[11px] uppercase tracking-wide text-slate-400">Stock</p>
                  <p className="text-sm font-medium text-slate-700">
                    {stockNum}
                  </p>
                </TableCell>
                <TableCell className="px-6 py-4 text-right align-middle">
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
                        <VariantEditFormComponent productId={productId} variant={variant} attributes={attributes} onSuccess={() => setActiveEditVariantId(null)} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-rose-600"
                      onClick={() => onDeleteVariant(variant.id, variant.sku || "-")}
                      data-testid={`button-delete-variant-${variant.id}`}
                      aria-label="Delete variant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

