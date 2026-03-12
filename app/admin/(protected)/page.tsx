"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface StoredFilter {
  id: string;
  name: string;
  description: string;
  prompt: string;
  visible: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<StoredFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<StoredFilter | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const fetchFilters = useCallback(async () => {
    const res = await fetch("/api/admin/filters", { credentials: "include" });
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    if (!res.ok) {
      setError("Failed to load filters");
      return;
    }
    const data = await res.json();
    setFilters(data.filters ?? []);
    setError("");
  }, [router]);

  useEffect(() => {
    fetchFilters().finally(() => setLoading(false));
  }, [fetchFilters]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleToggleVisible = async (filter: StoredFilter) => {
    setToggleLoadingId(filter.id);
    try {
      const res = await fetch("/api/admin/filters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: filter.id,
          visible: !filter.visible,
        }),
      });
      if (res.ok) await fetchFilters();
    } finally {
      setToggleLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === "none") return;
    if (!confirm("Delete this filter?")) return;
    const res = await fetch("/api/admin/filters", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setFilters((prev) => prev.filter((f) => f.id !== id));
      setEditing(null);
    } else {
      const data = await res.json();
      alert(data.error || "Delete failed");
    }
  };

  const handleSaveEdit = async (payload: Partial<StoredFilter> & { id: string }) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/filters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchFilters();
        setEditing(null);
        setCreating(false);
      } else {
        const data = await res.json();
        alert(data.error || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (payload: {
    id: string;
    name: string;
    description: string;
    prompt: string;
    visible: boolean;
  }) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchFilters();
        setCreating(false);
      } else {
        const data = await res.json();
        alert(data.error || "Create failed");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Filters dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreating(true)}>
              Add filter
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-destructive">{error}</p>
        )}

        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium w-24">Visible</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filters.map((filter) => (
                <tr key={filter.id} className="border-b border-border">
                  <td className="p-3">{filter.name}</td>
                  <td className="p-3 font-mono text-muted-foreground">{filter.id}</td>
                  <td className="p-3">
                    <Switch
                      checked={filter.visible}
                      disabled={toggleLoadingId === filter.id}
                      onCheckedChange={() => handleToggleVisible(filter)}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(filter)}
                    >
                      Edit
                    </Button>
                    {filter.id !== "none" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(filter.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(editing || creating) && (
        <FilterEditorModal
          filter={editing ?? undefined}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={editing ? handleSaveEdit : handleCreate}
          saving={saving}
          isCreate={creating}
        />
      )}
    </div>
  );
}

function FilterEditorModal({
  filter,
  onClose,
  onSave,
  saving,
  isCreate,
}: {
  filter?: StoredFilter;
  onClose: () => void;
  onSave: (payload: Partial<StoredFilter> & { id: string }) => void;
  saving: boolean;
  isCreate: boolean;
}) {
  const [id, setId] = useState(filter?.id ?? "");
  const [name, setName] = useState(filter?.name ?? "");
  const [description, setDescription] = useState(filter?.description ?? "");
  const [prompt, setPrompt] = useState(filter?.prompt ?? "");
  const [visible, setVisible] = useState(filter?.visible ?? true);

  useEffect(() => {
    if (filter) {
      setId(filter.id);
      setName(filter.name);
      setDescription(filter.description);
      setPrompt(filter.prompt);
      setVisible(filter.visible);
    } else {
      setId("");
      setName("");
      setDescription("");
      setPrompt("");
      setVisible(true);
    }
  }, [filter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreate) {
      (onSave as (p: {
        id: string;
        name: string;
        description: string;
        prompt: string;
        visible: boolean;
      }) => void)({
        id: id.trim().toLowerCase().replace(/\s+/g, "_"),
        name: name.trim(),
        description: description.trim() || name.trim(),
        prompt,
        visible,
      });
    } else {
      onSave({
        id: filter!.id,
        name: name.trim(),
        description: description.trim(),
        prompt,
        visible,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isCreate ? "Add filter" : "Edit filter"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-id">ID (slug)</Label>
            <Input
              id="edit-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 font-mono"
              required
              disabled={!isCreate}
            />
            {!isCreate && (
              <p className="text-xs text-muted-foreground mt-1">ID cannot be changed.</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit-prompt">Prompt</Label>
            <Textarea
              id="edit-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 min-h-[200px] font-mono text-sm"
              placeholder="AI transformation prompt…"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="edit-visible"
              checked={visible}
              onCheckedChange={setVisible}
            />
            <Label htmlFor="edit-visible">Visible in app</Label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
