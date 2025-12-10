import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Image,
  Badge,
  Button,
  Typography,
  Row,
  Col,
  message,
  Tooltip,
} from "antd";
import { Eye, ShoppingCart, Heart, Package, Star, TrendingUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// Redux actions
import { fetchProductsByShowroom } from "../Redux/slice/productSlice";
import { fetchShowrooms } from "../Redux/slice/showroomSlice";
import { addItemToCart } from "../Redux/slice/cartSlice";

const { Text, Title } = Typography;

// Helper function to get price range for products with variants
const getPriceDisplay = (product) => {
  // If product has variants
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants.map(v => v.price || 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return { display: `₵${minPrice.toFixed(2)}`, isRange: false, min: minPrice, max: maxPrice };
    }
    return { display: `₵${minPrice.toFixed(2)} - ₵${maxPrice.toFixed(2)}`, isRange: true, min: minPrice, max: maxPrice };
  }
  
  // If product has base price
  const price = product.price || 0;
  return { display: `₵${price.toFixed(2)}`, isRange: false, min: price, max: price };
};

// Helper function to get stock count
const getStockCount = (product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return product.stock || 0;
};

// Helper function to check if product is active
const isProductActive = (product) => {
  const stock = getStockCount(product);
  return product.isActive && stock > 0;
};

