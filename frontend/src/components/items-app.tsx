"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import {
  ITEM_GROUPS,
  groupLabel,
  type Item,
  type ItemGroup,
  type ItemPayload,
} from "@/lib/types";

type FormState = {
  name: string;
  group: ItemGroup;
  annual_price: string;
  monthly_price: string;
};

const emptyForm = (): FormState => ({
  name: "",
  group: "auto",
  annual_price: "",
  monthly_price: "",
});

function toPayload(form: FormState): ItemPayload {
  return {
    name: form.name.trim(),
    group: form.group,
    annual_price: form.annual_price.trim() || null,
    monthly_price: form.monthly_price.trim() || null,
  };
}

function fromItem(item: Item): FormState {
  return {
    name: item.name,
    group: item.group,
    annual_price: item.annual_price ?? "",
    monthly_price: item.monthly_price ?? "",
  };
}

function formatMoney(value: string | null): string {
  if (value === null || value === "") return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function validatePrices(
  form: FormState,
  items: Item[],
  excludeId?: number,
): string | null {
  const annual = form.annual_price.trim();
  const monthly = form.monthly_price.trim();
  if (annual && monthly && annual === monthly) {
    return "Annual and monthly prices must be different.";
  }
  const others = items.filter((item) => item.id !== excludeId);
  if (annual) {
    if (others.some((item) => item.annual_price === annual)) {
      return "This annual price is already used by another item.";
    }
    if (others.some((item) => item.monthly_price === annual)) {
      return "This annual price matches an existing monthly price.";
    }
  }
  if (monthly) {
    if (others.some((item) => item.monthly_price === monthly)) {
      return "This monthly price is already used by another item.";
    }
    if (others.some((item) => item.annual_price === monthly)) {
      return "This monthly price matches an existing annual price.";
    }
  }
  return null;
}

export function ItemsApp() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [newCompanyName, setNewCompanyName] = useState("");

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const companyNames = useMemo(() => {
    const names = new Set(items.map((item) => item.name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesGroup = groupFilter === "all" || item.group === groupFilter;
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.reference_code ?? "").toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [items, query, groupFilter]);

  function openCreate() {
    setForm(emptyForm());
    setNewCompanyName("");
    setFormError(null);
    setCreateOpen(true);
  }

  function openDetail(item: Item, startEditing = false) {
    setSelected(item);
    setForm(fromItem(item));
    setNewCompanyName("");
    setEditing(startEditing);
    setFormError(null);
    setDetailOpen(true);
  }

  function isNameTakenInGroup(
    name: string,
    group: ItemGroup,
    excludeId?: number,
  ): boolean {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return false;
    return items.some(
      (item) =>
        item.id !== excludeId &&
        item.group === group &&
        item.name.toLowerCase() === normalized,
    );
  }

  function addCompanyName() {
    const name = newCompanyName.trim();
    if (!name) return;
    if (isNameTakenInGroup(name, form.group, selected?.id)) {
      setFormError(
        `"${name}" already exists in the ${groupLabel(form.group)} group. Pick another company or group.`,
      );
      return;
    }
    setFormError(null);
    setForm((prev) => ({ ...prev, name }));
    setNewCompanyName("");
  }

  async function handleCreate() {
    setSaving(true);
    setFormError(null);
    if (isNameTakenInGroup(form.name, form.group)) {
      setFormError(
        `"${form.name.trim()}" already exists in the ${groupLabel(form.group)} group.`,
      );
      setSaving(false);
      return;
    }
    const priceError = validatePrices(form, items);
    if (priceError) {
      setFormError(priceError);
      setSaving(false);
      return;
    }
    try {
      const created = await api.createItem(toPayload(form));
      setItems((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      setCreateOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!selected) return;
    setSaving(true);
    setFormError(null);
    if (isNameTakenInGroup(form.name, form.group, selected.id)) {
      setFormError(
        `"${form.name.trim()}" already exists in the ${groupLabel(form.group)} group.`,
      );
      setSaving(false);
      return;
    }
    const priceError = validatePrices(form, items, selected.id);
    if (priceError) {
      setFormError(priceError);
      setSaving(false);
      return;
    }
    try {
      const updated = await api.updateItem(selected.id, toPayload(form));
      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSelected(updated);
      setEditing(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Item) {
    const ok = window.confirm(`Delete "${item.name}" in ${groupLabel(item.group)}?`);
    if (!ok) return;
    try {
      await api.deleteItem(item.id);
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      if (selected?.id === item.id) {
        setDetailOpen(false);
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Insurance registry
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            QuoteLedger
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            List, create, review, and update insurance items across product groups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void loadItems()}
            disabled={loading || undefined}
          >
            <RefreshCw className={loading ? "animate-spin" : undefined} />
            Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus />
            Add item
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="border-border bg-card/60 pl-8 text-foreground placeholder:text-muted-foreground"
            placeholder="Search by name or reference code"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          value={groupFilter}
          onValueChange={(value) => setGroupFilter(value ?? "all")}
        >
          <SelectTrigger className="w-full border-border bg-card/60 sm:w-56">
            <SelectValue placeholder="All groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {ITEM_GROUPS.map((group) => (
              <SelectItem key={group.value} value={group.value}>
                {group.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border bg-card/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Group</TableHead>
              <TableHead className="text-muted-foreground">Annual</TableHead>
              <TableHead className="text-muted-foreground">Monthly</TableHead>
              <TableHead className="text-muted-foreground">Reference</TableHead>
              <TableHead className="text-muted-foreground">Created</TableHead>
              <TableHead className="text-muted-foreground">Updated</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="size-4 animate-spin" />
                    Loading items…
                  </span>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                  No items found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="border-border hover:bg-accent/40">
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="border border-border bg-secondary text-secondary-foreground"
                    >
                      {groupLabel(item.group)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatMoney(item.annual_price)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatMoney(item.monthly_price)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.reference_code || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(item.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openDetail(item, true)}
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => void handleDelete(item)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetail(item)}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-border bg-popover sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create item</DialogTitle>
            <DialogDescription>
              Pick a company or add a new one. Reference codes are generated automatically.
            </DialogDescription>
          </DialogHeader>
          <ItemForm
            form={form}
            setForm={setForm}
            companyNames={companyNames}
            takenNamesInGroup={items
              .filter((item) => item.group === form.group)
              .map((item) => item.name.toLowerCase())}
            newCompanyName={newCompanyName}
            setNewCompanyName={setNewCompanyName}
            onAddCompany={addCompanyName}
            onClearFormError={() => setFormError(null)}
          />
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={saving || !form.name.trim()}>
              {saving ? <LoaderCircle className="animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setEditing(false);
            setSelected(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent className="border-border bg-popover sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit item" : "Item details"}</DialogTitle>
            <DialogDescription>
              {selected
                ? `ID ${selected.id} · ref ${selected.reference_code ?? "—"}`
                : "Review or update this item."}
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <ItemForm
              form={form}
              setForm={setForm}
              companyNames={companyNames}
              takenNamesInGroup={items
                .filter(
                  (item) =>
                    item.group === form.group && item.id !== selected?.id,
                )
                .map((item) => item.name.toLowerCase())}
              newCompanyName={newCompanyName}
              setNewCompanyName={setNewCompanyName}
              onAddCompany={addCompanyName}
              onClearFormError={() => setFormError(null)}
            />
          ) : selected ? (
            <div className="space-y-3 text-sm">
              <DetailRow label="Name" value={selected.name} />
              <DetailRow label="Group" value={groupLabel(selected.group)} />
              <DetailRow label="Annual" value={formatMoney(selected.annual_price)} />
              <DetailRow label="Monthly" value={formatMoney(selected.monthly_price)} />
              <DetailRow label="Reference" value={selected.reference_code || "—"} />
              <Separator className="bg-border" />
              <DetailRow label="Created" value={formatDate(selected.created_at)} />
              <DetailRow label="Updated" value={formatDate(selected.updated_at)} />
            </div>
          ) : null}

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <DialogFooter>
            {editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selected) setForm(fromItem(selected));
                    setEditing(false);
                    setFormError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleUpdate()}
                  disabled={saving || !form.name.trim()}
                >
                  {saving ? <LoaderCircle className="animate-spin" /> : null}
                  Save changes
                </Button>
              </>
            ) : (
              <>
                {selected ? (
                  <Button
                    variant="outline"
                    onClick={() => void handleDelete(selected)}
                  >
                    <Trash2 className="text-destructive" />
                    Delete
                  </Button>
                ) : null}
                <Button onClick={() => setEditing(true)}>
                  <Pencil />
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

function ItemForm({
  form,
  setForm,
  companyNames,
  takenNamesInGroup,
  newCompanyName,
  setNewCompanyName,
  onAddCompany,
  onClearFormError,
}: {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  companyNames: string[];
  takenNamesInGroup: string[];
  newCompanyName: string;
  setNewCompanyName: Dispatch<SetStateAction<string>>;
  onAddCompany: () => void;
  onClearFormError: () => void;
}) {
  const selectValue = form.name || undefined;
  const availableCompanies = companyNames.filter(
    (name) => !takenNamesInGroup.includes(name.toLowerCase()),
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Company name</Label>
        <Select
          value={selectValue}
          onValueChange={(value) => {
            if (!value) return;
            onClearFormError();
            setForm((prev) => ({ ...prev, name: value }));
          }}
        >
          <SelectTrigger className="w-full border-border bg-input/40">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {availableCompanies.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {availableCompanies.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            All listed companies are already used in this group — add a new company below.
          </p>
        ) : null}
        {form.name ? (
          <p className="text-xs text-muted-foreground">Selected: {form.name}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Only one of each company name is allowed per group.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="new-company">Add new company</Label>
        <div className="flex gap-2">
          <Input
            id="new-company"
            className="border-border bg-input/40"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            placeholder="Type a new company name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddCompany();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={onAddCompany}>
            <Plus />
            Add
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Group</Label>
        <Select
          value={form.group}
          onValueChange={(value) => {
            if (!value) return;
            onClearFormError();
            setForm((prev) => {
              const nextGroup = value as ItemGroup;
              // Parent recomputes takenNamesInGroup after render; clear name if
              // it would collide once group changes (checked on next interaction too).
              return { ...prev, group: nextGroup };
            });
          }}
        >
          <SelectTrigger className="w-full border-border bg-input/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ITEM_GROUPS.map((group) => (
              <SelectItem key={group.value} value={group.value}>
                {group.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="annual_price">Annual price</Label>
          <Input
            id="annual_price"
            className="border-border bg-input/40"
            inputMode="decimal"
            value={form.annual_price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, annual_price: e.target.value }))
            }
            placeholder="1848.00"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="monthly_price">Monthly price</Label>
          <Input
            id="monthly_price"
            className="border-border bg-input/40"
            inputMode="decimal"
            value={form.monthly_price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, monthly_price: e.target.value }))
            }
            placeholder="154.00"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Reference code is assigned automatically by the API and must be unique.
        Annual prices, monthly prices, created times, and updated times are also
        unique across the database — and annual must differ from monthly.
      </p>
    </div>
  );
}
