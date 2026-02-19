import { Layout } from "@/components/Layout";
import {
  useBulkArriveProcurements,
  useCreateBulkProcurements,
  useProcurements,
} from "@/hooks/use-procurements";
import { useProducts } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Boxes, Check, ChevronDown, ChevronRight, Copy, Package, Plus, Search, ShoppingBag, Trash2, Wallet } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ProcurementLineItem = {
  id: number;
  purchaseNumber?: string | null;
  createdAt?: string | Date | null;
  status: string;
  neededQty: number | string;
  capitalCostCents?: number | null;
  capitalCurrency?: string | null;
  productVariantId: number;
  variant: {
    sku?: string | null;
    optionValues: { attributeId: number; optionValue: string }[];
  };
  order?: {
    orderNumber?: string | null;
    customer?: { name?: string | null } | null;
  } | null;
};

type PurchaseTransaction = {
  key: string;
  purchaseNo: string;
  createdAt: Date | null;
  reference: string;
  statusLabel: string;
  totalItems: number;
  totalQty: number;
  totalCapital: number;
  lineItems: ProcurementLineItem[];
};

type ManualPurchaseRow = {
  key: string;
  variantId: string;
  qty: string;
  unitCapital: string;
};

type AdditionalCostType =
  | "SHIPPING_FREIGHT"
  | "GAS_FUEL"
  | "PACKAGING"
  | "HANDLING_FEE"
  | "HOTEL"
  | "FLIGHT_TICKET"
  | "TAX"
  | "CUSTOMS_IMPORT_FEE"
  | "INSURANCE"
  | "OTHER";

type AdditionalCostRow = {
  key: string;
  type: AdditionalCostType | "";
  amount: string;
};

const ADDITIONAL_COST_TYPE_OPTIONS: { value: AdditionalCostType; label: string }[] = [
  { value: "SHIPPING_FREIGHT", label: "Shipping/Freight" },
  { value: "GAS_FUEL", label: "Gas/Fuel" },
  { value: "PACKAGING", label: "Packaging" },
  { value: "HANDLING_FEE", label: "Handling Fee" },
  { value: "HOTEL", label: "Hotel" },
  { value: "FLIGHT_TICKET", label: "Flight Ticket" },
  { value: "TAX", label: "Tax" },
  { value: "CUSTOMS_IMPORT_FEE", label: "Customs/Import Fee" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "OTHER", label: "Other" },
];

type DrawerSortKey = "item" | "qty" | "unitCapital" | "subtotal";
type SortDirection = "asc" | "desc" | null;

function formatVariantOptionValues(variant: { optionValues: { attributeId: number; optionValue: string }[]; sku?: string | null }) {
  const values = [...variant.optionValues]
    .sort((a, b) => a.attributeId - b.attributeId)
    .map((selection) => selection.optionValue);

  if (values.length === 0) {
    return variant.sku || "Default";
  }

  return values.join(" - ");
}

function formatCapital(value: number, currency = "IDR") {
  return `${currency} ${Math.max(0, Math.round(value)).toLocaleString()}`;
}

function getLineSubtotal(item: ProcurementLineItem) {
  const qty = Number(item.neededQty) || 0;
  const unitCapital = Number(item.capitalCostCents ?? 0) || 0;
  return qty * unitCapital;
}

function buildReference(item: ProcurementLineItem) {
  if (item.order?.orderNumber) return item.order.orderNumber;
  if (item.order?.customer?.name) return item.order.customer.name;
  return "";
}

function SortIndicator({ direction }: { direction: SortDirection }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] leading-none">
      <span className={direction === "asc" ? "text-slate-700" : "text-slate-300"}>▲</span>
      <span className={direction === "desc" ? "text-slate-700" : "text-slate-300"}>▼</span>
    </span>
  );
}

