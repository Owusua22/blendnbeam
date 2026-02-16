import React from 'react';
import { CheckCircle, Package, Mail, ArrowRight, Clock, Truck } from 'lucide-react';

export default function OrderReceivedPage() {
  const orderNumber = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Order Received!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase
          </p>
        </div>

        {/* Order Number Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
            </div>
            <Package className="w-12 h-12 text-yellow-500" />
          </div>

          {/* Status Timeline */}
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="font-semibold text-gray-900">Order Confirmed</p>
                <p className="text-sm text-gray-600">Your order has been received and confirmed</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="font-semibold text-gray-900">Processing</p>
                <p className="text-sm text-gray-600">We're preparing your items for shipment</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-gray-500" />
              </div>
              <div className="ml-4 flex-1">
                <p className="font-semibold text-gray-600">Estimated Delivery</p>
                <p className="text-sm text-gray-600">{estimatedDelivery}</p>
              </div>
            </div>
          </div>
        </div>

       

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition duration-200 flex items-center justify-center group">
            Track Your Order
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl shadow border-2 border-gray-200 transition duration-200">
            Continue Shopping
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? <span className="text-green-600 font-semibold cursor-pointer hover:underline">Contact Support</span>
          </p>
        </div>
      </div>
    </div>
  );
}