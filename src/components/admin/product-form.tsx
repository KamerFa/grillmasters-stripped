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
import { Trash2, Plus, Save, ArrowLeft } from "lucide-react";

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
  categories?: { id: string; name: unknown }[];
  variants?: {
    id: string;
    sku: string;
    price: number | null;
    stock: number;
    reservedStock: number;
    attributes: Record<string, string> | null;
    isActive: boolean;
  }[];
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
    nameBs: (product?.name as { bs: string; en: string })?.bs ?? "",
    nameEn: (product?.name as { bs: string; en: string })?.en ?? "",
    slug: product?.slug ?? "",
    descBs: (product?.description as { bs: string; en: string })?.bs ?? "",
    descEn: (product?.description as { bs: string; en: string })?.en ?? "",
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

  // Variant management
  const [variants, setVariants] = useState(product?.variants ?? []);
  const [newVariant, setNewVariant] = useState({
    sku: "",
    price: "",
    stock: "0",
    attributeKey: "",
    attributeValue: "",
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const autoSlug = () => {
    const source = form.nameEn || form.nameBs;
    if (source) {
      updateField("slug", slugify(source));
    }
  };

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

    if (!form.sku || !form.nameBs || !form.nameEn || !form.slug || isNaN(priceInFeninga)) {
      setError("Please fill in all required fields (SKU, Name BS, Name EN, Slug, Price)");
      setSaving(false);
      return;
    }

    const payload = {
      sku: form.sku,
      name: { bs: form.nameBs, en: form.nameEn },
      slug: form.slug,
      description: form.descBs || form.descEn
        ? { bs: form.descBs, en: form.descEn }
        : undefined,
      price: priceInFeninga,
      compareAtPrice: compareAtPriceInFeninga,
      costPrice: costPriceInFeninga,
      categoryId: form.categoryId || null,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      weight: form.weight ? parseFloat(form.weight) : null,
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

  const addVariant = async () => {
    if (!product?.id || !newVariant.sku) return;

    try {
      const res = await fetch(`/api/admin/products/${product.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: newVariant.sku,
          price: newVariant.price ? Math.round(parseFloat(newVariant.price) * 100) : null,
          stock: parseInt(newVariant.stock) || 0,
          attributes: newVariant.attributeKey
            ? { [newVariant.attributeKey]: newVariant.attributeValue }
            : null,
        }),
      });

      if (res.ok) {
        const variant = await res.json();
        setVariants((prev) => [...prev, { ...variant, reservedStock: 0 }]);
        setNewVariant({
          sku: "",
          price: "",
          stock: "0",
          attributeKey: "",
          attributeValue: "",
        });
      }
    } catch {
      setError("Failed to add variant");
    }
  };

  const getLocalName = (name: unknown): string => {
    if (!name || typeof name !== "object") return "";
    const n = name as Record<string, string>;
    return n[locale] || n.bs || n.en || "";
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
        <div className="flex items-center gap-2">
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
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Variants (only on edit) */}
            {isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Variants{" "}
                    <Badge variant="secondary" className="ml-2">
                      {variants.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Existing variants */}
                    {variants.length > 0 && (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">SKU</th>
                            <th className="text-right p-2">Price</th>
                            <th className="text-right p-2">Stock</th>
                            <th className="text-left p-2">Attributes</th>
                            <th className="text-center p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v) => (
                            <tr key={v.id} className="border-b">
                              <td className="p-2 font-mono text-xs">
                                {v.sku}
                              </td>
                              <td className="p-2 text-right">
                                {v.price ? formatPrice(v.price) : "—"}
                              </td>
                              <td className="p-2 text-right">
                                {v.stock - v.reservedStock}
                                {v.reservedStock > 0 && (
                                  <span className="text-muted-foreground text-xs ml-1">
                                    ({v.reservedStock} reserved)
                                  </span>
                                )}
                              </td>
                              <td className="p-2">
                                {v.attributes
                                  ? Object.entries(v.attributes)
                                      .map(([k, val]) => `${k}: ${val}`)
                                      .join(", ")
                                  : "—"}
                              </td>
                              <td className="p-2 text-center">
                                <Badge
                                  variant={
                                    v.isActive ? "success" : "secondary"
                                  }
                                >
                                  {v.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Add variant */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-3">Add Variant</p>
                      <div className="grid grid-cols-5 gap-2">
                        <Input
                          placeholder="SKU"
                          value={newVariant.sku}
                          onChange={(e) =>
                            setNewVariant((p) => ({
                              ...p,
                              sku: e.target.value,
                            }))
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
                          placeholder="Attr (e.g. size)"
                          value={newVariant.attributeKey}
                          onChange={(e) =>
                            setNewVariant((p) => ({
                              ...p,
                              attributeKey: e.target.value,
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
