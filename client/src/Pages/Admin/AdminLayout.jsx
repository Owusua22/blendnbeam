import React, { useState, useEffect } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  List,
  Building2,
  LogOut,
  Home,
  User,
  Menu,
  X,
  ChevronLeft,
  ShoppingCart,
  Truck,
  Image,
  Package,
  LayoutDashboard,
  Bell,
  Search,
  Settings,
  ChevronDown,
} from "lucide-react";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect mobile
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { key: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", to: "/admin/dashboard" },
    { key: "/admin/categories", icon: List, label: "Categories", to: "/admin/categories" },
    { key: "/admin/showrooms", icon: Building2, label: "Showrooms", to: "/admin/showrooms" },
    { key: "/admin/products", icon: Package, label: "Products", to: "/admin/products" },
    { key: "/admin/customers", icon: User, label: "Customers", to: "/admin/users" },
    { key: "/admin/orders", icon: ShoppingCart, label: "Orders", to: "/admin/orders" },
    { key: "/admin/shipping", icon: Truck, label: "Shipping", to: "/admin/shipping" },
    { key: "/admin/banners", icon: Image, label: "Banners", to: "/admin/banners" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (key) => location.pathname.startsWith(key);

  // Get current page title
  const currentPage = menuItems.find((item) => isActive(item.key));
  const pageTitle = currentPage?.label || "Dashboard";

  /* ─── Sidebar Content (shared between desktop & mobile) ─── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800/50">
        <Link to="/admin/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base truncate">Admin</h1>
              <p className="text-gray-400 text-[10px] uppercase tracking-wider">Panel</p>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        )}

        {/* Desktop collapse button */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors hidden lg:flex"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {(!collapsed || isMobile) && (
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Navigation
          </p>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.key);
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                active
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/40"
              }`}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-emerald-400" />
              )}

              <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  active
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-gray-400 group-hover:bg-gray-700/60 group-hover:text-white"
                }`}
              >
                <Icon size={18} />
              </div>

              {(!collapsed || isMobile) && (
                <span className="truncate">{item.label}</span>
              )}

              {active && (!collapsed || isMobile) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-800/50 p-3 space-y-2">
        <Link
          to="/admin/settings"
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/40 transition-all ${
            collapsed && !isMobile ? "justify-center" : ""
          }`}
          title={collapsed && !isMobile ? "Settings" : undefined}
        >
          <Settings size={18} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Settings</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all ${
            collapsed && !isMobile ? "justify-center" : ""
          }`}
          title={collapsed && !isMobile ? "Logout" : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-800/50 z-30 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ─── Mobile Sidebar Overlay ─── */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ─── Mobile Sidebar Drawer ─── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 z-50 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ─── Main Content Area ─── */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          !isMobile ? (collapsed ? "ml-[72px]" : "ml-64") : "ml-0"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 lg:hidden transition-colors"
              >
                <Menu size={22} />
              </button>

              {/* Breadcrumb / Page title */}
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Home size={12} />
                  <span>/</span>
                  <span className="text-gray-600 font-medium">{pageTitle}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 -mt-0.5 hidden sm:block">
                  {pageTitle}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search (desktop) */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-2 w-56 lg:w-64 border border-transparent focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Search icon (mobile) */}
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 md:hidden transition-colors">
                <Search size={20} />
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    A
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">Admin</p>
                    <p className="text-[10px] text-gray-500">Super Admin</p>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 hidden sm:block transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <p className="font-semibold text-sm text-gray-900">Admin User</p>
                        <p className="text-xs text-gray-500">admin@blendandbeam.com</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/admin/settings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings size={16} className="text-gray-400" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 w-full transition-colors"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[calc(100vh-8rem)] p-4 sm:p-6">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-6 py-3 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <p>© 2024 Blend & Beam. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <span className="text-rose-400">♥</span> by Blend & Beam
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;