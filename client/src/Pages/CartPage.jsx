import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

const Spinner = ({ size = 24 }) => (
  <Loader2 size={size} className="animate-spin text-emerald-600" />
);

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const { type = "info", message = "" } = toast;
  const colors = {
    success: "bg-emerald-600",
    error: "bg-rose-600",
    info: "bg-slate-800",
  };
  const Icon =
    type === "success" ? CheckCircle2 : type === "error" ? AlertTriangle : ShoppingBag;

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      <div
        className={`flex items-center gap-3 text-white px-4 py-3 rounded-xl shadow-lg ${colors[type]}`}
      >
        <Icon size={18} />
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

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
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                {description && (
                  <p className="mt-1 text-sm text-gray-600">{description}</p>
                )}
              </div>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={loading ? undefined : onClose}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={loading ? undefined : onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-70"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size={16} />
                    Please wait...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
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

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const getItemPrice = (item) =>
    Number(
      item.price ||
        item.product?.price ||
        item.productId?.price ||
        item.variant?.price ||
        0
    ) || 0;

  const getItemName = (i) =>
    i.name || i.product?.name || i.productId?.name || "Product";
  const getItemImage = (i) =>
    i.image ||
    i.product?.images?.[0]?.url ||
    i.productId?.images?.[0]?.url ||
    "/placeholder.png";
  const formatPrice = (n) => Number(n || 0).toFixed(2);

  const totals = useMemo(() => {
    if (!cart?.items?.length)
      return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    const subtotal = cart.items.reduce(
      (sum, i) => sum + getItemPrice(i) * (Number(i.quantity) || 0),
      0
    );
    const shipping = Number(cart.shippingPrice) || 0;
    const tax = Number(cart.taxPrice) || 0;
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
  }, [cart]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2200);
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItemQty({ itemId, quantity }))
      .unwrap()
      .then(() => showToast("success", "Quantity updated"))
      .catch((err) => showToast("error", err?.message || "Failed to update"));
  };

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
        showToast("success", "Item removed");
      } else if (confirm.mode === "clear") {
        await dispatch(clearUserCart()).unwrap();
        showToast("success", "Cart cleared");
      }
      closeConfirm();
    } catch (err) {
      showToast("error", err?.message || "Action failed");
      setConfirm((s) => ({ ...s, loading: false }));
    }
  };

  const handleCheckout = () => navigate("/checkout");
  const handleContinueShopping = () => navigate("/products");

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="text-rose-600" size={22} />
          </div>
          <h3 className="text-lg font-bold text-rose-700">Error loading cart</h3>
          <p className="text-gray-700 mt-1">{error}</p>
          <button
            onClick={() => dispatch(fetchCart())}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50 p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <ShoppingCart className="text-emerald-600" size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mt-1">Find something you’ll love.</p>
          <button
            onClick={handleContinueShopping}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </button>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-600">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              Secure checkout
            </span>
            <span className="inline-flex items-center gap-2">
              <Truck size={14} className="text-emerald-600" />
              Fast delivery
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* page content with bottom safe padding for mobile sticky summary */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-40 md:pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Shopping Cart
            </h1>
            <div className="mt-1 h-1 w-28 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />
            <p className="text-sm text-gray-600 mt-2">
              {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
            </p>
          </div>

          <button
            onClick={askClear}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* items */}
          <div className="md:col-span-2">
            <div className="space-y-3">
              {cart.items.map((item) => {
                const price = getItemPrice(item);
                const qty = Number(item.quantity) || 0;
                const subtotal = formatPrice(price * qty);

                return (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={getItemImage(item)}
                          alt={getItemName(item)}
                          className="w-24 h-24 object-cover rounded-xl border"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {getItemName(item)}
                            </h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {item.color && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  Color: {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => askRemove(item._id)}
                            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            <div className="text-lg font-bold text-gray-900">
                              ₵{formatPrice(price)}
                            </div>
                            {qty > 1 && (
                              <div className="text-xs text-gray-500">
                                Subtotal:{" "}
                                <span className="font-semibold text-amber-600">
                                  ₵{subtotal}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center rounded-lg overflow-hidden border border-emerald-300 bg-white">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item._id, qty - 1)
                              }
                              disabled={qty <= 1}
                              className="h-9 w-9 grid place-items-center hover:bg-gray-50 disabled:opacity-50"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <div className="w-10 text-center font-semibold text-emerald-700 text-sm">
                              {qty}
                            </div>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item._id, qty + 1)
                              }
                              className="h-9 w-9 grid place-items-center hover:bg-gray-50"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* desktop summary */}
          <div className="hidden md:block md:col-span-1">
            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:sticky md:top-4">
              <h3 className="text-base font-bold text-gray-900">Order Summary</h3>
              <div className="mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₵{formatPrice(totals.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    ₵{formatPrice(totals.shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    ₵{formatPrice(totals.tax)}
                  </span>
                </div>

                <div className="mt-3 border-t border-emerald-200 pt-3 flex justify-between text-base font-extrabold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-amber-600">
                    ₵{formatPrice(totals.total)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  <ShoppingBag size={18} />
                  Proceed to Checkout
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-amber-400 text-amber-600 font-semibold hover:bg-amber-50"
                >
                  Continue Shopping
                </button>

                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Secure checkout
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Truck size={14} className="text-emerald-600" />
                    2–5 day delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      

      {/* mobile sticky order summary only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 grid place-items-center">
                <ShoppingCart className="text-emerald-600" size={18} />
              </div>
              <div>
                <div className="text-xs text-gray-600">Total</div>
                <div className="text-lg font-extrabold tracking-tight text-amber-600">
                  ₵{formatPrice(totals.total)}
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="flex-1 ml-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
            >
              Checkout
            </button>
          </div>

          <button
            onClick={() => setShowBreakdown((s) => !s)}
            className="mt-2 text-xs text-gray-600 underline underline-offset-4"
          >
            {showBreakdown ? "Hide breakdown" : "Show breakdown"}
          </button>

          {showBreakdown && (
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₵{formatPrice(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  ₵{formatPrice(totals.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  ₵{formatPrice(totals.tax)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.mode === "clear" ? "Clear Cart" : "Remove Item"}
        description={
          confirm.mode === "clear"
            ? "Are you sure you want to remove all items from your cart?"
            : "Are you sure you want to remove this item?"
        }
        confirmText={confirm.mode === "clear" ? "Clear All" : "Remove"}
        loading={confirm.loading}
        onConfirm={confirmAction}
        onClose={confirm.loading ? undefined : closeConfirm}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default CartPage;