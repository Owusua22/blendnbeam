import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Spin,
  Typography,
  Pagination,
  Empty,
  Select,
  Checkbox,
  Card,
  Tag,
  Image,
  Button,
  Tooltip,
} from "antd";
import { Eye, Package, TrendingUp } from "lucide-react";
import { fetchProductsByCategory } from "../Redux/slice/productSlice";
import { fetchCategories } from "../Redux/slice/categorySlice";

const { Title, Text } = Typography;
const { Option } = Select;

const PAGE_SIZE = 12;

// ========================
//   THEME & INLINE STYLES
// ========================
const theme = {
  pageBg:
    "radial-gradient(circle at top left,#fefce8 0,#f5f5f7 40%,#ecfdf5 100%)",
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

const styles = {
  page: {
    background: theme.pageBg,
    minHeight: "100vh",
    padding: "12px 0 24px",
    color: theme.brandPrimary,
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  pageInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 12px",
  },
  headerCard: {
    borderRadius: 18,
    padding: "16px 18px",
    marginBottom: 14,
    background:
      "linear-gradient(135deg, rgba(22,163,74,0.07), rgba(56,189,248,0.05))",
    border: "1px solid rgba(34,197,94,0.25)",
    boxShadow: "0 18px 40px rgba(22,163,74,0.15)",
  },
  headerRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  headerTitle: {
    margin: 0,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontSize: 15,
    color: theme.brandPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.brandSoft,
  },
  headerMeta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "2px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    background: "rgba(22,163,74,0.06)",
    color: "#16a34a",
    border: "1px solid rgba(22,163,74,0.2)",
  },
  sectionAccentBar: {
    width: 80,
    height: 3,
    borderRadius: 999,
    background: `linear-gradient(90deg,${theme.accentYellow},${theme.accentGreen})`,
    boxShadow: "0 4px 10px rgba(34,197,94,0.35)",
    marginTop: 6,
  },
  filterRow: {
    marginTop: 10,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },

  // Grid
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: 14,
    alignItems: "stretch",
    marginTop: 12,
  },

  // Product card (same style family as ProductsByShowroom)
  productCardBase: {
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(255,255,255,0.96)",
    border: `1px solid ${theme.borderSubtle}`,
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
    padding: "10px 8px 12px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  productMediaOuter: {
    marginBottom: 6,
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
    fontSize: 13.5,
    fontWeight: 500,
    color: theme.brandPrimary,
    lineHeight: 1.25,
    minHeight: 34,
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
    color: theme.danger,
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
    height: 32,
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
};

// ========================
//   HELPERS
// ========================
const getLowestVariantPrice = (product) => {
  if (!product?.variants || product.variants.length === 0) return null;
  const prices = product.variants
    .map((v) => {
      const n = Number(v.price);
      return Number.isFinite(n) ? n : null;
    })
    .filter((p) => p !== null);
  if (!prices.length) return null;
  return Math.min(...prices);
};

const getNumericPrice = (product) => {
  const varPrice = getLowestVariantPrice(product);
  if (varPrice !== null) return varPrice;
  const base = Number(product.price);
  return Number.isFinite(base) ? base : 0;
};

const getPriceDisplayInfo = (product) => {
  const varPrice = getLowestVariantPrice(product);
  const basePrice = Number(product.price || 0);

  if (varPrice !== null) {
    if (!basePrice || varPrice === basePrice) {
      return {
        isRange: false,
        text: formatPrice(varPrice),
        min: varPrice,
        max: varPrice,
      };
    }
    // If variant cheaper than base, show "From"
    return {
      isRange: true,
      text: `From ${formatPrice(varPrice)}`,
      min: varPrice,
      max: basePrice,
    };
  }

  return {
    isRange: false,
    text: formatPrice(basePrice),
    min: basePrice,
    max: basePrice,
  };
};

const getStockCount = (product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return product.stock ?? product.quantity ?? 0;
};

