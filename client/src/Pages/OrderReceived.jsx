import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Clock,
  Truck,
  ShoppingBag,
  ClipboardList,
  Sparkles,
  MessageCircle,
} from "lucide-react";

export default function OrderReceivedPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const displayId = id
    ? `#${id.slice(-8).toUpperCase()}`
    : `#${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

  const estimatedDelivery = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const steps = [
    {
      icon: CheckCircle,
      label: "Confirmed",
      sub: "Order received",
      done: true,
      active: false,
    },
    {
      icon: Clock,
      label: "Processing",
      sub: "Preparing items",
      done: false,
      active: true,
    },
    {
      icon: Truck,
      label: "Delivery",
      sub: estimatedDelivery,
      done: false,
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-8 sm:pt-14 pb-12 px-4">
      <div className="w-full max-w-md">
        {/* ─── Success Header ─── */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center mb-4">
            {/* Pulse ring */}
            <span className="absolute w-20 h-20 rounded-full bg-emerald-100 animate-ping opacity-30" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <CheckCircle size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <Sparkles size={16} className="text-amber-400" />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Order Placed!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thank you for your purchase
          </p>
        </div>

        {/* ─── Order Card ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Order ID bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <div>
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                Order ID
              </p>
              <p className="text-base font-bold text-gray-900 font-mono mt-0.5">
                {displayId}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center shadow-sm">
              <Package size={20} className="text-emerald-600" />
            </div>
          </div>

          {/* ─── Progress Steps ─── */}
          <div className="px-5 py-5">
            <div className="flex items-start justify-between relative">
              {/* Connector line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-gray-200 z-0">
                <div className="h-full w-1/3 bg-emerald-500 rounded-full" />
              </div>

              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="relative z-10 flex flex-col items-center text-center flex-1"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        step.done
                          ? "bg-emerald-500 shadow-md shadow-emerald-500/20"
                          : step.active
                            ? "bg-amber-400 shadow-md shadow-amber-400/20 animate-pulse"
                            : "bg-gray-100 border-2 border-gray-200"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          step.done || step.active
                            ? "text-white"
                            : "text-gray-400"
                        }
                        strokeWidth={2.5}
                      />
                    </div>
                    <p
                      className={`text-xs font-semibold mt-2 ${
                        step.done
                          ? "text-emerald-700"
                          : step.active
                            ? "text-amber-700"
                            : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                      {step.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Info Note ─── */}
          <div className="mx-5 mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <Clock size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              You'll receive updates as your order progresses. Check your
              orders page for real-time status.
            </p>
          </div>
        </div>

        {/* ─── Action Buttons ─── */}
        <div className="mt-5 space-y-2.5">
          <button
            onClick={() => navigate("/customer-orders")}
            className="group w-full flex items-center justify-center gap-2.5 py-3.5 
              bg-gray-900 text-white font-bold text-sm rounded-2xl shadow-lg 
              shadow-gray-900/10 hover:bg-gray-800 active:scale-[0.98] transition-all"
          >
            <ClipboardList size={17} />
            Track Your Orders
            <ArrowRight
              size={15}
              className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
            />
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 py-3 
              bg-white text-gray-700 font-semibold text-sm rounded-2xl 
              border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 
              active:scale-[0.98] transition-all"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </button>
        </div>

        {/* ─── Footer ─── */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Need help?{" "}
          <button
            onClick={() => navigate("/contact")}
            className="inline-flex items-center gap-1 text-emerald-600 font-semibold 
              hover:underline underline-offset-2"
          >
            <MessageCircle size={11} />
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
}