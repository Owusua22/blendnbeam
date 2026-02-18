
import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./slice/categorySlice";
import showroomReducer from "./slice/showroomSlice";
import productReducer from "./slice/productSlice";
import cartReducer from "./slice/cartSlice";
import authReducer from "./slice/authSlice";
import orderReducer from "./slice/orderSlice";
import shippingReducer from "./slice/shippingSlice";
import bannerReducer from "./slice/bannerSlice";


const store = configureStore({
  reducer: {
    categories: categoryReducer,
    showrooms: showroomReducer,
    products: productReducer,
    cart: cartReducer,
    auth: authReducer,
    orders: orderReducer,
    shipping: shippingReducer,
    banners: bannerReducer,

  },
});

export default store;
