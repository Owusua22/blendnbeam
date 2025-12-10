import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Loader,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Star,
  Minus,
  Plus,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  ArrowLeft,
  Palette,
  Ruler,
  AlertTriangle,
  Check,
  Zap,
  Award,
  Package
} from 'lucide-react';
import { fetchProductById } from '../Redux/slice/productSlice';
import { useParams, useNavigate } from "react-router-dom";
import { addItemToCart } from "../Redux/slice/cartSlice"; 
import { message, Tag, Spin } from "antd";
import AuthModal from './AuthPage';

// Utility Functions
const parseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') {
        if ((item.startsWith('[') && item.endsWith(']')) || 
            (item.startsWith('{') && item.endsWith('}'))) {
          try {
            const parsed = JSON.parse(item);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return item;
          }
        }
        if (item.includes(',') || item.includes(';')) {
          return item.split(/[,;]/).map(i => i.trim()).filter(Boolean);
        }
        return item;
      }
      return item;
    }).flat().filter(item => item && String(item).trim());
  }
  
  if (typeof value === 'string') {
    let cleanValue = value.trim().replace(/^["']|["']$/g, '');
    try {
      const parsed = JSON.parse(cleanValue);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item).trim()).filter(Boolean);
      }
      return [String(parsed).trim()];
    } catch {
      return cleanValue.split(/[,;]/).map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const parseSpecifications = (specs) => {
  if (!specs) return {};
  
  try {
    if (typeof specs === 'object' && !Array.isArray(specs) && !(specs instanceof Map)) {
      return specs;
    }
    if (specs instanceof Map) {
      return Object.fromEntries(specs);
    }
    if (typeof specs === 'string') {
      try {
        const parsed = JSON.parse(specs);
        if (Array.isArray(parsed)) {
          return Object.fromEntries(
            parsed.filter(([key, value]) => key && value !== undefined)
          );
        }
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      } catch {}
    }
  } catch {}
  return {};
};

const getColorStyle = (color) => {
  const colorMap = {
    black: '#000000',
    white: '#FFFFFF',
    grey: '#808080',
    gray: '#808080',
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#A855F7',
    pink: '#EC4899',
    orange: '#F97316',
    brown: '#92400E',
    navy: '#1E3A8A',
    teal: '#14B8A6',
    cyan: '#06B6D4',
    lime: '#84CC16',
    indigo: '#6366F1'
  };

  const colorLower = color.toLowerCase();
  for (const [name, hex] of Object.entries(colorMap)) {
    if (colorLower.includes(name)) return hex;
  }
  
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) return color;
  return colorLower;
};

// Component: Image Gallery
const ImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const nextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setImageLoading(true);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setImageLoading(true);
  };

  return (
    <div className="space-y-4">
      <div className="md:flex md:gap-4">
        {/* Thumbnail Column */}
        <div className="hidden md:flex flex-col gap-3">
          {images?.slice(0, 4).map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImage(index);
                setImageLoading(true);
              }}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === index
                  ? 'border-yellow-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-yellow-300 hover:scale-105'
              }`}
            >
              <img
                src={img.url}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden relative group">
          <div className="aspect-square flex items-center justify-center p-8">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <Loader className="animate-spin text-yellow-500" size={40} />
              </div>
            )}
            <img
              src={images?.[selectedImage]?.url || '/placeholder.png'}
              alt={productName}
              className="w-full h-full object-contain transition-opacity duration-300"
              style={{ opacity: imageLoading ? 0 : 1 }}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>

          {/* Navigation Arrows */}
          {images && images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Image Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
            {images?.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`transition-all duration-300 rounded-full ${
                  selectedImage === index 
                    ? 'bg-yellow-500 w-8 h-2' 
                    : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Thumbnails */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images?.map((img, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedImage(index);
              setImageLoading(true);
            }}
            className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
              selectedImage === index
                ? 'border-yellow-500 shadow-md'
                : 'border-gray-200'
            }`}
          >
            <img
              src={img.url}
              alt={`${productName} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// Component: Cart Sidebar
