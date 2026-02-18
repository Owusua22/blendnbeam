// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./Component/Navbar";

import Home from "./Pages/Home";
import AdminLayout from "./Pages/Admin/AdminLayout";
import Categories from "./Pages/Admin/Categories";
import Showroom from "./Pages/Admin/Showroom";
import ProductsPage from "./Pages/Admin/ProductsPage";
import Orders from "./Pages/Admin/Orders";
import Shipping from "./Pages/Admin/Shipping";

import ProductDetailsPage from "./Pages/ProductDetailsPage";
import CartPage from "./Pages/CartPage";
import CheckoutPage from "./Pages/Checkout";
import CategoryProductsPage from "./Pages/ProductbyCategories";
import OrderReceivedPage from "./Pages/OrderReceived";
import UserOrdersPage from "./Pages/UserOrders";

import AdminRegisterPage from "./Pages/AdminRegister";
import AdminLoginPage from "./Pages/AdminLogin";
import Users from "./Pages/Admin/Users";
import Banners from "./Pages/Admin/Banners";

/** Navbar wrapper: hides Navbar on admin routes */
function NavbarGate() {
  const { pathname } = useLocation();
  const hideNavbar = pathname.startsWith("/admin");
  if (hideNavbar) return null;
  return <Navbar />;
}

/** Protect admin routes */
function AdminRoute({ children }) {
  const { userInfo } = useSelector((s) => s.auth);

  // Adjust this if your payload uses a different admin flag field
  const isAdmin = Boolean(userInfo?.token) && (userInfo?.isAdmin === true || userInfo?.role === "admin");

  if (!isAdmin) {
    return <Navigate to="/admin/signin" replace />;
  }

  return children;
}

/** Optional: prevent logged-in admins from seeing admin auth pages */
function AdminAuthGate({ children }) {
  const { userInfo } = useSelector((s) => s.auth);
  const isAdmin = Boolean(userInfo?.token) && (userInfo?.isAdmin === true || userInfo?.role === "admin");

  if (isAdmin) return <Navigate to="/admin/products" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <NavbarGate />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/category/:categoryId" element={<CategoryProductsPage />} />
        <Route path="/order-received/:orderId" element={<OrderReceivedPage />} />
        <Route path="/customer-orders" element={<UserOrdersPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />

        {/* Admin auth routes (no Navbar because /admin/*) */}
        <Route
          path="/admin/signin"
          element={
            <AdminAuthGate>
              <AdminLoginPage />
            </AdminAuthGate>
          }
        />
        <Route
          path="/admin/signup"
          element={
            <AdminAuthGate>
              <AdminRegisterPage />
            </AdminAuthGate>
          }
        />

        {/* ✅ Protected Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* Redirect /admin -> /admin/products */}
          <Route index element={<Navigate to="products" replace />} />

          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<Categories />} />
          <Route path="showrooms" element={<Showroom />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="banners" element={<Banners />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;