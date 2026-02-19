import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrderThunk, resetOrderState } from "../Redux/slice/orderSlice";
import { fetchShippingList } from "../Redux/slice/shippingSlice";
import { clearUserCart } from "../Redux/slice/cartSlice";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Smartphone,
  ShoppingCart,
  MapPin,
  Phone,
  User,
  Truck,
  Info,
  Loader2,
  ArrowLeft,
  Shield,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  CheckCircle,
  Wallet,
  Banknote,
} from "lucide-react";

const formatCurrency = (n) => Number(n || 0).toFixed(2);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const [recipientDifferent, setRecipientDifferent] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [landmark, setLandmark] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [otherLocation, setOtherLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [formError, setFormError] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchShippingList({ isActive: true }));
  }, [dispatch]);

  useEffect(() => {
    const defaultName =
      userInfo?.name || userInfo?.fullName || userInfo?.profile?.name || "";
    const defaultPhone =
      userInfo?.phone ||
      userInfo?.mobile ||
      userInfo?.shippingAddress?.phone ||
      "";
    if (!recipientDifferent) setFullName(defaultName);
    setPhone(defaultPhone);
    setStreet(
      userInfo?.shippingAddress?.street || userInfo?.address?.street || ""
    );
    setCity(userInfo?.shippingAddress?.city || userInfo?.address?.city || "");
    setRegion(
      userInfo?.shippingAddress?.state || userInfo?.address?.state || ""
    );
    setZipCode(
      userInfo?.shippingAddress?.zipCode || userInfo?.address?.zipCode || ""
    );
    setCountry(
      userInfo?.shippingAddress?.country ||
        userInfo?.address?.country ||
        "Ghana"
    );
  }, [userInfo, recipientDifferent]);

  const handleRecipientToggle = (checked) => {
    setRecipientDifferent(checked);
    if (checked) setFullName("");
    else {
      setFullName(
        userInfo?.name || userInfo?.fullName || userInfo?.profile?.name || ""
      );
    }
  };

  const selectedZone = shippingZones.find((z) => z._id === selectedZoneId);
  const shippingPrice = otherLocation
    ? null
    : selectedZone?.deliveryCharge || 0;
  const totalPrice = useMemo(
    () => itemsPrice + taxPrice + (shippingPrice || 0),
    [itemsPrice, taxPrice, shippingPrice]
  );

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
    if (!fullName?.trim())
      return recipientDifferent
        ? "Please enter the recipient's full name."
        : "Your name is missing.";
    if (!phone?.trim()) return "Please enter a phone number.";
    if (!street?.trim()) return "Please enter your street address.";
    if (!city?.trim()) return "Please enter your city/town.";
    if (!country?.trim()) return "Please enter your country.";
    if (otherLocation) {
      if (!customLocation?.trim()) return "Enter your delivery location name.";
    } else {
      if (!selectedZoneId) return "Please select your delivery location.";
    }
    if (!paymentMethod) return "Please select a payment method.";
    return "";
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
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
      // ✅ Send the user's custom location text to the backend
      customLocationName: otherLocation ? customLocation.trim() : null,
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

  // ✅ Removed badgeText and badgeBg from all payment options
  const paymentOptions = [
    {
      value: "card",
      label: "Card Payment",
      sub: "Visa, Mastercard & more",
      Icon: CreditCard,
      gradient: "from-blue-500 to-indigo-600",
      lightBg: "bg-blue-50",
      activeBorder: "border-blue-500",
      activeRing: "ring-blue-200",
      activeBg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      iconColor: "text-blue-600",
    },
    {
      value: "mobile_money",
      label: "Mobile Money",
      sub: "MTN MoMo, Vodafone Cash, AirtelTigo",
      Icon: Smartphone,
      gradient: "from-amber-400 to-orange-500",
      lightBg: "bg-amber-50",
      activeBorder: "border-amber-500",
      activeRing: "ring-amber-200",
      activeBg: "bg-gradient-to-br from-amber-50 to-orange-50",
      iconColor: "text-amber-600",
    },
    {
      value: "cash_on_delivery",
      label: "Cash on Delivery",
      sub: "Pay when your order arrives",
      Icon: Banknote,
      gradient: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50",
      activeBorder: "border-emerald-500",
      activeRing: "ring-emerald-200",
      activeBg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600",
    },
  ];

  /* ─── Shared Order Summary Component ─── */
  const OrderSummaryContent = ({ compact = false }) => (
    <>
      {/* Items */}
      <div
        className={`divide-y divide-gray-50 ${
          compact ? "max-h-48" : "max-h-72"
        } overflow-y-auto`}
      >
        {cartItems.map((item) => (
          <div
            key={item._id}
            className={`flex items-center gap-3 ${
              compact ? "px-4 py-2.5" : "px-5 py-3"
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className={`${
                  compact ? "w-11 h-11" : "w-14 h-14"
                } rounded-lg border border-gray-100 object-cover bg-gray-50`}
              />
              <span
                className={`absolute -top-1.5 -right-1.5 ${
                  compact ? "w-4 h-4 text-[9px]" : "w-5 h-5 text-[10px]"
                } rounded-full bg-gray-800 text-white font-bold flex items-center justify-center`}
              >
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              {!compact && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {item.color && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                      <span
                        className="w-2.5 h-2.5 rounded-full border"
                        style={{
                          backgroundColor: item.color.toLowerCase(),
                        }}
                      />
                      {item.color}
                    </span>
                  )}
                  {item.size && (
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                      {item.size}
                    </span>
                  )}
                </div>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
              ₵{formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div
        className={`${
          compact ? "px-4 py-3" : "p-5"
        } border-t border-gray-100 bg-gray-50/60 space-y-2 text-sm`}
      >
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">₵{formatCurrency(itemsPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tax</span>
          <span className="font-medium">₵{formatCurrency(taxPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 flex items-center gap-1">
            <Truck size={13} /> Shipping
          </span>
          {/* ✅ Changed from "TBD" to descriptive message */}
          <span
            className={`font-medium ${
              shippingPrice === null
                ? "text-amber-600 text-xs"
                : shippingPrice === 0
                  ? "text-emerald-600"
                  : ""
            }`}
          >
            {shippingPrice === null
              ? "Provided by seller"
              : shippingPrice === 0
                ? "Free"
                : `₵${formatCurrency(shippingPrice)}`}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between items-center">
          <span className="font-bold text-gray-900">Total</span>
          <div className="text-right">
            <span
              className={`font-extrabold text-emerald-700 ${
                compact ? "text-lg" : "text-xl"
              }`}
            >
              ₵{formatCurrency(totalPrice)}
            </span>
            {shippingPrice === null && (
              <span className="block text-[10px] text-amber-600 font-medium">
                excluding shipping
              </span>
            )}
          </div>
        </div>
        {/* ✅ Updated info message */}
        {shippingPrice === null && (
          <p className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2">
            <Info
              size={13}
              className="text-amber-500 mt-0.5 flex-shrink-0"
            />
            <span>
              Delivery fee will be provided by the seller after confirming
              your location
              {customLocation ? (
                <span className="font-semibold"> ({customLocation})</span>
              ) : null}
              .
            </span>
          </p>
        )}
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen bg-gray-50/80">
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
            <p className="font-semibold text-gray-900">
              Placing your order…
            </p>
            <p className="text-sm text-gray-500">
              Please don't close this page
            </p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Cart</span>
          </button>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lock size={15} className="text-emerald-600" />
            Checkout
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Shield size={14} className="text-emerald-500" />
            <span className="hidden sm:inline">Secure</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 pb-48 lg:pb-10">
        {/* Error */}
        {(formError || error) && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm flex items-start gap-3">
            <Info size={18} className="text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Something needs your attention</p>
              <p className="mt-0.5">{formError || error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT: FORM */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Shipping Details */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 md:px-6 border-b border-gray-100 bg-gray-50/60">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <h2 className="font-bold text-gray-900">
                    Shipping Details
                  </h2>
                </div>
                <div className="p-5 md:p-6 space-y-4">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100/60 transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={recipientDifferent}
                      onChange={(e) =>
                        handleRecipientToggle(e.target.checked)
                      }
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        Sending to someone else?
                      </span>
                      <span className="block text-xs text-gray-500">
                        Recipient's name will be used instead
                      </span>
                    </div>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Ama Mensah"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Phone <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+233 XXX XXX XXXX"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Street Address{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="House number, street name"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        City / Town{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Accra"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Region / State
                      </label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="e.g. Greater Accra"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Zip Code{" "}
                        <span className="text-gray-400 font-normal">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Country <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Ghana"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Landmark / Notes{" "}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Nearby landmarks, gate colour, instructions…"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Delivery Zone */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 md:px-6 border-b border-gray-100 bg-gray-50/60">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Truck size={16} />
                  </div>
                  <h2 className="font-bold text-gray-900">Delivery Zone</h2>
                </div>
                <div className="p-5 md:p-6 space-y-4">
                  <div
                    className={`transition-opacity duration-200 ${
                      otherLocation
                        ? "opacity-40 pointer-events-none"
                        : ""
                    }`}
                  >
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Delivery Location
                    </label>
                    <div className="relative">
                      <Truck
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full appearance-none pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white"
                      >
                        <option value="" disabled>
                          {shippingLoading
                            ? "Loading…"
                            : "Select a delivery zone"}
                        </option>
                        {!shippingLoading &&
                          shippingZones.map((zone) => (
                            <option key={zone._id} value={zone._id}>
                              {zone.name} — ₵
                              {formatCurrency(zone.deliveryCharge)}
                              {zone.estimate
                                ? ` • ${zone.estimate}`
                                : ""}
                            </option>
                          ))}
                      </select>
                      <ChevronDown
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                    {selectedZone?.estimate && !otherLocation && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                        <Clock size={12} /> Estimated delivery:{" "}
                        {selectedZone.estimate}
                      </p>
                    )}
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={otherLocation}
                      onChange={(e) => {
                        setOtherLocation(e.target.checked);
                        if (e.target.checked) setSelectedZoneId("");
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      My location isn't listed
                    </span>
                  </label>

                  {otherLocation && (
                    <div className="space-y-3 pl-7">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                          Your Location{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="text"
                            value={customLocation}
                            onChange={(e) =>
                              setCustomLocation(e.target.value)
                            }
                            placeholder="e.g. Adenta New Site"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                          />
                        </div>
                      </div>
                      {/* ✅ Updated message to reflect what happens */}
                      <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <Info
                          size={14}
                          className="text-amber-600 mt-0.5 flex-shrink-0"
                        />
                        <span>
                          Your location{" "}
                          {customLocation.trim() ? (
                            <strong>"{customLocation.trim()}"</strong>
                          ) : null}{" "}
                          will be sent to the seller. The delivery fee will
                          be provided by the seller after confirming your
                          location.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 3. Payment Method */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 md:px-6 border-b border-gray-100 bg-gray-50/60">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">
                      Payment Method
                    </h2>
                    <p className="text-xs text-gray-500">
                      Choose how you'd like to pay
                    </p>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <div className="space-y-3">
                    {paymentOptions.map((opt) => {
                      const selected = paymentMethod === opt.value;
                      const Icon = opt.Icon;
                      return (
                        <label
                          key={opt.value}
                          className={`group relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                            selected
                              ? `${opt.activeBorder} ${opt.activeBg} ring-2 ${opt.activeRing} shadow-md`
                              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-sm"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={opt.value}
                            checked={selected}
                            onChange={() => setPaymentMethod(opt.value)}
                            className="sr-only"
                          />
                          <div
                            className={`relative w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              selected
                                ? `bg-gradient-to-br ${opt.gradient} shadow-lg`
                                : `${opt.lightBg} group-hover:scale-105`
                            }`}
                          >
                            <Icon
                              size={24}
                              className={
                                selected ? "text-white" : opt.iconColor
                              }
                              strokeWidth={selected ? 2.2 : 1.8}
                            />
                            {selected && (
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0" />
                            )}
                          </div>
                          {/* ✅ Removed badge tags — just label + subtitle */}
                          <div className="flex-1 min-w-0">
                            <span
                              className={`font-semibold transition-colors ${
                                selected
                                  ? "text-gray-900"
                                  : "text-gray-700 group-hover:text-gray-900"
                              }`}
                            >
                              {opt.label}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {opt.sub}
                            </p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              selected
                                ? `bg-gradient-to-br ${opt.gradient} shadow-md`
                                : "border-2 border-gray-200 group-hover:border-gray-300"
                            }`}
                          >
                            {selected && (
                              <CheckCircle
                                size={16}
                                className="text-white"
                                strokeWidth={2.5}
                              />
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* ── Mobile: Order Summary (inline, collapsible) ── */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileCartOpen(!mobileCartOpen)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50/60 border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <ShoppingCart size={16} />
                    </div>
                    <div className="text-left">
                      <h2 className="font-bold text-gray-900">
                        Order Summary
                      </h2>
                      <p className="text-xs text-gray-500">
                        {cartItems.length} item
                        {cartItems.length !== 1 ? "s" : ""} · ₵
                        {formatCurrency(totalPrice)}
                        {shippingPrice === null && " + shipping"}
                      </p>
                    </div>
                  </div>
                  {mobileCartOpen ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>

                {mobileCartOpen && <OrderSummaryContent compact />}

                {/* Always-visible quick totals when collapsed */}
                {!mobileCartOpen && (
                  <div className="px-5 py-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">
                        ₵{formatCurrency(itemsPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax</span>
                      <span className="font-medium">
                        ₵{formatCurrency(taxPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Truck size={13} /> Shipping
                      </span>
                      {/* ✅ Updated mobile shipping display */}
                      <span
                        className={`font-medium ${
                          shippingPrice === null
                            ? "text-amber-600 text-xs"
                            : shippingPrice === 0
                              ? "text-emerald-600"
                              : ""
                        }`}
                      >
                        {shippingPrice === null
                          ? "Provided by seller"
                          : shippingPrice === 0
                            ? "N/A"
                            : `₵${formatCurrency(shippingPrice)}`}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-emerald-700">
                          ₵{formatCurrency(totalPrice)}
                        </span>
                        {shippingPrice === null && (
                          <span className="block text-[10px] text-amber-600 font-medium">
                            + shipping fee excluded
                          </span>
                        )}
                      </div>
                    </div>
                    {/* ✅ Updated mobile info message */}
                    {shippingPrice === null && (
                      <p className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-1">
                        <Info
                          size={12}
                          className="text-amber-500 mt-0.5 flex-shrink-0"
                        />
                        <span>
                          Delivery fee will be provided by the seller
                          {customLocation.trim()
                            ? ` for "${customLocation.trim()}"`
                            : ""}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* Desktop Place Order */}
              <button
                type="submit"
                disabled={loading}
                className="hidden lg:flex w-full items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />{" "}
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Place Order — ₵
                    {formatCurrency(totalPrice)}
                    {shippingPrice === null && " + shipping"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: ORDER SUMMARY (desktop only) */}
          <aside className="lg:col-span-5 xl:col-span-4 hidden lg:block">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm sticky top-20 overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={17} className="text-emerald-600" />
                  <h3 className="font-bold text-gray-900">Order Summary</h3>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full border">
                  {cartItems.length} item
                  {cartItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              <OrderSummaryContent />
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="px-4 pt-2.5 pb-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing…
              </>
            ) : (
              <>
                <Lock size={16} /> Place Order — ₵
                {formatCurrency(totalPrice)}
                {shippingPrice === null && " + shipping"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;