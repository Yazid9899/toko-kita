import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema, type Customer, type InsertCustomer } from "@shared/schema";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Pencil, Plus } from "lucide-react";

type CustomerFormProps = {
  onSuccess?: (customer: Customer) => void;
  defaultValues?: Customer;
  isEditing?: boolean;
  variant?: "default" | "order";
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  addressMode?: "input" | "textarea";
};

export function CustomerForm({
  onSuccess,
  defaultValues,
  isEditing,
  variant = "default",
  submitLabel,
  submitIcon,
  addressMode,
}: CustomerFormProps) {
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();
  const isPending = isCreating || isUpdating;

  const labelClassName = variant === "order" ? "text-slate-700 font-medium" : undefined;
  const smallLabelClassName = variant === "order" ? "text-slate-700 font-medium text-xs" : undefined;
  const selectTriggerClassName = variant === "order" ? "h-11 rounded-xl" : undefined;
  const resolvedAddressMode = addressMode ?? (variant === "order" ? "textarea" : "input");

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          phoneNumber: defaultValues.phoneNumber,
          addressLine: defaultValues.addressLine || "",
          kecamatan: defaultValues.kecamatan || "",
          cityOrKabupaten: defaultValues.cityOrKabupaten || "",
          postCode: defaultValues.postCode || "",
          customerType: defaultValues.customerType,
        }
      : {
          name: "",
          phoneNumber: "",
          addressLine: "",
          kecamatan: "",
          cityOrKabupaten: "",
          postCode: "",
          customerType: "PERSONAL",
        },
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
      updateCustomer(
        { id: defaultValues.id, data },
        {
          onSuccess: (updatedCustomer) => {
            onSuccess?.(updatedCustomer);
          },
        }
      );
      return;
    }

    createCustomer(data, {
      onSuccess: (newCustomer) => {
        form.reset();
        onSuccess?.(newCustomer);
      },
    });
  }

  const resolvedSubmitLabel =
    submitLabel ?? (isEditing ? "Save Changes" : "Create Customer");
  const resolvedSubmitIcon = isEditing ? (
    <Pencil className="w-4 h-4 mr-2" />
  ) : (
    submitIcon ?? <Plus className="w-4 h-4 mr-2" />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClassName}>Full Name</FormLabel>
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
                <FormLabel className={labelClassName}>Phone</FormLabel>
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
                <FormLabel className={labelClassName}>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      className={selectTriggerClassName}
                      data-testid="select-customer-type"
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PERSONAL" data-testid="select-option-personal">
                      Personal
                    </SelectItem>
                    <SelectItem value="RESELLER" data-testid="select-option-reseller">
                      Reseller
                    </SelectItem>
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
              <FormLabel className={labelClassName}>Address</FormLabel>
              <FormControl>
                {resolvedAddressMode === "textarea" ? (
                  <Textarea
                    placeholder="Paste full address here..."
                    {...field}
                    className="min-h-[96px] resize-y"
                    data-testid="input-customer-address"
                  />
                ) : (
                  <Input placeholder="Street address..." {...field} data-testid="input-customer-address" />
                )}
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
                <FormLabel className={smallLabelClassName}>Kecamatan</FormLabel>
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
                <FormLabel className={smallLabelClassName}>City</FormLabel>
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
                <FormLabel className={smallLabelClassName}>Post Code</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-customer-postcode" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-customer">
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" data-testid="loader-submit-customer" />
          ) : (
            resolvedSubmitIcon
          )}
          {resolvedSubmitLabel}
        </Button>
      </form>
    </Form>
  );
}
