// src/Pages/CartPage.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCart,
  updateCartItemQty,
  removeCartItem,
  clearUserCart,
} from "../Redux/slice/cartSlice";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Truck,
  AlertTriangle,
  X,
  CheckCircle2,
  Loader2,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Package,
  CreditCard,
  Heart,
  RefreshCw,
  Gift,
  Sparkles,
  ShoppingBasket,
} from "lucide-react";

/* ──────────────────── helpers ──────────────────── */
const Spinner = ({ size = 24, className = "" }) => (
  <Loader2
    size={size}
    className={`animate-spin text-emerald-500 ${className}`}
  />
);

const normalizeMsg = (err) =>
  typeof err === "string" ? err : err?.message || "Something went wrong";

const formatPrice = (n) => Number(n || 0).toFixed(2);

/* ──────────────────── Toast ──────────────────── */
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const { type = "info", message = "" } = toast;

  const styles = {
    success: "from-emerald-500 to-emerald-600",
    error: "from-rose-500 to-rose-600",
    info: "from-slate-700 to-slate-800",
  };

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error"
      ? AlertTriangle
      : ShoppingBag;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-[slideUp_0.3s_ease-out]">
      <div
        className={`flex items-center gap-3 text-white px-5 py-3.5 rounded-2xl 
          shadow-[0_8px_32px_rgba(0,0,0,0.2)] bg-gradient-to-r ${styles[type]}
          backdrop-blur-lg`}
      >
        <Icon size={18} className="flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 opacity-80 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

/* ──────────────────── ConfirmDialog ──────────────────── */
const ConfirmDialog = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={loading ? undefined : onClose}
      />
      <div
        className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl 
          shadow-[0_-8px_40px_rgba(0,0,0,0.15)] sm:shadow-2xl 
          animate-[slideUp_0.3s_ease-out] overflow-hidden"
      >
        {/* Drag handle on mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-500 flex-shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              {description && (
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
            <button
              className="px-5 py-3 sm:py-2.5 rounded-xl border border-gray-200 text-gray-700 
                font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all text-center"
              onClick={loading ? undefined : onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="px-5 py-3 sm:py-2.5 rounded-xl text-white bg-rose-500 
                hover:bg-rose-600 active:scale-[0.98] transition-all font-semibold 
                disabled:opacity-70 text-center shadow-lg shadow-rose-500/20"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner size={16} className="text-white" />
                  Removing...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────── Free Shipping Bar ──────────────────── */
const FreeShippingBar = ({ subtotal }) => {
  const threshold = 100;
  const progress = Math.min((subtotal / threshold) * 100, 100);
  const remaining = Math.max(threshold - subtotal, 0);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-100 p-4">
      <div className="flex items-center gap-3">
     
       
      </div>
    </div>
  );
};

