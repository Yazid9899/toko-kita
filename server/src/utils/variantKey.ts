export type VariantSelection = {
  attributeId: string;
  optionId: string;
};

export const buildVariantKey = (selections: VariantSelection[]) => {
  const seen = new Map<string, string>();

  for (const selection of selections) {
    if (!selection.attributeId || !selection.optionId) {
      throw new Error("Invalid selection");
    }

    const existing = seen.get(selection.attributeId);
    if (existing && existing !== selection.optionId) {
      throw new Error("Duplicate attribute selection");
    }

    seen.set(selection.attributeId, selection.optionId);
  }

  return Array.from(seen.entries())
    .sort(([attrA, optA], [attrB, optB]) => {
      const attrCompare = attrA.localeCompare(attrB);
      if (attrCompare !== 0) return attrCompare;
      return optA.localeCompare(optB);
    })
    .map(([attributeId, optionId]) => `${attributeId}:${optionId}`)
    .join("|");
};
