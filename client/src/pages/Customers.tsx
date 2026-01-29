import { Layout } from "@/components/Layout";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type InsertCustomer, type Customer } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search, Users, Phone, MapPin, Pencil, Trash2 } from "lucide-react";

const formatCustomerAddress = (customer: Customer) => {
  const parts = [
    customer.addressLine,
    customer.kecamatan,
    customer.cityOrKabupaten,
    customer.postCode,
  ].filter((part) => part && part.trim().length > 0);
  return parts.length > 0 ? parts.join(", ") : "-";
};

function CustomerForm({ onSuccess, defaultValues, isEditing }: { 
  onSuccess: () => void; 
  defaultValues?: Customer;
  isEditing?: boolean;
}) {
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();
  const isPending = isCreating || isUpdating;
  
  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: defaultValues ? {
      name: defaultValues.name,
      phoneNumber: defaultValues.phoneNumber,
      addressLine: defaultValues.addressLine || "",
      kecamatan: defaultValues.kecamatan || "",
      cityOrKabupaten: defaultValues.cityOrKabupaten || "",
      postCode: defaultValues.postCode || "",
      customerType: defaultValues.customerType,
    } : {
      name: "",
      phoneNumber: "",
      addressLine: "",
      kecamatan: "",
      cityOrKabupaten: "",
      postCode: "",
      customerType: "PERSONAL"
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name,
        phoneNumber: defaultValues.phoneNumber,
        addressLine: defaultValues.addressLine || "",
        kecamatan: defaultValues.kecamatan || "",
        cityOrKabupaten: defaultValues.cityOrKabupaten || "",
        postCode: defaultValues.postCode || "",
        customerType: defaultValues.customerType,
      });
    }
  }, [defaultValues, form]);

  function onSubmit(data: InsertCustomer) {
    if (isEditing && defaultValues) {
      updateCustomer({ id: defaultValues.id, data }, {
        onSuccess: () => {
          onSuccess();
        }
      });
    } else {
      createCustomer(data, {
        onSuccess: () => {
          form.reset();
          onSuccess();
        }
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} data-testid="input-customer-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="0812..." {...field} data-testid="input-customer-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-customer-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PERSONAL" data-testid="select-option-personal">Personal</SelectItem>
                    <SelectItem value="RESELLER" data-testid="select-option-reseller">Reseller</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="addressLine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Street address..." {...field} data-testid="input-customer-address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="kecamatan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kecamatan</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-kecamatan" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cityOrKabupaten"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-city" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Code</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-postcode" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-customer">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" data-testid="loader-submit-customer" /> : isEditing ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isEditing ? "Save Changes" : "Create Customer"}
        </Button>
      </form>
    </Form>
  );
}

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
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" data-testid="icon-search" />
        <Input 
          placeholder="Search by name or phone..." 
          className="pl-11 max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-customers"
        />
      </div>

      {/* Customer Cards Grid */}
      <div className="premium-card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-wrap items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-customers" />
          </div>
        ) : customers?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex flex-wrap items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" data-testid="icon-no-customers" />
            </div>
            <p className="text-muted-foreground mb-2" data-testid="text-no-customers">No customers found</p>
            <Button variant="ghost" onClick={() => setCreateOpen(true)} data-testid="button-add-first-customer">Add your first customer</Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted text-xs font-semibold text-muted-foreground uppercase tracking-wider" data-testid="table-header-customers">
              <div className="col-span-4" data-testid="header-customer">Customer</div>
              <div className="col-span-2" data-testid="header-contact">Contact</div>
              <div className="col-span-2" data-testid="header-type">Type</div>
              <div className="col-span-2" data-testid="header-location">Address</div>
              <div className="col-span-2 text-right" data-testid="header-actions">Actions</div>
            </div>
            {/* Customer Rows */}
            {customers?.map((customer) => (
              <div key={customer.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center" data-testid={`customer-row-${customer.id}`}>
                <div className="md:col-span-4 flex flex-wrap items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-muted flex flex-wrap items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground" data-testid={`text-customer-name-${customer.id}`}>{customer.name}</p>
                    <p className="text-sm text-muted-foreground md:hidden" data-testid={`text-customer-phone-mobile-${customer.id}`}>{customer.phoneNumber}</p>
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(customer)}
                      className="mt-1 md:hidden inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors truncate max-w-[240px]"
                      title="Click to copy address"
                      data-testid={`button-copy-address-mobile-${customer.id}`}
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{customer.cityOrKabupaten || "-"}</span>
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2 hidden md:flex flex-wrap items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm" data-testid={`text-customer-phone-${customer.id}`}>{customer.phoneNumber}</span>
                </div>
                <div className="md:col-span-2">
                  <Badge 
                    variant={customer.customerType === 'RESELLER' ? 'default' : 'secondary'} 
                    data-testid={`badge-customer-type-${customer.id}`}
                  >
                    {customer.customerType}
                  </Badge>
                </div>
                <div className="md:col-span-2 hidden md:flex flex-wrap items-center gap-2 text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(customer)}
                    className="inline-flex items-center gap-2 text-sm text-left hover:text-foreground transition-colors truncate max-w-[220px] lg:max-w-[260px]"
                    title="Click to copy address"
                    data-testid={`button-copy-address-${customer.id}`}
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{customer.cityOrKabupaten || "-"}</span>
                  </button>
                </div>
                <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(customer)}
                    data-testid={`button-edit-customer-${customer.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(customer)}
                    data-testid={`button-delete-customer-${customer.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
