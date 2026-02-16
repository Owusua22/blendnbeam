// src/Component/NewArrivals.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Tag,
  Image,
  Button,
  Typography,
  Tooltip,
} from "antd";
import { Eye, Package, TrendingUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../Redux/slice/productSlice";

const { Title, Text } = Typography;

const MAX_ITEMS = 12; // how many "new arrivals" to show

// THEME (same family as Chairs)
const theme = {
  
  borderSubtle: "rgba(15,23,42,0.06)",
  borderStrong: "rgba(15,23,42,0.12)",
  shadowSoft: "0 18px 45px rgba(15,23,42,0.06)",
  shadowHover: "0 22px 55px rgba(15,23,42,0.14)",
  brandPrimary: "#111827",
  brandMuted: "#6b7280",
  brandSoft: "#9ca3af",
  accentYellow: "#facc15",
  accentGreen: "#22c55e",
  success: "#16a34a",
  danger: "#ef4444",
};

// STYLES (aligned with Chairs)
const styles = {
  page: {
    background: theme.pageBg,
    padding: "8px 0 16px",
    color: theme.brandPrimary,
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    WebkitFontSmoothing: "antialiased",
  },
  pageInner: {
    maxWidth: 1800,
    margin: "0 auto",
    padding: "0 8px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  sectionTitle: {
    margin: 0,
    fontWeight: 600,
    letterSpacing: "0.03em",
    fontSize: 17,
    color: theme.brandPrimary,
    textTransform: "uppercase",
  },
  sectionAccentBar: {
    width: 70,
    height: 3,
    borderRadius: 999,
    background: `linear-gradient(90deg,${theme.accentYellow},${theme.accentGreen})`,
    boxShadow: "0 4px 10px rgba(34,197,94,0.35)",
    marginBottom: 10,
  },
  productsGrid: {
    display: "grid",
    gap: 14,
    alignItems: "stretch",
  },
  productCardBase: {
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme.borderSubtle,
    boxShadow: theme.shadowSoft,
    cursor: "pointer",
    transition:
      "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease",
  },
  productCardHovered: {
    transform: "translateY(-3px)",
    boxShadow: theme.shadowHover,
    borderColor: "rgba(22,163,74,0.35)",
    background: "#ffffff",
  },
  productCardBody: {
    padding: "12px 8px 15px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  productCardSkeleton: {
    cursor: "default",
    pointerEvents: "none",
  },
  skeletonMedia: {
    width: "100%",
    aspectRatio: "4 / 5",
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
    marginBottom: 8,
  },
  skeletonLine: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    marginBottom: 4,
  },
  skeletonLineShort: {
    width: "70%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    marginBottom: 4,
  },
  skeletonMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  skeletonPrice: {
    width: 52,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  skeletonButton: {
    width: 70,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  productMediaOuter: {
    borderRadius: 16,
    padding: 4,
  },
  productMediaInner: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    background: "#f9fafb",
    aspectRatio: "4 / 5",
  },
  productImagePlaceholder: {
    width: "100%",
    aspectRatio: "4 / 5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
  },
  mediaBadgesRow: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    display: "flex",
    justifyContent: "space-between",
    gap: 6,
    pointerEvents: "none",
  },
  badgeBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px 7px",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderRadius: 999,
    pointerEvents: "auto",
    whiteSpace: "nowrap",
  },
  badgeDiscount: {
    background: "#fee2e2",
    color: "#ef4444",
  },
  badgeVariants: {
    background: "#fef9c3",
    color: "#65a30d",
    marginLeft: "auto",
  },
  outOfStockOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(249,250,251,0.85)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  outOfStockTag: {
    borderRadius: 999,
    padding: "4px 12px",
    border: `1px solid ${theme.borderStrong}`,
    background: "rgba(255,255,255,0.96)",
    color: theme.brandMuted,
    fontSize: 10,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  productBody: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.brandPrimary,
    lineHeight: 1.25,
    minHeight: 36,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    transition: "color 0.18s ease",
  },
  productTitleHovered: {
    color: theme.success,
  },
  priceRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 2,
  },
  priceColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  currentPrice: {
    fontSize: 14,
    color: theme.success,
    letterSpacing: "0.02em",
  },
  oldPrice: {
    fontSize: 11,
    color: "#9ca3af",
  },
  lowStock: {
    fontSize: 11,
    color: "#ef4444",
  },
  variantInfo: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    color: theme.brandMuted,
    padding: "3px 6px",
    borderRadius: 999,
    background: "#fefce8",
    marginTop: 1,
  },
  actions: {
    marginTop: 4,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  ctaButton: {
    width: "100%",
    height: 34,
    borderRadius: 999,
    border: "none",
    background: `linear-gradient(135deg,${theme.accentYellow},${theme.accentGreen})`,
    color: "#14532d",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxShadow: "0 12px 26px rgba(22,163,74,0.35)",
    transition:
      "background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
  },
  emptyCard: {
    borderRadius: 18,
    border: "1px dashed rgba(148,163,184,0.55)",
    background: "linear-gradient(135deg,#fefce8,#ecfdf5)",
  },
  emptyState: {
    padding: "42px 12px",
    textAlign: "center",
  },
  emptyIcon: {
    color: "#d1d5db",
    marginBottom: 10,
  },
  emptyTitle: {
    marginBottom: 4,
    fontWeight: 500,
    color: theme.brandMuted,
  },
  emptyDescription: {
    fontSize: 13.5,
    color: theme.brandSoft,
  },
};

