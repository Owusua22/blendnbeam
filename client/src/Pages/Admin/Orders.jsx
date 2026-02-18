// src/Pages/Admin/OrdersAdminPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrdersThunk,
  updateOrderStatusThunk,
  toggleOrderPaidThunk,
} from "../../Redux/slice/orderSlice";
import {
  CalendarClock,
  RefreshCw,
  MapPin,
  User,
  Package,
  ChevronDown,
  Check,
  X,
  Printer,
  Pencil,
  XCircle,
  Search,
  Phone,
  Mail,
} from "lucide-react";

/* ---------------- helpers ---------------- */
const formatGHS = (v) =>
  Number(v || 0).toLocaleString("en-GH", { style: "currency", currency: "GHS" });

const formatDateTime = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleString("en-GB");
};

const statusMeta = {
  pending: { label: "Pending", pill: "bg-amber-50 text-amber-900 border-amber-200" },
  processing: { label: "Processing", pill: "bg-blue-50 text-blue-900 border-blue-200" },
  shipped: { label: "Shipped", pill: "bg-purple-50 text-purple-900 border-purple-200" },
  delivered: { label: "Delivered", pill: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  completed: { label: "Completed", pill: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  cancelled: { label: "Cancelled", pill: "bg-red-50 text-red-900 border-red-200" },
  refunded: { label: "Refunded", pill: "bg-slate-50 text-slate-900 border-slate-200" },
  "not answered": { label: "Not answered", pill: "bg-orange-50 text-orange-900 border-orange-200" },
};

const ALL_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
  "not answered",
];

const getPhone = (o) => o?.user?.phone || o?.shippingAddress?.phone || "—";

const itemsText = (items = []) =>
  (items || []).map((it) => `${it?.name || "Item"} x${it?.quantity ?? 0}`).join(", ");

/* ---------------- small UI pieces ---------------- */
function StatusPill({ status }) {
  const meta = statusMeta[status] || {
    label: status,
    pill: "bg-slate-50 text-slate-800 border-slate-200",
  };
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold capitalize",
        meta.pill,
      ].join(" ")}
      title={status}
    >
      {meta.label}
    </span>
  );
}

function PaidToggle({ value, disabled, onChange }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full border transition",
        value ? "bg-emerald-600 border-emerald-600" : "bg-slate-200 border-slate-300",
        disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-95",
      ].join(" ")}
      title={value ? "Mark as Unpaid" : "Mark as Paid"}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
          value ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="text-sm font-black text-slate-900">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
            title="Close"
          >
            <XCircle className="h-5 w-5 text-slate-700" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* ---------- A4 invoice UI (modern) ---------- */