const ProductsByShowroom = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: showrooms = [], loading: loadingShowrooms } = useSelector(
    (state) => state.showrooms
  );

  useEffect(() => {
    dispatch(fetchShowrooms());
  }, [dispatch]);

  const handleViewProduct = (productId) => navigate(`/product/${productId}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-2 sm:px-6 md:px-8 lg:px-12 py-2">
        {loadingShowrooms ? (
          <LoadingShowrooms />
        ) : (
          showrooms.map((showroom, index) => (
            <section key={showroom._id} className={`mb-1 ${index > 0 ? 'mt-4' : ''}`}>
              {/* Section Header */}
              <div className="mb-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Title level={5} className="!mb-1 !text-gray-900">
                      {showroom.name}
                    </Title>
                  </div>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-yellow-500 to-green-500 rounded-full" />
              </div>

              {/* Products Grid */}
              <ShowroomProducts
                showroomId={showroom._id}
                onView={handleViewProduct}
              />
            </section>
          ))
        )}
      </div>
    </div>
  );
};

//
// ========================
//   LOADING PLACEHOLDER
// ========================
const LoadingShowrooms = () => (
  <div className="space-y-12">
    {[...Array(3)].map((_, idx) => (
      <div key={idx}>
        {/* Section Header Skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="h-7 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
          </div>
          <div className="h-1 w-24 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        
        {/* Products Grid Skeleton */}
        <Row gutter={[16, 16]}>
          {[...Array(6)].map((_, index) => (
            <Col xs={12} sm={8} md={6} lg={4} xl={4} key={index}>
              <ProductSkeleton />
            </Col>
          ))}
        </Row>
      </div>
    ))}
  </div>
);

//
// ========================
//    PRODUCT SKELETON
// ========================
const ProductSkeleton = () => (
  <Card 
    className="shadow-sm hover:shadow-md transition-shadow border-0 rounded-lg" 
    bodyStyle={{ padding: "16px" }}
  >
    <div className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse mb-4" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
        <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-20"></div>
      </div>
    </div>
  </Card>
);

//
// ========================
//   SHOWROOM PRODUCTS
// ========================
const ShowroomProducts = ({ showroomId, onView }) => {
  const dispatch = useDispatch();
  const [wishlist, setWishlist] = useState(new Set());

  const { productsByShowroom, loadingProductsByShowroom } = useSelector(
    (state) => state.products
  );

  const products = productsByShowroom?.[showroomId] || [];
  const isLoading = loadingProductsByShowroom && products.length === 0;

  useEffect(() => {
    dispatch(fetchProductsByShowroom(showroomId));
  }, [dispatch, showroomId]);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    // For products with variants, we need to handle this differently
    if (product.variants && product.variants.length > 0) {
      message.info("Please select a size on the product page");
      onView(product._id);
      return;
    }

    const payload = { productId: product._id, quantity: 1 };
    const result = await dispatch(addItemToCart(payload));

    if (result.meta.requestStatus === "fulfilled") {
      message.success(`${product.name} added to cart`);
    } else {
      const err = result.payload || "Failed to add to cart";
      if (err === "Not authenticated") {
        message.error("Please login to add items to cart");
      } else {
        message.error(err);
      }
    }
  };

  const toggleWishlist = (e, productId) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const setCopy = new Set(prev);
      if (setCopy.has(productId)) {
        setCopy.delete(productId);
        message.info("Removed from Wishlist");
      } else {
        setCopy.add(productId);
        message.success("Added to Wishlist");
      }
      return setCopy;
    });
  };

  const calcDiscount = (price, oldPrice) => {
    if (!oldPrice || oldPrice <= 0 || price >= oldPrice) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  if (isLoading) {
    return (
      <Row gutter={[16, 16]}>
        {[...Array(6)].map((_, i) => (
          <Col xs={12} sm={8} md={6} lg={4} xl={4} key={i}>
            <ProductSkeleton />
          </Col>
        ))}
      </Row>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="shadow-sm border-0 rounded-lg">
        <div className="text-center py-16">
          <Package size={56} className="text-gray-300 mx-auto mb-4" />
          <Title level={4} className="!text-gray-400 !mb-2">
            No Products Available
          </Title>
          <Text type="secondary">
            Check back later for new arrivals in this showroom
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => {
        const priceInfo = getPriceDisplay(product);
        const stockCount = getStockCount(product);
        const discount = calcDiscount(priceInfo.min, product.oldPrice);
        const isWishlisted = wishlist.has(product._id);
        const isActive = isProductActive(product);

        return (
          <Col xs={12} sm={8} md={6} lg={4} xl={4} key={product._id}>
            <Card
              hoverable
              onClick={() => onView(product._id)}
              className="shadow-sm hover:shadow-md transition-all duration-300 rounded-lg border-0 group"
              bodyStyle={{ padding: "16px" }}
            >
              {/* Image Container */}
              <div className="relative rounded-lg overflow-hidden">
                <div className="aspect-[3/4] relative">
                  {/* Product Image */}
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      preview={false}
                      placeholder={
                        <div className="flex justify-center items-center h-full">
                          <Package size={32} />
                        </div>
                      }
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full text-gray-300">
                      <Package size={40} />
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between">
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <Badge
                        count={`-${discount}%`}
                        style={{ 
                          backgroundColor: '#ef4444',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </div>

                  {/* Variant Badge */}
                  {product.variants && product.variants.length > 0 && (
                    <Badge
                      count={`${product.variants.length} sizes`}
                      style={{ 
                        backgroundColor: '#3b82f6',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        position: 'absolute',
                        top: 2,
                        right: 2
                      }}
                    />
                  )}

                  {/* Wishlist Button */}
                  <Button
                    shape="circle"
                    icon={
                      <Heart
                        size={16}
                        fill={isWishlisted ? "red" : "none"}
                        className={isWishlisted ? "text-red-500" : "text-gray-600"}
                      />
                    }
                    onClick={(e) => toggleWishlist(e, product._id)}
                    className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm !border-0 shadow-sm hover:shadow-md transition-all"
                    size="small"
                  />

                  {/* Out of Stock Overlay */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <Tag color="default" className="!text-gray-600 !border-gray-300">
                        Out of Stock
                      </Tag>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-3">
                {/* Product Name */}
                <h6
                  className="!mb-0 !text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors"
                  style={{ 
                    minHeight: "2.5rem",
                    lineHeight: "1.25rem",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  {product.name}
                </h6>

                {/* Price Section */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Tooltip 
                      title={priceInfo.isRange ? "Multiple prices available" : ""}
                      placement="top"
                    >
                      <Text strong className="text-sm text-green-600">
                        {priceInfo.display}
                      </Text>
                    </Tooltip>
                    
                    {/* Old Price */}
                    {product.oldPrice > 0 && product.oldPrice > priceInfo.min && (
                      <Text delete type="secondary" className="text-xs">
                        ₵{product.oldPrice.toFixed(2)}
                      </Text>
                    )}
                  </div>
                  
                  {/* Stock Status */}
                  {stockCount > 0 && stockCount < 10 && (
                    <Text type="secondary" className="text-xs">
                      {stockCount} left
                    </Text>
                  )}
                </div>

                {/* Variant Info Tooltip */}
                {product.variants && product.variants.length > 0 && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>Multiple sizes available</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    icon={<ShoppingCart size={14} />}
                    className="w-full !h-9 rounded-lg hover:scale-[1.02] transition-transform font-medium"
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={!isActive}
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #fbbf24 0%, #84cc16 100%)"
                        : "#d1d5db",
                      border: "none",
                      color: "white",
                    }}
                  >
                    {product.variants && product.variants.length > 0 ? "Select Size" : "Add to Cart"}
                  </Button>

                  <Button
                    icon={<Eye size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(product._id);
                    }}
                    className="w-full !h-9 rounded-lg hover:scale-[1.02] transition-transform border-gray-300 font-medium"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default ProductsByShowroom;