// RESPONSIVE GRID
const getColumnCount = (width) => {
  if (width < 640) return 2;
  if (width < 1024) return 4;
  return 6;
};

const useResponsiveColumns = () => {
  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return 2;
    return getColumnCount(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setColumns(getColumnCount(window.innerWidth));
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return columns;
};

// HELPERS
const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getPriceDisplay = (product) => {
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants.map((v) => Number(v.price || 0));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return {
        display: `₵${formatMoney(minPrice)}`,
        isRange: false,
        min: minPrice,
        max: maxPrice,
      };
    }
    return {
      display: `₵${formatMoney(minPrice)} - ₵${formatMoney(maxPrice)}`,
      isRange: true,
      min: minPrice,
      max: maxPrice,
    };
  }
  const price = Number(product.price || 0);
  return {
    display: `₵${formatMoney(price)}`,
    isRange: false,
    min: price,
    max: price,
  };
};

const getStockCount = (product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return product.stock || 0;
};

const isProductActive = (product) => {
  const stock = getStockCount(product);
  return (product.isActive ?? true) && stock > 0;
};

const calcDiscount = (price, oldPrice) => {
  if (!oldPrice || oldPrice <= 0 || price >= oldPrice) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

// SKELETON CARD
const ProductSkeleton = () => (
  <Card
    bordered={false}
    style={{ ...styles.productCardBase, ...styles.productCardSkeleton }}
    bodyStyle={styles.productCardBody}
  >
    <div style={styles.skeletonMedia} />
    <div>
      <div style={styles.skeletonLine} />
      <div style={styles.skeletonLineShort} />
      <div style={styles.skeletonMetaRow}>
        <div style={styles.skeletonPrice} />
        <div style={styles.skeletonButton} />
      </div>
    </div>
  </Card>
);

// PRODUCT CARD
const ProductCard = ({ product, priceInfo, stockCount, discount, isActive, onView }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      hoverable
      bordered={false}
      onClick={() => onView(product._id)}
      style={{
        ...styles.productCardBase,
        ...(hovered ? styles.productCardHovered : {}),
      }}
      bodyStyle={styles.productCardBody}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.productMediaOuter}>
        <div style={styles.productMediaInner}>
          {product.images?.[0]?.url ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              preview={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: hovered ? "scale(1.04)" : "scale(1.0)",
                transition: "transform 0.26s ease-out",
                display: "block",
              }}
              placeholder={
                <div style={styles.productImagePlaceholder}>
                  <Package size={30} />
                </div>
              }
            />
          ) : (
            <div style={styles.productImagePlaceholder}>
              <Package size={36} />
            </div>
          )}

          <div style={styles.mediaBadgesRow}>
            {discount > 0 && (
              <span style={{ ...styles.badgeBase, ...styles.badgeDiscount }}>
                -{discount}%
              </span>
            )}
            {product.variants && product.variants.length > 0 && (
              <span style={{ ...styles.badgeBase, ...styles.badgeVariants }}>
                {product.variants.length} sizes
              </span>
            )}
          </div>

          {!isActive && (
            <div style={styles.outOfStockOverlay}>
              <Tag style={styles.outOfStockTag}>Out of stock</Tag>
            </div>
          )}
        </div>
      </div>

      <div style={styles.productBody}>
        <div
          style={{
            ...styles.productTitle,
            ...(hovered ? styles.productTitleHovered : {}),
          }}
        >
          {product.name}
        </div>

        <div style={styles.priceRow}>
          <div style={styles.priceColumn}>
            <Tooltip
              title={priceInfo.isRange ? "Multiple price points" : ""}
              placement="top"
            >
              <Text strong style={styles.currentPrice}>
                {priceInfo.display}
              </Text>
            </Tooltip>
            {product.oldPrice > 0 && product.oldPrice > priceInfo.min && (
              <Text delete type="secondary" style={styles.oldPrice}>
                ₵{formatMoney(product.oldPrice)}
              </Text>
            )}
          </div>

          {stockCount > 0 && stockCount < 10 && (
            <Text type="secondary" style={styles.lowStock}>
              {stockCount} left
            </Text>
          )}
        </div>

        {product.variants && product.variants.length > 0 && (
          <div style={styles.variantInfo}>
            <TrendingUp size={12} />
            <span>Multiple sizes available</span>
          </div>
        )}

        <div style={styles.actions}>
          <Button
            style={styles.ctaButton}
            icon={<Eye size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onView(product._id);
            }}
          >
            View details
          </Button>
        </div>
      </div>
    </Card>
  );
};

