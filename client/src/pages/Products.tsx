import { Layout } from "@/components/Layout";
import { useProducts, useBrands, useUpdateAttribute, useDeleteVariant } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Loader2, Plus, Package, ChevronDown, ChevronUp, Tag, Layers, Pencil, Sparkles, PenLine, MoreHorizontal, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
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
import { VariantFiltersCard, VariantsTable, type VariantFilterValue } from "@/pages/products/VariantsSection";
import {
  AttributeEditForm,
  AttributeForm,
  BrandEditForm,
  BrandForm,
  OptionEditForm,
  OptionForm,
  ProductEditForm,
  ProductForm,
  VariantEditForm,
  VariantForm,
} from "@/pages/products/ProductsForms";
export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { data: brands } = useBrands();
  const { mutate: updateAttribute } = useUpdateAttribute();
  const { mutate: deleteVariant, isPending: isDeletingVariant } = useDeleteVariant();
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [activeAttributeProductId, setActiveAttributeProductId] = useState<number | null>(null);
  const [activeOptionAttributeId, setActiveOptionAttributeId] = useState<number | null>(null);
  const [activeEditProductId, setActiveEditProductId] = useState<number | null>(null);
  const [activeEditBrandId, setActiveEditBrandId] = useState<number | null>(null);
  const [activeEditAttributeId, setActiveEditAttributeId] = useState<number | null>(null);
  const [activeEditOptionId, setActiveEditOptionId] = useState<number | null>(null);
  const [activeEditVariantId, setActiveEditVariantId] = useState<number | null>(null);
  const [expandedOptionRows, setExpandedOptionRows] = useState<Record<number, boolean>>({});
  const [variantFilters, setVariantFilters] = useState<Record<number, Record<number, VariantFilterValue>>>({});
  const [deleteAttributeTarget, setDeleteAttributeTarget] = useState<{
    productId: number;
    attributeId: number;
    name: string;
  } | null>(null);
  const [deleteVariantTarget, setDeleteVariantTarget] = useState<{
    id: number;
    sku: string;
  } | null>(null);
  const hasBrands = (brands?.length || 0) > 0;

  const toggleItem = (id: number) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteAttribute = (productId: number, attributeId: number) => {
    updateAttribute({ id: attributeId, productId, data: { isActive: false } });
  };

  const setVariantFilter = (productId: number, attributeId: number, value: VariantFilterValue) => {
    setVariantFilters((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [attributeId]: value,
      },
    }));
  };

  const toggleOptionRow = (attributeId: number) => {
    setExpandedOptionRows((prev) => ({
      ...prev,
      [attributeId]: !prev[attributeId],
    }));
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage products and stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
            <DialogTrigger asChild>
              <Button variant="default" data-testid="button-add-product">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Create New Product</DialogTitle>
                <DialogDescription>Add a new product to your inventory.</DialogDescription>
              </DialogHeader>
              {!hasBrands ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Create a brand before adding products.</p>
                  <Button className="w-full" onClick={() => { setAddProductOpen(false); setAddBrandOpen(true); }}>
                    Create Brand
                  </Button>
                </div>
              ) : (
                <ProductForm brands={brands || []} onSuccess={() => setAddProductOpen(false)} />
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={addBrandOpen} onOpenChange={setAddBrandOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="w-4 h-4 mr-2" /> Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Create Brand</DialogTitle>
                <DialogDescription>Add a brand to organize your products.</DialogDescription>
              </DialogHeader>
              <BrandForm onSuccess={() => setAddBrandOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AlertDialog open={!!deleteAttributeTarget} onOpenChange={(open) => !open && setDeleteAttributeTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attribute?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the attribute from the product. You can re-enable it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-attribute">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteAttributeTarget) return;
                handleDeleteAttribute(deleteAttributeTarget.productId, deleteAttributeTarget.attributeId);
                setDeleteAttributeTarget(null);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              data-testid="button-confirm-delete-attribute"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!deleteVariantTarget} onOpenChange={(open) => !open && setDeleteVariantTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove variant <span className="font-semibold">{deleteVariantTarget?.sku || "-"}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-variant">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteVariantTarget) return;
                deleteVariant(deleteVariantTarget.id, {
                  onSuccess: () => setDeleteVariantTarget(null),
                });
              }}
              disabled={isDeletingVariant}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              data-testid="button-confirm-delete-variant"
            >
              {isDeletingVariant ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Products Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#5C6AC4]" />
          </div>
        ) : products?.length === 0 ? (
          <Card className="rounded-2xl border border-slate-100 shadow-sm text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-2">No products yet</p>
            <Button variant="default" onClick={() => setAddProductOpen(true)}>Add your first product</Button>
          </Card>
        ) : (
          products?.map((product) => (
            <Card key={product.id} className="overflow-hidden border border-slate-100 shadow-sm rounded-2xl" data-testid={`product-card-${product.id}`}>
              <Collapsible open={openItems[product.id]} onOpenChange={() => toggleItem(product.id)}>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-800">{product.name}</h3>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Layers className="w-3.5 h-3.5" />
                          {product.variants.length} variants
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Tag className="w-3.5 h-3.5" />
                          {product.brand?.name || "No brand"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Tag className="w-3.5 h-3.5" />
                          {product.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Dialog open={activeAttributeProductId === product.id} onOpenChange={(open) => setActiveAttributeProductId(open ? product.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="default">
                          <Plus className="w-4 h-4 mr-2" /> Add Attribute
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[480px] rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">Add Attribute</DialogTitle>
                          <DialogDescription>Define attributes like Color or Size.</DialogDescription>
                        </DialogHeader>
                        <AttributeForm productId={product.id} nextSortOrder={product.attributes.length + 1} onSuccess={() => setActiveAttributeProductId(null)} />
                      </DialogContent>
                    </Dialog>
                    <Dialog open={activeProductId === product.id} onOpenChange={(open) => setActiveProductId(open ? product.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" data-testid={`button-add-variant-${product.id}`}>
                          <Plus className="w-4 h-4 mr-2" /> Add Variant
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-hidden rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">Add Variant to {product.name}</DialogTitle>
                          <DialogDescription>Create a new variant with different attributes.</DialogDescription>
                        </DialogHeader>
                        <VariantForm productId={product.id} attributes={product.attributes} onSuccess={() => setActiveProductId(null)} />
                      </DialogContent>
                    </Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More options">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setActiveEditProductId(product.id)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit Product
                        </DropdownMenuItem>
                        {product.brand && (
                          <DropdownMenuItem onClick={() => setActiveEditBrandId(product.brand.id)}>
                            <PenLine className="w-4 h-4 mr-2" /> Edit Brand
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-toggle-product-${product.id}`}>
                        {openItems[product.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                
                <CollapsibleContent>
                  <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 space-y-5">
                    <Dialog open={activeEditProductId === product.id} onOpenChange={(open) => setActiveEditProductId(open ? product.id : null)}>
                      <DialogContent className="sm:max-w-[520px] rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">Edit Product</DialogTitle>
                          <DialogDescription>Update product details.</DialogDescription>
                        </DialogHeader>
                        <ProductEditForm product={product} brands={brands || []} onSuccess={() => setActiveEditProductId(null)} />
                      </DialogContent>
                    </Dialog>
                    {product.brand && (
                      <Dialog open={activeEditBrandId === product.brand.id} onOpenChange={(open) => setActiveEditBrandId(open ? product.brand.id : null)}>
                        <DialogContent className="sm:max-w-[480px] rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Edit Brand</DialogTitle>
                            <DialogDescription>Update brand details.</DialogDescription>
                          </DialogHeader>
                          <BrandEditForm brand={product.brand} onSuccess={() => setActiveEditBrandId(null)} />
                        </DialogContent>
                      </Dialog>
                    )}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" /> Attributes
                      </h4>
                      {product.attributes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No attributes yet. Add one to build variants.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {product.attributes.map((attribute) => {
                            const isUsedByVariant = product.variants.some((variant) =>
                              variant.optionValues.some((value) => value.attributeId === attribute.id)
                            );
                            return (
                              <Card key={attribute.id} className="border border-slate-100 shadow-sm rounded-xl">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-800">{attribute.name}</p>
                                    <p className="text-xs text-muted-foreground">{attribute.code}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Dialog open={activeOptionAttributeId === attribute.id} onOpenChange={(open) => setActiveOptionAttributeId(open ? attribute.id : null)}>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          aria-label="Add option"
                                          title="Add option"
                                          data-testid={`button-add-option-${attribute.id}`}
                                        >
                                          <Plus className="w-4 h-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[420px] rounded-2xl">
                                        <DialogHeader>
                                          <DialogTitle className="text-lg font-bold">Add Option</DialogTitle>
                                          <DialogDescription>Add a value for {attribute.name}.</DialogDescription>
                                        </DialogHeader>
                                        <OptionForm productId={product.id} attributeId={attribute.id} nextSortOrder={attribute.options.length + 1} onSuccess={() => setActiveOptionAttributeId(null)} />
                                      </DialogContent>
                                    </Dialog>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" aria-label="Attribute actions">
                                          <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setActiveEditAttributeId(attribute.id)}>
                                          <Pencil className="w-4 h-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => setDeleteAttributeTarget({ productId: product.id, attributeId: attribute.id, name: attribute.name })}
                                          disabled={isUsedByVariant}
                                          className="text-rose-600 focus:text-rose-600"
                                          data-testid={`menu-delete-attribute-${attribute.id}`}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                <Dialog open={activeEditAttributeId === attribute.id} onOpenChange={(open) => setActiveEditAttributeId(open ? attribute.id : null)}>
                                  <DialogContent className="sm:max-w-[450px] rounded-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-lg font-bold">Edit Attribute</DialogTitle>
                                      <DialogDescription>Update attribute details.</DialogDescription>
                                    </DialogHeader>
                                    <AttributeEditForm productId={product.id} attribute={attribute} onSuccess={() => setActiveEditAttributeId(null)} />
                                  </DialogContent>
                                </Dialog>
                                <div
                                  className={cn(
                                    "mt-2.5 flex gap-2",
                                    expandedOptionRows[attribute.id] ? "flex-wrap" : "flex-nowrap overflow-hidden",
                                  )}
                                >
                                  {attribute.options.length === 0 ? (
                                    <span className="text-xs text-muted-foreground">No options yet</span>
                                  ) : (
                                    (expandedOptionRows[attribute.id] ? attribute.options : attribute.options.slice(0, 6)).map((option) => (
                                      <Dialog key={option.id} open={activeEditOptionId === option.id} onOpenChange={(open) => setActiveEditOptionId(open ? option.id : null)}>
                                        <DialogTrigger asChild>
                                          <button type="button" className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full hover:bg-slate-200 transition-colors shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]">
                                            {option.value}
                                          </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[420px] rounded-2xl">
                                          <DialogHeader>
                                            <DialogTitle className="text-lg font-bold">Edit Option</DialogTitle>
                                            <DialogDescription>Update option details.</DialogDescription>
                                          </DialogHeader>
                                          <OptionEditForm productId={product.id} option={option} onSuccess={() => setActiveEditOptionId(null)} />
                                        </DialogContent>
                                      </Dialog>
                                    ))
                                  )}
                                  {attribute.options.length > 6 && !expandedOptionRows[attribute.id] && (
                                    <button
                                      type="button"
                                      onClick={() => toggleOptionRow(attribute.id)}
                                      className="shrink-0 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100"
                                    >
                                      +{attribute.options.length - 6} more
                                    </button>
                                  )}
                                  {attribute.options.length > 6 && expandedOptionRows[attribute.id] && (
                                    <button
                                      type="button"
                                      onClick={() => toggleOptionRow(attribute.id)}
                                      className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100"
                                    >
                                      Show less
                                    </button>
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <VariantFiltersCard
                        productId={product.id}
                        attributes={product.attributes}
                        activeFilters={variantFilters[product.id]}
                        onSetVariantFilter={setVariantFilter}
                      />
                      <VariantsTable
                        productId={product.id}
                        variants={product.variants}
                        attributes={product.attributes}
                        activeFilters={variantFilters[product.id]}
                        activeEditVariantId={activeEditVariantId}
                        setActiveEditVariantId={setActiveEditVariantId}
                        onDeleteVariant={(id, sku) => setDeleteVariantTarget({ id, sku })}
                        VariantEditFormComponent={VariantEditForm}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}








