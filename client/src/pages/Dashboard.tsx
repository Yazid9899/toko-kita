
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from "@/hooks/use-orders";
import { useProcurements } from "@/hooks/use-procurements";
import { useProducts } from "@/hooks/use-products";
import { formatPrice, formatVariantLabel, getVariantPrice } from "@/lib/variant-utils";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  Download,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState, type ComponentType } from "react";
import { Link, useLocation } from "wouter";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LOW_STOCK_THRESHOLD = 3;
const CHART_COLORS = {
  revenue: "#10B981",
  capital: "#5C6AC4",
  unpaid: "#F59E0B",
  paid: "#10B981",
  packing: "#3B82F6",
};

type TimeRange = 7 | 30 | 90;

type PurchaseLineItem = {
  id: number;
  purchaseNumber?: string | null;
  createdAt?: string | Date | null;
  status: string;
  neededQty: number | string;
  capitalCostCents?: number | null;
  capitalCurrency?: string | null;
  variant: {
    sku?: string | null;
    optionValues: { attributeId: number; optionValue: string }[];
  };
};

type PurchaseTransaction = {
  key: string;
  purchaseNo: string;
  createdAt: Date | null;
  totalQty: number;
  totalCapital: number;
  lineItems: PurchaseLineItem[];
};

function formatCurrency(value: number) {
  return `Rp ${Math.max(0, Math.round(value)).toLocaleString()}`;
}

