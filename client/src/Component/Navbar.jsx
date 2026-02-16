import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Search,
  Phone,
  Menu,
  X,
  Mail,
  LogOut,
  Heart,
  MapPin,
  Home,
  Package,
  Store,
  PhoneCall,
  Tag,
  ChevronRight,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories } from "../Redux/slice/categorySlice";
import { logout } from "../Redux/slice/authSlice";
import AuthModal from "../Pages/AuthPage";
import { getProducts } from "../api";
import debounce from "lodash.debounce";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // UI state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState("menu");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Redux state
  const { items: categories = [] } = useSelector((state) => state.categories);
  const { userInfo } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);

  // Search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
        setHoveredCategory(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLoginClick = () => {
    setAuthDefaultTab("login");
    setAuthModalOpen(true);
    closeMobileMenu();
  };

  const handleCategoryClick = (category) => {
    const categoryId = category.slug || category._id;
    setCategoryDropdownOpen(false);
    setHoveredCategory(null);
    navigate(`/category/${categoryId}`);
  };

  const doSearch = useRef(
    debounce(async (q) => {
      if (!q || q.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await getProducts({ search: q.trim(), limit: 6 });
        const results = Array.isArray(res) ? res : res?.data ?? res?.products ?? [];
        setSuggestions(results.slice(0, 6));
        setShowSuggestions(true);
      } catch (err) {
        console.error("Search error", err);
        setSuggestions([]);
      }
    }, 300)
  ).current;

  useEffect(() => {
    doSearch(query);
    setActiveSuggestionIndex(-1);
  }, [query, doSearch]);

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((idx) => Math.min(idx + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((idx) => Math.max(idx - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = suggestions[activeSuggestionIndex] ?? suggestions[0];
      if (selected) {
        goToProduct(selected);
      } else {
        navigateToSearchPage(query);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const navigateToSearchPage = (q) => {
    setShowSuggestions(false);
    navigate(`/search?query=${encodeURIComponent(q)}`);
  };

  const goToProduct = (product) => {
    setShowSuggestions(false);
    setQuery("");
    const idOrSlug = product.slug || product._id || product.id;
    navigate(`/product/${idOrSlug}`);
    closeMobileMenu();
  };

  const totalItems = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <header className="w-full sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between h-7 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Phone size={12} />
                <span className="hidden sm:inline">+233554671026</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5">
                <Mail size={12} />
                <span>info@blendandbeam.com</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-medium">
                🎉 50% Off Selected Items
                <Link to="/sale" className="ml-1 underline hover:text-yellow-200">
                  Shop Now
                </Link>
              </span>
              <div className="hidden md:flex items-center gap-1 text-white/90">
                <MapPin size={12} />
                <span>Accra, Ghana</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-md">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Mobile Header */}
            <div className="flex items-center gap-2 lg:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1">
                <Menu size={20} className="text-gray-900" />
              </button>
              <Link to="/" className="flex items-center">
                <div className="text-lg font-bold text-gray-900 leading-tight">
                  Blend & Beam
                </div>
              </Link>
            </div>

            {/* Desktop Left Section */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-sm">
                  <ShoppingCart className="text-white" size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 leading-tight">
                    Blend & Beam
                  </div>
                </div>
              </Link>

              {/* Categories Dropdown - Desktop */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="flex items-center gap-1.5 px-5 py-1.5 text-xs font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                >
                  <Tag size={16} />
                  Categories
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute top-12 left-0 shadow-xl bg-white border rounded-lg z-50">
                    <div className="w-56 max-h-96 overflow-y-auto p-2 bg-white rounded-lg">
                      {categories.slice(0, 15).map((category) => (
                        <button
                          key={category._id}
                          onClick={() => handleCategoryClick(category)}
                          className={`flex items-center justify-between w-full px-2 py-2 text-sm cursor-pointer hover:bg-green-400 hover:text-white rounded-lg transition ${
                            hoveredCategory === category._id ? "bg-green-600 text-white" : ""
                          }`}
                          onMouseEnter={() => setHoveredCategory(category._id)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <div className="flex items-center gap-2">
                            <Tag className={`h-4 w-4 ${hoveredCategory === category._id ? "text-white" : "text-green-600"}`} />
                            <span>{category.name}</span>
                          </div>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-3xl mx-6" ref={searchRef}>
              <div className="relative w-full">
                <div className="flex items-center bg-gray-100 border border-gray-300 rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-red-300 transition">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query && setShowSuggestions(true)}
                    placeholder="Search for furniture, decor, lighting..."
                    className="bg-transparent outline-none w-full text-sm placeholder-gray-500"
                  />
                  <button
                    onClick={() => query?.trim() && navigateToSearchPage(query)}
                    className="ml-2"
                  >
                    <Search size={18} className="text-gray-500 hover:text-red-600" />
                  </button>
                </div>

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 max-h-80 overflow-auto">
                    <div className="p-2 bg-gray-50 border-b text-xs text-gray-600">
                      Found {suggestions.length} product{suggestions.length !== 1 ? 's' : ''}
                    </div>
                    {suggestions.map((p, i) => (
                      <button
                        key={p._id || p.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          goToProduct(p);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-green-50 border-b last:border-b-0 transition-colors ${
                          activeSuggestionIndex === i ? "bg-green-50" : ""
                        }`}
                      >
                        <img
                          src={p.images?.[0]?.url || p.image || "/placeholder.png"}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-md border"
                        />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm text-gray-900 line-clamp-1">
                            {p.name}
                          </div>
                          <div className="text-green-600 font-semibold text-sm mt-0.5">
                            ₵{(p.price ?? 0).toFixed(2)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Right Navigation */}
            <div className="hidden lg:flex items-center gap-3 text-sm">
              <Link to="/" className="hover:text-red-500 transition-colors px-2 py-1">
                Home
              </Link>
              <Link to="/about" className="hover:text-red-500 transition-colors px-2 py-1">
                About
              </Link>
              {userInfo && (
                <Link to="/orders" className="hover:text-red-500 transition-colors px-2 py-1">
                  Orders
                </Link>
              )}
              <Link to="/shops" className="hover:text-red-500 transition-colors px-2 py-1">
                Shops
              </Link>

              {/* User Account */}
              {userInfo ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold hover:from-red-600 hover:to-red-700 transition-all text-xs"
                    title={userInfo.name}
                  >
                    {userInfo.name?.charAt(0).toUpperCase()}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border rounded-lg shadow-xl z-50 py-2">
                      <div className="px-4 py-3 border-b">
                        <div className="font-medium text-sm text-gray-900">{userInfo.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{userInfo.email}</div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        <User size={16} />
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        <Package size={16} />
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        <Heart size={16} />
                        Wishlist
                      </Link>
                      <div className="h-px bg-gray-200 my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 w-full"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-md hover:from-green-600 hover:to-green-700 transition-all text-xs flex items-center gap-1"
                >
                  <User size={14} />
                  Sign Up
                </button>
              )}

              {/* Wishlist */}
              <button
                onClick={() => navigate("/wishlist")}
                className="relative p-1.5 rounded-full hover:bg-pink-50 transition-all group"
                title="Wishlist"
              >
                <Heart className="h-5 w-5 text-pink-500 hover:text-pink-600" />
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate("/cart")}
                className="relative p-1.5 rounded-full hover:bg-green-50 transition-all group"
                title="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700 hover:text-green-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Right Icons */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => navigate("/wishlist")}
                className="relative p-1"
                title="Wishlist"
              >
                <Heart className="h-5 w-5 text-pink-500" />
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="relative p-1"
                title="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full font-semibold">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="w-full lg:hidden pb-3" ref={searchRef}>
            <div className="relative">
              <div className="flex items-center rounded-full px-3 py-2 shadow-md border border-gray-300">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="ml-2 bg-white text-gray-800 text-sm w-full focus:outline-none placeholder-gray-400"
                />
              </div>

              {/* Mobile Search Results */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                  <div className="p-2 bg-gray-50 border-b text-xs text-gray-600">
                    {suggestions.length} product{suggestions.length !== 1 ? "s" : ""}
                  </div>
                  {suggestions.map((p) => (
                    <button
                      key={p._id || p.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        goToProduct(p);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-3 hover:bg-green-50 border-b last:border-b-0"
                    >
                      <img
                        src={p.images?.[0]?.url || p.image || "/placeholder.png"}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-md"
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm line-clamp-1">{p.name}</div>
                        <div className="text-green-600 font-semibold text-sm">
                          ₵{(p.price ?? 0).toFixed(2)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Menu</h2>
              <button onClick={closeMobileMenu} className="p-1">
                <X size={20} className="text-gray-900" />
              </button>
            </div>

            <div className="flex border-b">
              <button
                onClick={() => setActiveSidebar("menu")}
                className={`w-1/2 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  activeSidebar === "menu"
                    ? "border-green-500 text-green-600"
                    : "border-gray-200"
                }`}
              >
                Main Menu
              </button>
              <button
                onClick={() => setActiveSidebar("categories")}
                className={`w-1/2 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  activeSidebar === "categories"
                    ? "border-green-500 text-green-600"
                    : "border-gray-200"
                }`}
              >
                Categories
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeSidebar === "menu" ? (
                <div className="p-4">
                  {userInfo ? (
                    <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {userInfo.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-green-700 text-sm">
                          {userInfo.name}
                        </div>
                        <div className="text-xs text-green-600">{userInfo.email}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2 mb-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                      <div className="text-xs font-medium text-blue-700 mb-2">Welcome!</div>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          handleLoginClick();
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-3 rounded-md text-xs font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-1.5"
                      >
                        <User className="w-3 h-3" />
                        Sign Up / Login
                      </button>
                    </div>
                  )}

                  <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg"
                  >
                    <Home size={18} className="text-gray-600" />
                    <span className="text-sm">Home</span>
                  </Link>

                  <Link
                    to="/about"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg"
                  >
                    <Store size={18} className="text-gray-600" />
                    <span className="text-sm">About Us</span>
                  </Link>

                  {userInfo && (
                    <Link
                      to="/orders"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg"
                    >
                      <Package size={18} className="text-gray-600" />
                      <span className="text-sm">My Orders</span>
                    </Link>
                  )}

                  <Link
                    to="/shops"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg"
                  >
                    <Store size={18} className="text-gray-600" />
                    <span className="text-sm">Shops</span>
                  </Link>

                  <Link
                    to="/contact"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg"
                  >
                    <PhoneCall size={18} className="text-gray-600" />
                    <span className="text-sm">Contact</span>
                  </Link>

                  {userInfo && (
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg"
                    >
                      <User size={18} className="text-gray-600" />
                      <span className="text-sm">My Account</span>
                    </Link>
                  )}

                  <Link
                    to="/wishlist"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg"
                  >
                    <Heart size={18} className="text-gray-600" />
                    <span className="text-sm">Wishlist</span>
                  </Link>

                  <Link
                    to="/cart"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg"
                  >
                    <ShoppingCart size={18} className="text-gray-600" />
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">Shopping Cart</span>
                      {totalItems > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                          {totalItems > 99 ? "99+" : totalItems}
                        </span>
                      )}
                    </div>
                  </Link>

                  {userInfo && (
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <div className="space-y-1">
                    {categories.slice(0, 15).map((category) => (
                      <button
                        key={category._id}
                        onClick={() => {
                          handleCategoryClick(category);
                          closeMobileMenu();
                        }}
                        className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authDefaultTab}
      />
    </header>
  );
};

export default Navbar;