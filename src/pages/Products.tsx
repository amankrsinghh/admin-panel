import { useEffect, useState } from "react";
import { productsDB, categoriesDB, uid as makeId } from "../shared/mockStore";
import type { Product, Category, CategoryItem } from "../shared/types";
import { Button, Input, Select, Textarea, formatINR, toast, Badge } from "../shared/ui";
import { useHashRoute } from "../shared/router";

const emptyForm = {
  title: "",
  description: "",
  price: 0,
  discountPrice: 0,
  category: "" as Category,
  sizes: "S,M,L,XL,Custom",
  colors: "",
  stock: 1,
  fabric: "",
  images: "",
  featured: false,
};

export function AddProduct({ editId }: { editId?: string }) {
  const { navigate } = useHashRoute();
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    return categoriesDB.subscribe(setCategories);
  }, []);

  useEffect(() => {
    if (editId) {
      const p = productsDB.get(editId);
      if (p) {
        setForm({
          title: p.title,
          description: p.description,
          price: p.price,
          discountPrice: p.discountPrice ?? 0,
          category: p.category,
          sizes: p.sizes.join(","),
          colors: p.colors.join(","),
          stock: p.stock,
          fabric: p.fabric,
          images: p.images.join("\n"),
          featured: !!p.featured,
        });
      }
    } else {
      setForm(emptyForm);
    }
  }, [editId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const images = form.images.split(/\s|\n/).map((s) => s.trim()).filter(Boolean);
    if (images.length === 0) { toast("Add at least one image URL", "err"); return; }
    if (!form.title || !form.price) { toast("Title and price are required", "err"); return; }
    if (!form.category) { toast("Select a category", "err"); return; }

    setBusy(true);
    const payload: Product = {
      id: editId || "p_" + makeId(),
      title: form.title,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      category: form.category,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      stock: Number(form.stock),
      fabric: form.fabric,
      images,
      featured: form.featured,
      createdAt: editId ? (productsDB.get(editId)?.createdAt ?? Date.now()) : Date.now(),
    };
    if (editId) productsDB.update(editId, payload);
    else productsDB.add(payload);

    setBusy(false);
    toast(editId ? "Product updated" : "Product added! Visible on customer site instantly.");
    navigate("/products");
  }

  const preview = form.images.split(/\s|\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">{editId ? "Edit Product" : "Add New Product"}</h1>
          <p className="mt-1 text-sm text-ink/60">
            Paste image URLs — no file uploads needed. Saves instantly to customer site.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/products")} className="w-full sm:w-auto">← Back</Button>
      </div>

      <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl bg-white p-6 ring-1 ring-ink/5">
            <div className="font-serif text-xl">Basic Info</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input label="Product Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Textarea rows={4} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </Select>
              <Input label="Fabric" value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} />
              <Input label="Price (₹)" type="number" required value={form.price || ""} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
              <Input label="Discount Price (₹)" type="number" value={form.discountPrice || ""} onChange={(e) => setForm({ ...form, discountPrice: +e.target.value })} />
              <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} />
              <label className="flex items-center gap-2 pt-7 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Feature on homepage
              </label>
              <Input label="Sizes (comma separated)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                placeholder="S,M,L,XL,Custom" />
              <Input label="Colors (comma separated)" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="Rose Gold,Ivory" />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 ring-1 ring-ink/5">
            <div className="font-serif text-xl">Image URLs</div>
            <p className="mt-1 text-xs text-ink/60">
              Paste one image URL per line. Upload to any image host first, then paste here.
            </p>
            <Textarea rows={5} className="mt-4 font-mono text-xs"
              value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })}
              placeholder={"https://images.unsplash.com/photo-1610030469983-98e550d6193c\nhttps://…"} />
            {preview.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5">
                {preview.map((u, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg ring-1 ring-ink/10">
                    <img src={u} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.2")} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="rounded-2xl bg-ink p-6 text-white lg:sticky lg:top-8 lg:self-start">
          <div className="font-serif text-2xl">Live Preview</div>
          <div className="mt-5 overflow-hidden rounded-xl bg-white text-ink">
            <div className="aspect-[3/4] bg-blush">
              {preview[0] && <img src={preview[0]} className="h-full w-full object-cover" />}
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink/50">{form.category}</div>
              <div className="mt-0.5 font-serif text-lg line-clamp-1">{form.title || "Product title"}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-medium">{formatINR(form.discountPrice || form.price || 0)}</span>
                {!!form.discountPrice && form.discountPrice < form.price && (
                  <span className="text-xs text-ink/40 line-through">{formatINR(form.price)}</span>
                )}
              </div>
            </div>
          </div>
          <Button className="mt-5 w-full" type="submit" disabled={busy}>
            {busy ? "Saving…" : editId ? "Update Product" : "Publish Product"}
          </Button>
        </aside>
      </form>
    </div>
  );
}

export function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const { navigate } = useHashRoute();
  useEffect(() => productsDB.subscribe(setProducts), []);
  const list = products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  function remove(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    productsDB.remove(id);
    toast("Product deleted");
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Manage Products</h1>
          <p className="mt-1 text-sm text-ink/60">{products.length} pieces in store</p>
        </div>
        <Button onClick={() => navigate("/add")} className="w-full sm:w-auto">+ Add Product</Button>
      </div>

      <div className="mt-6">
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full max-w-sm rounded-full border border-ink/15 bg-white px-4 py-2 text-sm outline-none focus:border-rose-gold"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-ink/5">
        <table className="w-full min-w-[500px] text-sm">
          <thead className="bg-ink/[0.03] text-left text-[11px] uppercase tracking-wider text-ink/60">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 hidden md:table-cell">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 hidden md:table-cell">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-ink/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} className="h-12 w-10 rounded object-cover" />
                    <div>
                      <div className="font-medium line-clamp-1">{p.title}</div>
                      <div className="text-xs text-ink/50">{p.fabric}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">{p.category}</td>
                <td className="px-4 py-3">{formatINR(p.discountPrice ?? p.price)}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {p.stock > 0 ? <Badge tone="green">{p.stock}</Badge> : <Badge tone="red">Out</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => navigate(`/edit/${p.id}`)}
                    className="mr-3 text-xs text-rose-gold-dark hover:underline">Edit</button>
                  <button onClick={() => remove(p.id)}
                    className="text-xs text-rose-700 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink/50">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