/* ──────────────────── CartItem ──────────────────── */
const CartItem = ({ item, onUpdateQty, onRemove }) => {
  const price = Number(item?.price ?? 0) || 0;
  const qty = Number(item.quantity) || 0;
  const subtotal = price * qty;
  const name = item?.name || "Product";
  const image = item?.image || "/placeholder.png";

  const [isRemoving, setIsRemoving] = useState(false);

  return (
    <div
      className={`group relative rounded-2xl bg-white border border-gray-100 
        overflow-hidden transition-all duration-300 
        hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-emerald-100
        ${isRemoving ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
    >
      <div className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="relative flex-shrink-0">
            <div
              className="w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-xl 
              overflow-hidden bg-gray-50 border border-gray-100"
            >
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 
                  group-hover:scale-105"
              />
            </div>
            {/* Mobile delete badge */}
            <button
              onClick={() => onRemove(item._id)}
              className="md:hidden absolute -top-1.5 -right-1.5 w-7 h-7 
                rounded-full bg-white border border-gray-200 shadow-md
                flex items-center justify-center text-gray-400 
                active:bg-rose-50 active:text-rose-500 active:border-rose-200
                transition-all"
              aria-label="Remove item"
            >
              <X size={14} />
            </button>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="text-[15px] sm:text-base font-semibold text-gray-900 
                  line-clamp-2 leading-snug"
                >
                  {name}
                </h3>
                {/* Desktop delete */}
                <button
                  onClick={() => onRemove(item._id)}
                  className="hidden md:flex p-2 rounded-xl text-gray-300 
                    hover:text-rose-500 hover:bg-rose-50 transition-all flex-shrink-0"
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Variants */}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {item.color && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs 
                    font-medium rounded-lg bg-gray-50 text-gray-600"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.color}
                  </span>
                )}
                {item.size && (
                  <span
                    className="inline-flex items-center px-2.5 py-1 text-xs 
                    font-medium rounded-lg bg-gray-50 text-gray-600"
                  >
                    {item.size}
                  </span>
                )}
              </div>
            </div>

            {/* Price & Qty */}
            <div className="mt-3 flex items-end justify-between gap-2">
              <div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  ₵{formatPrice(price)}
                </div>
                {qty > 1 && (
                  <div className="text-[11px] sm:text-xs text-gray-400 font-medium mt-0.5">
                    Total:{" "}
                    <span className="text-emerald-600 font-semibold">
                      ₵{formatPrice(subtotal)}
                    </span>
                  </div>
                )}
              </div>

              {/* Qty Stepper */}
              <div
                className="flex items-center rounded-xl bg-gray-50 border border-gray-200
                overflow-hidden"
              >
                <button
                  onClick={() => onUpdateQty(item._id, qty - 1)}
                  disabled={qty <= 1}
                  className="h-10 w-10 sm:h-9 sm:w-9 flex items-center justify-center 
                    text-gray-500 hover:bg-gray-100 active:bg-gray-200 
                    disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <div
                  className="w-10 sm:w-9 text-center font-bold text-gray-900 text-sm 
                  select-none"
                >
                  {qty}
                </div>
                <button
                  onClick={() => onUpdateQty(item._id, qty + 1)}
                  className="h-10 w-10 sm:h-9 sm:w-9 flex items-center justify-center 
                    text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 
                    active:bg-emerald-100 transition-all"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────── Main Component ──────────────────── */
export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading, error } = useSelector((s) => s.cart);

  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({
    open: false,
    mode: null,
    itemId: null,
    loading: false,
  });
  const [showBreakdown, setShowBreakdown] = useState(false);
  const breakdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const getItemPrice = (item) => Number(item?.price ?? 0) || 0;

  const totals = useMemo(() => {
    const items = cart?.items || [];
    const subtotal = items.reduce(
      (sum, i) => sum + getItemPrice(i) * (Number(i.quantity) || 0),
      0
    );
    const shipping = Number(cart?.shippingPrice) || 0;
    const tax = Number(cart?.taxPrice) || 0;
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
  }, [cart]);

  const totalItems = useMemo(() => {
    return (cart?.items || []).reduce(
      (sum, i) => sum + (Number(i.quantity) || 0),
      0
    );
  }, [cart]);

  const showToastMsg = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleUpdateQuantity = useCallback(
    (itemId, quantity) => {
      if (quantity < 1) return;
      dispatch(updateCartItemQty({ itemId, quantity }))
        .unwrap()
        .then(() => showToastMsg("success", "Cart updated"))
        .catch((err) => showToastMsg("error", normalizeMsg(err)));
    },
    [dispatch, showToastMsg]
  );

  const askRemove = (itemId) =>
    setConfirm({ open: true, mode: "remove", itemId, loading: false });
  const askClear = () =>
    setConfirm({ open: true, mode: "clear", itemId: null, loading: false });
  const closeConfirm = () =>
    setConfirm((s) => ({ ...s, open: false, loading: false }));

  const confirmAction = async () => {
    setConfirm((s) => ({ ...s, loading: true }));
    try {
      if (confirm.mode === "remove" && confirm.itemId) {
        await dispatch(removeCartItem(confirm.itemId)).unwrap();
        showToastMsg("success", "Item removed from cart");
      } else if (confirm.mode === "clear") {
        await dispatch(clearUserCart()).unwrap();
        showToastMsg("success", "Cart cleared");
      }
      closeConfirm();
    } catch (err) {
      showToastMsg("error", normalizeMsg(err));
      setConfirm((s) => ({ ...s, loading: false }));
    }
  };

  const handleCheckout = () => navigate("/checkout");
  const handleContinueShopping = () => navigate("/");

  const errorMsg = error
    ? typeof error === "string"
      ? error
      : error?.message
    : null;

  /* ──────── Loading State ──────── */
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 
            flex items-center justify-center animate-pulse"
          >
            <ShoppingCart size={28} className="text-emerald-500" />
          </div>
          <Spinner
            size={56}
            className="absolute -top-1 -left-1 text-emerald-300"
          />
        </div>
        <p className="text-sm text-gray-400 font-medium animate-pulse">
          Loading your cart...
        </p>
      </div>
    );
  }

  /* ──────── Error State ──────── */
  if (errorMsg && errorMsg !== "Cart not found") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center">
          <div
            className="mx-auto w-20 h-20 rounded-3xl bg-rose-50 
            flex items-center justify-center mb-6"
          >
            <AlertTriangle size={36} className="text-rose-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Couldn't load your cart
          </h3>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            {errorMsg || "Something went wrong. Please try again."}
          </p>
          <button
            onClick={() => dispatch(fetchCart())}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl 
              bg-emerald-500 text-white font-semibold hover:bg-emerald-600 
              active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ──────── Empty Cart ──────── */
  if (!cart?.items?.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center">
          {/* Animated empty cart illustration */}
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-100 
              to-teal-50 animate-[pulse_3s_ease-in-out_infinite]"
            />
            <div
              className="absolute inset-4 rounded-full bg-white shadow-inner 
              flex items-center justify-center"
            >
              <ShoppingCart
                size={40}
                className="text-emerald-300"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
            Looks like you haven't added anything yet. Discover products you'll
            love!
          </p>

          <button
            onClick={handleContinueShopping}
            className="mt-8 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl 
              bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold 
              hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.97] 
              transition-all shadow-xl shadow-emerald-500/25"
          >
            <ShoppingBag size={20} />
            Start Shopping
          </button>

         
        </div>
      </div>
    );
  }

  /* ──────── Cart with Items ──────── */
  return (
    <div className="relative min-h-screen bg-gray-50/80">
      {/* Global Styles for animations */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 pt-2 pb-10 md:pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleContinueShopping}
            className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all 
              text-gray-400 hover:text-gray-700 md:hidden"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="flex-1">
            <h1 className="text-md sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              My Cart
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 font-medium">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <button
            onClick={askClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl 
              text-xs font-semibold text-gray-400 hover:text-rose-500 
              hover:bg-rose-50 transition-all"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ─── Item List ─── */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="space-y-3">
              {cart.items.map((item, index) => (
                <div
                  key={item._id}
                  className="animate-[scaleIn_0.3s_ease-out]"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                >
                  <CartItem
                    item={item}
                    onUpdateQty={handleUpdateQuantity}
                    onRemove={askRemove}
                  />
                </div>
              ))}
            </div>

            {/* Continue Shopping link (desktop) */}
            <button
              onClick={handleContinueShopping}
              className="hidden md:inline-flex items-center gap-2 mt-6 text-sm 
                font-semibold text-emerald-600 hover:text-emerald-700 
                hover:underline underline-offset-4 transition-all"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </button>
          </div>

          {/* ─── Desktop Summary ─── */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
            <div
              className="sticky top-6 rounded-3xl bg-white border border-gray-100 
              shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden"
            >
              {/* Summary header */}
              <div className="px-6 pt-6 pb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Order Summary
                </h3>
              </div>

              {/* Line items */}
              <div className="px-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₵{formatPrice(totals.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span
                    className={`font-medium ${
                      totals.shipping === 0
                        ? "text-emerald-500"
                        : "text-gray-900"
                    }`}
                  >
                    {totals.shipping === 0
                      ? "Free"
                      : `₵${formatPrice(totals.shipping)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium text-gray-900">
                    ₵{formatPrice(totals.tax)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mx-6 mt-4 pt-4 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    ₵{formatPrice(totals.total)}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 
                    rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 
                    text-white font-bold hover:from-emerald-600 hover:to-emerald-700 
                    active:scale-[0.98] transition-all 
                    shadow-lg shadow-emerald-500/20"
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 
                    rounded-2xl border-2 border-gray-100 text-gray-600 font-semibold 
                    hover:border-emerald-100 hover:bg-emerald-50/50 hover:text-emerald-700 
                    active:scale-[0.98] transition-all"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Trust badges */}
              <div
                className="px-6 pb-6 flex items-center justify-center gap-5 
                flex-wrap text-xs text-gray-400"
              >
                {[
                  { icon: ShieldCheck, label: "Secure Payment" },
                  { icon: Truck, label: "2–5 Day Delivery" },
                  { icon: RefreshCw, label: "Easy Returns" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Icon size={14} className="text-emerald-400" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile Bottom Bar ─── */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 
          bg-white/95 backdrop-blur-xl border-t border-gray-100 
          shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      >
        {/* Breakdown panel */}
        <div
          ref={breakdownRef}
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showBreakdown ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-5 pt-4 pb-2 space-y-2.5 border-b border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Subtotal ({totalItems} items)
              </span>
              <span className="font-semibold text-gray-900">
                ₵{formatPrice(totals.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span
                className={`font-medium ${
                  totals.shipping === 0 ? "text-emerald-500" : "text-gray-900"
                }`}
              >
                {totals.shipping === 0
                  ? "Calculated at checkout"
                  : `₵${formatPrice(totals.shipping)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax</span>
              <span className="font-medium text-gray-900">
                ₵{formatPrice(totals.tax)}
              </span>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-4">
            {/* Price column */}
            <button
              onClick={() => setShowBreakdown((s) => !s)}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 
                  to-teal-50 flex items-center justify-center"
                >
                 <ShoppingBasket/>
                </div>
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full 
                  bg-emerald-500 text-white text-[10px] font-bold 
                  flex items-center justify-center"
                >
                  {totalItems}
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    Total
                  </span>
                  {showBreakdown ? (
                    <ChevronDown size={12} className="text-gray-400" />
                  ) : (
                    <ChevronUp size={12} className="text-gray-400" />
                  )}
                </div>
                <div className="text-xl font-extrabold text-gray-900 tracking-tight">
                  ₵{formatPrice(totals.total)}
                </div>
              </div>
            </button>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              className="flex-1 flex items-center justify-center gap-0.5 px-2 py-0.5 
                rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 
                text-white font-bold active:scale-[0.97] transition-all 
                shadow-lg shadow-emerald-500/25"
            >
              <span>Proceed to Checkout</span>
              <ChevronUp size={18} className="rotate-90" />
            </button>
          </div>
        </div>

        {/* iPhone home indicator safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.mode === "clear" ? "Clear Cart?" : "Remove Item?"}
        description={
          confirm.mode === "clear"
            ? "All items will be removed from your cart. This action cannot be undone."
            : "This item will be removed from your cart."
        }
        confirmText={confirm.mode === "clear" ? "Clear All" : "Remove"}
        loading={confirm.loading}
        onConfirm={confirmAction}
        onClose={confirm.loading ? undefined : closeConfirm}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}