function formatVariantOptionValues(variant: { optionValues: { attributeId: number; optionValue: string }[]; sku?: string | null }) {
  const values = [...variant.optionValues]
    .sort((a, b) => a.attributeId - b.attributeId)
    .map((selection) => selection.optionValue);

  if (values.length === 0) return variant.sku || "Default";
  return values.join(" - ");
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function bucketByDay<T>(
  items: T[],
  rangeDays: number,
  dateFn: (item: T) => Date,
  valueFn: (item: T) => number,
) {
  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setDate(start.getDate() - (rangeDays - 1));

  const bucketMap = new Map<string, number>();
  for (let i = 0; i < rangeDays; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    bucketMap.set(d.toISOString().slice(0, 10), 0);
  }

  for (const item of items) {
    const d = startOfDay(dateFn(item));
    if (d < start || d > today) continue;
    const key = d.toISOString().slice(0, 10);
    bucketMap.set(key, (bucketMap.get(key) ?? 0) + valueFn(item));
  }

  return Array.from(bucketMap.entries()).map(([date, value]) => ({ date, value }));
}

function bucketByWeek<T>(
  items: T[],
  rangeDays: number,
  dateFn: (item: T) => Date,
  valueFn: (item: T) => number,
) {
  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setDate(start.getDate() - (rangeDays - 1));

  const weekKey = (d: Date) => {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    return monday.toISOString().slice(0, 10);
  };

  const bucketMap = new Map<string, number>();
  for (const item of items) {
    const d = startOfDay(dateFn(item));
    if (d < start || d > today) continue;
    const key = weekKey(d);
    bucketMap.set(key, (bucketMap.get(key) ?? 0) + valueFn(item));
  }

  return Array.from(bucketMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
  accent = "default",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  loading: boolean;
  accent?: "default" | "success" | "warning";
}) {
  const accentClass =
    accent === "success"
      ? "bg-emerald-50 text-emerald-700"
      : accent === "warning"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <Card className="border border-slate-100 shadow-sm rounded-2xl">
      <CardContent className="p-1 ">
        <div className="mb-4 flex items-center gap-2">
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${accentClass}`}>
            <Icon className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        </div>
        {loading ? <Skeleton className="h-8 w-40" /> : <p className="text-2xl font-bold text-slate-900">{value}</p>}
        <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: procurements, isLoading: procurementsLoading } = useProcurements();
  const { data: products, isLoading: productsLoading } = useProducts();
  const [, setLocation] = useLocation();

  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [selectedPurchaseKey, setSelectedPurchaseKey] = useState<string | null>(null);

  const loading = ordersLoading || procurementsLoading || productsLoading;
  const allOrders = orders ?? [];
  const allProcurements = (procurements ?? []) as PurchaseLineItem[];
  const allVariants = (products ?? []).flatMap((product) =>
    product.variants.map((variant) => ({ productName: product.name, variant })),
  );

  const arrivedProcurements = allProcurements.filter((p) => p.status === "ARRIVED");

  const lowStockVariants = allVariants
    .map(({ productName, variant }) => ({
      productName,
      variant,
      stock: Number(variant.stockOnHand ?? 0),
      priceCents: Number(getVariantPrice(variant, "IDR")?.priceCents ?? 0),
    }))
    .filter((item) => item.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);

  const purchaseTransactions = useMemo(() => {
    const grouped = new Map<string, PurchaseTransaction>();

    for (const item of arrivedProcurements) {
      const purchaseNo = item.purchaseNumber?.trim() || `PUR-${item.id}`;
      const createdAt = item.createdAt ? new Date(item.createdAt) : null;

      if (!grouped.has(purchaseNo)) {
        grouped.set(purchaseNo, {
          key: purchaseNo,
          purchaseNo,
          createdAt,
          totalQty: 0,
          totalCapital: 0,
          lineItems: [],
        });
      }

      const tx = grouped.get(purchaseNo)!;
      tx.totalQty += Number(item.neededQty) || 0;
      tx.totalCapital += (Number(item.capitalCostCents ?? 0) || 0) * (Number(item.neededQty) || 0);
      tx.lineItems.push(item);

      if (!tx.createdAt && createdAt) tx.createdAt = createdAt;
    }

    return Array.from(grouped.values()).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }, [arrivedProcurements]);

  const selectedPurchase = purchaseTransactions.find((tx) => tx.key === selectedPurchaseKey) ?? null;

  const orderTotal = (order: (typeof allOrders)[number]) => {
    const itemsTotal = order.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * Number(item.quantity),
      0,
    );
    return Math.max(0, itemsTotal - Number(order.discount));
  };

  const totalRevenue = allOrders.reduce((sum, order) => sum + orderTotal(order), 0);
  const totalCapitalInvested = arrivedProcurements.reduce(
    (sum, item) => sum + (Number(item.capitalCostCents ?? 0) || 0) * (Number(item.neededQty) || 0),
    0,
  );
  const estimatedProfit = totalRevenue - totalCapitalInvested;

  const days = Number(timeRange);
  const currentRangeStart = startOfDay(new Date());
  currentRangeStart.setDate(currentRangeStart.getDate() - (days - 1));
  const previousRangeStart = new Date(currentRangeStart);
  previousRangeStart.setDate(previousRangeStart.getDate() - days);

  const currentRangeRevenue = allOrders
    .filter((o) => new Date(o.createdAt) >= currentRangeStart)
    .reduce((sum, o) => sum + orderTotal(o), 0);
  const previousRangeRevenue = allOrders
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d >= previousRangeStart && d < currentRangeStart;
    })
    .reduce((sum, o) => sum + orderTotal(o), 0);

  const currentRangeCapital = arrivedProcurements
    .filter((p) => new Date(p.createdAt ?? 0) >= currentRangeStart)
    .reduce((sum, item) => sum + (Number(item.capitalCostCents ?? 0) || 0) * (Number(item.neededQty) || 0), 0);
  const previousRangeCapital = arrivedProcurements
    .filter((p) => {
      const d = new Date(p.createdAt ?? 0);
      return d >= previousRangeStart && d < currentRangeStart;
    })
    .reduce((sum, item) => sum + (Number(item.capitalCostCents ?? 0) || 0) * (Number(item.neededQty) || 0), 0);

  const currentRangeProfit = currentRangeRevenue - currentRangeCapital;
  const previousRangeProfit = previousRangeRevenue - previousRangeCapital;

  const trendCaption = (current: number, previous: number) => {
    if (allOrders.length === 0 && allProcurements.length === 0) return "";
    if (previous === 0) return `vs previous ${days}d`;
    const delta = ((current - previous) / Math.abs(previous)) * 100;
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}% vs previous ${days}d`;
  };

  const dailyRevenue = bucketByDay(allOrders, days, (o) => new Date(o.createdAt), (o) => orderTotal(o));
  const dailyCapital = bucketByDay(
    arrivedProcurements,
    days,
    (p) => new Date(p.createdAt ?? 0),
    (p) => (Number(p.capitalCostCents ?? 0) || 0) * (Number(p.neededQty) || 0),
  );

  const dailyTrend = dailyRevenue.map((item, idx) => ({
    date: item.date,
    revenue: item.value,
    capital: dailyCapital[idx]?.value ?? 0,
  }));

  const dailyNonZeroPoints = dailyTrend.filter((d) => d.revenue > 0 || d.capital > 0).length;

  const weeklyRevenue = bucketByWeek(allOrders, days, (o) => new Date(o.createdAt), (o) => orderTotal(o));
  const weeklyCapital = bucketByWeek(
    arrivedProcurements,
    days,
    (p) => new Date(p.createdAt ?? 0),
    (p) => (Number(p.capitalCostCents ?? 0) || 0) * (Number(p.neededQty) || 0),
  );

  const weeklyMap = new Map<string, { date: string; revenue: number; capital: number }>();
  for (const r of weeklyRevenue) weeklyMap.set(r.date, { date: r.date, revenue: r.value, capital: 0 });
  for (const c of weeklyCapital) {
    const existing = weeklyMap.get(c.date);
    if (existing) existing.capital = c.value;
    else weeklyMap.set(c.date, { date: c.date, revenue: 0, capital: c.value });
  }

  const weeklyTrend = Array.from(weeklyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  const useWeeklyTrend = dailyNonZeroPoints < 4;
  const trendSeries = useWeeklyTrend ? weeklyTrend : dailyTrend;
  const hasTrendData = trendSeries.some((d) => d.revenue > 0 || d.capital > 0);

  const exportCsv = (filenamePrefix: string, headers: string[], rows: (string | number)[][]) => {
    const escapeCsv = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");
    const stamp = format(new Date(), "yyyy-MM-dd");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenamePrefix}-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ordersRange = allOrders.filter((o) => new Date(o.createdAt) >= currentRangeStart);
  const funnelData = [
    {
      key: "unpaid",
      name: "Unpaid",
      value: ordersRange.filter((o) => o.paymentStatus !== "PAID").length,
      color: CHART_COLORS.unpaid,
      href: "/orders?status=NOT_PAID",
    },
    {
      key: "paid",
      name: "Paid",
      value: ordersRange.filter((o) => o.paymentStatus === "PAID").length,
      color: CHART_COLORS.paid,
      href: "/orders",
    },
    {
      key: "packing",
      name: "Ready to Pack",
      value: ordersRange.filter((o) => o.packingStatus === "PACKING").length,
      color: CHART_COLORS.packing,
      href: "/orders?packingStatus=PACKING",
    },
  ];

  const actionRequiredLowStock = lowStockVariants.slice(0, 8);
  const recentPurchases = purchaseTransactions.slice(0, 5);
  const openProcurementItems = allProcurements.filter((p) => p.status === "TO_BUY");
  const totalPurchasedQty = arrivedProcurements.reduce((sum, item) => sum + Number(item.neededQty || 0), 0);
  const lastPurchaseDate = purchaseTransactions[0]?.createdAt ?? null;
  const unpaidOrdersOlder24h = allOrders
    .filter((order) => order.paymentStatus !== "PAID")
    .filter((order) => Date.now() - new Date(order.createdAt).getTime() >= 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 3);
  const oldestOpenProcurements = openProcurementItems
    .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
    .slice(0, 3);
  const hasActionItems =
    actionRequiredLowStock.length > 0 || unpaidOrdersOlder24h.length > 0 || oldestOpenProcurements.length > 0;
  const hasRangeData =
    allOrders.some((o) => new Date(o.createdAt) >= currentRangeStart) ||
    arrivedProcurements.some((p) => new Date(p.createdAt ?? 0) >= currentRangeStart);
  const pipelineCounts = {
    unpaid: allOrders.filter((o) => o.paymentStatus !== "PAID").length,
    paid: allOrders.filter((o) => o.paymentStatus === "PAID").length,
    readyToPack: allOrders.filter((o) => o.packingStatus === "PACKING").length,
    packed: allOrders.filter((o) => o.packingStatus === "PACKED").length,
  };
  const profitMarginPct = currentRangeRevenue > 0 ? (currentRangeProfit / currentRangeRevenue) * 100 : null;

  const activityFeed = [
    ...allOrders.map((order) => ({
      key: `order-${order.id}`,
      at: new Date(order.createdAt),
      title: `Order ${order.orderNumber} created`,
      detail: `${order.customer.name} - ${order.paymentStatus}`,
      type: "order" as const,
      href: "/orders",
    })),
    ...purchaseTransactions.map((tx) => ({
      key: `purchase-${tx.key}`,
      at: tx.createdAt ?? new Date(0),
      title: `Purchase ${tx.purchaseNo} recorded`,
      detail: `${tx.totalQty} qty - ${formatCurrency(tx.totalCapital)}`,
      type: "purchase" as const,
      href: "/purchases",
    })),
    ...allProcurements
      .filter((p) => p.status === "TO_BUY")
      .map((p) => ({
        key: `proc-${p.id}`,
        at: new Date(p.createdAt ?? 0),
        title: `Procurement pending for ${p.purchaseNumber || `ID ${p.id}`}`,
        detail: `${Number(p.neededQty)} qty - ${formatVariantOptionValues(p.variant)}`,
        type: "procurement" as const,
        href: "/purchases",
      })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10);

  return (
    <Layout>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Strategic business dashboard with trends and operational risk</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
          {[7, 30, 90].map((range) => (
            <Button
              key={range}
              type="button"
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range as TimeRange)}
              className="h-8"
              data-testid={`button-range-${range}`}
            >
              {range}d
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={trendCaption(currentRangeRevenue, previousRangeRevenue)}
          icon={TrendingUp}
          loading={loading}
          accent="success"
        />
        <SummaryCard
          title="Total Capital Invested"
          value={formatCurrency(totalCapitalInvested)}
          subtitle={trendCaption(currentRangeCapital, previousRangeCapital)}
          icon={CircleDollarSign}
          loading={loading}
          accent="default"
        />
        <SummaryCard
          title="Estimated Profit"
          value={formatCurrency(estimatedProfit)}
          subtitle={trendCaption(currentRangeProfit, previousRangeProfit)}
          icon={ShoppingCart}
          loading={loading}
          accent={estimatedProfit >= 0 ? "success" : "warning"}
        />
        <SummaryCard
          title="Inventory Health"
          value={actionRequiredLowStock.length === 0 ? "Healthy" : `${actionRequiredLowStock.length} low stock`}
          subtitle={`Threshold <= ${LOW_STOCK_THRESHOLD}`}
          icon={Boxes}
          loading={loading}
          accent={actionRequiredLowStock.length === 0 ? "success" : "warning"}
        />
      </div>

      {!hasRangeData ? (
        <p className="mb-6 text-sm text-slate-500">No data for selected range. Showing all-time KPIs only.</p>
      ) : null}

      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Operational Overview</h2>
      </div>
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <h3 className="text-base font-semibold text-slate-900">Order Pipeline</h3>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {[
              { label: "Unpaid Orders", value: pipelineCounts.unpaid, href: "/orders?status=NOT_PAID" },
              { label: "Paid Orders", value: pipelineCounts.paid, href: "/orders" },
              { label: "Ready to Pack", value: pipelineCounts.readyToPack, href: "/orders?packingStatus=PACKING" },
              { label: "Packed Orders", value: pipelineCounts.packed, href: "/orders?packingStatus=PACKED" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setLocation(item.href)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">{item.label}</span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  {item.value}
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card className="border border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <h3 className="text-base font-semibold text-slate-900">Inventory & Procurement</h3>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {[
              { label: "Items to Restock", value: actionRequiredLowStock.length, href: "/products" },
              { label: "Open Procurement Items", value: openProcurementItems.length, href: "/purchases" },
              { label: "Total Purchased Qty", value: totalPurchasedQty, href: "/purchases" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setLocation(item.href)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">{item.label}</span>
                <span className={`inline-flex items-center gap-2 text-sm font-semibold ${item.value > 0 ? "text-amber-700" : "text-slate-900"}`}>
                  {item.value}
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </span>
              </button>
            ))}
            <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
              <span className="text-sm text-slate-700">Last Purchase Date</span>
              <span className="text-sm font-semibold text-slate-900">
                {lastPurchaseDate ? format(lastPurchaseDate, "MMM d, yyyy") : "No purchases yet"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue vs Capital ({timeRange} days)</h2>
              <p className="text-sm text-slate-500">{useWeeklyTrend ? "Weekly buckets" : "Daily trend"}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                exportCsv(
                  "revenue-capital",
                  ["Date", "Revenue", "Capital"],
                  trendSeries.map((d) => [d.date, d.revenue, d.capital]),
                )
              }
              disabled={!hasTrendData}
              data-testid="button-export-trend-csv"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {!hasTrendData ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                No data for selected range.
              </div>
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), useWeeklyTrend ? "MMM d" : "MM/dd")} />
                    <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(Number(value)), ""]}
                      labelFormatter={(label) => format(new Date(label), "MMM d, yyyy")}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS.revenue} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="capital" name="Capital" stroke={CHART_COLORS.capital} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-bold text-slate-900">Financial Snapshot ({timeRange} days)</h2>
            <p className="text-sm text-slate-500">Revenue minus capital from purchases</p>
          </CardHeader>
          <CardContent className="grid gap-3 pt-0 md:grid-cols-2">
            {!hasRangeData ? (
              <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No data for selected range.
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(currentRangeRevenue)}</p>
                  <p className="text-xs text-slate-500">From orders</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Capital Added</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(currentRangeCapital)}</p>
                  <p className="text-xs text-slate-500">Capital from Purchases</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estimated Profit</p>
                  <p className={`mt-1 text-xl font-bold ${currentRangeProfit < 0 ? "text-amber-700" : "text-slate-900"}`}>
                    {formatCurrency(currentRangeProfit)}
                  </p>
                  <p className="text-xs text-slate-500">Revenue - Capital</p>
                </div>
                {profitMarginPct !== null ? (
                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Profit Margin</p>
                    <p className={`mt-1 text-xl font-bold ${profitMarginPct < 0 ? "text-amber-700" : "text-slate-900"}`}>
                      {profitMarginPct.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500">Profit / Revenue</p>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 border border-slate-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-bold text-slate-900">Action Required</h2>
          <p className="text-sm text-slate-500">Prioritized items that need your attention</p>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          {!hasActionItems ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-8 text-center text-sm text-emerald-700">
              All good
            </div>
          ) : (
            <>
              {actionRequiredLowStock.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Low Stock Items</p>
                  <div className="space-y-2">
                    {actionRequiredLowStock.slice(0, 5).map((item) => (
                      <div key={item.variant.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{formatVariantLabel(item.variant)}</p>
                          <p className="text-xs text-slate-500">{item.variant.sku || "-"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Stock {item.stock}</span>
                          <Link href="/purchases">
                            <Button variant="ghost" size="sm" className="h-8">Buy</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {unpaidOrdersOlder24h.length > 0 ? (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unpaid Orders (Older than 24h)</p>
                    <Link href="/orders?status=NOT_PAID"><Button variant="ghost" size="sm" className="h-7">View all</Button></Link>
                  </div>
                  <div className="space-y-2">
                    {unpaidOrdersOlder24h.map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">{order.orderNumber}</p>
                        <p className="text-xs text-slate-500">{format(new Date(order.createdAt), "MMM d, HH:mm")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {oldestOpenProcurements.length > 0 ? (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Open Procurement (Not Arrived)</p>
                    <Link href="/purchases"><Button variant="ghost" size="sm" className="h-7">View all</Button></Link>
                  </div>
                  <div className="space-y-2">
                    {oldestOpenProcurements.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">{formatVariantOptionValues(item.variant)}</p>
                        <p className="text-xs text-slate-500">{format(new Date(item.createdAt ?? 0), "MMM d, yyyy")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-bold text-slate-900">Orders Pipeline ({timeRange} days)</h2>
            <p className="text-sm text-slate-500">Status breakdown</p>
          </CardHeader>
          <CardContent className="pt-0">
            {!hasRangeData ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No data for selected range.
              </div>
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={funnelData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      onClick={(entry) => setLocation((entry as { href: string }).href)}
                    >
                      {funnelData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} style={{ cursor: "pointer" }} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border border-slate-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-bold text-slate-900">Recent Purchases</h2>
            <p className="text-sm text-slate-500">Last 5 purchase transactions</p>
          </CardHeader>
          <CardContent className="pt-0">
            {recentPurchases.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No purchases yet.
              </div>
            ) : (
              <div className="space-y-2">
                {recentPurchases.map((tx) => (
                  <button
                    key={tx.key}
                    type="button"
                    onClick={() => setSelectedPurchaseKey(tx.key)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                    data-testid={`recent-purchase-${tx.key}`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{tx.purchaseNo}</p>
                      <p className="text-xs text-slate-500">{tx.createdAt ? format(tx.createdAt, "MMM d, yyyy") : "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">Qty {tx.totalQty}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(tx.totalCapital)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          <p className="text-sm text-slate-500">Derived from latest orders and purchases</p>
        </CardHeader>
        <CardContent className="pt-0">
          {activityFeed.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No recent activity.
            </div>
          ) : (
            <div className="space-y-2">
              {activityFeed.map((activity) => (
                <Link key={activity.key} href={activity.href}>
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        {activity.type === "order" ? <ShoppingCart className="h-4 w-4" /> : activity.type === "purchase" ? <Package className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                        <p className="text-xs text-slate-500">{activity.detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{format(activity.at, "MMM d, HH:mm")}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selectedPurchase} onOpenChange={(open) => !open && setSelectedPurchaseKey(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
          {selectedPurchase ? (
            <div className="h-full flex flex-col">
              <SheetHeader className="p-6 border-b border-slate-100">
                <SheetTitle className="text-xl">{selectedPurchase.purchaseNo}</SheetTitle>
                <SheetDescription>
                  {selectedPurchase.createdAt ? format(selectedPurchase.createdAt, "MMM d, yyyy") : "-"}
                </SheetDescription>
              </SheetHeader>
              <div className="p-6 border-b border-slate-100 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Items</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{selectedPurchase.lineItems.length}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Qty</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{selectedPurchase.totalQty}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Capital</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(selectedPurchase.totalCapital)}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Item</TableHead>
                      <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Qty</TableHead>
                      <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Unit Capital</TableHead>
                      <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPurchase.lineItems.map((item) => {
                      const unit = Number(item.capitalCostCents ?? 0);
                      const qty = Number(item.neededQty ?? 0);
                      const subtotal = unit * qty;
                      return (
                        <TableRow key={item.id} className="hover:bg-slate-50/60">
                          <TableCell className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-800">{formatVariantOptionValues(item.variant)}</p>
                            <p className="text-xs text-slate-500">{item.variant.sku || "-"}</p>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right text-sm text-slate-700">{qty}</TableCell>
                          <TableCell className="px-4 py-3 text-right text-sm text-slate-700">{formatCurrency(unit)}</TableCell>
                          <TableCell className="px-4 py-3 text-right text-sm font-semibold text-slate-900">{formatCurrency(subtotal)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