const CartSidebar = ({ show, onClose, cartItems, navigate }) => {
  if (!show) return null;

  const getItemPrice = (item) => {
    return Number(item.price || item.product?.price || item.productId?.price || 0);
  };

  const getItemName = (item) => {
    return item.name || item.product?.name || 'Product';
  };

  const getItemImage = (item) => {
    return item.image || item.product?.images?.[0]?.url || '/placeholder.png';
  };

  const cartTotal = cartItems?.reduce((sum, item) => {
    return sum + (getItemPrice(item) * Number(item.quantity || 0));
  }, 0) || 0;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-yellow-50 to-green-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
            <p className="text-sm text-gray-600 mt-1">
              {cartItems?.length || 0} {cartItems?.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition-all hover:rotate-90 duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems && cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemPrice = getItemPrice(item);
                const itemTotal = itemPrice * Number(item.quantity || 0);
                
                return (
                  <div key={item._id} className="flex gap-4 bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={getItemImage(item)} 
                        alt={getItemName(item)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2 truncate">
                        {getItemName(item)}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        {item.size && (
                          <p className="flex items-center gap-1">
                            <Ruler size={14} /> {item.size}
                          </p>
                        )}
                        {item.color && (
                          <p className="flex items-center gap-1">
                            <Palette size={14} /> {item.color}
                          </p>
                        )}
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-yellow-600 mt-2 text-lg">
                        ₵{itemTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm mt-2">Add some products to get started</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gradient-to-r from-gray-50 to-white p-6 space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700">Subtotal:</span>
            <span className="font-bold text-2xl bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              ₵{cartTotal.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            disabled={!cartItems || cartItems.length === 0}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Proceed to Checkout
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

// Main Component
const ProductDetailsPage = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { product, loadingProduct, error } = useSelector((state) => state.products);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState('login');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [productId, dispatch]);

  const parsedProduct = useMemo(() => {
    if (!product) return null;
    return {
      ...product,
      color: parseArray(product.color),
      features: parseArray(product.features),
      specifications: parseSpecifications(product.specifications)
    };
  }, [product]);

  useEffect(() => {
    if (parsedProduct) {
      if (parsedProduct.color?.length > 0) {
        setSelectedColor(parsedProduct.color[0]);
      }
      if (parsedProduct.variants?.length > 0) {
        const availableVariant = parsedProduct.variants.find(v => v.stock > 0);
        setSelectedSize(availableVariant ? availableVariant.size : parsedProduct.variants[0].size);
      }
    }
  }, [parsedProduct]);

  const getStockForSelectedSize = () => {
    if (!parsedProduct?.variants?.length) return parsedProduct?.stock || 0;
    if (!selectedSize) return 0;
    const variant = parsedProduct.variants.find(v => v.size === selectedSize);
    return variant?.stock || 0;
  };

  const getPriceForSelectedSize = () => {
    if (!parsedProduct?.variants?.length) return parsedProduct?.price || 0;
    if (!selectedSize && parsedProduct.variants.length > 0) {
      return parsedProduct.variants[0].price || 0;
    }
    const variant = parsedProduct.variants.find(v => v.size === selectedSize);
    return variant?.price || parsedProduct?.price || 0;
  };

  const handleAddToCart = async () => {
    if (!userInfo) {
      setAuthDefaultTab('login');
      setShowAuthModal(true);
      return;
    }

    if (parsedProduct?.color?.length > 0 && !selectedColor) {
      message.warning('Please select a color');
      return;
    }

    if (parsedProduct?.variants?.length > 0 && !selectedSize) {
      message.warning('Please select a size');
      return;
    }

    const stock = getStockForSelectedSize();
    if (stock === 0) {
      message.warning('This item is out of stock');
      return;
    }

    if (quantity > stock) {
      message.warning(`Only ${stock} items available`);
      setQuantity(stock);
      return;
    }

    let finalPrice = 0;
    if (parsedProduct?.variants?.length > 0 && selectedSize) {
      const variant = parsedProduct.variants.find(v => v.size === selectedSize);
      finalPrice = Number(variant?.price || parsedProduct.price || 0);
    } else {
      finalPrice = Number(parsedProduct.price || 0);
    }

    if (finalPrice <= 0) {
      message.error('Unable to determine product price');
      return;
    }

    const payload = {
      productId: parsedProduct._id,
      quantity,
      price: finalPrice
    };

    if (selectedSize) payload.size = selectedSize;
    if (selectedColor) payload.color = selectedColor;

    setAddingToCart(true);

    try {
      const result = await dispatch(addItemToCart(payload));

      if (result.meta.requestStatus === "fulfilled") {
        message.success(`${parsedProduct.name} added to cart`);
        setShowCartSidebar(true);
      } else {
        const err = result.payload || "Failed to add to cart";
        if (err === "Not authenticated") {
          setAuthDefaultTab('login');
          setShowAuthModal(true);
        } else {
          message.error(err);
        }
      }
    } catch (error) {
      message.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!userInfo) {
      setAuthDefaultTab('login');
      setShowAuthModal(true);
      return;
    }

    if (parsedProduct?.variants?.length > 0 && !selectedSize) {
      message.warning('Please select a size');
      return;
    }

    handleAddToCart();
    setTimeout(() => navigate('/checkout'), 500);
  };

  const toggleWishlist = () => {
    if (!userInfo) {
      setAuthDefaultTab('login');
      setShowAuthModal(true);
      return;
    }
    setIsWishlisted(!isWishlisted);
    message.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = parsedProduct?.name || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };

    if (platform && shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    } else {
      if (navigator.share) {
        try {
          await navigator.share({ title: text, url });
        } catch {
          navigator.clipboard.writeText(url);
          message.info('Link copied!');
        }
      } else {
        navigator.clipboard.writeText(url);
        message.info('Link copied!');
      }
    }
  };

  const currentStock = getStockForSelectedSize();
  const currentPrice = getPriceForSelectedSize();
  const totalStock = parsedProduct?.variants?.length > 0
    ? parsedProduct.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : parsedProduct?.stock || 0;

  const shouldShowOldPrice = useMemo(() => {
    if (!parsedProduct) return false;
    const oldPrice = Number(parsedProduct.oldPrice);
    return oldPrice > 0 && oldPrice > Number(currentPrice);
  }, [parsedProduct, currentPrice]);

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !parsedProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={64} />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h3>
          <p className="text-gray-600 mb-6">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 pb-32 md:pb-8">
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab={authDefaultTab}
      />

      <CartSidebar 
        show={showCartSidebar}
        onClose={() => setShowCartSidebar(false)}
        cartItems={cartItems}
        navigate={navigate}
      />

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 font-semibold text-gray-900 truncate">
            {parsedProduct.name}
          </h1>
          <button
            onClick={toggleWishlist}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <Heart 
              size={20} 
              className={`transition-all ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'}`}
            />
          </button>
          <button
            onClick={() => handleShare()}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl overflow-hidden shadow-xl">
          {/* Image Gallery */}
          <div className="p-6">
            <ImageGallery images={parsedProduct.images} productName={parsedProduct.name} />
          </div>

          {/* Product Info */}
          <div className="p-6 lg:p-8">
            {parsedProduct.category && (
              <div className="hidden md:inline-flex items-center gap-2 text-sm font-medium mb-4 bg-gradient-to-r from-yellow-100 to-green-100 text-gray-700 px-4 py-2 rounded-full">
                <Package size={16} />
                {parsedProduct.category.name}
              </div>
            )}

            <h1 className="hidden md:block text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {parsedProduct.name}
            </h1>

            {/* Stock & Rating */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b">
              <div className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full ${
                currentStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  currentStock > 0 ? 'bg-green-600' : 'bg-red-600'
                }`} />
                {currentStock > 0 ? `${currentStock} In Stock` : 'Out of Stock'}
              </div>

              {parsedProduct.ratings && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.round(parsedProduct.ratings.average || 0)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({parsedProduct.ratings.count || 0})
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mb-8 bg-gradient-to-br from-yellow-50 via-white to-green-50 p-6 rounded-2xl border-2 border-yellow-200 shadow-inner">
              <div className="text-sm text-gray-600 mb-2 font-medium">Price</div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                  ₵{currentPrice.toFixed(2)}
                </span>
                {shouldShowOldPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ₵{Number(parsedProduct.oldPrice).toFixed(2)}
                  </span>
                )}
              </div>
              {shouldShowOldPrice && (
                <div className="mt-2 inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <Zap size={14} />
                  Save ₵{(Number(parsedProduct.oldPrice) - currentPrice).toFixed(2)}
                </div>
              )}
            </div>

            {/* Color Selection */}
            {parsedProduct.color?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={18} className="text-gray-600" />
                  <span className="font-semibold text-gray-900">Color:</span>
                  <span className="text-gray-600">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {parsedProduct.color.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                        selectedColor === color
                          ? 'border-yellow-500 bg-yellow-50 shadow-md scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: getColorStyle(color) }}
                      />
                      <span className="font-medium">{color}</span>
                      {selectedColor === color && <Check size={16} className="text-green-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {parsedProduct.variants?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Ruler size={18} className="text-gray-600" />
                  <span className="font-semibold text-gray-900">Size:</span>
                  <span className="text-gray-600">{selectedSize || 'Select'}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {parsedProduct.variants.map((variant) => {
                    const isOutOfStock = variant.stock === 0;
                    const isSelected = selectedSize === variant.size;
                    
                    return (
                      <button
                        key={variant.size}
                        onClick={() => !isOutOfStock && setSelectedSize(variant.size)}
                        disabled={isOutOfStock}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-yellow-500 bg-yellow-50 shadow-md scale-105'
                            : isOutOfStock
                            ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-105'
                        }`}
                      >
                        <div className="text-center">
                          <span className="font-bold text-lg block">{variant.size}</span>
                          <span className={`text-sm block mt-1 ${isOutOfStock ? 'text-red-500' : 'text-gray-600'}`}>
                            {isOutOfStock ? 'Out' : `₵${variant.price?.toFixed(2)}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Features */}
            {parsedProduct.features?.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={18} className="text-blue-600" />
                  <span className="font-semibold text-gray-900">Key Features</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedProduct.features.map((feature, idx) => (
                    <Tag key={idx} color="blue" className="text-sm px-3 py-1">
                      {feature}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector - Desktop */}
            <div className="hidden md:block mb-6">
              <label className="block font-semibold text-gray-900 mb-3">Quantity</label>
              <div className="flex items-center border-2 border-gray-300 rounded-xl w-fit hover:border-yellow-400 transition-all">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={currentStock === 0}
                  className="px-5 py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  min={1}
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(currentStock, val)));
                  }}
                  disabled={currentStock === 0}
                  className="w-20 text-center border-x-2 border-gray-300 py-3 text-lg font-bold focus:outline-none disabled:bg-gray-50"
                />
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={currentStock === 0 || quantity >= currentStock}
                  className="px-5 py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Selected Options Summary */}
            {(selectedColor || selectedSize) && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">Your Selection</p>
                <div className="flex flex-wrap gap-2">
                  {selectedColor && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                      <Palette size={14} className="text-gray-600" />
                      <span className="font-medium">{selectedColor}</span>
                    </div>
                  )}
                  {selectedSize && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                      <Ruler size={14} className="text-gray-600" />
                      <span className="font-medium">{selectedSize}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={currentStock === 0 || addingToCart}
                className="flex-1 h-14 flex items-center justify-center gap-2 border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {addingToCart ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={22} />
                    Add To Cart
                  </>
                )}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={currentStock === 0 || addingToCart}
                className="flex-1 h-14 bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="hidden md:grid grid-cols-3 gap-4 mb-6 p-5 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Truck size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Fast Delivery</p>
                  <p className="text-xs text-gray-600">2-3 days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Shield size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Secure Pay</p>
                  <p className="text-xs text-gray-600">100% safe</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <RotateCcw size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Easy Returns</p>
                  <p className="text-xs text-gray-600">14 days</p>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="space-y-3 text-sm border-t pt-6">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">SKU</span>
                <span className="font-semibold text-gray-900">{parsedProduct.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Category</span>
                <span className="font-semibold text-gray-900">{parsedProduct.category?.name || 'N/A'}</span>
              </div>
            </div>

            {/* Share - Desktop */}
            <div className="hidden md:flex items-center gap-4 pt-6 border-t mt-6">
              <span className="font-semibold text-gray-900">Share:</span>
              <div className="flex items-center gap-2">
                {[
                  { icon: Facebook, color: 'blue', platform: 'facebook' },
                  { icon: Twitter, color: 'sky', platform: 'twitter' },
                  { icon: Linkedin, color: 'blue', platform: 'linkedin' },
                  { icon: MessageCircle, color: 'gray', platform: null }
                ].map(({ icon: Icon, color, platform }, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleShare(platform)}
                    className={`p-2.5 hover:bg-${color}-50 rounded-full transition-all hover:scale-110 shadow-sm hover:shadow-md`}
                  >
                    <Icon size={20} className={`text-${color}-600`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            {[
              { id: 'description', label: 'Description', icon: Info },
              { id: 'specifications', label: 'Specifications', icon: Award },
              { id: 'additional', label: 'Details', icon: Package },
              { id: 'reviews', label: `Reviews (${parsedProduct.ratings?.count || 0})`, icon: Star }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 flex-1 min-w-fit px-6 py-4 font-medium transition-all relative ${
                  activeTab === id
                    ? 'text-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                {label}
                {activeTab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-green-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {parsedProduct.description || 'No description available.'}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                {Object.keys(parsedProduct.specifications).length > 0 ? (
                  <div className="grid gap-4">
                    {Object.entries(parsedProduct.specifications).map(([key, value], idx) => (
                      <div key={idx} className="flex py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                        <div className="w-1/3">
                          <span className="text-gray-600 font-semibold">{key}</span>
                        </div>
                        <div className="w-2/3">
                          <span className="font-bold text-gray-900">{String(value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Award size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No specifications available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'additional' && (
              <div className="grid gap-4">
                {[
                  { label: 'SKU', value: parsedProduct.sku },
                  { label: 'Category', value: parsedProduct.category?.name },
                  { label: 'Status', value: parsedProduct.isActive ? 'Active' : 'Inactive' },
                  { label: 'Variants', value: parsedProduct.variants?.length || 'Single' },
                  { label: 'Total Stock', value: totalStock },
                  { label: 'Colors', value: parsedProduct.color?.length || 0 }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                    <span className="text-gray-600 font-semibold">{item.label}</span>
                    <span className="font-bold text-gray-900">{item.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-16 text-gray-400">
                <Star size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No reviews yet</p>
                <p className="text-sm">Be the first to review this product</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="font-semibold text-gray-900">Quantity</span>
          <div className="flex items-center border-2 border-gray-300 rounded-xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={currentStock === 0}
              className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              <Minus size={18} />
            </button>
            <input
              type="number"
              min={1}
              max={currentStock}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuantity(Math.max(1, Math.min(currentStock, val)));
              }}
              disabled={currentStock === 0}
              className="w-14 text-center border-x-2 border-gray-300 py-2 font-bold focus:outline-none disabled:bg-gray-50"
            />
            <button
              onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
              disabled={currentStock === 0 || quantity >= currentStock}
              className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 py-4 flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0 || addingToCart}
            className="flex-1 h-12 flex items-center justify-center gap-2 border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 disabled:border-gray-300 disabled:text-gray-400 font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            {addingToCart ? (
              <>
                <Loader className="animate-spin" size={18} />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart size={20} />
                Add
              </>
            )}
          </button>
          
          <button
            onClick={handleBuyNow}
            disabled={currentStock === 0 || addingToCart}
            className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
          >
            Buy Now
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailsPage;