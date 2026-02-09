import { Layout } from "@/components/Layout";
import { useCustomers, useDeleteCustomer } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useState } from "react";
import { type Customer } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search, Users, Phone, MapPin, Pencil, Trash2 } from "lucide-react";
import { CustomerForm } from "@/components/CustomerForm";

const formatCustomerAddress = (customer: Customer) => {
  const parts = [
    customer.addressLine,
    customer.kecamatan,
    customer.cityOrKabupaten,
    customer.postCode,
  ].filter((part) => part && part.trim().length > 0);
  return parts.length > 0 ? parts.join(", ") : "-";
};

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useCustomers(search);
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCustomer) {
      deleteCustomer(selectedCustomer.id, {
        onSuccess: () => {
          setDeleteOpen(false);
          setSelectedCustomer(null);
        }
      });
    }
  };

  const handleCopyAddress = async (customer: Customer) => {
    const address = formatCustomerAddress(customer);
    await navigator.clipboard.writeText(address);
    toast({ title: "Address copied", description: address });
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title" data-testid="text-page-title">Customers</h1>
          <p className="page-subtitle" data-testid="text-page-subtitle">Manage your client base and contacts</p>
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="default" data-testid="button-add-customer">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle data-testid="dialog-title-add-customer">Add New Customer</DialogTitle>
              <DialogDescription data-testid="dialog-desc-add-customer">Fill in the details below to add a new customer to your database.</DialogDescription>
            </DialogHeader>
            <CustomerForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" data-testid="icon-search" />
          <Input
            placeholder="Search by name or phone..."
            className="h-10 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-customers"
          />
        </div>
      </div>

      {/* Customers Table */}
      <Card className="overflow-hidden border border-slate-100 shadow-sm rounded-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#5C6AC4]" data-testid="loader-customers" />
          </div>
        ) : customers?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" data-testid="icon-no-customers" />
            </div>
            <p className="text-slate-500 mb-2" data-testid="text-no-customers">No customers found</p>
            <Button variant="ghost" onClick={() => setCreateOpen(true)} data-testid="button-add-first-customer">Add your first customer</Button>
          </div>
        ) : (
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent" data-testid="table-header-customers">
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" data-testid="header-customer">Customer</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" data-testid="header-contact">Contact</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" data-testid="header-type">Type</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500" data-testid="header-location">Address</TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500" data-testid="header-actions">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers?.map((customer, index) => (
                <TableRow key={customer.id} className="hover:bg-slate-50/60" data-testid={`customer-row-${customer.id}`}>
                  <TableCell className="px-4 py-2 align-middle">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 shrink-0 text-xs text-slate-500">
                        {index + 1}.
                      </span>
                      <p className="text-sm font-medium text-slate-800" data-testid={`text-customer-name-${customer.id}`}>{customer.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="h-3.5 w-3.5" />
                      <span data-testid={`text-customer-phone-${customer.id}`}>{customer.phoneNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500"
                      data-testid={`badge-customer-type-${customer.id}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          customer.customerType === "RESELLER" ? "bg-violet-500" : "bg-emerald-500"
                        }`}
                      />
                      {customer.customerType === "RESELLER" ? "Reseller" : "Personal"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle">
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(customer)}
                      className="inline-flex max-w-[280px] items-center gap-1.5 truncate text-left text-xs text-slate-500 transition-colors hover:text-slate-700"
                      title="Click to copy address"
                      data-testid={`button-copy-address-${customer.id}`}
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{customer.cityOrKabupaten || "-"}</span>
                    </button>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-slate-700"
                        onClick={() => handleEdit(customer)}
                        data-testid={`button-edit-customer-${customer.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-slate-700"
                        onClick={() => handleDeleteClick(customer)}
                        data-testid={`button-delete-customer-${customer.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-edit-customer">Edit Customer</DialogTitle>
            <DialogDescription data-testid="dialog-desc-edit-customer">Update customer information below.</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm 
              onSuccess={() => {
                setEditOpen(false);
                setSelectedCustomer(null);
              }} 
              defaultValues={selectedCustomer}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="dialog-title-delete-customer">Delete Customer</AlertDialogTitle>
            <AlertDialogDescription data-testid="dialog-desc-delete-customer">
              Are you sure you want to delete <span className="font-semibold" data-testid="text-delete-customer-name">{selectedCustomer?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              data-testid="button-confirm-delete"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" data-testid="loader-delete-customer" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

