import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, Pencil, Plus } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { createAdminFeed, deleteAdminFeed, fetchAdminFeed, updateAdminFeed } from "@/api/adminApi";
import AdminHeader from "@/components/AdminHeader";

const emptyForm = { category: "NEWS", text: "", published: true };

export default function AdminFeed() {
  const { theme } = useOutletContext();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchAdminFeed(token).then((data) => setItems(Array.isArray(data) ? data : []));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (editingId) {
      await updateAdminFeed(editingId, form, token);
      setItems((prev) => prev.map((i) => (i.id === editingId ? { ...form, id: editingId } : i)));
    } else {
      const res = await createAdminFeed(form, token);
      const newItem = { ...form, id: res.id };
      setItems((prev) => [newItem, ...prev]);
    }
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ category: item.category, text: item.text, published: !!item.published });
  };

  const handleDelete = async (item) => {
    if (!token) return;
    if (!confirm("Delete this feed item?")) return;
    await deleteAdminFeed(item.id, token);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  return (
    <section className="min-h-screen px-6 md:px-24 py-16" style={{ backgroundColor: theme.colors.bg.primary }}>
      <div className="max-w-5xl mx-auto space-y-8">
        <AdminHeader theme={theme} />
        <div className="flex items-center justify-between">
          <h1 className="text-4xl md:text-5xl font-light" style={{ color: theme.text }}>
            Admin Feed
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="border p-6 space-y-4" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-4">
            <input
              className="border px-3 py-2 rounded-none"
              style={{ backgroundColor: theme.colors.bg.card, borderColor: theme.border, color: theme.text }}
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              placeholder="Category"
            />
            <label className="text-sm" style={{ color: theme.text }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
              />{" "}
              Published
            </label>
          </div>
          <textarea
            className="w-full border p-3 rounded-none min-h-[120px]"
            style={{ backgroundColor: theme.colors.bg.card, borderColor: theme.border, color: theme.text }}
            value={form.text}
            onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
            placeholder="Feed text"
            required
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-none"
            style={{ borderColor: theme.border, color: theme.text }}
          >
            <Plus size={14} /> {editingId ? "Update" : "Add"}
          </button>
        </form>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border p-4 flex flex-col md:flex-row gap-4 justify-between"
              style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.card }}
            >
              <div>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  {item.category} · {item.published ? "Published" : "Draft"}
                </p>
                <p className="text-sm" style={{ color: theme.text }}>
                  {item.text}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startEdit(item)}
                  className="inline-flex items-center gap-2 text-sm"
                  style={{ color: theme.text }}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="inline-flex items-center gap-2 text-sm"
                  style={{ color: "#b91c1c" }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
