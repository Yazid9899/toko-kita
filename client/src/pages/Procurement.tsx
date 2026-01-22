import { Layout } from "@/components/Layout";
import { useProcurements, useUpdateProcurement } from "@/hooks/use-procurements";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ShoppingBag, Truck } from "lucide-react";
import { format } from "date-fns";

export default function Procurement() {
  const { data: procurements, isLoading } = useProcurements();
  const { mutate: updateStatus } = useUpdateProcurement();

  const handleUpdate = (id: number, status: "ORDERED" | "ARRIVED") => {
    updateStatus({ id, status });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Procurement (To Buy)</h1>
        <p className="text-muted-foreground mt-1">Manage restocking for preorder items.</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Item / Variant</TableHead>
              <TableHead>Qty Needed</TableHead>
              <TableHead>For Order</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></TableCell></TableRow>
            ) : procurements?.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No items to buy.</TableCell></TableRow>
            ) : (
              procurements?.map((item) => (
                <TableRow key={item.id} className={item.status === 'ARRIVED' ? 'opacity-50 bg-muted/20' : ''}>
                  <TableCell className="font-medium">{item.variant.variantName}</TableCell>
                  <TableCell className="font-bold text-lg text-secondary">{Number(item.neededQty)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.order.orderNumber}</span>
                      <span className="text-xs text-muted-foreground">{item.order.customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={item.status} type="procurement" /></TableCell>
                  <TableCell className="text-right space-x-2">
                    {item.status === 'TO_BUY' && (
                      <Button size="sm" variant="outline" onClick={() => handleUpdate(item.id, 'ORDERED')}>
                        <ShoppingBag className="w-4 h-4 mr-2" /> Mark Ordered
                      </Button>
                    )}
                    {item.status === 'ORDERED' && (
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdate(item.id, 'ARRIVED')}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Arrived
                      </Button>
                    )}
                    {item.status === 'ARRIVED' && (
                      <span className="text-xs text-muted-foreground italic">Completed {format(new Date(item.updatedAt), 'MMM d')}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
