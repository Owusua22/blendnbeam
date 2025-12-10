import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ShoppingCart, User, Search, Phone, ChevronDown, Menu, X, Mail, LogOut } from "lucide-react";
import { fetchCategories } from "../Redux/slice/categorySlice";
import { logout } from "../Redux/slice/authSlice";
import { useNavigate } from "react-router-dom";
import AuthModal from "../Pages/AuthPage"; // Import the AuthModal

const Navbar = () => {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState("login");
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: categories, loading } = useSelector((state) => state.categories);
  const { userInfo } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  };

  const handleLoginClick = () => {
    setAuthDefaultTab("login");
    setAuthModalOpen(true);
    closeMobileMenu();
  };

  const handleRegisterClick = () => {
    setAuthDefaultTab("register");
    setAuthModalOpen(true);
    closeMobileMenu();
  };

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white text-sm">
        <div className="px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span className="text-xs md:text-sm">+233554671026</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Mail size={14} />
                <span className="text-xs md:text-sm">info@blend&beam.com</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
              <span className="text-center">🎉 Get 50% Off on Selected Items</span>
              <span className="font-semibold cursor-pointer hover:text-yellow-200 transition-colors">
                Shop Now →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation - Sticky */}
      <div className={`bg-white border-b transition-all duration-300 ${
        isScrolled ? "shadow-lg" : "shadow-sm"
      }`}>
        <div className="px-4 py-0.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="text-white" size={22} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Blend & Beam
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-green-600 font-medium transition-all duration-200 hover:bg-gray-50 rounded-lg"
                >
                  Categories <ChevronDown size={16} className={`transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2">
                    {loading ? (
                      <div className="px-4 py-3 text-gray-500 text-sm flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </div>
                    ) : categories.length > 0 ? (
                      <ul className="max-h-80 overflow-y-auto">
                        {categories.map((category) => (
                          <li key={category._id}>
                            <a
                              href={`/category/${category.slug || category._id}`}
                              className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 border-l-2 border-transparent hover:border-green-500"
                              onClick={() => setCategoryDropdownOpen(false)}
                            >
                              {category.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">No categories available</div>
                    )}
                  </div>
                )}
              </div>

              {['/about', '/contact', '/orders'].map((path) => (
                <a
                  key={path}
                  href={path}
                  className="text-gray-700 hover:text-green-600 font-medium transition-all duration-200 hover:bg-gray-50 px-3 py-2 rounded-lg"
                >
                  {path === '/about' ? 'About Us' : path === '/contact' ? 'Contact Us' : 'My Orders'}
                </a>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-80 px-4 py-2.5 pr-11 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-2">
                {userInfo ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {userInfo.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">{userInfo.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    <User size={20} />
                    Login
                  </button>
                )}

                {/* Cart */}
                <button
                  className="flex items-center gap-2 p-2.5 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-all duration-200 relative"
                  onClick={() => navigate("/cart")}
                >
                  <ShoppingCart size={22} />
                  {cart?.items?.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {cart.items.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button 
                onClick={() => setSearchOpen(!searchOpen)} 
                className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <Search size={20} />
              </button>

              <button 
                className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
                onClick={() => {
                  navigate("/cart");
                  closeMobileMenu();
                }}
              >
                <ShoppingCart size={20} />
                {cart?.items?.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cart.items.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="lg:hidden mt-3 animate-fadeIn">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b shadow-xl animate-slideDown">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex flex-col gap-1">
              {/* Categories */}
              <div className="mb-2">
                <h3 className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Categories
                </h3>
                <div className="space-y-1">
                  {loading ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">Loading...</div>
                  ) : categories.length > 0 ? (
                    categories.slice(0, 5).map((category) => (
                      <a
                        key={category._id}
                        href={`/category/${category.slug || category._id}`}
                        className="flex items-center px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                        onClick={closeMobileMenu}
                      >
                        {category.name}
                      </a>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">No categories</div>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              {['/about', '/contact', '/orders'].map((path) => (
                <a
                  key={path}
                  href={path}
                  className="flex items-center px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                  onClick={closeMobileMenu}
                >
                  {path === '/about' ? 'About Us' : path === '/contact' ? 'Contact Us' : 'My Orders'}
                </a>
              ))}

              {/* User Section */}
              <div className="border-t border-gray-200 mt-2 pt-4">
                {userInfo ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-medium">
                        {userInfo.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{userInfo.name}</p>
                        <p className="text-sm text-gray-600">Welcome back!</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                      className="flex items-center gap-3 w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLoginClick}
                      className="flex items-center gap-3 w-full px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      <User size={20} />
                      Login
                    </button>
                    <button
                      onClick={handleRegisterClick}
                      className="flex items-center gap-3 w-full px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium mt-1"
                    >
                      <User size={20} />
                      Register
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authDefaultTab}
      />

      {/* Add these styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Navbar;