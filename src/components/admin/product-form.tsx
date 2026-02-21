"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";
import { formatPrice } from "@/config/currency";
import {
  Trash2,
  Plus,
  Save,
  ArrowLeft,
  ImagePlus,
  X,
  Star,
  Edit2,
  Check,
} from "lucide-react";

interface ImageData {
  id: string;
  url: string;
  altText: { bs: string; en: string } | null;
  sortOrder: number;
  isPrimary: boolean;
}

interface VariantData {
  id: string;
  sku: string;
  price: number | null;
  stock: number;
  reservedStock: number;
  attributes: Record<string, string> | null;
  isActive: boolean;
}

interface ProductData {
  id?: string;
  sku: string;
  name: { bs: string; en: string };
  slug: string;
  description?: { bs: string; en: string };
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  categoryId?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  weight?: number | null;
  tags?: string[];
  variants?: VariantData[];
  images?: ImageData[];
}

interface ProductFormProps {
  product?: ProductData;
  categories: { id: string; name: unknown }[];
  locale: string;
}

export function ProductForm({ product, categories, locale }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product?.id;

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    sku: product?.sku ?? "",
    nameBs: product?.name?.bs ?? "",
    nameEn: product?.name?.en ?? "",
    slug: product?.slug ?? "",
    descBs: product?.description?.bs ?? "",
    descEn: product?.description?.en ?? "",
    price: product?.price ? (product.price / 100).toString() : "",
    compareAtPrice: product?.compareAtPrice
      ? (product.compareAtPrice / 100).toString()
      : "",
    costPrice: product?.costPrice
      ? (product.costPrice / 100).toString()
      : "",
    categoryId: product?.categoryId ?? "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    weight: product?.weight?.toString() ?? "",
  });

  // Tags
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [newTag, setNewTag] = useState("");

  // Images
  const [images, setImages] = useState<ImageData[]>(product?.images ?? []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [addingImage, setAddingImage] = useState(false);

  // Variants
  const [variants, setVariants] = useState<VariantData[]>(
    product?.variants ?? []
  );
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [editVariantData, setEditVariantData] = useState({
    sku: "",
    price: "",
    stock: "",
    attrKey: "",
    attrValue: "",
  });
  const [newVariant, setNewVariant] = useState({
    sku: "",
    price: "",
    stock: "0",
    attrKey: "",
    attrValue: "",
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const autoSlug = () => {
    const source = form.nameEn || form.nameBs;
    if (source) updateField("slug", slugify(source));
  };

  const getLocalName = (name: unknown): string => {
    if (!name || typeof name !== "object") return "";
    const n = name as Record<string, string>;
    return n[locale] || n.bs || n.en || "";
  };

  // ─── Tags ───
  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // ─── Images ───
  const addImage = async () => {
    if (!isEdit || !newImageUrl.trim()) return;
    setAddingImage(true);

    try {
      const res = await fetch(`/api/admin/products/${product!.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newImageUrl.trim(),
          isPrimary: images.length === 0,
        }),
      });

      if (res.ok) {
        const img = await res.json();
        setImages((prev) => [...prev, img]);
        setNewImageUrl("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add image");
      }
    } catch {
      setError("Failed to add image");
    } finally {
      setAddingImage(false);
    }
  };

  const removeImage = async (imageId: string) => {
    if (!isEdit) return;

    try {
      const res = await fetch(`/api/admin/products/${product!.id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });

      if (res.ok) {
        setImages((prev) => prev.filter((i) => i.id !== imageId));
      }
    } catch {
      setError("Failed to remove image");
    }
  };

  // ─── Variants ───
  const addVariant = async () => {
    if (!isEdit || !newVariant.sku) return;

    try {
      const attrs: Record<string, string> = {};
      if (newVariant.attrKey.trim()) {
        attrs[newVariant.attrKey.trim()] = newVariant.attrValue.trim();
      }

      const res = await fetch(`/api/admin/products/${product!.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: newVariant.sku,
          price: newVariant.price
            ? Math.round(parseFloat(newVariant.price) * 100)
            : null,
          stock: parseInt(newVariant.stock) || 0,
          attributes: Object.keys(attrs).length > 0 ? attrs : null,
        }),
      });

      if (res.ok) {
        const variant = await res.json();
        setVariants((prev) => [...prev, { ...variant, reservedStock: 0 }]);
        setNewVariant({
          sku: "",
          price: "",
          stock: "0",
          attrKey: "",
          attrValue: "",
        });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add variant");
      }
    } catch {
      setError("Failed to add variant");
    }
  };

  const startEditVariant = (v: VariantData) => {
    setEditingVariant(v.id);
    const firstAttr = v.attributes
      ? Object.entries(v.attributes)[0]
      : undefined;
    setEditVariantData({
      sku: v.sku,
      price: v.price ? (v.price / 100).toString() : "",
      stock: v.stock.toString(),
      attrKey: firstAttr?.[0] ?? "",
      attrValue: firstAttr?.[1] ?? "",
    });
  };

  const saveEditVariant = async (variantId: string) => {
    if (!isEdit) return;

    try {
      const attrs: Record<string, string> = {};
      if (editVariantData.attrKey.trim()) {
        attrs[editVariantData.attrKey.trim()] =
          editVariantData.attrValue.trim();
      }

      const res = await fetch(
        `/api/admin/products/${product!.id}/variants/${variantId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: editVariantData.sku,
            price: editVariantData.price
              ? Math.round(parseFloat(editVariantData.price) * 100)
              : null,
            stock: parseInt(editVariantData.stock) || 0,
            attributes: Object.keys(attrs).length > 0 ? attrs : null,
          }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setVariants((prev) =>
          prev.map((v) =>
            v.id === variantId
              ? { ...updated, reservedStock: v.reservedStock }
              : v
          )
        );
        setEditingVariant(null);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update variant");
      }
    } catch {
      setError("Failed to update variant");
    }
  };

  const deleteVariant = async (variantId: string) => {
    if (!isEdit || !confirm("Delete this variant?")) return;

    try {
      const res = await fetch(
        `/api/admin/products/${product!.id}/variants/${variantId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setVariants((prev) => prev.filter((v) => v.id !== variantId));
      }
    } catch {
      setError("Failed to delete variant");
    }
  };

  const toggleVariantActive = async (v: VariantData) => {
    if (!isEdit) return;

    try {
      const res = await fetch(
        `/api/admin/products/${product!.id}/variants/${v.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !v.isActive }),
        }
      );

      if (res.ok) {
        setVariants((prev) =>
          prev.map((variant) =>
            variant.id === v.id
              ? { ...variant, isActive: !variant.isActive }
              : variant
          )
        );
      }
    } catch {
      setError("Failed to update variant");
    }
  };

  // ─── Save product ───
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const priceInFeninga = Math.round(parseFloat(form.price) * 100);
    const compareAtPriceInFeninga = form.compareAtPrice
      ? Math.round(parseFloat(form.compareAtPrice) * 100)
      : null;
    const costPriceInFeninga = form.costPrice
      ? Math.round(parseFloat(form.costPrice) * 100)
      : null;

    if (
      !form.sku ||
      !form.nameBs ||
      !form.nameEn ||
      !form.slug ||
      isNaN(priceInFeninga)
    ) {
      setError(
        "Please fill in all required fields (SKU, Name BS, Name EN, Slug, Price)"
      );
      setSaving(false);
      return;
    }

    const payload = {
      sku: form.sku,
      name: { bs: form.nameBs, en: form.nameEn },
      slug: form.slug,
      description:
        form.descBs || form.descEn
          ? { bs: form.descBs, en: form.descEn }
          : undefined,
      price: priceInFeninga,
      compareAtPrice: compareAtPriceInFeninga,
      costPrice: costPriceInFeninga,
      categoryId: form.categoryId || null,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      weight: form.weight ? parseFloat(form.weight) : null,
      tags,
    };

    try {
      const url = isEdit
        ? `/api/admin/products/${product!.id}`
        : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save product");
        setSaving(false);
        return;
      }

      const saved = await res.json();
      setSuccess(isEdit ? "Product updated!" : "Product created!");

      if (!isEdit) {
        router.push(`/${locale}/admin/products/${saved.id}`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${product!.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push(`/${locale}/admin/products`);
      } else {
        setError("Failed to delete product");
      }
    } catch {
      setError("Network error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/admin/products`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Product" : "New Product"}
          </h1>
        </div>
        {isEdit && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU *</Label>
                    <Input
                      value={form.sku}
                      onChange={(e) => updateField("sku", e.target.value)}
                      placeholder="e.g. PROD-001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Slug *{" "}
                      <button
                        type="button"
                        className="text-xs text-blue-500 hover:underline"
                        onClick={autoSlug}
                      >
                        Auto-generate
                      </button>
                    </Label>
                    <Input
                      value={form.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      placeholder="product-url-slug"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name (Bosnian) *</Label>
                    <Input
                      value={form.nameBs}
                      onChange={(e) => updateField("nameBs", e.target.value)}
                      placeholder="Naziv proizvoda"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name (English) *</Label>
                    <Input
                      value={form.nameEn}
                      onChange={(e) => updateField("nameEn", e.target.value)}
                      placeholder="Product name"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Description (Bosnian)</Label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.descBs}
                      onChange={(e) => updateField("descBs", e.target.value)}
                      placeholder="Opis proizvoda..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (English)</Label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.descEn}
                      onChange={(e) => updateField("descEn", e.target.value)}
                      placeholder="Product description..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Price (KM) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Compare At Price (KM)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.compareAtPrice}
                      onChange={(e) =>
                        updateField("compareAtPrice", e.target.value)
                      }
                      placeholder="Original price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Price (KM)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.costPrice}
                      onChange={(e) =>
                        updateField("costPrice", e.target.value)
                      }
                      placeholder="Your cost"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images (edit mode only) */}
            {isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImagePlus className="h-5 w-5" />
                    Images
                    <Badge variant="secondary" className="ml-1">
                      {images.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {images.map((img) => (
                        <div
                          key={img.id}
                          className="relative group rounded-lg border overflow-hidden bg-muted"
                        >
                          <div className="aspect-square">
                            <img
                              src={img.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => removeImage(img.id)}
                              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {img.isPrimary && (
                            <div className="absolute top-1 left-1">
                              <Badge className="text-xs gap-1 px-1.5 py-0.5">
                                <Star className="h-3 w-3" />
                                Primary
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste image URL..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addImage}
                      disabled={!newImageUrl.trim() || addingImage}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {addingImage ? "Adding..." : "Add"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add images by URL. First image becomes primary automatically.
                    Use paths like /images/products/placeholder-1.svg for local placeholders.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Variants (edit mode only) */}
            {isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Variants
                    <Badge variant="secondary" className="ml-2">
                      {variants.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {variants.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3">SKU</th>
                            <th className="text-right p-3">Price</th>
                            <th className="text-right p-3">Stock</th>
                            <th className="text-left p-3">Attributes</th>
                            <th className="text-center p-3">Status</th>
                            <th className="text-right p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v) =>
                            editingVariant === v.id ? (
                              <tr key={v.id} className="border-b bg-blue-50/50">
                                <td className="p-2">
                                  <Input
                                    className="h-8 text-xs"
                                    value={editVariantData.sku}
                                    onChange={(e) =>
                                      setEditVariantData((p) => ({
                                        ...p,
                                        sku: e.target.value,
                                      }))
                                    }
                                  />
                                </td>
                                <td className="p-2">
                                  <Input
                                    className="h-8 text-xs w-20 ml-auto"
                                    type="number"
                                    step="0.01"
                                    value={editVariantData.price}
                                    onChange={(e) =>
                                      setEditVariantData((p) => ({
                                        ...p,
                                        price: e.target.value,
                                      }))
                                    }
                                    placeholder="—"
                                  />
                                </td>
                                <td className="p-2">
                                  <Input
                                    className="h-8 text-xs w-16 ml-auto"
                                    type="number"
                                    value={editVariantData.stock}
                                    onChange={(e) =>
                                      setEditVariantData((p) => ({
                                        ...p,
                                        stock: e.target.value,
                                      }))
                                    }
                                  />
                                </td>
                                <td className="p-2">
                                  <div className="flex gap-1">
                                    <Input
                                      className="h-8 text-xs w-16"
                                      placeholder="key"
                                      value={editVariantData.attrKey}
                                      onChange={(e) =>
                                        setEditVariantData((p) => ({
                                          ...p,
                                          attrKey: e.target.value,
                                        }))
                                      }
                                    />
                                    <Input
                                      className="h-8 text-xs w-16"
                                      placeholder="value"
                                      value={editVariantData.attrValue}
                                      onChange={(e) =>
                                        setEditVariantData((p) => ({
                                          ...p,
                                          attrValue: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="p-2" />
                                <td className="p-2 text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => saveEditVariant(v.id)}
                                    >
                                      <Check className="h-3.5 w-3.5 text-green-600" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => setEditingVariant(null)}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              <tr key={v.id} className="border-b hover:bg-muted/30">
                                <td className="p-3 font-mono text-xs">
                                  {v.sku}
                                </td>
                                <td className="p-3 text-right">
                                  {v.price ? formatPrice(v.price) : "—"}
                                </td>
                                <td className="p-3 text-right">
                                  {v.stock - v.reservedStock}
                                  {v.reservedStock > 0 && (
                                    <span className="text-muted-foreground text-xs ml-1">
                                      ({v.reservedStock} reserved)
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {v.attributes
                                    ? Object.entries(v.attributes).map(
                                        ([k, val]) => (
                                          <Badge
                                            key={k}
                                            variant="outline"
                                            className="mr-1 text-xs"
                                          >
                                            {k}: {val}
                                          </Badge>
                                        )
                                      )
                                    : "—"}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleVariantActive(v)}
                                  >
                                    <Badge
                                      variant={
                                        v.isActive ? "success" : "secondary"
                                      }
                                      className="cursor-pointer"
                                    >
                                      {v.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </button>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => startEditVariant(v)}
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-500 hover:text-red-700"
                                      onClick={() => deleteVariant(v.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Add New Variant</p>
                    <div className="grid grid-cols-6 gap-2">
                      <Input
                        placeholder="SKU *"
                        value={newVariant.sku}
                        onChange={(e) =>
                          setNewVariant((p) => ({ ...p, sku: e.target.value }))
                        }
                      />
                      <Input
                        placeholder="Price (KM)"
                        type="number"
                        step="0.01"
                        value={newVariant.price}
                        onChange={(e) =>
                          setNewVariant((p) => ({
                            ...p,
                            price: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Stock"
                        type="number"
                        value={newVariant.stock}
                        onChange={(e) =>
                          setNewVariant((p) => ({
                            ...p,
                            stock: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Attr key (e.g. size)"
                        value={newVariant.attrKey}
                        onChange={(e) =>
                          setNewVariant((p) => ({
                            ...p,
                            attrKey: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Attr value (e.g. M)"
                        value={newVariant.attrValue}
                        onChange={(e) =>
                          setNewVariant((p) => ({
                            ...p,
                            attrValue: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addVariant}
                        disabled={!newVariant.sku}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                    onClick={() => updateField("isActive", !form.isActive)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Featured</Label>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.isFeatured ? "bg-blue-500" : "bg-gray-300"
                    }`}
                    onClick={() =>
                      updateField("isFeatured", !form.isFeatured)
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.isFeatured ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getLocalName(cat.name)}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weight */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save button */}
            <Button type="submit" className="w-full gap-2" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
