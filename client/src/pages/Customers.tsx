import { Layout } from "@/components/Layout";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type InsertCustomer } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Search, Users, Phone, MapPin } from "lucide-react";

function CustomerForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateCustomer();
  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      addressLine: "",
      kecamatan: "",
      cityOrKabupaten: "",
      postCode: "",
      customerType: "PERSONAL"
    }
  });

  function onSubmit(data: InsertCustomer) {
    mutate(data, {
      onSuccess: () => {
        form.reset();
        onSuccess();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-customer-name" />
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
                <FormLabel className="text-slate-700 font-medium">Phone</FormLabel>
                <FormControl>
                  <Input placeholder="0812..." {...field} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-customer-phone" />
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
                <FormLabel className="text-slate-700 font-medium">Type</FormLabel>
                <FormControl>
                  <select 
                    {...field}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:bg-white focus:border-[#5C6AC4] focus:ring-2 focus:ring-[#5C6AC4]/20 transition-all"
                    data-testid="select-customer-type"
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="RESELLER">Reseller</option>
                  </select>
                </FormControl>
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
              <FormLabel className="text-slate-700 font-medium">Address</FormLabel>
              <FormControl>
                <Input placeholder="Street address..." {...field} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-customer-address" />
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
                <FormLabel className="text-slate-700 font-medium text-xs">Kecamatan</FormLabel>
                <FormControl>
                  <Input {...field} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-customer-kecamatan" />
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
                <FormLabel className="text-slate-700 font-medium text-xs">City</FormLabel>
                <FormControl>
                  <Input {...field} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-customer-city" />
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
                <FormLabel className="text-slate-700 font-medium text-xs">Post Code</FormLabel>
                <FormControl>
                  <Input {...field} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#5C6AC4]" data-testid="input-customer-postcode" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-[#5C6AC4] to-[#6B7AC8] hover:opacity-90 font-semibold shadow-[0_4px_15px_rgba(92,106,196,0.3)]" disabled={isPending} data-testid="button-submit-customer">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          Create Customer
        </Button>
      </form>
    </Form>
  );
}

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useCustomers(search);
  const [open, setOpen] = useState(false);

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your client base and contacts</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#5C6AC4] to-[#6B7AC8] font-semibold shadow-[0_4px_15px_rgba(92,106,196,0.3)]" data-testid="button-add-customer">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Customer</DialogTitle>
              <DialogDescription>Fill in the details below to add a new customer to your database.</DialogDescription>
            </DialogHeader>
            <CustomerForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search by name or phone..." 
          className="pl-11 h-12 max-w-md rounded-xl border-slate-200 bg-white shadow-sm focus:border-[#5C6AC4] focus:ring-2 focus:ring-[#5C6AC4]/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-customers"
        />
      </div>

      {/* Customer Cards Grid */}
      <div className="premium-card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#5C6AC4]" />
          </div>
        ) : customers?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-2">No customers found</p>
            <Button variant="link" className="text-[#5C6AC4]" onClick={() => setOpen(true)}>Add your first customer</Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">Customer</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Location</div>
            </div>
            {/* Customer Rows */}
            {customers?.map((customer) => (
              <div key={customer.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50/60 transition-colors items-center" data-testid={`customer-row-${customer.id}`}>
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#5C6AC4]/10 to-[#00848E]/10 flex items-center justify-center text-[#5C6AC4] font-bold text-sm shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{customer.name}</p>
                    <p className="text-sm text-slate-500 md:hidden">{customer.phoneNumber}</p>
                  </div>
                </div>
                <div className="md:col-span-3 hidden md:flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{customer.phoneNumber}</span>
                </div>
                <div className="md:col-span-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    customer.customerType === 'RESELLER' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {customer.customerType}
                  </span>
                </div>
                <div className="md:col-span-3 hidden md:flex items-center gap-2 text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm truncate">{customer.cityOrKabupaten}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