function PurchasesTableSkeleton() {
  return (
    <Table className="min-w-[920px]">
      <TableHeader className="bg-slate-50/80">
        <TableRow className="hover:bg-transparent">
          <TableHead className="px-4 py-3"><Skeleton className="h-3 w-32" /></TableHead>
          <TableHead className="px-4 py-3"><Skeleton className="h-3 w-12" /></TableHead>
          <TableHead className="px-4 py-3"><Skeleton className="h-3 w-24" /></TableHead>
          <TableHead className="px-4 py-3"><Skeleton className="h-3 w-14" /></TableHead>
          <TableHead className="px-4 py-3"><Skeleton className="h-3 w-10" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, idx) => (
          <TableRow key={idx} className="hover:bg-transparent">
            <TableCell className="px-4 py-4"><Skeleton className="h-10 w-44" /></TableCell>
            <TableCell className="px-4 py-4"><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell className="px-4 py-4"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="px-4 py-4"><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell className="px-4 py-4"><Skeleton className="h-5 w-16" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Purchases() {
  const { data: procurements, isLoading } = useProcurements();
  const { data: products } = useProducts();
  const { toast } = useToast();
  const { mutateAsync: bulkArrive, isPending: isBulkArriving } = useBulkArriveProcurements();
  const { mutateAsync: createBulkPurchases, isPending: isCreatingManualPurchase } = useCreateBulkProcurements();

  const [activeTab, setActiveTab] = useState<"PURCHASES" | "PROCUREMENT">("PURCHASES");
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<"PROCUREMENT" | "MANUAL">("PROCUREMENT");
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [manualSearch, setManualSearch] = useState("");
  const [purchaseNotes, setPurchaseNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});
  const [manualRows, setManualRows] = useState<ManualPurchaseRow[]>([
    { key: "row-1", variantId: "", qty: "", unitCapital: "" },
  ]);
  const [additionalCostRows, setAdditionalCostRows] = useState<AdditionalCostRow[]>([]);
  const [additionalCostsExpanded, setAdditionalCostsExpanded] = useState(false);
  const [pendingAdditionalCostFocusKey, setPendingAdditionalCostFocusKey] = useState<string | null>(null);
  const [selectedTransactionKey, setSelectedTransactionKey] = useState<string | null>(null);
  const [copiedPurchaseNo, setCopiedPurchaseNo] = useState<string | null>(null);
  const [drawerSortKey, setDrawerSortKey] = useState<DrawerSortKey | null>(null);
  const [drawerSortDirection, setDrawerSortDirection] = useState<SortDirection>(null);
  const additionalCostAmountRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const toBuyItems = useMemo(
    () => ((procurements ?? []) as ProcurementLineItem[]).filter((item) => item.status === "TO_BUY"),
    [procurements],
  );

  const purchasedItems = useMemo(
    () => ((procurements ?? []) as ProcurementLineItem[]).filter((item) => item.status !== "TO_BUY"),
    [procurements],
  );

  const variantOptions = useMemo(() => {
    return (products ?? []).flatMap((product) =>
      product.variants.map((variant) => ({
        id: variant.id,
        label: `${product.name} - ${formatVariantOptionValues(variant)} (${variant.sku || "-"})`,
      })),
    );
  }, [products]);

  const filteredVariantOptions = useMemo(() => {
    const keyword = manualSearch.trim().toLowerCase();
    if (!keyword) return variantOptions;
    return variantOptions.filter((option) => option.label.toLowerCase().includes(keyword));
  }, [manualSearch, variantOptions]);

  const purchaseTransactions = useMemo(() => {
    const grouped = new Map<string, PurchaseTransaction>();

    for (const item of purchasedItems) {
      const purchaseNo = item.purchaseNumber?.trim() || `PUR-${item.id}`;
      const key = purchaseNo;
      const createdAt = item.createdAt ? new Date(item.createdAt) : null;
      const reference = buildReference(item);

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          purchaseNo,
          createdAt,
          reference,
          statusLabel: "Purchased",
          totalItems: 0,
          totalQty: 0,
          totalCapital: 0,
          lineItems: [],
        });
      }

      const tx = grouped.get(key)!;
      tx.totalItems += 1;
      tx.totalQty += Number(item.neededQty) || 0;
      tx.totalCapital += getLineSubtotal(item);
      tx.lineItems.push(item);

      if (!tx.createdAt && createdAt) {
        tx.createdAt = createdAt;
      }
    }

    return Array.from(grouped.values()).sort((a: PurchaseTransaction, b: PurchaseTransaction) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
  }, [purchasedItems]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredPurchaseTransactions = useMemo(() => {
    if (!normalizedSearch) return purchaseTransactions;

    return purchaseTransactions.filter((tx) => {
      const transactionText = [tx.purchaseNo, tx.reference].join(" ").toLowerCase();
      if (transactionText.includes(normalizedSearch)) return true;

      return tx.lineItems.some((line: ProcurementLineItem) => {
        const lineText = [
          line.variant.sku,
          formatVariantOptionValues(line.variant),
          line.order?.orderNumber,
          line.order?.customer?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return lineText.includes(normalizedSearch);
      });
    });
  }, [normalizedSearch, purchaseTransactions]);

  const filteredProcurementItems = useMemo(() => {
    if (!normalizedSearch) return toBuyItems;

    return toBuyItems.filter((item) => {
      const text = [
        item.purchaseNumber,
        item.variant.sku,
        formatVariantOptionValues(item.variant),
        item.order?.orderNumber,
        item.order?.customer?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(normalizedSearch);
    });
  }, [normalizedSearch, toBuyItems]);

  const filteredToBuyItems = useMemo(() => {
    const keyword = purchaseSearch.trim().toLowerCase();
    if (!keyword) return toBuyItems;

    return toBuyItems.filter((item) => {
      const text = [
        item.purchaseNumber,
        item.variant.sku,
        formatVariantOptionValues(item.variant),
        item.order?.orderNumber,
        item.order?.customer?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(keyword);
    });
  }, [purchaseSearch, toBuyItems]);

  const selectedProcurementIds = useMemo(
    () => Object.entries(selectedIds).filter(([, checked]) => checked).map(([id]) => Number(id)),
    [selectedIds],
  );
  const selectedProcurementItems = useMemo(
    () => toBuyItems.filter((item) => selectedIds[item.id]),
    [selectedIds, toBuyItems],
  );

  const allFilteredSelected =
    filteredToBuyItems.length > 0 && filteredToBuyItems.every((item) => selectedIds[item.id]);

  const validManualRows = manualRows.filter((row) => {
    const qty = Number(row.qty);
    const unitCapital = Number(row.unitCapital);
    const variantId = Number(row.variantId);
    return variantId > 0 && qty > 0 && unitCapital > 0;
  });
  const isManualRowValid = (row: ManualPurchaseRow) => {
    const qty = Number(row.qty);
    const unitCapital = Number(row.unitCapital);
    const variantId = Number(row.variantId);
    return variantId > 0 && qty > 0 && unitCapital > 0;
  };
  const isManualRowTouched = (row: ManualPurchaseRow) =>
    row.variantId.trim().length > 0 || row.qty.trim().length > 0 || row.unitCapital.trim().length > 0;

  const isSubmittingPurchase = isBulkArriving || isCreatingManualPurchase;
  const canSubmitProcurement = selectedProcurementIds.length > 0;
  const canSubmitManual = validManualRows.length > 0 && validManualRows.length === manualRows.length;
  const itemsCapital = useMemo(() => {
    if (purchaseMode === "PROCUREMENT") {
      return selectedProcurementItems.reduce((sum, item) => sum + getLineSubtotal(item), 0);
    }
    return validManualRows.reduce((sum, row) => sum + Number(row.qty) * Number(row.unitCapital), 0);
  }, [purchaseMode, selectedProcurementItems, validManualRows]);

  const hasInvalidAdditionalCost = useMemo(
    () =>
      additionalCostRows.some((row) => {
        const amount = Number(row.amount);
        const hasType = !!row.type;
        if (!row.amount && !hasType) return false;
        if (Number.isNaN(amount) || amount < 0) return true;
        if (amount > 0 && !hasType) return true;
        return false;
      }),
    [additionalCostRows],
  );

  const normalizedAdditionalCosts = useMemo(
    () =>
      additionalCostRows
        .map((row) => ({
          type: row.type,
          amount: Number(row.amount || 0),
        }))
        .filter((row) => !!row.type && row.amount >= 0),
    [additionalCostRows],
  );

  const extraCapital = useMemo(
    () => normalizedAdditionalCosts.reduce((sum, row) => sum + row.amount, 0),
    [normalizedAdditionalCosts],
  );
  const grandTotalCapital = itemsCapital + extraCapital;

  const toBuyCount = toBuyItems.length;
  const inventoryItemsCount = products
    ? products.reduce((sum, product) => sum + product.variants.length, 0)
    : null;
  const totalPurchasedQty = purchaseTransactions.reduce((sum, tx) => sum + tx.totalQty, 0);
  const totalPurchasedCapital = purchaseTransactions.reduce((sum, tx) => sum + tx.totalCapital, 0);

  const singlePurchaseSummary = purchaseTransactions.length === 1 ? purchaseTransactions[0] : null;

  const selectedTransaction = useMemo(
    () => purchaseTransactions.find((tx) => tx.key === selectedTransactionKey) ?? null,
    [purchaseTransactions, selectedTransactionKey],
  );

  const sortedDrawerLineItems = useMemo(() => {
    if (!selectedTransaction) return [];
    if (!drawerSortKey || !drawerSortDirection) return selectedTransaction.lineItems;

    return selectedTransaction.lineItems
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const aItemName = `${formatVariantOptionValues(a.item.variant)} ${a.item.variant.sku ?? ""}`.trim();
        const bItemName = `${formatVariantOptionValues(b.item.variant)} ${b.item.variant.sku ?? ""}`.trim();
        const aQty = Number(a.item.neededQty) || 0;
        const bQty = Number(b.item.neededQty) || 0;
        const aUnit = Number(a.item.capitalCostCents ?? 0);
        const bUnit = Number(b.item.capitalCostCents ?? 0);
        const aSubtotal = getLineSubtotal(a.item);
        const bSubtotal = getLineSubtotal(b.item);

        let result = 0;
        if (drawerSortKey === "item") result = aItemName.localeCompare(bItemName, undefined, { sensitivity: "base" });
        if (drawerSortKey === "qty") result = aQty - bQty;
        if (drawerSortKey === "unitCapital") result = aUnit - bUnit;
        if (drawerSortKey === "subtotal") result = aSubtotal - bSubtotal;

        if (result === 0) return a.index - b.index;
        return drawerSortDirection === "asc" ? result : -result;
      })
      .map((entry) => entry.item);
  }, [drawerSortDirection, drawerSortKey, selectedTransaction]);

  const toggleAllFiltered = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      for (const item of filteredToBuyItems) {
        next[item.id] = checked;
      }
      return next;
    });
  };

  const addManualRow = () => {
    setManualRows((prev) => [...prev, { key: `row-${Date.now()}-${prev.length}`, variantId: "", qty: "", unitCapital: "" }]);
  };

  const updateManualRow = (key: string, patch: Partial<ManualPurchaseRow>) => {
    setManualRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeManualRow = (key: string) => {
    setManualRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.key !== key)));
  };

  const addAdditionalCostRow = () => {
    const key = `cost-${Date.now()}-${additionalCostRows.length}`;
    setAdditionalCostsExpanded(true);
    setAdditionalCostRows((prev) => [...prev, { key, type: "SHIPPING_FREIGHT", amount: "" }]);
    setPendingAdditionalCostFocusKey(key);
  };

  const updateAdditionalCostRow = (key: string, patch: Partial<AdditionalCostRow>) => {
    setAdditionalCostRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeAdditionalCostRow = (key: string) => {
    setAdditionalCostRows((prev) => prev.filter((row) => row.key !== key));
  };

  useEffect(() => {
    if (!pendingAdditionalCostFocusKey) return;
    const input = additionalCostAmountRefs.current[pendingAdditionalCostFocusKey];
    if (input) {
      input.focus();
      input.select();
      setPendingAdditionalCostFocusKey(null);
    }
  }, [additionalCostRows, pendingAdditionalCostFocusKey]);

  const resetPurchaseDialog = () => {
    setPurchaseMode("PROCUREMENT");
    setPurchaseSearch("");
    setManualSearch("");
    setPurchaseNotes("");
    setSelectedIds({});
    setManualRows([{ key: "row-1", variantId: "", qty: "", unitCapital: "" }]);
    setAdditionalCostRows([]);
    setAdditionalCostsExpanded(false);
    setPendingAdditionalCostFocusKey(null);
  };

  const handlePurchaseSubmit = async () => {
    if (hasInvalidAdditionalCost) return;
    const notes = purchaseNotes.trim() || undefined;
    const payloadMeta = {
      additionalCosts: normalizedAdditionalCosts
        .filter((row) => row.type)
        .map((row) => ({ type: row.type as AdditionalCostType, amount: row.amount })),
      extraCapital,
      grandTotalCapital,
    };

    try {
      if (purchaseMode === "PROCUREMENT") {
        if (!canSubmitProcurement) return;
        // TODO: Persist additional costs for procurement purchases after backend supports these fields.
        await bulkArrive({ ids: selectedProcurementIds, notes, ...payloadMeta });
        toast({ title: "Purchase recorded" });
        toast({ title: "Procurement marked as arrived" });
      } else {
        if (!canSubmitManual) return;

        const purchaseNumber = `PUR-${Date.now()}`;
        const payload = validManualRows.map((row) => ({
          purchaseNumber,
          productVariantId: Number(row.variantId),
          neededQty: Number(row.qty),
          capitalCostCents: Number(row.unitCapital),
          capitalCurrency: "IDR",
          status: "ARRIVED" as const,
          notes,
          ...payloadMeta,
        }));

        await createBulkPurchases(payload);
        toast({ title: "Purchase recorded" });
      }

      setPurchaseOpen(false);
      resetPurchaseDialog();
    } catch (error) {
      if (purchaseMode === "PROCUREMENT") {
        toast({
          title: "Purchase saved but procurement status update failed",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to record purchase",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    }
  };

  const cycleDrawerSort = (nextKey: DrawerSortKey) => {
    if (drawerSortKey !== nextKey) {
      setDrawerSortKey(nextKey);
      setDrawerSortDirection("asc");
      return;
    }
    if (drawerSortDirection === "asc") {
      setDrawerSortDirection("desc");
      return;
    }
    if (drawerSortDirection === "desc") {
      setDrawerSortKey(null);
      setDrawerSortDirection(null);
      return;
    }
    setDrawerSortDirection("asc");
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Purchases</h1>
          <p className="page-subtitle">Bought transactions and procurement items</p>
        </div>

        <Dialog
          open={purchaseOpen}
          onOpenChange={(open) => {
            setPurchaseOpen(open);
            if (!open) resetPurchaseDialog();
          }}
        >
          <DialogTrigger asChild>
            <Button data-testid="button-purchase-items">Purchase Items</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[960px] max-h-[100vh] overflow-hidden p-0">
            <div className="flex h-[min(100vh,820px)] flex-col">
              <div className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
                <DialogHeader>
                  <DialogTitle>Purchase Items</DialogTitle>
                  <DialogDescription>Record purchases from procurement items or create a manual purchase.</DialogDescription>
                </DialogHeader>
                <div className="mt-3 space-y-3">
                  <Tabs
                    defaultValue="PROCUREMENT"
                    value={purchaseMode}
                    onValueChange={(value) => setPurchaseMode(value as "PROCUREMENT" | "MANUAL")}
                  >
                    <TabsList className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100/80 p-1 text-slate-500">
                      <TabsTrigger value="PROCUREMENT" className="rounded-lg px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#00848E]">
                        From Procurement
                      </TabsTrigger>
                      <TabsTrigger value="MANUAL" className="rounded-lg px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#5C6AC4]">
                        Manual
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={purchaseMode === "PROCUREMENT" ? purchaseSearch : manualSearch}
                      onChange={(event) =>
                        purchaseMode === "PROCUREMENT"
                          ? setPurchaseSearch(event.target.value)
                          : setManualSearch(event.target.value)
                      }
                      placeholder={purchaseMode === "PROCUREMENT" ? "Search purchase number, SKU, variant, order, or customer" : "Search product or SKU"}
                      className="pl-9"
                      data-testid="input-purchase-search"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">

              {purchaseMode === "PROCUREMENT" ? (
                <div className="space-y-3">
                  {toBuyItems.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                      <p className="text-sm font-medium text-slate-700">No procurement items to buy.</p>
                      <p className="mt-1 text-xs text-slate-500">Use Manual mode to record a direct inventory purchase.</p>
                    </div>
                  ) : (
                    <>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          <div className="col-span-1">
                            <Checkbox
                              checked={allFilteredSelected}
                              onCheckedChange={(value) => toggleAllFiltered(Boolean(value))}
                            />
                          </div>
                          <div className="col-span-5">Item</div>
                          <div className="col-span-2 text-center">Qty</div>
                          <div className="col-span-4">Reference</div>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {filteredToBuyItems.length === 0 ? (
                            <div className="px-4 py-10 text-center text-sm text-slate-500">No to-buy items found.</div>
                          ) : (
                            filteredToBuyItems.map((item) => (
                              <div key={item.id} className="grid grid-cols-12 gap-3 px-4 py-2 items-center">
                                <div className="col-span-1">
                                  <Checkbox
                                    checked={!!selectedIds[item.id]}
                                    onCheckedChange={(value) =>
                                      setSelectedIds((prev) => ({ ...prev, [item.id]: Boolean(value) }))
                                    }
                                  />
                                </div>
                                <div className="col-span-5">
                                  <p className="text-sm font-medium text-slate-800">{formatVariantOptionValues(item.variant)}</p>
                                  <p className="text-xs text-slate-500">{item.variant.sku}</p>
                                </div>
                                <div className="col-span-2 text-center text-sm font-semibold text-[#00848E]">
                                  {Number(item.neededQty)}
                                </div>
                                <div className="col-span-4">
                                  <p className="text-sm font-medium text-slate-700">{item.order?.orderNumber ?? ""}</p>
                                  <p className="text-xs text-slate-500">{item.order?.customer?.name ?? ""}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {selectedProcurementIds.length > 0 ? (
                        <p className="text-xs text-slate-500" data-testid="text-arrive-impact">
                          This purchase will mark {selectedProcurementIds.length} procurement item{selectedProcurementIds.length === 1 ? "" : "s"} as arrived.
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
                      <p className="col-span-1 text-xs font-semibold uppercase tracking-wider text-slate-500">#</p>
                      <p className="col-span-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Variant</p>
                      <p className="col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Qty</p>
                      <p className="col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Unit Capital</p>
                      <div className="col-span-1 flex justify-end">
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={addManualRow}>
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {manualRows.map((row, index) => {
                        const rowInvalid = isManualRowTouched(row) && !isManualRowValid(row);
                        return (
                          <div
                            key={row.key}
                            className={`grid grid-cols-12 items-center gap-2 px-3 py-2 ${rowInvalid ? "bg-amber-50/60" : "bg-white"}`}
                          >
                            <p className="col-span-1 text-xs font-medium text-slate-500">{index + 1}</p>
                            <div className="col-span-6">
                              <Select value={row.variantId} onValueChange={(value) => updateManualRow(row.key, { variantId: value })}>
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select variant" />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredVariantOptions.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min={1}
                                value={row.qty}
                                onChange={(event) => updateManualRow(row.key, { qty: event.target.value })}
                                className="h-8"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min={1}
                                value={row.unitCapital}
                                onChange={(event) => updateManualRow(row.key, { unitCapital: event.target.value })}
                                className="h-8"
                              />
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-rose-600"
                                onClick={() => removeManualRow(row.key)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {manualRows.length > 0 && !canSubmitManual ? (
                    <p className="text-xs text-amber-700">Each manual row requires variant, qty &gt; 0, and unit capital &gt; 0.</p>
                  ) : null}
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
                    onClick={() => setAdditionalCostsExpanded((prev) => !prev)}
                  >
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${additionalCostsExpanded ? "rotate-180" : ""}`}
                    />
                    Additional costs (optional)
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{formatCapital(extraCapital)}</span>
                    <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={addAdditionalCostRow}>
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                </div>

                {additionalCostsExpanded ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="grid grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50/70 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <p className="col-span-6">Cost Type</p>
                      <p className="col-span-5">Amount</p>
                      <p className="col-span-1 text-right">Delete</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {additionalCostRows.length === 0 ? (
                        <p className="px-3 py-3 text-xs text-slate-500">No additional costs added yet.</p>
                      ) : (
                        additionalCostRows.map((row) => {
                          const rowAmount = Number(row.amount || 0);
                          const rowInvalid = Number.isNaN(rowAmount) || rowAmount < 0 || (rowAmount > 0 && !row.type);
                          return (
                            <div key={row.key} className={`grid grid-cols-12 gap-2 items-center px-2 py-1.5 ${rowInvalid ? "bg-amber-50/60" : "bg-white"}`}>
                              <div className="col-span-6">
                                <Select
                                  value={row.type || "__empty"}
                                  onValueChange={(value) =>
                                    updateAdditionalCostRow(row.key, {
                                      type: value === "__empty" ? "" : (value as AdditionalCostType),
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select cost type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__empty">No type</SelectItem>
                                    {ADDITIONAL_COST_TYPE_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-5">
                                <div className="relative">
                                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                    IDR
                                  </span>
                                  <Input
                                    ref={(node) => {
                                      additionalCostAmountRefs.current[row.key] = node;
                                    }}
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={row.amount}
                                    onChange={(event) => updateAdditionalCostRow(row.key, { amount: event.target.value })}
                                    className="h-8 pl-12"
                                  />
                                </div>
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-rose-600"
                                  onClick={() => removeAdditionalCostRow(row.key)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</p>
                <Textarea
                  value={purchaseNotes}
                  onChange={(event) => setPurchaseNotes(event.target.value)}
                  placeholder="Add notes for this purchase"
                  rows={2}
                  className="min-h-[64px] resize-y"
                  data-testid="input-purchase-notes"
                />
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full text-sm sm:max-w-[260px] sm:order-2 sm:text-right">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-500 sm:justify-end sm:gap-4">
                    <span>Items capital</span>
                    <span>{formatCapital(itemsCapital)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 sm:justify-end sm:gap-4">
                    <span>Additional costs</span>
                    <span>{formatCapital(extraCapital)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-slate-900 sm:justify-end sm:gap-4">
                    <span>Grand total capital</span>
                    <span>{formatCapital(grandTotalCapital)}</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-end gap-2 sm:order-3 sm:w-auto">
                <Button variant="outline" onClick={() => setPurchaseOpen(false)} disabled={isSubmittingPurchase}>
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchaseSubmit}
                  disabled={
                    isSubmittingPurchase ||
                    hasInvalidAdditionalCost ||
                    (purchaseMode === "PROCUREMENT" ? !canSubmitProcurement : !canSubmitManual)
                  }
                  data-testid="button-confirm-purchase-items"
                >
                  {isSubmittingPurchase ? <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" /> : null}
                  {purchaseMode === "PROCUREMENT"
                    ? `Purchase Selected (${selectedProcurementIds.length})`
                    : `Record Manual Purchase (${validManualRows.length})`}
                </Button>
              </div>
            </DialogFooter>
            </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-slate-100 shadow-sm rounded-2xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inventory Items</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{inventoryItemsCount ?? "-"}</p>
            </div>
            <Boxes className="h-5 w-5 text-slate-400" />
          </div>
        </Card>
        <Card className="border border-slate-100 shadow-sm rounded-2xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">To Buy</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{toBuyCount}</p>
            </div>
            <ShoppingBag className="h-5 w-5 text-slate-400" />
          </div>
        </Card>
        <Card className="border border-slate-100 shadow-sm rounded-2xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Purchased Qty</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{totalPurchasedQty}</p>
            </div>
            <Package className="h-5 w-5 text-slate-400" />
          </div>
        </Card>
        <Card className="border border-slate-100 shadow-sm rounded-2xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Capital</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCapital(totalPurchasedCapital)}</p>
            </div>
            <Wallet className="h-5 w-5 text-slate-400" />
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="PURCHASES" onValueChange={(value) => setActiveTab(value as "PURCHASES" | "PROCUREMENT")}>
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-100/80 p-1.5 text-slate-500">
            <TabsTrigger
              value="PURCHASES"
              className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-[#5C6AC4] data-[state=active]:shadow-sm"
              data-testid="tab-purchases"
            >
              Purchases
            </TabsTrigger>
            <TabsTrigger
              value="PROCUREMENT"
              className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-[#00848E] data-[state=active]:shadow-sm"
              data-testid="tab-procurement"
            >
              Procurement
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={activeTab === "PURCHASES" ? "Search purchase no, reference, item name, SKU..." : "Search to-buy item, order, customer..."}
            className="h-10 pl-9"
            data-testid="input-search-purchases"
          />
        </div>
      </div>
      {activeTab === "PURCHASES" ? (
        <p className="mb-3 text-xs text-slate-500" data-testid="text-showing-purchases-count">
          Showing {filteredPurchaseTransactions.length} purchase{filteredPurchaseTransactions.length === 1 ? "" : "s"}
        </p>
      ) : null}

      {activeTab === "PURCHASES" && singlePurchaseSummary ? (
        <p className="mb-3 text-xs text-slate-500" data-testid="text-single-purchase-summary">
          1 purchase recorded - {singlePurchaseSummary.totalItems} items - {formatCapital(singlePurchaseSummary.totalCapital)} total capital
        </p>
      ) : null}

      <Card className="overflow-hidden border border-slate-100 shadow-sm rounded-2xl">
        {isLoading ? (
          <PurchasesTableSkeleton />
        ) : activeTab === "PURCHASES" ? (
          filteredPurchaseTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500">No purchase transactions found</p>
            </div>
          ) : (
            <Table className="min-w-[980px]">
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Purchase</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Qty</TableHead>
                  <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total Capital</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
                  <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchaseTransactions.map((tx) => (
                  <TableRow
                    key={tx.key}
                    className="cursor-pointer border-slate-100 transition-colors hover:bg-slate-50/70 hover:border-slate-200"
                    data-testid={`purchase-transaction-row-${tx.key}`}
                    onClick={() => setSelectedTransactionKey(tx.key)}
                  >
                    <TableCell className="px-4 py-3 align-middle">
                      <p className="text-sm font-semibold text-slate-900">{tx.purchaseNo}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[
                          tx.createdAt ? format(tx.createdAt, "MMM d, yyyy") : null,
                          tx.reference || null,
                          `${tx.totalItems} item${tx.totalItems === 1 ? "" : "s"}`,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      <span className="text-sm text-slate-500">{tx.totalQty}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right align-middle">
                      <p className="text-base font-bold text-slate-900">{formatCapital(tx.totalCapital, tx.lineItems[0]?.capitalCurrency ?? "IDR")}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        {tx.statusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right align-middle">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        View
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        ) : filteredProcurementItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500">No procurement items found</p>
          </div>
        ) : (
          <Table className="min-w-[940px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Purchase No</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Reference</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Item Summary</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Qty</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcurementItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-slate-50/60"
                  data-testid={`procurement-row-${item.id}`}
                >
                  <TableCell className="px-4 py-2 align-middle">
                    <p className="text-sm font-medium text-slate-800">{item.purchaseNumber ?? ""}</p>
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle text-sm text-slate-600">
                    {item.createdAt ? format(new Date(item.createdAt), "MMM d, yyyy") : ""}
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle">
                    <p className="text-sm font-medium text-slate-800">{item.order?.orderNumber ?? ""}</p>
                    <p className="text-xs text-slate-500">{item.order?.customer?.name ?? ""}</p>
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle">
                    <p className="text-sm font-medium text-slate-800">{formatVariantOptionValues(item.variant)}</p>
                    <p className="text-xs text-slate-500">{item.variant.sku}</p>
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle text-sm font-semibold text-[#00848E]">
                    {Number(item.neededQty)}
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle">
                    <span className="inline-flex items-center rounded-full bg-[#00848E]/10 px-2 py-0.5 text-[11px] font-semibold text-[#00848E]">
                      To Buy
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Sheet open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransactionKey(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
          {selectedTransaction ? (
            <div className="h-full flex flex-col">
              <SheetHeader className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-xl">{selectedTransaction.purchaseNo}</SheetTitle>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    {selectedTransaction.statusLabel}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-8 w-8 text-slate-500 hover:text-slate-700"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTransaction.purchaseNo);
                      setCopiedPurchaseNo(selectedTransaction.purchaseNo);
                      setTimeout(() => {
                        setCopiedPurchaseNo((prev) => (prev === selectedTransaction.purchaseNo ? null : prev));
                      }, 1200);
                    }}
                    data-testid="button-copy-purchase-number"
                  >
                    {copiedPurchaseNo === selectedTransaction.purchaseNo ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <SheetDescription>
                  {[selectedTransaction.createdAt ? format(selectedTransaction.createdAt, "MMM d, yyyy") : null, selectedTransaction.reference || null]
                    .filter(Boolean)
                    .join(" • ")}
                </SheetDescription>
              </SheetHeader>

              <div className="p-6 border-b border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Items</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{selectedTransaction.totalItems}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Qty</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{selectedTransaction.totalQty}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Capital</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{formatCapital(selectedTransaction.totalCapital, selectedTransaction.lineItems[0]?.capitalCurrency ?? "IDR")}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/85">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-slate-100/70"
                          onClick={() => cycleDrawerSort("item")}
                        >
                          <span>Item Summary</span>
                          <SortIndicator direction={drawerSortKey === "item" ? drawerSortDirection : null} />
                        </button>
                      </TableHead>
                      <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <button
                          type="button"
                          className="ml-auto inline-flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-slate-100/70"
                          onClick={() => cycleDrawerSort("qty")}
                        >
                          <span>Qty</span>
                          <SortIndicator direction={drawerSortKey === "qty" ? drawerSortDirection : null} />
                        </button>
                      </TableHead>
                      <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <button
                          type="button"
                          className="ml-auto inline-flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-slate-100/70"
                          onClick={() => cycleDrawerSort("unitCapital")}
                        >
                          <span>Unit Capital</span>
                          <SortIndicator direction={drawerSortKey === "unitCapital" ? drawerSortDirection : null} />
                        </button>
                      </TableHead>
                      <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <button
                          type="button"
                          className="ml-auto inline-flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-slate-100/70"
                          onClick={() => cycleDrawerSort("subtotal")}
                        >
                          <span>Subtotal</span>
                          <SortIndicator direction={drawerSortKey === "subtotal" ? drawerSortDirection : null} />
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDrawerLineItems.map((item: ProcurementLineItem) => {
                      const unitCapital = Number(item.capitalCostCents ?? 0);
                      const subtotal = getLineSubtotal(item);

                      return (
                        <TableRow key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <TableCell className="px-4 py-3 align-middle">
                            <p className="text-sm font-medium text-slate-800">{formatVariantOptionValues(item.variant)}</p>
                            <p className="text-xs text-slate-500">{item.variant.sku ?? "-"}</p>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right align-middle text-sm text-slate-700">{Number(item.neededQty)}</TableCell>
                          <TableCell className="px-4 py-3 text-right align-middle text-sm text-slate-700">
                            {unitCapital > 0 ? formatCapital(unitCapital, item.capitalCurrency ?? "IDR") : "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 align-middle text-right text-sm font-semibold text-slate-900">
                            {subtotal > 0 ? formatCapital(subtotal, item.capitalCurrency ?? "IDR") : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableCell className="px-4 py-3 text-sm font-semibold text-slate-700">Grand Total</TableCell>
                      <TableCell className="px-4 py-3" />
                      <TableCell className="px-4 py-3" />
                      <TableCell className="px-4 py-3 text-right text-base font-bold text-slate-900">
                        {formatCapital(selectedTransaction.totalCapital, selectedTransaction.lineItems[0]?.capitalCurrency ?? "IDR")}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
