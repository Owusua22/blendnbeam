// pages/CheckoutPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrderThunk, resetOrderState } from "../Redux/slice/orderSlice";
import { fetchShippingList } from "../Redux/slice/shippingSlice";
import { clearUserCart } from "../Redux/slice/cartSlice";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Smartphone,
  HandCoins,
  Home,
  ShoppingCart,
  MapPin,
  Phone,
  User,
  Truck,
  Info,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const formatCurrency = (n) => Number(n || 0).toFixed(2);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const cartState = useSelector((state) => state.cart.cart);
  const cartItems = cartState?.items || [];
  const itemsPrice = cartState?.itemsPrice || 0;
  const taxPrice = cartState?.taxPrice || 0;

  const { list: shippingZones = [], loading: shippingLoading } = useSelector(
    (state) => state.shipping
  );
  const { loading, error, success, currentOrder } = useSelector(
    (state) => state.orders
  );
  const { userInfo } = useSelector((state) => state.auth);

  // Recipient
  const [recipientDifferent, setRecipientDifferent] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Address
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [landmark, setLandmark] = useState("");

  // Shipping selection
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [otherLocation, setOtherLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState("");

  // Payment
  
  const [paymentMethod, setPaymentMethod] = useState("");

  // UI
  const [formError, setFormError] = useState("");

  // Fetch shipping zones
  useEffect(() => {
    dispatch(fetchShippingList({ isActive: true }));
  }, [dispatch]);

  // Prefill from userInfo (except fullname when recipientDifferent is ON)
  useEffect(() => {
    const defaultName =
      userInfo?.name || userInfo?.fullName || userInfo?.profile?.name || "";
    const defaultPhone =
      userInfo?.phone ||
      userInfo?.mobile ||
      userInfo?.shippingAddress?.phone ||
      "";
    if (!recipientDifferent) {
      setFullName(defaultName);
    }
    setPhone(defaultPhone);

    setStreet(userInfo?.shippingAddress?.street || userInfo?.address?.street || "");
    setCity(userInfo?.shippingAddress?.city || userInfo?.address?.city || "");
    setRegion(userInfo?.shippingAddress?.state || userInfo?.address?.state || "");
    setZipCode(userInfo?.shippingAddress?.zipCode || userInfo?.address?.zipCode || "");
    setCountry(userInfo?.shippingAddress?.country || userInfo?.address?.country || "Ghana");
  }, [userInfo, recipientDifferent]);

  const handleRecipientToggle = (checked) => {
    setRecipientDifferent(checked);
    if (checked) setFullName(""); // do not prefill fullname
    else {
      const defaultName =
        userInfo?.name || userInfo?.fullName || userInfo?.profile?.name || "";
      setFullName(defaultName);
    }
  };

  const selectedZone = shippingZones.find((z) => z._id === selectedZoneId);
  const shippingPrice = otherLocation ? null : selectedZone?.deliveryCharge || 0;

  const totalPrice = useMemo(
    () => itemsPrice + taxPrice + (shippingPrice || 0),
    [itemsPrice, taxPrice, shippingPrice]
  );

  // After successful order: clear DB cart then navigate
  useEffect(() => {
    if (success && currentOrder) {
      (async () => {
        try {
          await dispatch(clearUserCart()).unwrap();
        } catch (e) {
          console.warn("Failed to clear cart after order:", e);
        } finally {
          dispatch(resetOrderState());
          navigate(`/order-received/${currentOrder._id}`, { replace: true });
        }
      })();
    }
  }, [success, currentOrder, dispatch, navigate]);

  const validate = () => {
    setFormError("");
    if (!cartItems.length) return "Your cart is empty.";
    if (!paymentMethod) return "Please select a payment method.";
    if (!fullName?.trim())
      return recipientDifferent
        ? "Please enter the recipient's full name."
        : "Your name is missing. Please update your profile or enter your name.";
    if (!phone?.trim()) return "Please enter a phone number.";
    if (!street?.trim()) return "Please enter your street address.";
    if (!city?.trim()) return "Please enter your city/town.";
    if (!country?.trim()) return "Please enter your country.";
    if (otherLocation) {
      if (!customLocation?.trim())
        return "Enter your delivery location name if it's not listed.";
    } else {
      if (!selectedZoneId) return "Please select your delivery location.";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const orderData = {
      cartId: cartState?._id,
      paymentMethod,
      shippingLocationId: otherLocation ? null : selectedZone?._id || null,
      shippingAddress: {
        name: fullName,
        street,
        city,
        state: region,
        zipCode,
        country,
        phone,
        landmark,
      },
      customLocationName: otherLocation ? customLocation : null,
      shippingPricePending: otherLocation,
      itemsPrice,
      taxPrice,
      orderItems: cartItems.map((item) => ({
        productId: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      })),
    };

    dispatch(createOrderThunk({ orderData, token: userInfo?.token }));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/40">
      {/* Centered full-screen loader */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-xl">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
            <span className="text-sm font-medium text-gray-700">
              Placing your order...
            </span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Checkout
          </h1>
          <p className="text-gray-600 mt-1">
            Provide delivery details and choose how you want to pay
          </p>
        </div>

        {/* Error banner */}
        {(formError || error) && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/80 text-rose-700 px-4 py-3 text-sm">
            {formError || error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT: Form */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm"
            >
              {/* Shipping Information */}
              <div className="flex items-center gap-2 mb-4">
                <Home className="text-emerald-600" size={18} />
                <h2 className="text-lg font-bold text-gray-900">
                  Shipping Information
                </h2>
              </div>

              {/* Different recipient */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/30 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recipientDifferent}
                  onChange={(e) => handleRecipientToggle(e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    Recipient is a different person
                  </div>
                  <div className="text-sm text-gray-600">
                    If checked, the full name won’t be prefilled from your
                    account — enter the recipient’s name instead.
                  </div>
                </div>
              </label>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ama Mensah"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="House number, street name"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      City/Town
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Accra"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Region/State
                    </label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g. Greater Accra"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Zip Code (optional)
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Ghana"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Landmark / Delivery Directions (optional)
                  </label>
                  <textarea
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Nearby landmarks, special instructions, etc."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
              </div>

              {/* Delivery Location */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="text-emerald-600" size={18} />
                  <h3 className="font-bold text-gray-900">Delivery Location</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* List selection */}
                  <div
                    className={`transition ${
                      otherLocation ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Choose from list
                    </label>
                    <div className="relative">
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full appearance-none bg-white px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      >
                        <option value="" disabled>
                          {shippingLoading
                            ? "Loading locations..."
                            : "Select location"}
                        </option>
                        {!shippingLoading &&
                          shippingZones.map((zone) => (
                            <option key={zone._id} value={zone._id}>
                              {zone.name} — ₵{formatCurrency(zone.deliveryCharge)}
                              {zone.estimate ? ` • ${zone.estimate}` : ""}
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        ▼
                      </div>
                    </div>
                    {selectedZone?.estimate && !otherLocation && (
                      <div className="mt-1 text-xs text-gray-600">
                        Estimated delivery: {selectedZone.estimate}
                      </div>
                    )}
                  </div>

                  {/* Toggle to custom location */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={otherLocation}
                      onChange={(e) => {
                        const isOther = e.target.checked;
                        setOtherLocation(isOther);
                        if (isOther) {
                          setSelectedZoneId("");
                        }
                      }}
                    />
                    <span className="text-sm text-gray-800">
                      My location isn’t listed — I’ll enter it manually
                    </span>
                  </label>

                  {/* Manual location field */}
                  {otherLocation && (
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        Enter your delivery area/zone name
                      </label>
                      <input
                        type="text"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="e.g. Adenta New Site"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                      <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50/80 border border-amber-200 rounded-lg p-2">
                        <Info size={14} className="text-amber-600 mt-0.5" />
                        Shipping fee will be provided by the seller after
                        confirming your location.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="text-emerald-600" size={18} />
                  <h3 className="font-bold text-gray-900">Payment Method</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      value: "card",
                      label: "Card Payment",
                      icon: <CreditCard size={18} />,
                      desc: "Visa / Mastercard",
                    },
                    {
                      value: "mobile_money",
                      label: "Mobile Money",
                      icon: <Smartphone size={18} />,
                      desc: "MTN / Vodafone / AirtelTigo",
                    },
                    {
                      value: "cash_on_delivery",
                      label: "Cash on Delivery",
                      icon: <HandCoins size={18} />,
                      desc: "Pay on arrival",
                    },
                  ].map((opt) => {
                    const selected = paymentMethod === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          selected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={opt.value}
                          checked={selected}
                          onChange={() => setPaymentMethod(opt.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600">{opt.icon}</span>
                            <span className="font-semibold text-gray-900">
                              {opt.label}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">{opt.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft size={16} />
                  Back to Cart
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Place Order</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:sticky md:top-6">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart size={18} className="text-emerald-600" />
                <h3 className="font-bold text-gray-900">Order Summary</h3>
              </div>

              <div className="max-h-80 overflow-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 py-2 border-b last:border-b-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg border object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        Qty: {item.quantity}{" "}
                        {item.color && <span>• {item.color}</span>}{" "}
                        {item.size && <span>• {item.size}</span>}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ₵{formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-4 h-px bg-gray-200" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-semibold text-gray-900">
                    ₵{formatCurrency(itemsPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-900">
                    ₵{formatCurrency(taxPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-amber-600">
                    {shippingPrice === null
                      ? "To be provided by seller"
                      : `₵${formatCurrency(shippingPrice)}`}
                  </span>
                </div>
              </div>

              <div className="my-4 h-px bg-gray-200" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-amber-600">
                  ₵{formatCurrency(totalPrice)}
                </span>
              </div>

              <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
                <Info size={14} className="text-emerald-600 mt-0.5" />
                {otherLocation
                  ? "Shipping fee will be provided by the seller after confirming your address."
                  : selectedZone?.estimate
                  ? `Estimated delivery: ${selectedZone.estimate}.`
                  : "Shipping fee may vary based on exact address."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;