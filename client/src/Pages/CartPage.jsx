import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCart,
  updateCartItemQty,
  removeCartItem,
  clearUserCart,
} from '../Redux/slice/cartSlice';
import { Button, Spin, message, Card, Empty, App as AntApp } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ShoppingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// COMPLETE FIXED VERSION - Replace your entire CartPage component with this:

const CartPage = () => {
  const { modal } = AntApp.useApp();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading, error } = useSelector((state) => state.cart);
  const [showStickyCheckout, setShowStickyCheckout] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        setShowStickyCheckout(window.scrollY > 300);
      } else {
        setShowStickyCheckout(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItemQty({ itemId, quantity }))
      .unwrap()
      .then(() => message.success('Quantity updated'))
      .catch((err) => message.error(err.message || 'Failed to update'));
  };

  const showRemoveConfirm = (itemId) => {
    modal.confirm({
      title: 'Remove Item',
      content: 'Are you sure you want to remove this item?',
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        return dispatch(removeCartItem(itemId))
          .unwrap()
          .then(() => message.success('Item removed'))
          .catch((err) => {
            message.error(err.message || 'Failed to remove');
            throw err;
          });
      },
    });
  };

  const showClearCartConfirm = () => {
    modal.confirm({
      title: 'Clear Cart',
      content: 'Remove all items from your cart?',
      okText: 'Clear All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        return dispatch(clearUserCart())
          .unwrap()
          .then(() => message.success('Cart cleared'))
          .catch((err) => {
            message.error(err.message || 'Failed to clear cart');
            throw err;
          });
      },
    });
  };

  const handleCheckout = () => navigate('/checkout');
  const handleContinueShopping = () => navigate('/products');

  // FIXED HELPER FUNCTIONS - Try multiple price locations
  const getItemPrice = (item) => {
    // Try all possible locations where price might be stored
    const price = item.price || 
                  item.product?.price || 
                  item.productId?.price || 
                  item.variant?.price ||
                  0;
    return Number(price) || 0;
  };

  const getItemName = (item) => {
    return item.name || 
           item.product?.name || 
           item.productId?.name || 
           'Product';
  };

  const getItemImage = (item) => {
    return item.image || 
           item.product?.images?.[0]?.url || 
           item.productId?.images?.[0]?.url ||
           '/placeholder-image.jpg';
  };

  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return numPrice.toFixed(2);
  };

  const calculateItemSubtotal = (item) => {
    const price = getItemPrice(item);
    const quantity = Number(item.quantity) || 0;
    return (price * quantity).toFixed(2);
  };

  // FIXED: Calculate cart totals using the helper function
  const calculateCartTotals = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0
      };
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = getItemPrice(item);
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    const shipping = Number(cart.shippingPrice) || 0;
    const tax = Number(cart.taxPrice) || 0;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const cartTotals = calculateCartTotals();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Loading your cart..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="text-center border-red-200 bg-red-50">
          <div className="text-red-500 text-lg mb-4">Error loading cart</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Button 
            type="primary" 
            onClick={() => dispatch(fetchCart())}
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Empty
          image={<ShoppingCartOutlined className="text-6xl text-yellow-500" />}
          description={
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some products to get started</p>
            </div>
          }
        >
          <Button 
            type="primary" 
            size="large" 
            icon={<ShoppingOutlined />}
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
              <p className="text-sm text-gray-600">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <Button 
              danger 
              size="small"
              onClick={showClearCartConfirm}
              icon={<DeleteOutlined />}
            >
              Clear
            </Button>
          </div>

          <div className="space-y-3">
            {cart.items.map((item) => {
              const itemPrice = getItemPrice(item);
              const itemSubtotal = calculateItemSubtotal(item);
              
              return (
                <Card
                  key={item._id}
                  className="shadow-sm border-gray-200"
                  bodyStyle={{ padding: '12px' }}
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={getItemImage(item)}
                        alt={getItemName(item)}
                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded border"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-base text-gray-800 truncate">
                          {getItemName(item)}
                        </h3>
                        <Button
                          danger
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => showRemoveConfirm(item._id)}
                        />
                      </div>

                      {/* Selected Options */}
                      <div className="flex flex-wrap gap-2 mb-2 text-xs">
                        {item.color && (
                          <span className="px-2 py-1 rounded border border-green-200 bg-green-50 text-green-700 font-medium">
                            Color: {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-medium">
                            Size: {item.size}
                          </span>
                        )}
                      </div>

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-green-600">
                          ₵{formatPrice(itemPrice)}
                        </div>

                        <div className="flex items-center border border-green-300 rounded overflow-hidden">
                          <Button
                            icon={<MinusOutlined />}
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            size="small"
                            className="h-7 w-7 p-0"
                          />
                          <div className="w-8 text-center font-semibold text-green-700 text-sm">
                            {item.quantity}
                          </div>
                          <Button
                            icon={<PlusOutlined />}
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            size="small"
                            className="h-7 w-7 p-0"
                          />
                        </div>
                      </div>

                      {item.quantity > 1 && (
                        <div className="text-right mt-1">
                          <span className="text-xs text-gray-500">Subtotal: </span>
                          <span className="text-sm font-bold text-yellow-600">
                            ₵{itemSubtotal}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card 
            title={<div className="text-base font-semibold text-gray-800">Order Summary</div>}
            className="shadow-sm border-gray-200 lg:sticky lg:top-4"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-green-700">
                  ₵{formatPrice(cartTotals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">
                  ₵{formatPrice(cartTotals.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  ₵{formatPrice(cartTotals.tax)}
                </span>
              </div>
              <div className="border-t border-green-200 pt-2 mt-2 flex justify-between text-base font-bold">
                <span className="text-gray-800">Total</span>
                <span className="text-yellow-600">
                  ₵{formatPrice(cartTotals.total)}
                </span>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleCheckout}
                className="bg-green-600 hover:bg-green-700 border-green-600 mt-4"
              >
                Proceed to Checkout
              </Button>

              <Button
                size="large"
                block
                onClick={handleContinueShopping}
                icon={<ShoppingOutlined />}
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-600"
              >
                Continue Shopping
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Checkout */}
      {showStickyCheckout && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
            <div>
              <div className="text-xs text-gray-600">Total</div>
              <div className="text-lg font-bold text-yellow-600">
                ₵{formatPrice(cartTotals.total)}
              </div>
            </div>
            <Button
              type="primary"
              size="large"
              onClick={handleCheckout}
              className="bg-green-600 hover:bg-green-700 border-green-600 px-8"
            >
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
// Wrap with Ant Design App for modal context
const CartPageWithProvider = () => (
  <AntApp>
    <CartPage />
  </AntApp>
);

export default CartPageWithProvider;