import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Palette,
  Ruler,
  Check,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  TruckIcon,
  Shield,
  Heart,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  Info,
  RotateCcw,
  Zap,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Eye,
} from "lucide-react";
import { message, Tooltip } from "antd";

import { fetchProductById } from "../Redux/slice/productSlice";
import {
  addItemToCart,
  fetchCart,
  updateCartItemQty,
  removeCartItem,
} from "../Redux/slice/cartSlice";
import AuthModal from "./AuthPage";

/* ═══════════════════════════════════ CART SIDEBAR ═══════════════════════════════════ */

const CartSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    if (isOpen) dispatch(fetchCart());
  }, [isOpen, dispatch]);

  const getItemPrice = (item) =>
    Number(item.price || item.product?.price || item.productId?.price || 0);
  const getItemName = (item) =>
    item.name || item.product?.name || item.productId?.name || "Product";
  const getItemImage = (item) =>
    item.image ||
    item.product?.images?.[0]?.url ||
    item.productId?.images?.[0]?.url ||
    "";

  const handleUpdateQty = (itemId, newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartItemQty({ itemId, quantity: newQty }))
      .unwrap()
      .then(() => message.success("Quantity updated"))
      .catch((err) => message.error(err?.message || "Failed to update quantity"));
  };

  const handleRemove = (itemId) => {
    dispatch(removeCartItem(itemId))
      .unwrap()
      .then(() => message.success("Item removed"))
      .catch((err) => message.error(err?.message || "Failed to remove item"));
  };

  const cartTotal = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce(
      (sum, item) => sum + getItemPrice(item) * (item.quantity || 0),
      0
    );
  }, [cart]);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-md z-40 transition-all duration-500 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-50 transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: isOpen ? "-20px 0 60px rgba(0,0,0,0.15)" : "none" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <ShoppingCart className="text-white" size={20} />
                  </div>
                  {cart?.items?.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                      {cart.items.length}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
                  {cart?.items?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {cart.items.length} {cart.items.length === 1 ? "item" : "items"} added
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all hover:rotate-90 duration-300"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="flex items-center justify-center h-72">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-[3px] border-gray-100" />
                    <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin" />
                  </div>
                  <span className="text-sm text-gray-500">Loading cart...</span>
                </div>
              </div>
            ) : !cart?.items?.length ? (
              <div className="flex flex-col items-center justify-center h-72 px-8 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-5">
                  <ShoppingCart size={40} className="text-gray-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-[240px]">
                  Looks like you haven't added anything yet. Start exploring!
                </p>
                <button
                  onClick={onClose}
                  className="group px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                  Browse Products
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cart.items.map((item, index) => {
                  const itemPrice = getItemPrice(item);
                  const itemSubtotal = itemPrice * (item.quantity || 0);
                  return (
                    <div
                      key={item._id}
                      className="group bg-white border border-gray-100 rounded-2xl p-3.5 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="flex gap-3.5">
                        <div className="relative flex-shrink-0">
                          <div className="w-[82px] h-[82px] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                            <img
                              src={getItemImage(item)}
                              alt={getItemName(item)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          {item.quantity > 1 && (
                            <span className="absolute -top-1.5 -left-1.5 min-w-[22px] h-[22px] flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-md px-1">
                              ×{item.quantity}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold text-[13px] text-gray-900 line-clamp-2 leading-snug">
                              {getItemName(item)}
                            </h4>
                            <button
                              onClick={() => handleRemove(item._id)}
                              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {(item.color || item.size) && (
                            <div className="flex gap-1.5 mt-1.5">
                              {item.color && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md text-[11px] border border-gray-100">
                                  <span
                                    className="w-2 h-2 rounded-full border border-gray-200"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md text-[11px] border border-gray-100">
                                  {item.size}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2.5">
                            <div>
                              <span className="text-base font-bold text-gray-900">
                                ₵{itemPrice.toFixed(2)}
                              </span>
                              {item.quantity > 1 && (
                                <span className="block text-[11px] text-emerald-600 font-medium">
                                  Total: ₵{itemSubtotal.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center h-8 border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() =>
                                  handleUpdateQty(item._id, (item.quantity || 1) - 1)
                                }
                                disabled={(item.quantity || 1) <= 1}
                                className="w-8 h-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                aria-label="Decrease"
                              >
                                <Minus size={12} />
                              </button>
                              <div className="w-8 h-full flex items-center justify-center text-sm font-semibold border-x border-gray-200 bg-gray-50/50">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() =>
                                  handleUpdateQty(item._id, (item.quantity || 1) + 1)
                                }
                                className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                                aria-label="Increase"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart?.items?.length > 0 && (
            <div className="border-t border-gray-100 bg-white p-5 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-gray-600">Subtotal</span>
                <span className="text-2xl font-extrabold text-gray-900">
                  ₵{cartTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 -mt-2">
                Shipping & taxes calculated at checkout
              </p>

              <button
                onClick={handleCheckout}
                className="group w-full py-3.5 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2"
              >
                Checkout
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Continue Shopping
              </button>

              <div className="flex items-center justify-center gap-5 pt-1 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Shield size={12} /> Secure
                </span>
                <span className="flex items-center gap-1">
                  <TruckIcon size={12} /> Fast Delivery
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw size={12} /> Easy Returns
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

/* ═══════════════════════════════════ HELPERS ═══════════════════════════════════ */

const tryJsonParseRecursive = (value, maxDepth = 3) => {
  let current = value;
  let depth = 0;
  while (depth < maxDepth) {
    if (typeof current !== "string") break;
    const trimmed = current.trim();
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      try {
        current = JSON.parse(trimmed);
        depth += 1;
        continue;
      } catch {
        break;
      }
    }
    break;
  }
  return current;
};

const parseArray = (value) => {
  if (!value && value !== 0) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          const parsed = tryJsonParseRecursive(item);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && typeof parsed !== "object") return String(parsed).trim();
          if (typeof parsed === "object" && parsed !== null) return parsed;
          const str = item.trim();
          if (str.includes(",") || str.includes(";"))
            return str.split(/[,;]/).map((i) => i.trim()).filter(Boolean);
          return str;
        }
        return item;
      })
      .flat(Infinity)
      .filter((i) => i !== undefined && i !== null && String(i).trim());
  }
  if (typeof value === "string") {
    const parsed = tryJsonParseRecursive(value);
    if (Array.isArray(parsed))
      return parsed.map((item) => (item == null ? "" : String(item).trim())).filter(Boolean);
    const cleaned = value.trim().replace(/^["']|["']$/g, "");
    return cleaned.split(/[,;]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const parseSpecifications = (specs) => {
  if (!specs) return {};
  try {
    if (typeof specs === "object" && !Array.isArray(specs)) return specs;
    if (typeof specs === "string") {
      const parsed = tryJsonParseRecursive(specs);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed)) {
        const obj = {};
        parsed.forEach((entry, idx) => {
          if (Array.isArray(entry) && entry.length >= 2) {
            const [k, v] = entry;
            if (k != null) obj[String(k)] = v;
          } else if (entry && typeof entry === "object") {
            Object.assign(obj, entry);
          } else if (entry != null) {
            obj[`Spec ${idx + 1}`] = entry;
          }
        });
        return obj;
      }
    }
  } catch {}
  return {};
};

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return Number.isNaN(num) ? "0.00" : num.toFixed(2);
};

const colorMap = {
  black: "#000000", white: "#FFFFFF", grey: "#808080", gray: "#808080",
  red: "#EF4444", blue: "#3B82F6", green: "#10B981", yellow: "#F59E0B",
  purple: "#A855F7", pink: "#EC4899", orange: "#F97316", brown: "#92400E",
  navy: "#1E3A8A", teal: "#14B8A6", gold: "#D4AF37", silver: "#C0C0C0",
  rose: "#F43F5E", indigo: "#6366F1", cyan: "#06B6D4", lime: "#84CC16",
  emerald: "#10B981", violet: "#8B5CF6", fuchsia: "#D946EF",
};

const getColorStyle = (color) => {
  const lower = String(color).toLowerCase();
  for (const [name, hex] of Object.entries(colorMap)) {
    if (lower.includes(name)) return hex;
  }
  if (/^#([0-9A-F]{3}){1,2}$/i.test(lower)) return lower;
  return lower;
};

const renderSpecValue = (value) => {
  if (value == null || value === "") return <span className="text-gray-400">—</span>;
  const parsed = typeof value === "string" ? tryJsonParseRecursive(value) : value;
  if (Array.isArray(parsed)) {
    return (
      <ul className="space-y-0.5 text-sm text-gray-700">
        {parsed.map((v, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            {String(v)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof parsed === "object") {
    return (
      <div className="space-y-0.5 text-sm text-gray-700">
        {Object.entries(parsed).map(([k, v]) => (
          <div key={k}>
            <span className="font-medium text-gray-600">{k}: </span>
            <span>{Array.isArray(v) ? v.join(", ") : String(v ?? "")}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span className="text-sm text-gray-700">{String(parsed)}</span>;
};

const getFeatureText = (item) => {
  if (item == null) return "";
  if (typeof item === "string") return item;
  if (Array.isArray(item)) return item.join(", ");
  if (typeof item === "object") {
    return Object.entries(item)
      .map(([k, v]) => (v != null ? `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}` : k))
      .join(" | ");
  }
  return String(item);
};

/* ═══════════════════════════════════ SKELETON LOADER ═══════════════════════════════════ */

const SkeletonLoader = () => (
  <div className="min-h-screen bg-gray-50/50">
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="h-5 w-64 bg-gray-200 rounded-full mb-8 animate-pulse" />
      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
          <div className="flex gap-3 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-5 w-1/3 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-14 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
          <div className="h-14 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-14 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════ IMAGE GALLERY ═══════════════════════════════════ */

const ImageGallery = ({ images = [], productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);
  const thumbnailRef = useRef(null);

  const handlePrev = useCallback(() => {
    if (!images?.length) return;
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images?.length]);

  const handleNext = useCallback(() => {
    if (!images?.length) return;
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images?.length]);

  const onMove = useCallback((e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    setPos({
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    });
  }, []);

  const mainImage = images?.[selectedIndex];

  return (
    <div className="space-y-4 sticky top-8">
      {/* Main Image Container */}
      <div
        ref={imageRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/80 group cursor-crosshair"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={onMove}
      >
        {mainImage?.url ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt || productName}
            className="w-full h-[400px] md:h-[500px] lg:h-[560px] object-contain p-4 transition-transform duration-200 ease-out select-none"
            style={
              isZoomed
                ? { transform: "scale(2.2)", transformOrigin: `${pos.x}% ${pos.y}%` }
                : { transform: "scale(1)" }
            }
            draggable={false}
          />
        ) : (
          <div className="w-full h-[400px] md:h-[500px] lg:h-[560px] flex flex-col items-center justify-center text-gray-400 gap-3">
            <Package size={48} strokeWidth={1.5} />
            <span className="text-sm font-medium">No image available</span>
          </div>
        )}

        {/* Navigation */}
        {images?.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 duration-300"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Counter Badge */}
        {images?.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-sm text-white flex items-center gap-1.5">
            <Eye size={12} />
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Zoom Hint */}
        {!isZoomed && mainImage?.url && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/80 backdrop-blur-sm text-gray-600 text-[11px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 shadow-sm">
            <Sparkles size={12} />
            Hover to zoom
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images?.length > 1 && (
        <div ref={thumbnailRef} className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={img.publicId || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden transition-all duration-300 ${
                idx === selectedIndex
                  ? "ring-2 ring-emerald-500 ring-offset-2 scale-105 shadow-lg"
                  : "border border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.alt || productName}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                  N/A
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════ DETAIL TABS ═══════════════════════════════════ */

const DetailTabs = ({ product, featureList, specsObject }) => {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = useMemo(() => {
    const t = [{ id: "description", label: "Description", icon: Info }];
    if (featureList.length > 0)
      t.push({ id: "features", label: "Features", icon: Zap });
    if (Object.keys(specsObject).length > 0)
      t.push({ id: "specifications", label: "Specifications", icon: Ruler });
    if (product.additionalInfo)
      t.push({ id: "additional", label: "Additional Info", icon: Info });
    return t;
  }, [featureList, specsObject, product.additionalInfo]);

  return (
    <section className="mt-12">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-3xl border border-t-0 border-gray-200 p-6 md:p-8 min-h-[200px]">
        {/* Description */}
        {activeTab === "description" && (
          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {product.description || (
              <p className="text-gray-400 italic">No description available.</p>
            )}
          </div>
        )}

        {/* Features */}
        {activeTab === "features" && (
          <div className="grid sm:grid-cols-2 gap-3">
            {featureList.map((f, idx) => {
              const text = getFeatureText(f);
              if (!text) return null;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/80 hover:bg-emerald-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Specifications */}
        {activeTab === "specifications" && (
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(specsObject).map(([label, value], idx) => (
              <div
                key={label}
                className={`flex flex-col p-4 rounded-xl border transition-all hover:shadow-sm ${
                  idx % 2 === 0 ? "bg-gray-50/80 border-gray-100" : "bg-white border-gray-100"
                }`}
              >
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  {label}
                </span>
                <div className="font-medium">{renderSpecValue(value)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Info */}
        {activeTab === "additional" && (
          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {product.additionalInfo}
          </div>
        )}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════ MAIN COMPONENT ═══════════════════════════════════ */

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loadingProduct, error } = useSelector((state) => state.products);
  const { userInfo } = useSelector((state) => state.auth);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState("login");
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  const colors = useMemo(() => parseArray(product?.color), [product?.color]);
  const featureList = useMemo(() => parseArray(product?.features), [product?.features]);
  const specsObject = useMemo(
    () => parseSpecifications(product?.specifications),
    [product?.specifications]
  );

  useEffect(() => {
    if (!product) return;
    if (colors.length > 0) setSelectedColor(colors[0]);
    if (product.variants?.length > 0) {
      const available = product.variants.find((v) => v.stock > 0) || product.variants[0];
      setSelectedSize(available.size);
    } else {
      setSelectedSize(null);
    }
    setQuantity(1);
  }, [product, colors.length]);

  const currentVariant = useMemo(() => {
    if (!product?.variants?.length || !selectedSize) return null;
    return product.variants.find((v) => v.size === selectedSize) || product.variants[0];
  }, [product, selectedSize]);

  const price = useMemo(() => {
    if (!product) return 0;
    return currentVariant ? currentVariant.price || 0 : product.price ?? 0;
  }, [product, currentVariant]);

  const stock = useMemo(() => {
    if (!product) return 0;
    return currentVariant ? currentVariant.stock ?? 0 : product.stock ?? 0;
  }, [product, currentVariant]);

  const hasOldPrice =
    typeof product?.oldPrice === "number" && product.oldPrice > 0 && product.oldPrice > price;

  const discountPercent = useMemo(() => {
    if (!hasOldPrice || !price) return null;
    return Math.round(((product.oldPrice - price) / product.oldPrice) * 100);
  }, [hasOldPrice, product?.oldPrice, price]);

  const changeQty = useCallback(
    (type) => {
      setQuantity((prev) =>
        type === "dec" ? Math.max(1, prev - 1) : Math.min(stock || 1, prev + 1)
      );
    },
    [stock]
  );

  const validateAndBuildPayload = useCallback(() => {
    if (!product) return null;
    if (product.variants?.length > 0 && !selectedSize) {
      message.warning("Please select a size");
      return null;
    }
    if (colors.length > 0 && !selectedColor) {
      message.warning("Please select a color");
      return null;
    }
    if (stock === 0) {
      message.warning("This item is out of stock");
      return null;
    }
    if (quantity > stock) {
      message.warning(`Only ${stock} items available`);
      setQuantity(stock);
      return null;
    }
    return {
      productId: product._id,
      quantity,
      color: selectedColor || null,
      size: selectedSize || null,
      price,
      sizePrice: currentVariant ? currentVariant.price : null,
      variantId: currentVariant?._id || null,
    };
  }, [product, selectedSize, selectedColor, colors.length, stock, quantity, price, currentVariant]);

  const ensureAuth = useCallback(() => {
    if (!userInfo) {
      message.info("Please login to continue");
      setAuthDefaultTab("login");
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [userInfo]);

  const tryAddToCart = useCallback(async () => {
    if (!ensureAuth()) return;
    const payload = validateAndBuildPayload();
    if (!payload) return;
    try {
      setAdding(true);
      const result = await dispatch(addItemToCart(payload));
      if (result.meta?.requestStatus === "fulfilled") {
        message.success("Added to cart!");
        setCartSidebarOpen(true);
      } else {
        message.error(result.payload || result.error?.message || "Failed to add to cart");
      }
    } catch {
      message.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }, [ensureAuth, validateAndBuildPayload, dispatch]);

  const handleBuyNow = useCallback(async () => {
    if (!ensureAuth()) return;
    const payload = validateAndBuildPayload();
    if (!payload) return;
    try {
      setBuying(true);
      const result = await dispatch(addItemToCart(payload));
      if (result.meta?.requestStatus === "fulfilled") {
        navigate("/checkout");
      } else {
        message.error(result.payload || result.error?.message || "Failed to start checkout");
      }
    } catch {
      message.error("Failed to start checkout");
    } finally {
      setBuying(false);
    }
  }, [ensureAuth, validateAndBuildPayload, dispatch, navigate]);

  const handleShare = useCallback(async () => {
    if (!product?._id) return message.error("Unable to share this product.");
    const url = `${window.location.origin}/product/${product._id}`;
    const title = product.name || "Check this product";
    const text = product.description?.slice(0, 140) + (product.description?.length > 140 ? "..." : "") || "Check out this product";
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        message.success("Thanks for sharing!");
      } else {
        await navigator.clipboard.writeText(url);
        message.success("Link copied to clipboard!");
      }
    } catch (err) {
      if (err?.name !== "AbortError") message.error("Could not share. Try again.");
    }
  }, [product]);

  const handleWishlist = useCallback(() => {
    setIsWishlisted((prev) => !prev);
    message.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  }, [isWishlisted]);

  /* ── Loading / Error ── */

  if (loadingProduct) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <X size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-6">We couldn't load this product. Please try again.</p>
          <button
            onClick={() => dispatch(fetchProductById(id))}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const totalPrice = price * quantity;
  const savings = hasOldPrice ? (product.oldPrice - price) * quantity : 0;

  /* ══════════════════════ RENDER ══════════════════════ */

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 md:pb-12">
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authDefaultTab}
      />
      <CartSidebar isOpen={cartSidebarOpen} onClose={() => setCartSidebarOpen(false)} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link
            to="/products"
            className="text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Products
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-semibold line-clamp-1 max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* ════════ Main Grid ════════ */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* ─── Left: Gallery ─── */}
          <div>
            {discountPercent != null && discountPercent > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-xs font-bold shadow-lg shadow-rose-500/25">
                  <Zap size={12} />
                  {discountPercent}% OFF
                </span>
                <span className="text-xs text-gray-500">Limited time offer</span>
              </div>
            )}
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* ─── Right: Product Info ─── */}
          <div className="space-y-6 lg:space-y-7">
            {/* Title Block */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {product.brand && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-2.5 border border-emerald-100">
                      <BadgeCheck size={12} />
                      {product.brand}
                    </span>
                  )}
                  <h1 className="text-2xl md:text-[28px] lg:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                    {product.name}
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Tooltip title="Share">
                    <button
                      onClick={handleShare}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
                      aria-label="Share"
                    >
                      <Share2 size={18} />
                    </button>
                  </Tooltip>
                  <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                    <button
                      onClick={handleWishlist}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                        isWishlisted
                          ? "bg-rose-50 border-rose-200 text-rose-500"
                          : "bg-white border-gray-200 text-gray-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50"
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Rating & SKU */}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.ratings?.average || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {(product.ratings?.average || 0).toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  ({product.ratings?.count || 0} reviews)
                </span>
                {product.sku && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-400 font-mono">SKU: {product.sku}</span>
                  </>
                )}
              </div>
            </div>

            {/* ─── Price Block ─── */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl md:text-4xl font-black text-gray-900">
                  ₵{formatCurrency(price)}
                </span>
                {hasOldPrice && (
                  <span className="text-lg text-gray-400 line-through font-medium">
                    ₵{formatCurrency(product.oldPrice)}
                  </span>
                )}
                {hasOldPrice && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    Save ₵{formatCurrency(product.oldPrice - price)}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    stock > 0
                      ? stock <= 3
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {stock > 0 ? (
                    stock <= 3 ? (
                      <>
                        <Zap size={12} /> Only {stock} left
                      </>
                    ) : (
                      <>
                        <Check size={12} strokeWidth={3} /> In Stock
                      </>
                    )
                  ) : (
                    <>
                      <X size={12} /> Out of Stock
                    </>
                  )}
                </span>
              </div>

              {/* Trust Row */}
              <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-500 border-t border-gray-100 pt-3">
                <span className="flex items-center gap-1.5">
                  <TruckIcon size={13} className="text-emerald-500" />
                  Free Shipping
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield size={13} className="text-emerald-500" />
                  Buyer Protection
                </span>
                <span className="flex items-center gap-1.5">
                  <RotateCcw size={13} className="text-emerald-500" />
                  Easy Returns
                </span>
              </div>
            </div>

            {/* ─── Color Selection ─── */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette size={16} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-900">Color</span>
                  <span className="text-sm text-gray-400">— {selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((color, idx) => {
                    const isSelected = selectedColor === color;
                    const bg = getColorStyle(color);
                    const isLight = ["white", "#ffffff", "#fff"].includes(
                      String(color).toLowerCase()
                    );
                    return (
                      <Tooltip title={color} key={idx}>
                        <button
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-11 h-11 rounded-2xl transition-all duration-200 ${
                            isSelected
                              ? "ring-2 ring-offset-2 ring-emerald-500 scale-110 shadow-lg"
                              : `hover:scale-105 hover:shadow-md ${
                                  isLight ? "border-2 border-gray-200" : "border-2 border-transparent"
                                }`
                          }`}
                          style={{ backgroundColor: bg }}
                          aria-label={`Select ${color}`}
                        >
                          {isSelected && (
                            <span
                              className={`absolute inset-0 flex items-center justify-center rounded-2xl ${
                                isLight ? "text-gray-700" : "text-white"
                              }`}
                            >
                              <Check size={16} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Size Selection ─── */}
            {product.variants?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler size={16} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-900">Size</span>
                  {selectedSize && (
                    <span className="text-sm text-gray-400">— {selectedSize}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedSize === variant.size;
                    const isOutOfStock = (variant.stock ?? 0) <= 0;
                    return (
                      <button
                        key={variant._id}
                        onClick={() => !isOutOfStock && setSelectedSize(variant.size)}
                        disabled={isOutOfStock}
                        className={`relative min-w-[64px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isSelected
                            ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105"
                            : isOutOfStock
                            ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100 line-through"
                            : "bg-white text-gray-700 border border-gray-200 hover:border-gray-900 hover:shadow-sm"
                        }`}
                        aria-label={`Size ${variant.size}`}
                      >
                        <span>{variant.size}</span>
                        {variant.price && (
                          <span
                            className={`block text-[10px] mt-0.5 ${
                              isSelected ? "text-gray-300" : "text-gray-400"
                            }`}
                          >
                            ₵{formatCurrency(variant.price)}
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                            ✕
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Quantity ─── */}
            <div className="space-y-3">
              <span className="text-sm font-semibold text-gray-900">Quantity</span>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="inline-flex items-center border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => changeQty("dec")}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="w-14 h-12 flex items-center justify-center text-lg font-bold border-x border-gray-200">
                    {quantity}
                  </div>
                  <button
                    onClick={() => changeQty("inc")}
                    disabled={quantity >= stock}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {stock > 0 && (
                  <span className="text-sm text-gray-400">{stock} pieces available</span>
                )}
              </div>
            </div>

            {/* ─── Total ─── */}
            {quantity > 1 && (
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-sm text-gray-600">Total ({quantity} items)</span>
                <span className="text-xl font-extrabold text-gray-900">
                  ₵{formatCurrency(totalPrice)}
                </span>
              </div>
            )}

            {/* ─── CTA Buttons (Desktop) ─── */}
            <div className="hidden md:flex flex-col gap-3 pt-1">
              <button
                onClick={handleBuyNow}
                disabled={stock === 0 || buying}
                className="group w-full py-4 bg-gray-900 text-white font-bold text-base rounded-2xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2.5"
              >
                {buying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/60 border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Buy Now
                    <ArrowRight
                      size={18}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </>
                )}
              </button>

              <button
                onClick={tryAddToCart}
                disabled={stock === 0 || adding}
                className="group w-full py-4 bg-white border-2 border-gray-200 text-gray-900 font-bold text-base rounded-2xl hover:border-gray-900 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5"
              >
                {adding ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>

              {hasOldPrice && savings > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <Sparkles size={14} className="text-emerald-600" />
                  <span className="text-sm text-emerald-700 font-medium">
                    You save ₵{formatCurrency(savings)} on this order!
                  </span>
                </div>
              )}
            </div>

            {/* ─── Guarantees ─── */}
            <div className="hidden md:grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Shield, label: "Secure Payment", sub: "256-bit SSL" },
                { icon: TruckIcon, label: "Fast Delivery", sub: "2–5 days" },
                { icon: RotateCcw, label: "Easy Returns", sub: "30-day policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <Icon size={18} className="text-emerald-500 mb-1.5" />
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                  <span className="text-[10px] text-gray-400">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════ Product Details Tabs ════════ */}
        <DetailTabs
          product={product}
          featureList={featureList}
          specsObject={specsObject}
        />
      </div>

      {/* ════════ Mobile Sticky Bottom Bar ════════ */}
      {product && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
          {/* Glass Background */}
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
            {/* Price Row */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center h-9 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => changeQty("dec")}
                    disabled={quantity <= 1}
                    className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => changeQty("inc")}
                    disabled={stock === 0 || quantity >= stock}
                    className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                  Total
                </p>
                <p className="text-lg font-extrabold text-gray-900">
                  ₵{formatCurrency(totalPrice)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4 flex gap-2.5">
              <button
                onClick={tryAddToCart}
                disabled={stock === 0 || adding}
                className="flex-1 h-12 flex items-center justify-center gap-1.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-900 transition-all"
              >
                {adding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent" />
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={stock === 0 || buying}
                className="flex-[2] h-12 flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-900/20"
              >
                {buying ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/60 border-t-transparent" />
                ) : (
                  <>
                    <Zap size={16} />
                    Buy Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;