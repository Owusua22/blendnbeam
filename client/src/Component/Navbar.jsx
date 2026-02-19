import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  ChevronDown,
  Sparkles,
  ArrowRight,
  Grid3X3,
  TrendingUp,
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
  const location = useLocation();

  // UI state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState("menu");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Redux state
  const { items: categories = [] } = useSelector((state) => state.categories);
  const { userInfo } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);

  // Search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchFocused, setSearchFocused] = useState(false);

  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null); // desktop search container
  const mobileSearchInputRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside (dropdowns, user menu, desktop search suggestions)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
        setHoveredCategory(null);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }

      // Only close desktop search suggestions when mobile search is NOT open
      if (
        !mobileSearchOpen &&
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
        setSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileSearchOpen]);

  // Auto-focus the mobile search input when modal opens
  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      const t = setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [mobileSearchOpen]);

  // Prevent body scroll when mobile search is open
  useEffect(() => {
    if (mobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSearchOpen]);

  // Debounced product search
  const doSearch = useRef(
    debounce(async (q) => {
      if (!q || q.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const res = await getProducts({ search: q.trim(), limit: 6 });
        const results = Array.isArray(res)
          ? res
          : res?.data ?? res?.products ?? [];
        setSuggestions(results.slice(0, 6));
        setShowSuggestions(true);
      } catch (err) {
        console.error("Search error", err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300)
  ).current;

  // Run search when query changes
  useEffect(() => {
    doSearch(query);
    setActiveSuggestionIndex(-1);
  }, [query, doSearch]);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

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

  const goToProduct = (product) => {
    if (!product) return;

    const productId = product._id || product.id || product.slug;
    if (!productId) return;

    setShowSuggestions(false);
    setQuery("");

    // Adjust path if your product details route is different
    navigate(`/product/${productId}`);

    closeMobileMenu();
    closeMobileSearch();
  };

  const navigateToSearchPage = (searchTerm) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setShowSuggestions(false);
    setSearchFocused(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    closeMobileMenu();
    closeMobileSearch();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault();
        navigateToSearchPage(query);
      }
      if (e.key === "Escape" && mobileSearchOpen) {
        closeMobileSearch();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((idx) =>
        Math.min(idx + 1, suggestions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((idx) => Math.max(idx - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = suggestions[activeSuggestionIndex] ?? suggestions[0];
      if (selected) {
        goToProduct(selected);
      } else if (query.trim()) {
        navigateToSearchPage(query);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      if (mobileSearchOpen) closeMobileSearch();
    }
  };

  const totalItems =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/about", label: "About", icon: Store },
    { to: "/shops", label: "Shops", icon: Store },
    ...(userInfo
      ? [{ to: "/customer-orders", label: "Orders", icon: Package }]
      : []),
  ];

  return (
    <header className="w-full sticky top-0 z-50">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-9 text-xs">
            <div className="flex items-center gap-5">
              <a
                href="tel:+233554671026"
                className="flex items-center gap-1.5 hover:text-emerald-100 transition-colors group"
              >
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <Phone size={10} />
                </div>
                <span className="sm:inline font-medium">
                  +233 554 671 026
                </span>
              </a>
              <a
                href="mailto:info@blendandbeam.com"
                className="flex items-center gap-1.5 hover:text-emerald-100 transition-colors group"
              >
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <Mail size={10} />
                </div>
                <span className="font-medium">info@blendandbeam.com</span>
              </a>
            </div>

            <div className="hidden md:flex items-center gap-5">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <Sparkles size={12} className="text-yellow-300 animate-pulse" />
                <span className="font-semibold">
                  50% Off Selected Items
                  <Link
                    to="/sale"
                    className="ml-1.5 underline underline-offset-2 hover:text-yellow-200 transition-colors"
                  >
                    Shop Now →
                  </Link>
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 text-white/80">
                <MapPin size={12} />
                <span className="font-medium">Accra, Ghana</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`bg-white transition-all duration-300 ${
          scrolled
            ? "shadow-lg shadow-black/5 backdrop-blur-md bg-white/95"
            : "shadow-sm"
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">
            {/* Mobile Header */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all"
              >
                <Menu size={22} className="text-gray-700" />
              </button>
              <Link to="/" className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                    <span className="text-white font-bold text-sm">B&B</span>
                  </div>
                  <span className="text-lg font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Blend & Beam
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Left Section */}
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all group-hover:scale-105">
                  <span className="text-white font-bold text-sm">B&B</span>
                </div>
                <div>
                  <div className="text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight">
                    Blend & Beam
                  </div>
                  <div className="text-[10px] font-medium text-emerald-600 tracking-wider uppercase">
                    Home & Living
                  </div>
                </div>
              </Link>

              {/* Categories Dropdown - Desktop */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    categoryDropdownOpen
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200"
                  }`}
                >
                  <Grid3X3 size={16} />
                  <span>Categories</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      categoryDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute top-full mt-3 left-0 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden">
                    <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-800">
                          Browse Categories
                        </span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
                      {categories.slice(0, 15).map((category) => (
                        <button
                          key={category._id}
                          onClick={() => handleCategoryClick(category)}
                          className={`flex items-center justify-between w-full px-3 py-2.5 text-sm cursor-pointer rounded-xl transition-all duration-150 group ${
                            hoveredCategory === category._id
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                              : "hover:bg-emerald-50 text-gray-700"
                          }`}
                          onMouseEnter={() => setHoveredCategory(category._id)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                hoveredCategory === category._id
                                  ? "bg-white/20"
                                  : "bg-emerald-100"
                              }`}
                            >
                              <Tag
                                className={`h-3.5 w-3.5 ${
                                  hoveredCategory === category._id
                                    ? "text-white"
                                    : "text-emerald-600"
                                }`}
                              />
                            </div>
                            <span className="font-medium">
                              {category.name}
                            </span>
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${
                              hoveredCategory === category._id
                                ? "text-white/80"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div
              className="hidden lg:flex flex-1 max-w-2xl mx-8"
              ref={searchRef}
            >
              <div className="relative w-full">
                <div
                  className={`flex items-center rounded-2xl px-4 py-2.5 transition-all duration-300 ${
                    searchFocused
                      ? "bg-white ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/10 border-transparent"
                      : "bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100/50"
                  }`}
                >
                  <Search
                    size={18}
                    className={`transition-colors flex-shrink-0 ${
                      searchFocused ? "text-emerald-500" : "text-gray-400"
                    }`}
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      setSearchFocused(true);
                      query && setShowSuggestions(true);
                    }}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search for furniture, decor, lighting..."
                    className="bg-transparent outline-none w-full text-sm placeholder-gray-400 ml-3 text-gray-800"
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <X size={14} className="text-gray-400" />
                    </button>
                  )}
                  <div className="h-6 w-px bg-gray-200 mx-2" />
                  <button
                    onClick={() =>
                      query?.trim() && navigateToSearchPage(query)
                    }
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl px-4 py-1.5 text-sm font-medium transition-all hover:shadow-md"
                  >
                    Search
                  </button>
                </div>

                {/* Desktop Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-black/10 z-50 max-h-96 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-500" />
                        <span className="text-xs font-semibold text-gray-600">
                          {suggestions.length} product
                          {suggestions.length !== 1 ? "s" : ""} found
                        </span>
                      </div>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          navigateToSearchPage(query);
                        }}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        View all <ArrowRight size={12} />
                      </button>
                    </div>
                    <div className="overflow-y-auto max-h-72">
                      {suggestions.map((p, i) => (
                        <button
                          key={p._id || p.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            goToProduct(p);
                          }}
                          className={`flex items-center gap-4 w-full px-4 py-3 hover:bg-emerald-50/50 border-b border-gray-50 last:border-b-0 transition-all duration-150 ${
                            activeSuggestionIndex === i ? "bg-emerald-50" : ""
                          }`}
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                            <img
                              src={
                                p.images?.[0]?.url ||
                                p.image ||
                                "/placeholder.png"
                              }
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-sm text-gray-900 line-clamp-1">
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-emerald-600 font-bold text-sm">
                                ₵{(p.price ?? 0).toFixed(2)}
                              </span>
                              {p.compareAtPrice && (
                                <span className="text-gray-400 text-xs line-through">
                                  ₵{p.compareAtPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight
                            size={16}
                            className="text-gray-300 flex-shrink-0"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Right Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(link.to)
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </Link>
              ))}

              <div className="h-8 w-px bg-gray-200 mx-2" />

              {/* User Account */}
              {userInfo ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all duration-200 ${
                      userMenuOpen
                        ? "bg-emerald-50 ring-2 ring-emerald-200"
                        : "hover:bg-gray-50"
                    }`}
                    title={userInfo.name}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
                      {userInfo.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden">
                      <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
                            {userInfo.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">
                              {userInfo.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {userInfo.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-sm text-gray-700 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <User size={15} className="text-blue-600" />
                          </div>
                          <span className="font-medium">My Profile</span>
                        </Link>
                        <Link
                          to="/customer-orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-sm text-gray-700 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <Package size={15} className="text-amber-600" />
                          </div>
                          <span className="font-medium">My Orders</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-sm text-gray-700 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                            <Heart size={15} className="text-pink-500" />
                          </div>
                          <span className="font-medium">Wishlist</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-sm text-red-600 w-full transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <LogOut size={15} className="text-red-500" />
                          </div>
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]"
                >
                  <User size={15} />
                  Sign Up
                </button>
              )}

              {/* Wishlist */}
              <button
                onClick={() => navigate("/wishlist")}
                className="relative p-2.5 rounded-xl hover:bg-pink-50 transition-all duration-200 group ml-1"
                title="Wishlist"
              >
                <Heart
                  className="h-[22px] w-[22px] text-gray-400 group-hover:text-pink-500 transition-colors"
                  strokeWidth={1.8}
                />
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2.5 rounded-xl hover:bg-emerald-50 transition-all duration-200 group"
                title="Shopping Cart"
              >
                <ShoppingCart
                  className="h-[22px] w-[22px] text-gray-400 group-hover:text-emerald-600 transition-colors"
                  strokeWidth={1.8}
                />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] min-w-[20px] h-5 px-1.5 rounded-full font-bold flex items-center justify-center shadow-lg shadow-red-500/30">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Right Icons */}
            <div className="lg:hidden flex items-center gap-1">
              {/* Mobile Search Icon */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all"
                title="Search"
              >
                <Search className="h-5 w-5 text-gray-500" strokeWidth={1.8} />
              </button>

              <button
                onClick={() => navigate("/wishlist")}
                className="relative p-2 rounded-xl hover:bg-pink-50 transition-all"
                title="Wishlist"
              >
                <Heart className="h-5 w-5 text-gray-400" strokeWidth={1.8} />
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 rounded-xl hover:bg-emerald-50 transition-all"
                title="Shopping Cart"
              >
                <ShoppingCart
                  className="h-5 w-5 text-gray-500"
                  strokeWidth={1.8}
                />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full font-bold flex items-center justify-center shadow-md">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Modal */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          mobileSearchOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileSearchOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobileSearch}
        />

        {/* Search Panel */}
        <div
          className={`absolute top-0 left-0 right-0 bg-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileSearchOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500">
            <div className="flex-1 flex items-center bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-inner">
              <Search size={18} className="text-emerald-500 flex-shrink-0" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for products..."
                className="ml-3 bg-transparent text-gray-800 text-sm w-full focus:outline-none placeholder-gray-400"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                    mobileSearchInputRef.current?.focus();
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={closeMobileSearch}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Button */}
          {query && (
            <div className="px-4 pt-3">
              <button
                onClick={() => query?.trim() && navigateToSearchPage(query)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Search size={16} />
                Search for "{query}"
              </button>
            </div>
          )}

          {/* Search Results */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="border-t border-gray-100 mt-3">
              <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-600">
                    {suggestions.length} product
                    {suggestions.length !== 1 ? "s" : ""} found
                  </span>
                </div>
                <button
                  onClick={() => navigateToSearchPage(query)}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[50vh]">
                {suggestions.map((p, i) => (
                  <button
                    key={p._id || p.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      goToProduct(p);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 border-b border-gray-50 last:border-b-0 transition-all duration-150 active:bg-emerald-50 ${
                      activeSuggestionIndex === i ? "bg-emerald-50" : ""
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                      <img
                        src={
                          p.images?.[0]?.url || p.image || "/placeholder.png"
                        }
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-semibold text-sm line-clamp-1 text-gray-900">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-emerald-600 font-bold text-sm">
                          ₵{(p.price ?? 0).toFixed(2)}
                        </span>
                        {p.compareAtPrice && (
                          <span className="text-gray-400 text-xs line-through">
                            ₵{p.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-gray-300 flex-shrink-0"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query &&
            query.trim().length >= 2 &&
            showSuggestions &&
            suggestions.length === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Search size={24} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  No products found
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try searching with different keywords
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
      />

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl z-50 lg:hidden overflow-hidden flex flex-col transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">B&B</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Blend & Beam</h2>
            </div>
          </div>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-50 p-1.5 mx-4 mt-4 rounded-xl">
          <button
            onClick={() => setActiveSidebar("categories")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeSidebar === "categories"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveSidebar("menu")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeSidebar === "menu"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Main Menu
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {activeSidebar === "menu" ? (
            <div className="space-y-1">
              {/* User Section */}
              {userInfo ? (
                <div className="flex items-center gap-3 p-3 mb-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
                    {userInfo.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-emerald-800 text-sm truncate">
                      {userInfo.name}
                    </div>
                    <div className="text-xs text-emerald-600 truncate">
                      {userInfo.email}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100">
                  <div className="text-sm font-semibold text-gray-800 mb-1">
                    Welcome!
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Sign in to access your account
                  </p>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLoginClick();
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                  >
                    <User className="w-4 h-4" />
                    Sign Up / Login
                  </button>
                </div>
              )}

              {/* Nav Links */}
              {[
                { to: "/", icon: Home, label: "Home", color: "blue" },
                {
                  to: "/about",
                  icon: Store,
                  label: "About Us",
                  color: "purple",
                },
                ...(userInfo
                  ? [
                      {
                        to: "/customer-orders",
                        icon: Package,
                        label: "My Orders",
                        color: "amber",
                      },
                    ]
                  : []),
                { to: "/shops", icon: Store, label: "Shops", color: "indigo" },
                {
                  to: "/contact",
                  icon: PhoneCall,
                  label: "Contact",
                  color: "green",
                },
                ...(userInfo
                  ? [
                      {
                        to: "/profile",
                        icon: User,
                        label: "My Account",
                        color: "cyan",
                      },
                    ]
                  : []),
                {
                  to: "/wishlist",
                  icon: Heart,
                  label: "Wishlist",
                  color: "pink",
                },
              ].map((item) => {
                const Icon = item.icon;
                const colorMap = {
                  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
                  purple:
                    "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
                  amber:
                    "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
                  indigo:
                    "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
                  green:
                    "bg-green-50 text-green-600 group-hover:bg-green-100",
                  cyan: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100",
                  pink: "bg-pink-50 text-pink-600 group-hover:bg-pink-100",
                };
                return (
                  <Link
                    key={item.to + item.label}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive(item.to)
                        ? "bg-emerald-50 border border-emerald-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        colorMap[item.color]
                      }`}
                    >
                      <Icon size={17} />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive(item.to)
                          ? "text-emerald-700"
                          : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </span>
                    {isActive(item.to) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}

              {/* Cart Link */}
              <Link
                to="/cart"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive("/cart")
                    ? "bg-emerald-50 border border-emerald-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                  <ShoppingCart size={17} />
                </div>
                <span className="text-sm font-medium text-gray-700 flex-1">
                  Shopping Cart
                </span>
                {totalItems > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Logout */}
              {userInfo && (
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-6 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all duration-200 border border-red-100 text-sm"
                >
                  <LogOut size={17} />
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {categories.slice(0, 15).map((category, index) => (
                <button
                  key={category._id}
                  onClick={() => {
                    handleCategoryClick(category);
                    closeMobileMenu();
                  }}
                  className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-emerald-50 rounded-xl transition-all duration-200 group"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Tag className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
                      {category.name}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone size={12} />
            <span>Need help? Call +233 554 671 026</span>
          </div>
        </div>
      </div>

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