import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createBannerThunk,
  deleteBannerThunk,
  fetchAllBannersThunk,
  resetBannerState,
  updateBannerThunk,
} from "../../Redux/slice/bannerSlice";
import {
  ImagePlus,
  Trash2,
  Save,
  RefreshCw,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Plus,
  X,
} from "lucide-react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="text-sm font-black text-slate-900">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
            title="Close"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function BannerForm({
  mode = "create", // "create" | "edit"
  initialValues,
  loading,
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [subtitle, setSubtitle] = useState(initialValues?.subtitle || "");
  const [link, setLink] = useState(initialValues?.link || "");
  const [isActive, setIsActive] = useState(
    initialValues?.isActive ?? true
  );
  const [position, setPosition] = useState(initialValues?.position ?? 0);
  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(initialValues?.image?.url || "");

  useEffect(() => {
    // update when modal opens with different initial values
    setTitle(initialValues?.title || "");
    setSubtitle(initialValues?.subtitle || "");
    setLink(initialValues?.link || "");
    setIsActive(initialValues?.isActive ?? true);
    setPosition(initialValues?.position ?? 0);
    setImage(null);
    setPreview(initialValues?.image?.url || "");
  }, [initialValues]);

  const handleFile = (file) => {
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(initialValues?.image?.url || "");
    }
  };

  const submit = (e) => {
    e.preventDefault();

    if (mode === "create" && !image) {
      alert("Please select an image");
      return;
    }

    const payload = {
      title,
      subtitle,
      link,
      isActive,
      position,
      ...(image ? { image } : {}),
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      {/* Preview */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-start gap-3">
          <div className="h-24 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-xs font-semibold text-slate-500">
                No image
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="text-xs font-extrabold text-slate-600">Preview</div>
            <div className="mt-1 text-sm font-black text-slate-900">
              {title || "Banner title"}
            </div>
            <div className="mt-1 text-sm font-medium text-slate-600">
              {subtitle || "Banner subtitle"}
            </div>
            {link ? (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-extrabold text-slate-700">
                <ExternalLink className="h-3.5 w-3.5" />
                {link}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs font-extrabold text-slate-600">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="e.g. Big Sale"
          />
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600">Subtitle</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="e.g. Up to 50% off"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-extrabold text-slate-600">Link</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="/sale or https://..."
          />
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600">Position</label>
          <input
            type="number"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-xs font-extrabold text-slate-600">Active</div>
            <div className="mt-1 text-xs font-semibold text-slate-600">
              {isActive ? "Visible on homepage" : "Hidden"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-extrabold",
              isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-slate-50 text-slate-700"
            )}
          >
            {isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {isActive ? "Active" : "Inactive"}
          </button>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-extrabold text-slate-600">
            {mode === "create" ? "Image (required)" : "Replace image (optional)"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-black text-white shadow-lg shadow-emerald-600/20 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : mode === "create" ? "Create Banner" : "Update Banner"}
        </button>
      </div>
    </form>
  );
}

export default function BannersPage() {
  const dispatch = useDispatch();
  const { all, loading, error, success } = useSelector((s) => s.banners);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchAllBannersThunk());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => dispatch(resetBannerState()), 800);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  const sorted = useMemo(() => {
    return [...(all || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [all]);

  const openEdit = (banner) => {
    setSelected(banner);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setSelected(null);
    setEditOpen(false);
  };

  const onCreate = async (payload) => {
    await dispatch(createBannerThunk(payload));
    setCreateOpen(false);
  };

  const onUpdate = async (updates) => {
    if (!selected?._id) return;
    await dispatch(updateBannerThunk({ id: selected._id, updates }));
    closeEdit();
  };

  const onDelete = async (id) => {
    const ok = confirm("Delete this banner?");
    if (!ok) return;
    await dispatch(deleteBannerThunk(id));
  };

  const quickToggleActive = async (b) => {
    await dispatch(updateBannerThunk({ id: b._id, updates: { isActive: !b.isActive } }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-extrabold text-emerald-700">Admin · Banners</div>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              Banner Management
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Create, edit, activate, and delete homepage banners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-black text-white shadow-lg shadow-emerald-600/20"
            >
              <Plus className="h-4 w-4" />
              New banner
            </button>

            <button
              onClick={() => dispatch(fetchAllBannersThunk())}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        {/* List */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-black text-slate-900">
                  All banners ({sorted.length})
                </div>
                <div className="mt-1 text-sm font-medium text-slate-600">
                  Ordered by position
                </div>
              </div>

              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
                Tip: lower position shows first
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {sorted.map((b) => (
              <div key={b._id} className="p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-3">
                    <div className="h-20 w-36 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <img
                        src={b.image?.url}
                        alt={b.title || "Banner"}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-900">
                        {b.title || "Untitled banner"}
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-600">
                        {b.subtitle || "—"}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
                            b.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          )}
                        >
                          {b.isActive ? "Active" : "Inactive"}
                        </span>

                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-slate-700">
                          Position: {b.position ?? 0}
                        </span>

                        {b.link ? (
                          <a
                            href={b.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-slate-700 hover:bg-slate-50"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Link
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* actions */}
                  <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                    <button
                      onClick={() => quickToggleActive(b)}
                      disabled={loading}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-extrabold disabled:opacity-60",
                        b.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      )}
                      title="Toggle active"
                    >
                      {b.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      Toggle
                    </button>

                    <button
                      onClick={() => openEdit(b)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(b._id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {sorted.length === 0 && !loading && (
              <div className="p-10 text-center text-sm font-semibold text-slate-600">
                No banners yet. Click <span className="font-black">New banner</span> to upload one.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} title="Create Banner" onClose={() => setCreateOpen(false)}>
        <BannerForm
          mode="create"
          loading={loading}
          initialValues={{
            title: "",
            subtitle: "",
            link: "",
            isActive: true,
            position: 0,
            image: { url: "" },
          }}
          onCancel={() => setCreateOpen(false)}
          onSubmit={onCreate}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} title="Edit Banner" onClose={closeEdit}>
        <BannerForm
          mode="edit"
          loading={loading}
          initialValues={selected}
          onCancel={closeEdit}
          onSubmit={onUpdate}
        />
      </Modal>
    </div>
  );
}