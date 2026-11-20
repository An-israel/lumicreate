import { useEffect, useState } from "react";
import { Loader2, Lock, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ImageUpload from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CONTENT_TYPES, formatNaira } from "@/lib/constants";
import { PRODUCT_CATEGORIES } from "@/lib/productCategories";
import { cn, getErrorMessage } from "@/lib/utils";
import { copyImagesToStorage, uploadProductImage } from "@/lib/productImages";
import { ContentType, Product, ProductTier } from "@/types/database";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Product to edit, or null to create a new one */
  product: Product | null;
  onSaved: () => void;
}

interface SpecRow {
  key: string;
  value: string;
}

const AUTO_CATEGORY = "auto";

const SPEC_SUGGESTIONS: Record<string, string[]> = {
  microphones: ["Type", "Polar Pattern", "Connection", "Frequency Response", "Best For", "In the Box"],
  "key-lights": ["Light Type", "Power", "Colour Temperature", "CRI", "Mount", "Best For", "In the Box"],
  "fill-lights": ["Light Type", "Power", "Colour Temperature", "CRI", "Best For", "In the Box"],
  "background-lights": ["Light Type", "Colours", "Power", "Control", "Best For", "In the Box"],
  "rim-lights": ["Light Type", "Power", "Colour Temperature", "Best For", "In the Box"],
  "stands-mounts": ["Type", "Max Height", "Max Load", "Material", "Best For", "In the Box"],
  "audio-gear": ["Type", "Inputs", "Connection", "Best For", "In the Box"],
};
const DEFAULT_SPEC_SUGGESTIONS = ["Type", "Best For", "Warranty", "In the Box"];

const toNumberOrNull = (value: string) => {
  const trimmed = value.replace(/[,\s₦]/g, "");
  if (!trimmed) return null;
  const number = Number(trimmed);
  return Number.isFinite(number) ? Math.round(number) : NaN;
};

const emptyState = () => ({
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  tier: "basic" as ProductTier,
  category: AUTO_CATEGORY,
  contentTypes: ["general"] as ContentType[],
  imageUrl: "",
  gallery: [] as string[],
  specs: [] as SpecRow[],
  inStock: true,
  isPackage: false,
  supplierName: "",
  supplierUrl: "",
  supplierProductId: "",
  supplierSkuId: "",
  costPrice: "",
  notes: "",
});

