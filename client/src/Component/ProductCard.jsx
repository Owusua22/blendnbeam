import React, { useState } from "react";
import {
  Card,
  Tag,
  Image,
  Button,
  Typography,
  Tooltip,
} from "antd";
import { Eye, Heart, Package, TrendingUp } from "lucide-react";

const { Text } = Typography;

// Theme dedicated to the product card
export const productCardTheme = {
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

export const productCardStyles = {
  // Card shell
  productCardBase: {
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(255,255,255,0.96)",
    border: `1px solid ${productCardTheme.borderSubtle}`,
    boxShadow: productCardTheme.shadowSoft,
    cursor: "pointer",
    transition:
      "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease",
  },
  productCardHovered: {
    transform: "translateY(-3px)",
    boxShadow: productCardTheme.shadowHover,
    borderColor: "rgba(22,163,74,0.35)",
    background: "#ffffff",
  },
  productCardBody: {
    padding: "12px 8px 15px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },

  // Skeleton
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

  // Media
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

  // Badges
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

  // Wishlist
  wishlistButton: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 999,
    border: "none",
    background: "rgba(255,255,255,0.96)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 7px 18px rgba(15,23,42,0.14)",
    backdropFilter: "blur(10px)",
    padding: 0,
  },
  wishlistIcon: {
    transition: "color 0.18s ease, transform 0.18s ease",
  },

  // Out of stock
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
    border: `1px solid ${productCardTheme.borderStrong}`,
    background: "rgba(255,255,255,0.96)",
    color: productCardTheme.brandMuted,
    fontSize: 10,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  // Body
  productBody: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: productCardTheme.brandPrimary,
    lineHeight: 1.25,
    minHeight: 36,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    transition: "color 0.18s ease",
  },
  productTitleHovered: {
    color: productCardTheme.success,
  },

  // Price
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
    color: productCardTheme.success,
    letterSpacing: "0.02em",
  },
  oldPrice: {
    fontSize: 11,
    color: "#9ca3af",
  },
  lowStock: {
    fontSize: 11,
    color: productCardTheme.danger,
  },

  // Variants info
  variantInfo: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    color: productCardTheme.brandMuted,
    padding: "3px 6px",
    borderRadius: 999,
    background: "#fefce8",
    marginTop: 1,
  },

  // Actions
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
    background: `linear-gradient(135deg,${productCardTheme.accentYellow},${productCardTheme.accentGreen})`,
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

// Skeleton card
export const ProductCardSkeleton = () => (
  <Card
    bordered={false}
    style={{
      ...productCardStyles.productCardBase,
      ...productCardStyles.productCardSkeleton,
    }}
    bodyStyle={productCardStyles.productCardBody}
  >
    <div style={productCardStyles.skeletonMedia} />
    <div>
      <div style={productCardStyles.skeletonLine} />
      <div style={productCardStyles.skeletonLineShort} />
      <div style={productCardStyles.skeletonMetaRow}>
        <div style={productCardStyles.skeletonPrice} />
        <div style={productCardStyles.skeletonButton} />
      </div>
    </div>
  </Card>
);

// Reusable ProductCard
export const ProductCard = ({
  product,
  priceInfo,
  stockCount,
  discount,
  isWishlisted,
  isActive,
  onView, // function(productId)
  onToggleWishlist, // function(productId)
  showVariantInfo = true,
  ctaLabel = "View details",
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      hoverable
      bordered={false}
      onClick={() => onView(product._id)}
      style={{
        ...productCardStyles.productCardBase,
        ...(hovered ? productCardStyles.productCardHovered : {}),
      }}
      bodyStyle={productCardStyles.productCardBody}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media */}
      <div style={productCardStyles.productMediaOuter}>
        <div style={productCardStyles.productMediaInner}>
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
                <div style={productCardStyles.productImagePlaceholder}>
                  <Package size={30} />
                </div>
              }
            />
          ) : (
            <div style={productCardStyles.productImagePlaceholder}>
              <Package size={36} />
            </div>
          )}

          {/* Badges */}
          <div style={productCardStyles.mediaBadgesRow}>
            {discount > 0 && (
              <span
                style={{
                  ...productCardStyles.badgeBase,
                  ...productCardStyles.badgeDiscount,
                }}
              >
                -{discount}%
              </span>
            )}
            {product.variants && product.variants.length > 0 && (
              <span
                style={{
                  ...productCardStyles.badgeBase,
                  ...productCardStyles.badgeVariants,
                }}
              >
                {product.variants.length} sizes
              </span>
            )}
          </div>

          {/* Wishlist */}
          <Button
            type="text"
            size="small"
            style={productCardStyles.wishlistButton}
            icon={
              <Heart
                size={15}
                style={{
                  ...productCardStyles.wishlistIcon,
                  color: isWishlisted
                    ? productCardTheme.danger
                    : "#6b7280",
                  fill: isWishlisted ? productCardTheme.danger : "none",
                }}
              />
            }
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product._id);
            }}
          />

          {/* Out of stock overlay */}
          {!isActive && (
            <div style={productCardStyles.outOfStockOverlay}>
              <Tag style={productCardStyles.outOfStockTag}>Out of stock</Tag>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={productCardStyles.productBody}>
        <div
          style={{
            ...productCardStyles.productTitle,
            ...(hovered ? productCardStyles.productTitleHovered : {}),
          }}
        >
          {product.name}
        </div>

        {/* Price */}
        <div style={productCardStyles.priceRow}>
          <div style={productCardStyles.priceColumn}>
            <Tooltip
              title={priceInfo.isRange ? "Multiple price points" : ""}
              placement="top"
            >
              <Text strong style={productCardStyles.currentPrice}>
                {priceInfo.display}
              </Text>
            </Tooltip>
            {product.oldPrice > 0 && product.oldPrice > priceInfo.min && (
              <Text delete type="secondary" style={productCardStyles.oldPrice}>
                ₵{product.oldPrice.toFixed(2)}
              </Text>
            )}
          </div>

          {stockCount > 0 && stockCount < 10 && (
            <Text type="secondary" style={productCardStyles.lowStock}>
              {stockCount} left
            </Text>
          )}
        </div>

        {/* Variant info */}
        {showVariantInfo &&
          product.variants &&
          product.variants.length > 0 && (
            <div style={productCardStyles.variantInfo}>
              <TrendingUp size={12} />
              <span>Multiple sizes available</span>
            </div>
          )}

        {/* CTA */}
        <div style={productCardStyles.actions}>
          <Button
            style={productCardStyles.ctaButton}
            icon={<Eye size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onView(product._id);
            }}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
};