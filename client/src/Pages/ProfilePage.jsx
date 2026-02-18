// src/Pages/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  clearAuthError,
  fetchProfileThunk,
  updateProfileThunk,
  logout,
} from "../Redux/slice/authSlice"; // adjust path if needed
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  LogOut,
  Loader2,
  AlertTriangle,
  Package,
} from "lucide-react";

const Spinner = ({ size = 18 }) => (
  <Loader2 size={size} className="animate-spin text-emerald-600" />
);

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, loading, error } = useSelector((s) => s.auth);

  const isLoggedIn = Boolean(userInfo?.token);
  const isAdmin = userInfo?.role === "admin";

  const [name, setName] = useState(userInfo?.name || "");
  const [email, setEmail] = useState(userInfo?.email || "");
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [localMsg, setLocalMsg] = useState(null); // { type, text }

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    // load freshest profile (if your backend returns more fields)
    dispatch(fetchProfileThunk());
  }, [dispatch, isLoggedIn, navigate]);

  // When userInfo updates (from fetchProfile/updateProfile), sync form fields
  useEffect(() => {
    setName(userInfo?.name || "");
    setEmail(userInfo?.email || "");
    setPhone(userInfo?.phone || "");
  }, [userInfo?.name, userInfo?.email, userInfo?.phone]);

  const initials = useMemo(() => {
    const n = (userInfo?.name || "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("");
  }, [userInfo?.name]);

  const showLocal = (type, text) => {
    setLocalMsg({ type, text });
    setTimeout(() => setLocalMsg(null), 2500);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    if (password && password.length < 6) {
      showLocal("error", "Password must be at least 6 characters.");
      return;
    }
    if (password && password !== confirmPassword) {
      showLocal("error", "Passwords do not match.");
      return;
    }

    const payload = {
      name,
      email,
      phone,
      ...(password ? { password } : {}),
    };

    try {
      await dispatch(updateProfileThunk(payload)).unwrap();
      setPassword("");
      setConfirmPassword("");
      showLocal("success", "Profile updated successfully.");
    } catch (err) {
      // error already in redux too
      showLocal("error", typeof err === "string" ? err : "Update failed");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50 font-sans">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
              <User className="h-4 w-4" />
              My Profile
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Account Settings
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Update your personal information and password.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/customer-orders"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
            >
              <Package className="h-4 w-4" />
              My Orders
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-extrabold text-rose-700 hover:bg-rose-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Messages */}
        {(localMsg || error) && (
          <div
            className={[
              "mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold",
              (localMsg?.type === "success")
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-800",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>
                {localMsg?.text ||
                  (typeof error === "string" ? error : error?.message) ||
                  "Something went wrong"}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Profile card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-600 text-lg font-black text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-black text-slate-900">
                  {userInfo?.name || "User"}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{userInfo?.email || "—"}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Role</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-extrabold text-slate-800">
                  {isAdmin ? (
                    <>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Admin
                    </>
                  ) : (
                    "User"
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Phone</span>
                <span className="text-slate-900 font-black">
                  {userInfo?.phone || "—"}
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs font-semibold text-slate-600">
              Tip: Leave password fields empty if you don’t want to change your
              password.
            </div>
          </div>

          {/* Edit form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="text-sm font-black text-slate-900">
              Edit Profile
            </div>
            <div className="mt-1 text-sm font-medium text-slate-600">
              Keep your details up to date.
            </div>

            <form onSubmit={onSubmit} className="mt-5 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-extrabold text-slate-600">
                    Full name
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-200">
                    <User className="h-4 w-4 text-slate-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-600">
                    Email
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-200">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                      placeholder="you@email.com"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-600">
                    Phone
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-200">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                      placeholder="+233..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-extrabold text-slate-600">
                    New password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-200"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-600">
                    Confirm password
                  </label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-200"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => dispatch(fetchProfileThunk())}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
                  disabled={loading}
                >
                  Refresh
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : <Save className="h-4 w-4" />}
                  {loading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}