const ProductFormDialog = ({ open, onOpenChange, product, onSaved }: ProductFormDialogProps) => {
  const [form, setForm] = useState(emptyState);
  const [newGalleryImage, setNewGalleryImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const set = <K extends keyof ReturnType<typeof emptyState>>(key: K, value: ReturnType<typeof emptyState>[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Load the product (and its private sourcing row) whenever the dialog opens
  useEffect(() => {
    if (!open) return;
    setNewGalleryImage("");

    if (!product) {
      setForm(emptyState());
      return;
    }

    const specs = Object.entries((product.specifications as Record<string, unknown>) || {}).map(([key, value]) => ({
      key,
      value: String(value ?? ""),
    }));

    setForm({
      ...emptyState(),
      name: product.name,
      description: product.description || "",
      price: String(product.price_naira ?? ""),
      originalPrice: product.original_price_naira ? String(product.original_price_naira) : "",
      tier: product.tier,
      category: product.category || AUTO_CATEGORY,
      contentTypes: product.content_types?.length ? product.content_types : ["general"],
      imageUrl: product.image_url || "",
      gallery: product.image_urls || [],
      specs,
      inStock: product.in_stock !== false,
      isPackage: !!product.is_package,
    });

    supabase
      .from("product_sourcing")
      .select("*")
      .eq("product_id", product.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setForm((prev) => ({
          ...prev,
          supplierName: data.supplier_name || "",
          supplierUrl: data.supplier_url || "",
          supplierProductId: data.supplier_product_id || "",
          supplierSkuId: data.supplier_sku_id || "",
          costPrice: data.cost_price_naira ? String(data.cost_price_naira) : "",
          notes: data.notes || "",
        }));
      });
  }, [open, product]);

  const price = toNumberOrNull(form.price);
  const originalPrice = toNumberOrNull(form.originalPrice);
  const costPrice = toNumberOrNull(form.costPrice);
  const margin =
    price && costPrice && !Number.isNaN(price) && !Number.isNaN(costPrice) ? price - costPrice : null;

  const usedSpecKeys = new Set(form.specs.map((spec) => spec.key.trim().toLowerCase()));
  const specSuggestions = (SPEC_SUGGESTIONS[form.category] || DEFAULT_SPEC_SUGGESTIONS).filter(
    (key) => !usedSpecKeys.has(key.toLowerCase())
  );

  const toggleContentType = (type: ContentType) => {
    const has = form.contentTypes.includes(type);
    const next = has ? form.contentTypes.filter((t) => t !== type) : [...form.contentTypes, type];
    set("contentTypes", next.length ? next : ["general"]);
  };

  const updateSpec = (index: number, field: keyof SpecRow, value: string) =>
    set(
      "specs",
      form.specs.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec))
    );

  const addGalleryImage = (url: string) => {
    if (!url) return;
    if (!/^https?:\/\//.test(url)) {
      toast.error("Paste a full image link starting with https://");
      return;
    }
    setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
    setNewGalleryImage("");
  };

  const handleGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setIsUploadingGallery(true);
    const uploaded: string[] = [];
    for (const file of files) {
      try {
        uploaded.push(await uploadProductImage(file));
      } catch (error) {
        toast.error(getErrorMessage(error, `Failed to upload ${file.name}`));
      }
    }
    setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...uploaded] }));
    setIsUploadingGallery(false);
    if (uploaded.length) toast.success(`${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} uploaded`);
  };

  const allImages = [form.imageUrl, ...form.gallery].filter(Boolean);
  const hasExternalImages = allImages.some((url) => !url.includes("/storage/v1/object/public/product-images/"));

  const handleCopyImages = async () => {
    setIsCopying(true);
    try {
      const { urls, failed } = await copyImagesToStorage(allImages);
      const [main, ...gallery] = form.imageUrl ? urls : ["", ...urls];
      setForm((prev) => ({ ...prev, imageUrl: main, gallery }));
      if (failed.length) toast.error(`${failed.length} photo(s) couldn't be copied; they stay linked`);
      else toast.success("Photos copied to your storage");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't copy photos"));
    } finally {
      setIsCopying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Product name is required");
    if (price === null || Number.isNaN(price) || price <= 0) return toast.error("Enter a valid selling price");
    if (originalPrice !== null && (Number.isNaN(originalPrice) || originalPrice <= price)) {
      return toast.error("Original price must be higher than the selling price, or left empty");
    }
    if (costPrice !== null && Number.isNaN(costPrice)) return toast.error("Enter a valid cost price");

    const specifications = Object.fromEntries(
      form.specs
        .filter((spec) => spec.key.trim() && spec.value.trim())
        .map((spec) => [spec.key.trim(), spec.value.trim()])
    );

    const productData = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price_naira: price,
      // Legacy column from the removed coin system; still NOT NULL in the schema
      price_coins: Math.round(price / 100),
      original_price_naira: originalPrice,
      tier: form.tier,
      category: form.category === AUTO_CATEGORY ? null : form.category,
      content_types: form.contentTypes,
      image_url: form.imageUrl || null,
      image_urls: form.gallery,
      specifications,
      in_stock: form.inStock,
      is_package: form.isPackage,
    };

    setIsSaving(true);
    try {
      let productId = product?.id;

      if (productId) {
        const { error } = await supabase.from("products").update(productData).eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(productData).select("id").single();
        if (error) throw error;
        productId = data.id;
      }

      const sourcing = {
        supplier_name: form.supplierName.trim() || null,
        supplier_url: form.supplierUrl.trim() || null,
        supplier_product_id: form.supplierProductId.trim() || null,
        supplier_sku_id: form.supplierSkuId.trim() || null,
        cost_price_naira: costPrice,
        notes: form.notes.trim() || null,
      };
      const hasSourcing = Object.values(sourcing).some((value) => value !== null);

      if (hasSourcing || product) {
        const { error } = await supabase
          .from("product_sourcing")
          .upsert({ product_id: productId!, ...sourcing });
        if (error) throw error;
      }

      toast.success(product ? "Product updated" : "Product created");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      console.error("Product save error:", error);
      toast.error(getErrorMessage(error, "Failed to save product"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add new product"}</DialogTitle>
          <DialogDescription>
            Everything above "Supplier" is shown to customers. Supplier details are private to admins and staff.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basics */}
          <section className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pf-name">Product name</Label>
              <Input
                id="pf-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. 18-inch LED Ring Light with Phone Holder"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-description">Description</Label>
              <Textarea
                id="pf-description"
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Write it in your own words: who it's for and why it's good."
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Pricing</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-price">Selling price (₦)</Label>
                <Input
                  id="pf-price"
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="45000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-original">Original price (₦), optional</Label>
                <Input
                  id="pf-original"
                  inputMode="numeric"
                  value={form.originalPrice}
                  onChange={(e) => set("originalPrice", e.target.value)}
                  placeholder="Shows a Sale badge if higher"
                />
              </div>
            </div>
          </section>

          {/* Classification */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Grade & category</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tier (quality grade)</Label>
                <Select value={form.tier} onValueChange={(value) => set("tier", value as ProductTier)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic: budget / entry level</SelectItem>
                    <SelectItem value="premium">Premium: mid-range, better build</SelectItem>
                    <SelectItem value="diamond">Diamond: professional grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Shop category</Label>
                <Select value={form.category} onValueChange={(value) => set("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AUTO_CATEGORY}>Automatic (from the name)</SelectItem>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Good for</Label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((type) => {
                  const active = form.contentTypes.includes(type.id as ContentType);
                  return (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => toggleContentType(type.id as ContentType)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                        active
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Photos</h3>
            <ImageUpload value={form.imageUrl} onChange={(url) => set("imageUrl", url)} label="Main photo" />

            <div className="space-y-2">
              <Label>Gallery photos</Label>
              {form.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {form.gallery.map((url, index) => (
                    <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onClick={() => set("gallery", form.gallery.filter((_, i) => i !== index))}
                        className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-input px-4 text-sm font-medium hover:bg-muted">
                  {isUploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    disabled={isUploadingGallery}
                    onChange={handleGalleryFiles}
                  />
                </label>
                <Input
                  type="url"
                  value={newGalleryImage}
                  onChange={(e) => setNewGalleryImage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGalleryImage(newGalleryImage.trim());
                    }
                  }}
                  placeholder="…or paste an image link"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={() => addGalleryImage(newGalleryImage.trim())}>
                  Add
                </Button>
              </div>
            </div>

            {hasExternalImages && (
              <div className="flex flex-col gap-3 rounded-xl bg-brand-soft p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p>Some photos are linked from another website. Copy them to your own storage so they never break.</p>
                <Button type="button" size="sm" variant="outline" disabled={isCopying} onClick={handleCopyImages}>
                  {isCopying && <Loader2 className="animate-spin" />}
                  Copy to my storage
                </Button>
              </div>
            )}
          </section>

          {/* Specifications */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Specifications</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => set("specs", [...form.specs, { key: "", value: "" }])}
              >
                <Plus /> Add row
              </Button>
            </div>
            {form.specs.map((spec, index) => (
              <div key={index} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
                <Input
                  value={spec.key}
                  onChange={(e) => updateSpec(index, "key", e.target.value)}
                  placeholder="e.g. Power"
                  aria-label="Specification name"
                />
                <Input
                  value={spec.value}
                  onChange={(e) => updateSpec(index, "value", e.target.value)}
                  placeholder="e.g. 60W"
                  aria-label="Specification value"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove specification"
                  onClick={() => set("specs", form.specs.filter((_, i) => i !== index))}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {specSuggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                Suggested:
                {specSuggestions.map((key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => set("specs", [...form.specs, { key, value: "" }])}
                    className="rounded-full border border-dashed px-2.5 py-0.5 hover:border-foreground hover:text-foreground"
                  >
                    + {key}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              "Type" or "Light Type" shows on product cards. "Best For" and "In the Box" show on the product page.
            </p>
          </section>

          {/* Availability */}
          <section className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl border p-4">
              <span>
                <span className="block text-sm font-medium">In stock</span>
                <span className="text-xs text-muted-foreground">Customers can add it to cart</span>
              </span>
              <Switch checked={form.inStock} onCheckedChange={(checked) => set("inStock", checked)} />
            </label>
            <label className="flex items-center justify-between rounded-xl border p-4">
              <span>
                <span className="block text-sm font-medium">Package / bundle</span>
                <span className="text-xs text-muted-foreground">Shows under Packages, not the Shop</span>
              </span>
              <Switch checked={form.isPackage} onCheckedChange={(checked) => set("isPackage", checked)} />
            </label>
          </section>

          {/* Supplier (private) */}
          <section className="space-y-4 rounded-2xl border border-dashed p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Lock className="h-4 w-4" /> Supplier, private
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-supplier">Supplier</Label>
                <Input
                  id="pf-supplier"
                  value={form.supplierName}
                  onChange={(e) => set("supplierName", e.target.value)}
                  placeholder="e.g. AliExpress, Alibaba, local vendor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-cost">Landed cost (₦)</Label>
                <Input
                  id="pf-cost"
                  inputMode="numeric"
                  value={form.costPrice}
                  onChange={(e) => set("costPrice", e.target.value)}
                  placeholder="Item + shipping + duty"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-url">Supplier link</Label>
              <Input
                id="pf-url"
                type="url"
                value={form.supplierUrl}
                onChange={(e) => set("supplierUrl", e.target.value)}
                placeholder="https://www.aliexpress.com/item/…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-sp-id">Supplier product ID</Label>
                <Input
                  id="pf-sp-id"
                  value={form.supplierProductId}
                  onChange={(e) => set("supplierProductId", e.target.value)}
                  placeholder="The number in the AliExpress link"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-sku">Variant / SKU ID</Label>
                <Input
                  id="pf-sku"
                  value={form.supplierSkuId}
                  onChange={(e) => set("supplierSkuId", e.target.value)}
                  placeholder="Optional: colour, plug type, size"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-notes">Notes</Label>
              <Textarea
                id="pf-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Shipping time, quality checks, alternative suppliers…"
              />
            </div>
            {margin !== null && (
              <p className={cn("text-sm", margin > 0 ? "text-success" : "text-destructive")}>
                Margin: {formatNaira(margin)} ({Math.round((margin / price!) * 100)}% of the selling price)
              </p>
            )}
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="animate-spin" />}
              {product ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