const isProductActive = (product) => {
  const stock = getStockCount(product);
  // if your product model has isActive, use it; otherwise treat stock>0 as active
  return (product.isActive ?? true) && stock > 0;
};

const calcDiscount = (price, oldPrice) => {
  if (!oldPrice || oldPrice <= 0 || price >= oldPrice) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price || 0);

// ========================
//   PRODUCT CARD
// ========================
const CategoryProductCard = ({ product, onView }) => {
  const [hovered, setHovered] = useState(false);

  const priceInfo = getPriceDisplayInfo(product);
  const stockCount = getStockCount(product);
  const discount = calcDiscount(priceInfo.min, product.oldPrice);
  const isActive = isProductActive(product);

  const imageUrl =
    product.images?.[0]?.url || product.image || product.productImage;

  return (
    <Card
      hoverable
      bordered={false}
      onClick={() => onView(product)}
      style={{
        ...styles.productCardBase,
        ...(hovered ? styles.productCardHovered : {}),
      }}
      bodyStyle={styles.productCardBody}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media */}
      <div style={styles.productMediaOuter}>
        <div style={styles.productMediaInner}>
          {imageUrl ? (
            <Image
              src={imageUrl}
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

          {/* Badges */}
          <div style={styles.mediaBadgesRow}>
            {discount > 0 && (
              <span
                style={{ ...styles.badgeBase, ...styles.badgeDiscount }}
              >
                -{discount}%
              </span>
            )}
            {product.variants && product.variants.length > 0 && (
              <span
                style={{ ...styles.badgeBase, ...styles.badgeVariants }}
              >
                {product.variants.length} sizes
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {!isActive && (
            <div style={styles.outOfStockOverlay}>
              <Tag style={styles.outOfStockTag}>Out of stock</Tag>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
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
              title={priceInfo.isRange ? "From lowest variant price" : ""}
              placement="top"
            >
              <Text strong style={styles.currentPrice}>
                {priceInfo.text}
              </Text>
            </Tooltip>
            {product.oldPrice > 0 &&
              product.oldPrice > priceInfo.min && (
                <Text delete type="secondary" style={styles.oldPrice}>
                  {formatPrice(product.oldPrice)}
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
            <span>Multiple variants</span>
          </div>
        )}

        <div style={styles.actions}>
          <Button
            style={styles.ctaButton}
            icon={<Eye size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onView(product);
            }}
          >
            View details
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ========================
//   CATEGORY PRODUCTS PAGE
// ========================
const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    products = [],
    productsByCategory = {},
    loadingProducts = false,
    loadingProductsByCategory = {},
    error,
    errorProductsByCategory = {},
  } = useSelector((state) => state.products || {});

  const {
    items: categories = [],
    loading: loadingCategories,
  } = useSelector((state) => state.categories || {});

  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState("featured");
  const [priceFilter, setPriceFilter] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);

  const categoryInfo =
    categories.find(
      (c) => c._id === categoryId || c.slug === categoryId
    ) || null;

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  useEffect(() => {
    if (!categoryId) {
      navigate("/categoriesproductspage");
      return;
    }
    dispatch(fetchProductsByCategory(categoryId));
    setPage(1);
  }, [dispatch, categoryId, location.key, navigate]);

  const categoryProducts =
    productsByCategory[categoryId] || products || [];

  const categoryLoading =
    loadingProductsByCategory[categoryId] ?? loadingProducts;
  const categoryError =
    errorProductsByCategory[categoryId] ?? error;

  const filteredAndSorted = useMemo(() => {
    let list = Array.isArray(categoryProducts)
      ? [...categoryProducts]
      : [];

    // FILTERS
    list = list.filter((p) => {
      const price = getNumericPrice(p);
      if (inStockOnly && !isProductActive(p)) return false;
      if (priceFilter !== "all") {
        if (priceFilter === "0-200" && !(price <= 200)) return false;
        if (priceFilter === "200-500" && !(price > 200 && price <= 500))
          return false;
        if (priceFilter === "500-1000" && !(price > 500 && price <= 1000))
          return false;
        if (priceFilter === "1000+" && !(price > 1000)) return false;
      }
      return true;
    });

    // SORT
    list.sort((a, b) => {
      const priceA = getNumericPrice(a);
      const priceB = getNumericPrice(b);
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      const dateA = a.createdAt ? new Date(a.createdAt) : null;
      const dateB = b.createdAt ? new Date(b.createdAt) : null;

      switch (sortOption) {
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        case "name-asc":
          return nameA.localeCompare(nameB);
        case "name-desc":
          return nameB.localeCompare(nameA);
        case "newest":
          if (dateA && dateB) return dateB - dateA;
          return 0;
        case "featured":
        default:
          return 0; // original order
      }
    });

    return list;
  }, [categoryProducts, sortOption, priceFilter, inStockOnly]);

  const total = filteredAndSorted.length;
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pagedProducts = filteredAndSorted.slice(start, end);

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const handleViewProduct = (product) => {
    const idOrSlug =
      product.slug || product._id || product.id || product.productID;
    navigate(`/product/${idOrSlug}`);
  };

  const loading = categoryLoading || loadingCategories;

  return (
    <div style={styles.page}>
      <div style={styles.pageInner}>
        {/* HEADER */}
        <section style={styles.headerCard}>
          <div style={styles.headerRow}>
            <div style={styles.headerTitleBlock}>
              <Title level={3} style={styles.headerTitle}>
                {categoryInfo ? categoryInfo.name : "Category"}
              </Title>
              <span style={styles.sectionAccentBar} />
              {categoryInfo?.description && (
                <Text style={styles.headerSubtitle}>
                  {categoryInfo.description}
                </Text>
              )}
            </div>

            <div style={styles.headerMeta}>
              <div style={styles.pill}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "999px",
                    background:
                      "radial-gradient(circle, #22c55e 0, #16a34a 40%, #166534 100%)",
                    boxShadow: "0 0 0 4px rgba(22,163,74,0.25)",
                  }}
                />
                <span>
                  {total} item{total !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* FILTERS & SORT */}
          <div style={styles.filterRow}>
            <Select
              size="small"
              value={sortOption}
              onChange={setSortOption}
              style={{ minWidth: 160 }}
            >
              <Option value="featured">Featured</Option>
              <Option value="price-asc">Price: Low to High</Option>
              <Option value="price-desc">Price: High to Low</Option>
              <Option value="name-asc">Name: A → Z</Option>
              <Option value="name-desc">Name: Z → A</Option>
              <Option value="newest">Newest</Option>
            </Select>

            <Select
              size="small"
              value={priceFilter}
              onChange={setPriceFilter}
              style={{ minWidth: 160 }}
            >
              <Option value="all">All prices</Option>
              <Option value="0-200">Up to ₵200</Option>
              <Option value="200-500">₵200 – ₵500</Option>
              <Option value="500-1000">₵500 – ₵1000</Option>
              <Option value="1000+">₵1000+</Option>
            </Select>

            <Checkbox
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            >
              In stock only
            </Checkbox>
          </div>
        </section>

        {/* CONTENT */}
        {loading ? (
          <div
            style={{
              padding: "40px 0",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Spin size="large" />
          </div>
        ) : categoryError ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <Text type="danger">
              Failed to load products: {String(categoryError)}
            </Text>
          </div>
        ) : !filteredAndSorted.length ? (
          <div style={{ padding: "40px 0" }}>
            <Empty description="No products found in this category" />
          </div>
        ) : (
          <>
            <div style={styles.productsGrid}>
              {pagedProducts.map((product) => (
                <CategoryProductCard
                  key={
                    product._id ||
                    product.id ||
                    product.productID
                  }
                  product={product}
                  onView={handleViewProduct}
                />
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;