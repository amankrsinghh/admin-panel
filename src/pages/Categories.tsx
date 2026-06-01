import { useEffect, useState } from "react";
import { categoriesDB, uid } from "../shared/mockStore";
import type { CategoryItem } from "../shared/types";
import { Button, Input, toast } from "../shared/ui";

export default function Categories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return categoriesDB.subscribe(setCategories);
  }, []);

  const startEdit = (c: CategoryItem) => {
    setEditingCat(c);
    setNewName(c.name);
    setNewDesc(c.description || "");
    setNewImage(c.image || "");
  };

  const cancelEdit = () => {
    setEditingCat(null);
    setNewName("");
    setNewDesc("");
    setNewImage("");
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    
    const slug = newName.trim();

    if (editingCat) {
      if (categories.some(c => c.id !== editingCat.id && c.slug.toLowerCase() === slug.toLowerCase())) {
        toast("Another category already exists with this name", "err");
        setBusy(false);
        return;
      }
      try {
        await categoriesDB.update(editingCat.id, {
          name: newName.trim(),
          slug: slug,
          description: newDesc.trim(),
          image: newImage.trim(),
        });
        toast("Category updated successfully");
        cancelEdit();
      } catch (err) {
        toast((err as Error).message, "err");
      }
    } else {
      if (categories.some(c => c.slug.toLowerCase() === slug.toLowerCase())) {
        toast("Category already exists", "err");
        setBusy(false);
        return;
      }
      try {
        await categoriesDB.add({
          id: uid(),
          name: newName.trim(),
          slug: slug,
          description: newDesc.trim(),
          image: newImage.trim(),
        });
        toast("Category added successfully");
        setNewName("");
        setNewDesc("");
        setNewImage("");
      } catch (err) {
        toast((err as Error).message, "err");
      }
    }
    setBusy(false);
  };

  const deleteCategory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      categoriesDB.remove(id);
      toast("Category removed");
      if (editingCat?.id === id) {
        cancelEdit();
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl">Categories</h1>
          <p className="mt-1 text-sm text-ink/60">Organize and customize your collection segments.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Add / Edit Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <h2 className="font-serif text-xl">{editingCat ? "Edit Category" : "Create Category"}</h2>
            <form onSubmit={saveCategory} className="mt-4 space-y-4">
              <Input 
                label="Category Name" 
                placeholder="e.g. Designer Sarees" 
                value={newName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                required
              />
              <Input 
                label="Category Image URL" 
                placeholder="https://images.unsplash.com/photo-..." 
                value={newImage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewImage(e.target.value)}
              />
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink/50">Description (Optional)</label>
                <textarea
                  className="mt-1.5 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold/20"
                  rows={3}
                  value={newDesc}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" disabled={busy}>
                  {busy ? "Saving..." : (editingCat ? "Save Changes" : "Add Category")}
                </Button>
                {editingCat && (
                  <Button variant="outline" type="button" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-ink/[0.02] text-[11px] uppercase tracking-wider text-ink/40">
                <tr>
                  <th className="px-6 py-4 font-semibold">Image</th>
                  <th className="px-6 py-4 font-semibold">Category Name</th>
                  <th className="px-6 py-4 font-semibold">Slug</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-ink/40">
                      No categories found. Start by adding one.
                    </td>
                  </tr>
                )}
                {categories.map((c) => (
                  <tr key={c.id} className="group hover:bg-ink/[0.01]">
                    <td className="px-6 py-4">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="h-10 w-10 rounded-lg object-cover ring-1 ring-ink/10" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink/5 text-[10px] text-ink/40">No Image</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink">{c.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-ink/5 px-1.5 py-0.5 text-xs text-ink/60">{c.slug}</code>
                    </td>
                    <td className="px-6 py-4 text-ink/60 max-w-xs truncate">
                      {c.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => startEdit(c)}
                        className="text-ink/60 hover:text-rose-gold font-medium underline underline-offset-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteCategory(c.id, c.name)}
                        className="text-rose-gold hover:text-rose-gold-dark font-medium underline underline-offset-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