function InvoiceA4({ order }) {
  if (!order) return null;

  const addr = order.shippingAddress || {};
  const shipLoc = order.shippingLocation || {};
  const items = order.orderItems || [];

  const subtotal = Number(order.itemsPrice || 0);
  const tax = Number(order.taxPrice || 0);
  const shipping = Number(order.shippingPrice || 0);
  const total = Number(order.totalPrice || 0);

  return (
    <div
      id="invoice"
      className="bg-white text-slate-900"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "16mm",
      }}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-600" />
            <div>
              <div className="text-xl font-black tracking-tight">Blend & Beam</div>
              <div className="text-xs font-semibold text-slate-600">
                Invoice / Receipt (A4)
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-1 text-xs font-semibold text-slate-700">
            <div>
              <span className="text-slate-500">Invoice #:</span>{" "}
              <span className="font-black">{order._id}</span>
            </div>
            <div>
              <span className="text-slate-500">Order date:</span>{" "}
              <span className="font-black">{formatDateTime(order.createdAt)}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>{" "}
              <span className="font-black capitalize">{order.status}</span>
            </div>
          </div>
        </div>

        <div className="w-[280px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-extrabold text-slate-600">Amount</div>
          <div className="mt-1 text-2xl font-black">{formatGHS(total)}</div>
          <div className="mt-2 text-xs font-semibold text-slate-700">
            <span className="text-slate-500">Payment:</span>{" "}
            <span className="font-black capitalize">{order.paymentMethod || "—"}</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-700">
            <span className="text-slate-500">Paid:</span>{" "}
            <span className="font-black">{order.isPaid ? "Yes" : "No"}</span>
          </div>
          {order.paidAt ? (
            <div className="mt-1 text-xs font-semibold text-slate-700">
              <span className="text-slate-500">Paid at:</span>{" "}
              <span className="font-black">{formatDateTime(order.paidAt)}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="my-6 h-px bg-slate-200" />

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-extrabold text-slate-600">Sold By</div>
          <div className="mt-2 text-sm font-black">Blend & Beam</div>
          <div className="mt-1 text-xs font-semibold text-slate-700">Accra, Ghana</div>
          <div className="mt-1 text-xs font-semibold text-slate-700">
            Email: info@blendandbeam.com
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-700">
            Phone: +233554671026
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-extrabold text-slate-600">Billed / Shipped To</div>
          <div className="mt-2 text-sm font-black">{addr.name || order.user?.name || "—"}</div>
          <div className="mt-1 text-xs font-semibold text-slate-700">{addr.street || "—"}</div>
          <div className="mt-1 text-xs font-semibold text-slate-700">
            {[addr.city, addr.state, addr.country].filter(Boolean).join(", ") || "—"}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-700">
            Phone: {addr.phone || order.user?.phone || "—"}
          </div>
          <div className="mt-3 text-xs font-semibold text-slate-700">
            <span className="text-slate-500">Shipping zone:</span>{" "}
            <span className="font-black">{shipLoc.name || "—"}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">Item</th>
              <th className="px-4 py-3 text-right text-xs font-extrabold text-slate-600">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-extrabold text-slate-600">Unit</th>
              <th className="px-4 py-3 text-right text-xs font-extrabold text-slate-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => {
              const lineTotal = Number(it.price || 0) * Number(it.quantity || 0);
              return (
                <tr key={i} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {it.image ? (
                          <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900">{it.name}</div>
                        <div className="mt-0.5 text-xs font-semibold text-slate-600">
                          {it.color ? `Color: ${it.color}` : ""}
                          {it.size ? ` · Size: ${it.size}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                    {it.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                    {formatGHS(it.price)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-black text-slate-900">
                    {formatGHS(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-black text-slate-900">{formatGHS(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate-700">
            <span className="text-slate-500">Tax</span>
            <span className="font-black text-slate-900">{formatGHS(tax)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate-700">
            <span className="text-slate-500">Shipping</span>
            <span className="font-black text-slate-900">{formatGHS(shipping)}</span>
          </div>

          <div className="my-3 h-px bg-slate-200" />

          <div className="flex items-center justify-between text-base font-black text-slate-900">
            <span>Total</span>
            <span>{formatGHS(total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-xs font-semibold text-slate-600">
        Thank you for shopping with Blend & Beam. This document is generated electronically.
      </div>
    </div>
  );
}

function printInvoice() {
  const el = document.getElementById("invoice");
  if (!el) return;

  const win = window.open("", "_blank", "width=1000,height=700");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Invoice</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { margin: 0; font-family: Arial, sans-serif; background: #fff; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          img { max-width: 100%; }
        </style>
      </head>
      <body>
        ${el.outerHTML}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

/* ---------------- page ---------------- */
export default function OrdersAdminPage() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((s) => s.orders);
  const { userInfo } = useSelector((s) => s.auth);
  const token = userInfo?.token;

  // filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [paidFilter, setPaidFilter] = useState("all"); // all | paid | unpaid
  const [search, setSearch] = useState("");

  // pagination
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // actions
  const [busyId, setBusyId] = useState(null);

  // modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [nextStatus, setNextStatus] = useState("");

  useEffect(() => {
    if (token) dispatch(fetchAllOrdersThunk());
  }, [dispatch, token]);

  const filtered = useMemo(() => {
    let list = orders || [];

    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (paidFilter === "paid") list = list.filter((o) => o.isPaid === true);
    if (paidFilter === "unpaid") list = list.filter((o) => o.isPaid === false);

    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((o) => {
      const id = String(o._id || "").toLowerCase();
      const name = String(o.user?.name || "").toLowerCase();
      const email = String(o.user?.email || "").toLowerCase();
      const phone = String(getPhone(o) || "").toLowerCase();
      const status = String(o.status || "").toLowerCase();
      const items = itemsText(o.orderItems).toLowerCase();
      return (
        id.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        status.includes(q) ||
        items.includes(q)
      );
    });
  }, [orders, statusFilter, paidFilter, search]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const refetch = async () => {
    await dispatch(fetchAllOrdersThunk());
  };

  const onTogglePaid = async (id, isPaid) => {
    if (!token) return;
    setBusyId(id);
    try {
      await dispatch(toggleOrderPaidThunk({ id, isPaid, token })).unwrap();
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNextStatus(order?.status || "pending");
    setStatusModalOpen(true);
  };

  const saveStatus = async () => {
    if (!token || !selectedOrder?._id || !nextStatus) return;
    setBusyId(selectedOrder._id);
    try {
      await dispatch(
        updateOrderStatusThunk({ id: selectedOrder._id, status: nextStatus, token })
      ).unwrap();
      await refetch();
      setStatusModalOpen(false);
    } finally {
      setBusyId(null);
    }
  };

  const openInvoice = (order) => {
    setSelectedOrder(order);
    setInvoiceOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50 font-sans">
      <div className="mx-auto px-2 py-2">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
              <Package className="h-4 w-4" />
              Admin · Orders
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Orders
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Search, filter (paid/unpaid), update status, and print invoices.
            </p>
          </div>

          <button
            onClick={() => dispatch(fetchAllOrdersThunk())}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-extrabold text-slate-600">
                Search
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 ring-emerald-200 focus-within:ring-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Order id, customer, phone, item..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Status */}
            <div className="relative">
              <label className="mb-1 block text-xs font-extrabold text-slate-600">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-2 pr-9 text-sm font-extrabold text-slate-800 outline-none ring-emerald-200 focus:ring-2"
              >
                <option value="all">All statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusMeta[s]?.label || s}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-slate-400" />
            </div>

            {/* Paid */}
            <div className="relative">
              <label className="mb-1 block text-xs font-extrabold text-slate-600">
                Payment
              </label>
              <select
                value={paidFilter}
                onChange={(e) => {
                  setPaidFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-2 pr-9 text-sm font-extrabold text-slate-800 outline-none ring-emerald-200 focus:ring-2"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-[38px] h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Pagination controls */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-600">
              Showing <span className="font-black text-slate-900">{filtered.length}</span> order(s)
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-600">Page size</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-2 pr-9 text-sm font-extrabold text-slate-800 outline-none ring-emerald-200 focus:ring-2"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1400px] w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">
                    Order / Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">
                    Shipping
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-4 py-4" colSpan={8}>
                        <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center">
                      <div className="text-sm font-black text-slate-900">No orders found</div>
                      <div className="mt-1 text-sm font-medium text-slate-600">
                        Try changing search/filters.
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((o, idx) => {
                    const addr = o.shippingAddress || {};
                    const shipLoc = o.shippingLocation || {};
                    const zebra = idx % 2 === 0 ? "bg-white" : "bg-slate-50/50";

                    return (
                      <tr key={o._id} className={`border-b border-slate-100 ${zebra}`}>
                        {/* Order */}
                        <td className="px-4 py-4 align-top">
                          <div className="text-sm font-black text-slate-900">
                            <span className="font-mono">#{o._id?.slice(-8)}</span>
                          </div>
                          <div className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <CalendarClock className="h-4 w-4 text-slate-400" />
                            {formatDateTime(o.createdAt)}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-4 align-top">
                          <div className="inline-flex items-center gap-2 text-xs font-black text-slate-900">
                            <User className="h-4 w-4 text-slate-500" />
                            {o.user?.name || "—"}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="truncate max-w-[260px]">{o.user?.email || "—"}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span>{getPhone(o)}</span>
                          </div>
                        </td>

                        {/* Shipping */}
                        <td className="px-4 py-4 align-top">
                          <div className="inline-flex items-center gap-2 text-xs font-black text-slate-900">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            {shipLoc?.name || "—"}
                            {shipLoc?.deliveryCharge !== undefined ? (
                              <span className="text-xs font-semibold text-slate-600">
                                · {formatGHS(shipLoc.deliveryCharge)}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-2 text-xs font-semibold text-slate-700">
                            <div>
                              <span className="text-slate-500">Name:</span> {addr?.name || "—"}
                            </div>
                            <div className="truncate max-w-[280px]">
                              <span className="text-slate-500">Street:</span> {addr?.street || "—"}
                            </div>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-4 py-4 align-top">
                          <div className="space-y-2">
                            {(o.orderItems || []).map((item, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-8 w-8 rounded-md border border-slate-200 object-cover"
                                />
                                <div className="min-w-0">
                                  <div className="truncate text-xs font-bold text-slate-800 max-w-[320px]">
                                    {item.name}
                                  </div>
                                  <div className="text-[11px] font-semibold text-slate-600">
                                    Qty: {item.quantity}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-4 align-top">
                          <div className="text-sm font-black text-slate-900">
                            {formatGHS(o.totalPrice)}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-600">
                            Items: {formatGHS(o.itemsPrice)} · Ship: {formatGHS(o.shippingPrice)}
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-4 align-top">
                          <div className="text-xs font-semibold text-slate-700">
                            Method:{" "}
                            <span className="font-black text-slate-900">{o.paymentMethod || "—"}</span>
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <PaidToggle
                              value={Boolean(o.isPaid)}
                              disabled={busyId === o._id}
                              onChange={(nextPaid) => onTogglePaid(o._id, nextPaid)}
                            />
                            <span
                              className={[
                                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
                                o.isPaid
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                  : "border-slate-200 bg-slate-50 text-slate-700",
                              ].join(" ")}
                            >
                              {o.isPaid ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                              {o.isPaid ? "Paid" : "Unpaid"}
                            </span>
                          </div>

                          {o.paidAt ? (
                            <div className="mt-1 text-[11px] font-semibold text-slate-600">
                              Paid at: {formatDateTime(o.paidAt)}
                            </div>
                          ) : null}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 align-top">
                          <StatusPill status={o.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => openStatusModal(o)}
                              disabled={busyId === o._id}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                            >
                              <Pencil className="h-4 w-4" />
                              Update status
                            </button>

                            <button
                              onClick={() => openInvoice(o)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-900 hover:bg-emerald-100"
                            >
                              <Printer className="h-4 w-4" />
                              Print invoice
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-3">
            <div className="text-xs font-semibold text-slate-600">
              Page <span className="font-black text-slate-900">{safePage}</span> of{" "}
              <span className="font-black text-slate-900">{totalPages}</span> ·{" "}
              <span className="font-black text-slate-900">{filtered.length}</span> total
            </div>

            <div className="flex items-center gap-1">
              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                onClick={() => setPage(1)}
                disabled={safePage === 1}
              >
                First
              </button>
              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                Prev
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const start = Math.max(1, safePage - 2);
                const p = Math.min(totalPages, start + i);
                const active = p === safePage;

                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={[
                      "rounded-xl px-3 py-2 text-xs font-extrabold border",
                      active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </button>
              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        open={statusModalOpen}
        title={`Update Status · #${selectedOrder?._id?.slice(-8) || ""}`}
        onClose={() => setStatusModalOpen(false)}
      >
        <div className="grid gap-3">
          <div className="text-sm font-semibold text-slate-600">
            Current:{" "}
            <span className="font-black text-slate-900 capitalize">
              {selectedOrder?.status}
            </span>
          </div>

          <div className="relative">
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-2 pr-9 text-sm font-extrabold text-slate-800 outline-none ring-emerald-200 focus:ring-2"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusMeta[s]?.label || s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            onClick={saveStatus}
            disabled={!nextStatus || busyId === selectedOrder?._id}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 disabled:opacity-60"
          >
            {busyId === selectedOrder?._id ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        open={invoiceOpen}
        title={`Invoice · #${selectedOrder?._id?.slice(-8) || ""}`}
        onClose={() => setInvoiceOpen(false)}
      >
        <div className="grid gap-3">
          <div className="overflow-auto">
            <InvoiceA4 order={selectedOrder} />
          </div>

          <button
            onClick={printInvoice}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </Modal>
    </div>
  );
}