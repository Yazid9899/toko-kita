import { Layout } from "@/components/Layout";
import { useOrder, useUpdateOrder } from "@/hooks/use-orders";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Printer, Loader2, ArrowLeft, Package, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const id = Number(params?.id);
  const { data: order, isLoading } = useOrder(id);
  const { mutate: updateOrder } = useUpdateOrder();

  if (isLoading) return <Layout><div className="flex justify-center pt-20"><Loader2 className="animate-spin w-8 h-8" /></div></Layout>;
  if (!order) return <Layout><div>Order not found</div></Layout>;

  const totalAmount = order.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0) + Number(order.deliveryFee);

  const handleStatusUpdate = (field: 'paymentStatus' | 'packingStatus', value: string) => {
    updateOrder({ id, data: { [field]: value } });
  };

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/orders">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Order {order.orderNumber}
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.packingStatus} />
          </h1>
          <p className="text-muted-foreground text-sm">Created on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div>
                       <p className="font-medium">{item.variant.variantName}</p>
                       <p className="text-sm text-muted-foreground">{item.isPreorder && <span className="text-orange-500 font-bold mr-2">[Preorder]</span>} SKU: {item.variant.barcodeOrSku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold">{Number(item.quantity)} x Rp {Number(item.unitPrice).toLocaleString()}</p>
                       <p className="text-sm text-muted-foreground">Rp {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                 <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rp {(totalAmount - Number(order.deliveryFee)).toLocaleString()}</span></div>
                 <div className="flex justify-between text-sm"><span>Delivery</span><span>Rp {Number(order.deliveryFee).toLocaleString()}</span></div>
                 <div className="flex justify-between font-bold text-lg mt-4"><span>Total</span><span>Rp {totalAmount.toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>

          {order.procurements.length > 0 && (
             <Card>
               <CardHeader><CardTitle className="text-base text-orange-600">Procurement Items (To Buy)</CardTitle></CardHeader>
               <CardContent>
                 <div className="space-y-2">
                   {order.procurements.map(p => (
                     <div key={p.id} className="flex justify-between text-sm bg-orange-50 p-2 rounded border border-orange-100">
                       <span>{p.variant.variantName}</span>
                       <div className="flex gap-4">
                         <span className="font-bold">{Number(p.neededQty)} needed</span>
                         <StatusBadge status={p.status} type="procurement" />
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Customer</CardTitle></CardHeader>
            <CardContent>
              <div className="font-medium text-lg mb-1">{order.customer.name}</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{order.customer.phoneNumber}</p>
                <p>{order.customer.addressLine}</p>
                <p>{order.customer.kecamatan}, {order.customer.cityOrKabupaten}</p>
                <p>{order.customer.postCode}</p>
              </div>
              {order.notes && (
                <div className="mt-4 bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
                  <span className="font-bold block mb-1">Notes:</span>
                  {order.notes}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Workflow</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 font-medium"><CreditCard className="w-4 h-4" /> Payment</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={order.paymentStatus === 'NOT_PAID' ? "destructive" : "outline"} 
                    size="sm"
                    className="text-xs"
                    onClick={() => handleStatusUpdate('paymentStatus', 'NOT_PAID')}
                  >
                    Unpaid
                  </Button>
                  <Button 
                    variant={order.paymentStatus === 'PAID' ? "default" : "outline"} 
                    size="sm"
                    className="text-xs bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusUpdate('paymentStatus', 'PAID')}
                  >
                    Paid
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2 font-medium"><Package className="w-4 h-4" /> Packing</div>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                     variant={order.packingStatus === 'NOT_READY' ? "secondary" : "outline"}
                     size="sm" className="text-xs"
                     onClick={() => handleStatusUpdate('packingStatus', 'NOT_READY')}
                  >
                    Not Ready
                  </Button>
                  <Button 
                     variant={order.packingStatus === 'PACKING' ? "default" : "outline"}
                     size="sm" className="text-xs"
                     onClick={() => handleStatusUpdate('packingStatus', 'PACKING')}
                  >
                    Packing
                  </Button>
                  <Button 
                     variant={order.packingStatus === 'PACKED' ? "default" : "outline"}
                     size="sm" className="text-xs bg-blue-600 hover:bg-blue-700"
                     onClick={() => handleStatusUpdate('packingStatus', 'PACKED')}
                  >
                    Packed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
