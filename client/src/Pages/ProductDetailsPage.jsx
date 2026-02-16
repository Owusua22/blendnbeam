
import React, { useEffect, useMemo, useRef, useState } from "react";
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

/* ====================== CART SIDEBAR COMPONENT ====================== */
const CartSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCart());
    }
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
      .catch((err) =>
        message.error(err?.message || "Failed to update quantity")
      );
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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-gradient-to-b from-white via-white to-gray-50 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500 rounded-lg shadow-sm">
                <ShoppingCart className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Your Cart
                {cart?.items?.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X size={22} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-200" />
                  <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                </div>
              </div>
            ) : !cart?.items?.length ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="relative mb-4">
                  <ShoppingCart size={64} className="text-gray-300" />
                  <div className="absolute -bottom-2 -right-2 p-1 bg-rose-500 text-white rounded-full">
                    <X size={12} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add some products to get started.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shadow"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => {
                  const itemPrice = getItemPrice(item);
                  const itemSubtotal = itemPrice * (item.quantity || 0);

                  return (
                    <div
                      key={item._id}
                      className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={getItemImage(item)}
                            alt={getItemName(item)}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          {!!item.quantity && item.quantity > 1 && (
                            <span className="absolute -top-2 -right-2 text-[10px] font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 rounded-full shadow">
                              ×{item.quantity}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                              {getItemName(item)}
                            </h4>
                            <button
                              onClick={() => handleRemove(item._id)}
                              className="flex-shrink-0 p-1 hover:bg-rose-50 rounded-full text-rose-500 transition-colors"
                              aria-label="Remove from cart"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Options */}
                          <div className="flex gap-2 mb-2 text-xs">
                            {item.color && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border"
                                  style={{ backgroundColor: item.color }}
                                />
                                {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                                {item.size}
                              </span>
                            )}
                          </div>

                          {/* Price & Quantity */}
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-gray-900">
                              ₵{itemPrice.toFixed(2)}
                            </div>

                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                              <button
                                onClick={() =>
                                  handleUpdateQty(
                                    item._id,
                                    (item.quantity || 1) - 1
                                  )
                                }
                                disabled={(item.quantity || 1) <= 1}
                                className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <div className="w-10 text-center font-semibold text-sm">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() =>
                                  handleUpdateQty(
                                    item._id,
                                    (item.quantity || 1) + 1
                                  )
                                }
                                className="p-1.5 hover:bg-gray-100 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          {item.quantity > 1 && (
                            <div className="text-right mt-1">
                              <span className="text-xs text-gray-500">
                                Subtotal:{" "}
                              </span>
                              <span className="text-sm font-bold text-emerald-600">
                                ₵{itemSubtotal.toFixed(2)}
                              </span>
                            </div>
                          )}
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
            <div className="border-t bg-gradient-to-r from-emerald-50 to-teal-50 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  ₵{cartTotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>

              <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-emerald-600" />
                  Secure checkout
                </div>
                <div className="flex items-center gap-2">
                  <TruckIcon size={14} className="text-emerald-600" />
                  Fast delivery
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ====================== HELPER FUNCTIONS ====================== */

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
          if (str.includes(",") || str.includes(";")) {
            return str
              .split(/[,;]/)
              .map((i) => i.trim())
              .filter(Boolean);
          }
          return str;
        }
        return item;
      })
      .flat(Infinity)
      .filter((i) => i !== undefined && i !== null && String(i).trim());
  }

  if (typeof value === "string") {
    const parsed = tryJsonParseRecursive(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) =>
          item === null || item === undefined ? "" : String(item).trim()
        )
        .filter(Boolean);
    }

    const cleaned = value.trim().replace(/^["']|["']$/g, "");
    return cleaned
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseSpecifications = (specs) => {
  if (!specs) return {};
  try {
    if (typeof specs === "object" && !Array.isArray(specs)) {
      return specs;
    }
    if (typeof specs === "string") {
      const parsed = tryJsonParseRecursive(specs);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
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
  } catch {
    // ignore parsing errors
  }
  return {};
};

const formatCurrency = (value) => {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
};

const getColorStyle = (color) => {
  const colorMap = {
    black: "#000000",
    white: "#FFFFFF",
    grey: "#808080",
    gray: "#808080",
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#10B981",
    yellow: "#F59E0B",
    purple: "#A855F7",
    pink: "#EC4899",
    orange: "#F97316",
    brown: "#92400E",
    navy: "#1E3A8A",
    teal: "#14B8A6",
    gold: "#D4AF37",
    silver: "#C0C0C0",
    rose: "#F43F5E",
    indigo: "#6366F1",
    cyan: "#06B6D4",
    lime: "#84CC16",
    emerald: "#10B981",
    violet: "#8B5CF6",
    fuchsia: "#D946EF",
  };
  const lower = String(color).toLowerCase();
  for (const [name, hex] of Object.entries(colorMap)) {
    if (lower.includes(name)) return hex;
  }
  if (/^#([0-9A-F]{3}){1,2}$/i.test(lower)) return lower;
  return lower;
};

const renderSpecValue = (value) => {
  if (value == null || value === "")
    return <span className="text-gray-400">—</span>;

  const parsed =
    typeof value === "string" ? tryJsonParseRecursive(value) : value;

  if (Array.isArray(parsed)) {
    return (
      <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-700">
        {parsed.map((v, i) => (
          <li key={i}>{String(v)}</li>
        ))}
      </ul>
    );
  }

  if (typeof parsed === "object") {
    return (
      <div className="space-y-0.5 text-sm text-gray-700">
        {Object.entries(parsed).map(([k, v]) => (
          <div key={k}>
            <span className="font-medium">{k}: </span>
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
      .map(([k, v]) =>
        v != null
          ? `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
          : k
      )
      .join(" | ");
  }
  return String(item);
};

/* ====================== IMAGE GALLERY ====================== */

const ImageGallery = ({ images = [], productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);

  const handlePrev = () => {
    if (!images?.length) return;
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!images?.length) return;
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const onMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const mainImage = images?.[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        ref={imageRef}
        className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 group shadow-sm"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={onMove}
      >
        {mainImage?.url ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt || productName}
            className="w-full h-[380px] md:h-[480px] lg:h-[520px] object-contain transition-transform duration-150 ease-out"
            style={
              isZoomed
                ? {
                    transform: "scale(2.05)",
                    transformOrigin: `${pos.x}% ${pos.y}%`,
                  }
                : { transform: "scale(1)" }
            }
          />
        ) : (
          <div className="w-full h-[380px] md:h-[480px] lg:h-[520px] flex flex-col items-center justify-center text-gray-400 gap-2">
            <Package size={40} />
            <span className="text-sm">No image available</span>
          </div>
        )}

        {/* Navigation Arrows */}
        {images?.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Image index */}
        {images?.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Zoom Indicator */}
        {isZoomed && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 text-white text-[11px] rounded-full">
            Hover to zoom
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images?.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={img.publicId || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === selectedIndex
                  ? "border-emerald-500 shadow-lg scale-105"
                  : "border-gray-200 hover:border-gray-400"
              }`}
              aria-label={`Thumbnail ${idx + 1}`}
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.alt || productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  No img
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ====================== MAIN COMPONENT ====================== */

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loadingProduct, error } = useSelector(
    (state) => state.products
  );
  const { userInfo } = useSelector((state) => state.auth);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState("login");
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  const colors = useMemo(() => parseArray(product?.color), [product?.color]);
  const featureList = useMemo(
    () => parseArray(product?.features),
    [product?.features]
  );
  const specsObject = useMemo(
    () => parseSpecifications(product?.specifications),
    [product?.specifications]
  );

  useEffect(() => {
    if (!product) return;

    if (colors.length > 0) setSelectedColor(colors[0]);

    if (product.variants?.length > 0) {
      const available =
        product.variants.find((v) => v.stock > 0) || product.variants[0];
      setSelectedSize(available.size);
    } else {
      setSelectedSize(null);
    }

    setQuantity(1);
  }, [product, colors.length]);

  const currentVariant = useMemo(() => {
    if (!product?.variants?.length || !selectedSize) return null;
    return (
      product.variants.find((v) => v.size === selectedSize) ||
      product.variants[0]
    );
  }, [product, selectedSize]);

  const price = useMemo(() => {
    if (!product) return 0;
    if (currentVariant) return currentVariant.price || 0;
    return product.price ?? 0;
  }, [product, currentVariant]);

  const stock = useMemo(() => {
    if (!product) return 0;
    if (currentVariant) return currentVariant.stock ?? 0;
    return product.stock ?? 0;
  }, [product, currentVariant]);

  const hasOldPrice =
    typeof product?.oldPrice === "number" &&
    product.oldPrice > 0 &&
    product.oldPrice > price;

  const discountPercent = useMemo(() => {
    if (!hasOldPrice || !price) return null;
    return Math.round(((product.oldPrice - price) / product.oldPrice) * 100);
  }, [hasOldPrice, product?.oldPrice, price]);

  const changeQty = (type) => {
    setQuantity((prev) => {
      if (type === "dec") return Math.max(1, prev - 1);
      return Math.min(stock || 1, prev + 1);
    });
  };

  const validateAndBuildPayload = () => {
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
  };

  const ensureAuth = () => {
    if (!userInfo) {
      message.info("Please login to continue");
      setAuthDefaultTab("login");
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const tryAddToCart = async () => {
    if (!ensureAuth()) return;

    const payload = validateAndBuildPayload();
    if (!payload) return;

    try {
      setAdding(true);
      const result = await dispatch(addItemToCart(payload));

      if (result.meta?.requestStatus === "fulfilled") {
        message.success("Item added to cart!", 2);
        setCartSidebarOpen(true);
      } else {
        const err =
          result.payload || result.error?.message || "Failed to add item to cart";
        message.error(err);
      }
    } catch {
      message.error("Failed to add item to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!ensureAuth()) return;

    const payload = validateAndBuildPayload();
    if (!payload) return;

    try {
      setBuying(true);
      const result = await dispatch(addItemToCart(payload));
      if (result.meta?.requestStatus === "fulfilled") {
        navigate("/checkout");
      } else {
        const err =
          result.payload || result.error?.message || "Failed to start checkout";
        message.error(err);
      }
    } catch {
      message.error("Failed to start checkout");
    } finally {
      setBuying(false);
    }
  };

  /* ====================== SHARE HANDLER ====================== */

  const handleShare = async () => {
    if (!product?._id) {
      message.error("Unable to share this product.");
      return;
    }

    if (typeof window === "undefined" || typeof navigator === "undefined") {
      message.warning("Sharing is not available in this environment.");
      return;
    }

    const url = `${window.location.origin}/product/${product._id}`;
    const title = product.name || "Check this product";
    const text = product.description
      ? product.description.slice(0, 140) +
        (product.description.length > 140 ? "..." : "")
      : "Check out this product";

    const shareData = { title, text, url };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        message.success("Thanks for sharing!");
      } else {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = url;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
        message.success("Product link copied to clipboard");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        message.error("Could not share right now. Please try again.");
      }
    }
  };

  /* ====================== LOADING / ERROR ====================== */

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={28} />
          </div>
          <p className="text-gray-700">Unable to load product</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const totalPrice = price * quantity;
  const savings = hasOldPrice ? (product.oldPrice - price) * quantity : 0;

  /* ====================== MAIN UI ====================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-white pb-28 md:pb-10">
      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authDefaultTab}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={cartSidebarOpen}
        onClose={() => setCartSidebarOpen(false)}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-700">Products</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <div>
            {discountPercent != null && discountPercent > 0 && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500 text-white rounded-full text-xs font-bold shadow">
                  🔥 Save {discountPercent}%
                </span>
              </div>
            )}
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Title / Rating / Actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {product.name}
                </h1>
                {/* Gradient underline under title */}
                <div className="mt-1 h-1 w-28 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < Math.floor(product.ratings?.average || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    <span className="text-sm font-semibold text-gray-700 ml-1">
                      {(product.ratings?.average || 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.ratings?.count || 0} reviews)
                    </span>
                  </div>
                  {product.sku && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip title="Share">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-full border bg-white hover:bg-gray-50 hover:shadow-sm transition"
                    aria-label="Share product"
                  >
                    <Share2 size={18} />
                  </button>
                </Tooltip>
                <Tooltip title="Add to Wishlist">
                  <button
                    type="button"
                    onClick={() => message.success("Added to wishlist")}
                    className="p-2 rounded-full border bg-white hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm transition"
                    aria-label="Add to wishlist"
                  >
                    <Heart size={18} />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Price Card */}
            <div className="rounded-2xl p-4 border-2 border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ₵{formatCurrency(price)}
                </span>
                {hasOldPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ₵{formatCurrency(product.oldPrice)}
                  </span>
                )}
                {hasOldPrice && (
                  <span className="ml-auto text-xs px-2 py-1 bg-emerald-600 text-white rounded-full">
                    You save ₵{formatCurrency(product.oldPrice - price)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    stock > 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {stock > 0
                    ? stock <= 3
                      ? "⚡ Only a few left"
                      : "✓ In Stock"
                    : "✗ Out of Stock"}
                </span>
                {stock > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-600">
                    <Info size={14} />
                    Tax inclusive
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <TruckIcon size={14} />
                  Fast delivery
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <Shield size={14} />
                  Buyer protection
                </span>
              </div>
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-gray-700" />
                  <span className="font-semibold text-gray-900">Color:</span>
                  <span className="text-gray-600">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color, idx) => {
                    const isSelected = selectedColor === color;
                    const bg = getColorStyle(color);
                    return (
                      <Tooltip title={color} key={idx}>
                        <button
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-10 h-10 rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            isSelected
                              ? "border-emerald-500 ring-2 ring-emerald-200 scale-105"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: bg }}
                          aria-label={`Select color ${color}`}
                        >
                          {isSelected && (
                            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow">
                              <Check size={12} />
                            </span>
                          )}
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.variants?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler size={18} className="text-gray-700" />
                  <span className="font-semibold text-gray-900">Size:</span>
                  <span className="text-gray-600">
                    {selectedSize || "Select size"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => {
                    const isSelected = selectedSize === variant.size;
                    const isOutOfStock = (variant.stock ?? 0) <= 0;
                    return (
                      <button
                        key={variant._id}
                        type="button"
                        onClick={() => !isOutOfStock && setSelectedSize(variant.size)}
                        disabled={isOutOfStock}
                        className={`relative px-4 py-2 rounded-xl border-2 font-semibold transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 shadow-sm"
                            : isOutOfStock
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-200 bg-white hover:border-gray-400"
                        }`}
                        aria-label={`Select size ${variant.size}`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className={isOutOfStock ? "line-through text-gray-400" : ""}>
                            {variant.size}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            ₵{formatCurrency(variant.price)}
                          </span>
                        </div>
                        {isSelected && (
                          <Check size={16} className="absolute top-1 right-1 text-emerald-600" />
                        )}
                        {isOutOfStock && (
                          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            Out
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <span className="font-semibold text-gray-900">Quantity:</span>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => changeQty("dec")}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="w-16 text-center font-bold text-lg">{quantity}</div>
                  <button
                    type="button"
                    onClick={() => changeQty("inc")}
                    disabled={quantity >= stock}
                    className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {stock > 0 && (
                  <span className="text-sm text-gray-600">{stock} available</span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2 hidden md:block">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stock === 0 || buying}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {buying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/80 border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={22} />
                    Buy Now
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={tryAddToCart}
                disabled={stock === 0 || adding}
                className="w-full py-4 bg-white border-2 border-emerald-500 text-emerald-600 font-bold text-lg rounded-xl hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow hover:shadow-md flex items-center justify-center gap-2"
              >
                {adding ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={22} />
                    Add to Cart
                  </>
                )}
              </button>

              {/* Trust bar */}
              <div className="pt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-emerald-600" />
                  Secure payment
                </div>
                <div className="flex items-center gap-2">
                  <TruckIcon size={14} className="text-emerald-600" />
                  2–5 day delivery
                </div>
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-emerald-600" />
                  Easy returns
                </div>
              </div>

              {hasOldPrice && savings > 0 && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
                  You’ll save approx ₵{formatCurrency(savings)} on this order
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRODUCT DETAILS */}
        <section className="mt-10 bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-200">
          {/* Header + big underline */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Product Details
              </h2>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                <Info size={14} />
                Info provided by seller
              </span>
            </div>
            {/* Bold gradient underline + subtle fade line */}
            <div className="mt-2 flex items-center gap-3">
              <div className="h-1.5 w-44 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />
              <div className="h-[3px] flex-1 rounded-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>
          </div>

          <div className="grid md:grid-cols-[1.6fr,1.2fr] gap-8">
            {/* Left: Description & Features */}
            <div className="space-y-8">
              {/* Description */}
              <div>
                <div className="flex items-center gap-2">
                  <Info size={18} className="text-emerald-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                </div>
                {/* mini underline */}
                <div className="mt-1 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="mt-3 text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {product.description || "No description available."}
                </div>
              </div>

              {/* Features */}
              {featureList.length > 0 && (
                <div>
                  <div className="flex items-center gap-2">
                    <Check size={18} className="text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
                  </div>
                  {/* mini underline */}
                  <div className="mt-1 h-1 w-20 rounded-full bg-gradient-to-r from-amber-400 to-rose-400" />
                  <ul className="mt-3 space-y-2">
                    {featureList.map((f, idx) => {
                      const text = getFeatureText(f);
                      if (!text) return null;
                      return (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Additional Info */}
              {product.additionalInfo && (
                <div>
                  <div className="flex items-center gap-2">
                    <Info size={18} className="text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                  </div>
                  {/* mini underline */}
                  <div className="mt-1 h-1 w-28 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400" />
                  <div className="mt-3 text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {product.additionalInfo}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Specifications */}
            {Object.keys(specsObject).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler size={18} className="text-emerald-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
                </div>
                {/* mini underline */}
                <div className="h-1 w-24 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(specsObject).map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 hover:bg-white hover:shadow-sm transition"
                    >
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {label}
                      </div>
                      <div>{renderSpecValue(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Decorative underline at the bottom of the whole section */}
          <div className="mt-8 h-[3px] rounded-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
        </section>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      {product && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] z-40">
          <div className="px-4 py-2 flex items-center justify-between gap-3">
            {/* Qty controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">Qty</span>
              <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-gray-50">
                <button
                  type="button"
                  onClick={() => changeQty("dec")}
                  disabled={quantity <= 1}
                  className="px-2 py-1 text-base text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => changeQty("inc")}
                  disabled={stock === 0 || quantity >= stock}
                  className="px-2 py-1 text-base text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="text-right">
              <p className="text-[11px] text-gray-500">Total</p>
              <p className="text-sm font-semibold text-gray-900">
                ₵{formatCurrency(totalPrice)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <button
              type="button"
              onClick={tryAddToCart}
              disabled={stock === 0 || adding}
              className="py-2.5 text-xs font-semibold flex items-center justify-center gap-1 border-t border-r border-gray-200 bg-white text-emerald-600 disabled:text-gray-400 disabled:bg-gray-100"
            >
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Add to Cart
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={stock === 0 || buying}
              className="py-2.5 text-xs font-semibold flex items-center justify-center gap-1 border-t border-gray-200 bg-gradient-to-r from-emerald-500 to-teal-500 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {buying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/70 border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Buy Now
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;