// NEW ARRIVALS COMPONENT (GRID ONLY)
const NewArrivals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const columns = useResponsiveColumns();

  const { products = [], loadingProducts, error } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const recentProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
    return sorted.slice(0, MAX_ITEMS);
  }, [products]);

  const gridStyle = useMemo(
    () => ({
      ...styles.productsGrid,
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      marginTop: 8,
    }),
    [columns]
  );

  const handleViewProduct = (id) => navigate(`/product/${id}`);

  if (!loadingProducts && !error && recentProducts.length === 0) {
    return null;
  }

  return (
    <div style={styles.page}>
      <div style={styles.pageInner}>
        <section style={styles.section}>
          <header style={styles.sectionHeader}>
            <Title level={4} style={styles.sectionTitle}>
              New Arrivals
            </Title>
          </header>
          <div style={styles.sectionAccentBar} />

          {loadingProducts ? (
            <div style={gridStyle}>
              {Array.from({ length: columns }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <Card bordered={false} style={styles.emptyCard}>
              <div style={styles.emptyState}>
                <Package size={48} style={styles.emptyIcon} />
                <Title level={4} style={styles.emptyTitle}>
                  Couldn&apos;t fetch new arrivals
                </Title>
                <Text type="secondary" style={styles.emptyDescription}>
                  {String(error)}
                </Text>
              </div>
            </Card>
          ) : (
            <div style={gridStyle}>
              {recentProducts.map((product) => {
                const priceInfo = getPriceDisplay(product);
                const stockCount = getStockCount(product);
                const discount = calcDiscount(
                  priceInfo.min,
                  product.oldPrice
                );
                const isActive = isProductActive(product);

                return (
                  <ProductCard
                    key={product._id}
                    product={product}
                    priceInfo={priceInfo}
                    stockCount={stockCount}
                    discount={discount}
                    isActive={isActive}
                    onView={handleViewProduct}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default NewArrivals;