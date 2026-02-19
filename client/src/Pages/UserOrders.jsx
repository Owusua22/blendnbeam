// src/pages/UserOrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchUserOrdersThunk,
  fetchOrderByIdThunk,
  cancelOrderThunk,
  resetOrderState,
} from "../Redux/slice/orderSlice";
import {
  Package,
  Eye,
  X,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  ChevronRight,
  Loader2,
  CreditCard,
  MapPin,
  Calendar,
  Hash,
  Ban,
  ArrowLeft,
  FileText,
  CircleDot,
  RefreshCw,
  Info,
} from "lucide-react";

/* ═══════════ Helpers ═══════════ */

const formatGHS = (v) =>
  Number(v || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusConfig = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    cls: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    icon: Clock,
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    cls: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  refunded: {
    label: "Refunded",
    icon: RefreshCw,
    cls: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    icon: CircleDot,
    cls: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
};

const getStatus = (s) =>
  statusConfig[(s || "pending").toLowerCase()] || statusConfig.pending;

const canCancel = (s) =>
  ["pending", "processing"].includes((s || "").toLowerCase());

const sumQty = (items = []) =>
  items.reduce((a, i) => a + Number(i.quantity || 0), 0);

/* ═══════════ Status Badge ═══════════ */

const StatusBadge = ({ status, size = "sm" }) => {
  const cfg = getStatus(status);
  const Icon = cfg.icon;
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-semibold rounded-full
        ${isSm ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"} ${cfg.cls}`}
    >
      <Icon size={isSm ? 12 : 14} />
      {cfg.label}
    </span>
  );
};

/* ═══════════ Payment Badge ═══════════ */

const PaidBadge = ({ isPaid }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold 
      rounded-full border ${
        isPaid
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-gray-50 text-gray-500 border-gray-200"
      }`}
  >
    {isPaid ? <CheckCircle size={11} /> : <Clock size={11} />}
    {isPaid ? "Paid" : "Unpaid"}
  </span>
);

/* ═══════════ Order Detail Modal ═══════════ */

const OrderDetailModal = ({
  open,
  onClose,
  order,
  loading,
  error,
  onCancel,
  cancelling,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-lg max-h-[90vh] bg-white 
          rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden
          animate-[slideUp_0.3s_ease-out] flex flex-col"
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Order Details
            </h3>
            {order?._id && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                #{order._id.slice(-8).toUpperCase()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {order && canCancel(order.status) && (
              <button
                onClick={() => onCancel(order._id)}
                disabled={cancelling}
                className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 
                  border border-rose-200 rounded-xl hover:bg-rose-100 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? "Cancelling…" : "Cancel"}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl 
                bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="text-emerald-500 animate-spin" />
              <p className="text-sm text-gray-500">Loading order…</p>
            </div>
          )}

          {error && !loading && (
            <div className="m-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
              {typeof error === "string"
                ? error
                : error?.message || "Something went wrong"}
            </div>
          )}

          {!loading && order && (
            <div className="p-5 space-y-4">
              {/* Status + Date row */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <StatusBadge status={order.status} size="md" />
                <div className="flex items-center gap-3">
                  <PaidBadge isPaid={order.isPaid} />
                  <span className="text-xs text-gray-400">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Package size={14} className="text-emerald-600" />
                    Items ({sumQty(order.orderItems)})
                  </h4>
                </div>
                <div className="divide-y divide-gray-50">
                  {order.orderItems?.map((it, idx) => (
                    <div
                      key={it.productId || idx}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={18} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {it.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-gray-400">
                            Qty: {it.quantity}
                          </span>
                          {it.size && (
                            <span className="text-[11px] text-gray-400">
                              • {it.size}
                            </span>
                          )}
                          {it.color && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                              •
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-gray-200"
                                style={{ backgroundColor: it.color }}
                              />
                              {it.color}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        ₵
                        {formatGHS(
                          Number(it.price || 0) * Number(it.quantity || 0)
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">
                      ₵{formatGHS(order.itemsPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-medium">
                      ₵{formatGHS(order.taxPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span
                      className={`font-medium ${
                        order.shippingPricePending
                          ? "text-amber-600 text-xs"
                          : ""
                      }`}
                    >
                      {order.shippingPricePending
                        ? "Pending"
                        : `₵${formatGHS(order.shippingPrice)}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-extrabold text-emerald-700 text-base">
                      ₵{formatGHS(order.totalPrice)}
                      {order.shippingPricePending && (
                        <span className="block text-[10px] text-amber-500 font-medium text-right">
                          + shipping
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MapPin size={14} className="text-blue-600" />
                    Shipping
                  </h4>
                </div>
                <div className="px-4 py-3 space-y-2.5 text-sm">
                  {order.shippingLocation?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Zone</span>
                      <span className="font-medium text-gray-900">
                        {order.shippingLocation.name}
                      </span>
                    </div>
                  )}
                  {order.customLocationName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Location</span>
                      <span className="font-medium text-amber-700">
                        {order.customLocationName}
                      </span>
                    </div>
                  )}
                  {order.shippingLocation?.estimate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. delivery</span>
                      <span className="font-medium text-gray-900">
                        {order.shippingLocation.estimate}
                      </span>
                    </div>
                  )}
                  {order.shippingAddress && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 flex-shrink-0">
                        Address
                      </span>
                      <span className="font-medium text-gray-900 text-right">
                        {[
                          order.shippingAddress.name,
                          order.shippingAddress.street,
                          order.shippingAddress.city,
                          order.shippingAddress.state,
                          order.shippingAddress.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  {order.shippingAddress?.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-gray-900">
                        {order.shippingAddress.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard size={14} className="text-violet-600" />
                    Payment
                  </h4>
                </div>
                <div className="px-4 py-3 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {(order.paymentMethod || "—").replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`font-medium ${
                        order.isPaid ? "text-emerald-600" : "text-gray-500"
                      }`}
                    >
                      {order.isPaid
                        ? `Paid · ${formatDate(order.paidAt)}`
                        : "Not paid"}
                    </span>
                  </div>
                  {order.isDelivered && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivered</span>
                      <span className="font-medium text-emerald-600">
                        {formatDate(order.deliveredAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping pending notice */}
              {order.shippingPricePending && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <Info
                    size={14}
                    className="text-amber-500 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Delivery fee will be provided by the seller after
                    confirming your location
                    {order.customLocationName && (
                      <span className="font-semibold">
                        {" "}
                        ({order.customLocationName})
                      </span>
                    )}
                    .
                  </p>
                </div>
              )}

              {/* Note */}
              {order.note && (
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <FileText size={14} className="text-gray-600" />
                      Note
                    </h4>
                  </div>
                  <p className="px-4 py-3 text-sm text-gray-700">
                    {order.note}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════ Order Card ═══════════ */

const OrderCard = ({ order, onView, onCancel, cancelling }) => {
  const itemCount = sumQty(order.orderItems);
  const cancellable = canCancel(order.status);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden 
        hover:shadow-md hover:border-gray-300 transition-all duration-300"
    >
      {/* Top row */}
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900 font-mono">
              #{order._id?.slice(-8).toUpperCase()}
            </span>
            <StatusBadge status={order.status} />
            <PaidBadge isPaid={order.isPaid} />
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(order.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Package size={11} />
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            {order.shippingLocation?.name && (
              <span className="hidden sm:flex items-center gap-1">
                <MapPin size={11} />
                {order.shippingLocation.name}
              </span>
            )}
            {order.customLocationName && (
              <span className="hidden sm:flex items-center gap-1 text-amber-500">
                <MapPin size={11} />
                {order.customLocationName}
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-lg font-extrabold text-gray-900 tracking-tight">
            ₵{formatGHS(order.totalPrice)}
          </p>
          {order.shippingPricePending && (
            <span className="text-[10px] text-amber-500 font-medium">
              + shipping
            </span>
          )}
        </div>
      </div>

      {/* Item thumbnails */}
      {order.orderItems?.length > 0 && (
        <div className="px-4 pb-2 flex items-center gap-1.5">
          {order.orderItems.slice(0, 5).map((it, idx) => (
            <div
              key={it.productId || idx}
              className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0"
            >
              {it.image ? (
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package size={12} />
                </div>
              )}
            </div>
          ))}
          {order.orderItems.length > 5 && (
            <span className="text-[11px] text-gray-400 font-medium ml-1">
              +{order.orderItems.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={() => onView(order._id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 
            bg-gray-900 text-white text-xs font-bold rounded-xl 
            hover:bg-gray-800 active:scale-[0.98] transition-all"
        >
          <Eye size={14} />
          View Details
        </button>

        {cancellable && (
          <button
            onClick={() => onCancel(order._id)}
            disabled={cancelling}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4
              text-xs font-bold rounded-xl border-2 border-gray-200
              text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98] transition-all"
          >
            <Ban size={13} />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

/* ═══════════ Empty State ═══════════ */

const EmptyState = ({ onShop }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-5">
      <ShoppingBag size={36} className="text-gray-300" strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
    <p className="text-sm text-gray-500 mt-1.5 max-w-[240px]">
      When you place an order, it will appear here for you to track.
    </p>
    <button
      onClick={onShop}
      className="mt-6 flex items-center gap-2 px-6 py-3 bg-gray-900 text-white 
        text-sm font-bold rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all"
    >
      <ShoppingBag size={16} />
      Start Shopping
    </button>
  </div>
);

/* ═══════════ Main Page ═══════════ */

export default function UserOrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((s) => s.auth);
  const { userOrders, currentOrder, loading, error } = useSelector(
    (s) => s.orders
  );

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const modalLoading = useMemo(
    () => detailsOpen && loading && !!selectedId,
    [detailsOpen, loading, selectedId]
  );

  useEffect(() => {
    if (!userInfo?.token) {
      navigate("/login");
      return;
    }
    dispatch(fetchUserOrdersThunk(userInfo.token));
  }, [dispatch, userInfo?.token, navigate]);

  const onView = (id) => {
    if (!userInfo?.token) return;
    setSelectedId(id);
    setDetailsOpen(true);
    dispatch(resetOrderState());
    dispatch(fetchOrderByIdThunk({ id, token: userInfo.token }));
  };

  const onCancel = async (id) => {
    if (!userInfo?.token) return;
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;

    setCancellingId(id);
    try {
      await dispatch(
        cancelOrderThunk({ id, token: userInfo.token })
      ).unwrap();
      if (selectedId === id) {
        dispatch(fetchOrderByIdThunk({ id, token: userInfo.token }));
      }
      // Refresh the list
      dispatch(fetchUserOrdersThunk(userInfo.token));
    } catch (err) {
      alert(
        typeof err === "string" ? err : err?.message || "Failed to cancel"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const closeModal = () => {
    setDetailsOpen(false);
    setSelectedId(null);
  };

  const isLoading = loading && !detailsOpen;
  const hasOrders = !isLoading && !error && userOrders?.length > 0;
  const isEmpty = !isLoading && !error && (!userOrders || !userOrders.length);

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 
                flex items-center justify-center text-gray-400 
                hover:text-gray-700 hover:border-gray-300 transition-all md:hidden"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                My Orders
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Track and manage your purchases
              </p>
            </div>
          </div>

          {userOrders?.length > 0 && (
            <span
              className="text-xs font-bold text-gray-500 bg-white border border-gray-200 
              px-3 py-1.5 rounded-full"
            >
              {userOrders.length}{" "}
              {userOrders.length === 1 ? "order" : "orders"}
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="text-emerald-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading your orders…</p>
          </div>
        )}

        {/* Error */}
        {error && !detailsOpen && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="text-rose-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-rose-800">
                Failed to load orders
              </p>
              <p className="text-xs text-rose-600 mt-0.5">
                {typeof error === "string"
                  ? error
                  : error?.message || "Please try again."}
              </p>
              <button
                onClick={() =>
                  dispatch(fetchUserOrdersThunk(userInfo?.token))
                }
                className="mt-3 text-xs font-semibold text-rose-700 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {isEmpty && <EmptyState onShop={() => navigate("/")} />}

        {/* Orders List */}
        {hasOrders && (
          <div className="space-y-3">
            {userOrders.map((order, idx) => (
              <div
                key={order._id}
                className="animate-[slideUp_0.3s_ease-out]"
                style={{
                  animationDelay: `${idx * 40}ms`,
                  animationFillMode: "both",
                }}
              >
                <OrderCard
                  order={order}
                  onView={onView}
                  onCancel={onCancel}
                  cancelling={cancellingId === order._id}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <OrderDetailModal
        open={detailsOpen}
        onClose={closeModal}
        order={currentOrder}
        loading={modalLoading}
        error={detailsOpen ? error : null}
        onCancel={onCancel}
        cancelling={!!cancellingId && currentOrder?._id === cancellingId}
      />
    </div>
  );
}