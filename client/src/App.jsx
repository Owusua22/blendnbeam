import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Component/Navbar";

import Home from "./Pages/Home";
import AdminLayout from "./Pages/Admin/AdminLayout";
import Categories from "./Pages/Admin/Categories";
import Showroom from "./Pages/Admin/Showroom";
import ProductsPage from "./Pages/Admin/ProductsPage";
import ProductDetailsPage from "./Pages/ProductDetailsPage";

import CartPage from "./Pages/CartPage";
import CheckoutPage from "./Pages/Checkout";
import Orders from "./Pages/Admin/Orders";
import Shipping from "./Pages/Admin/Shipping";
import CategoryProductsPage from "./Pages/ProductbyCategories";
import OrderReceivedPage from "./Pages/OrderReceived";

function App() {
  return (
    <Router>
      <Navbar />
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/category/:categoryId" element={<CategoryProductsPage />} />
        <Route path="/order-received/:orderId" element={<OrderReceivedPage />} />
 
        <Route path="/cart" element={<CartPage />} />
        
        {/* Product details route */}
        <Route path="/product/:id" element={<ProductDetailsPage />} />

        {/* ✅ Admin routes nested inside AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="categories" element={<Categories />} />
          <Route path="showrooms" element={<Showroom />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<Orders />} />
          <Route path="shipping" element={<Shipping/>} />

          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;