import type { ProductVariantOption, ProductVariantWithRelations, VariantPrice } from "@shared/schema";

export function formatVariantLabel(
  variant: { optionValues: ProductVariantOption[]; sku?: string }
): string {
  const selections = [...variant.optionValues].sort(
    (a, b) => a.attributeId - b.attributeId
  );
  if (selections.length === 0) {
    return variant.sku || "Default";
  }
  return selections
    .map((selection) => `${selection.attributeName}: ${selection.optionValue}`)
    .join(" / ");
}

export function getVariantPrice(
  variant: ProductVariantWithRelations,
  currency = "IDR"
): VariantPrice | undefined {
  return variant.prices.find((price) => price.currency === currency);
}

export function formatPrice(value: number): string {
  return value.toLocaleString();
}
