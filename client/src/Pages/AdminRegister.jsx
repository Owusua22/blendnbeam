import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { registerAdminThunk, clearAuthError } from "../Redux/slice/authSlice";

export default function AdminRegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, loading, error } = useSelector((s) => s.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [localError, setLocalError] = useState(null);

  const redirectTo = useMemo(() => {
    return new URLSearchParams(location.search).get("redirect") || "/admin/products";
  }, [location.search]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    const isAdmin = userInfo?.role === "admin";
    if (userInfo?.token && isAdmin) navigate(redirectTo, { replace: true });
  }, [userInfo?.token, userInfo?.role, navigate, redirectTo]);

  const validate = () => {
    if (!name.trim()) return "Name is required.";
    if (!email.trim()) return "Email is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    const msg = validate();
    if (msg) return setLocalError(msg);

    // ✅ add role: admin to payload (even though backend forces it too)
    dispatch(registerAdminThunk({ name, email, password, role: "admin" }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-amber-50">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 lg:grid-cols-2">
        {/* Left: Branding / Info */}
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
            <ShieldCheck className="h-4 w-4" />
            Blend & Beam Admin
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
            Create an admin account
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            Access products, orders, shipping zones and more. Use a secure password and keep
            admin credentials private.
          </p>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-green-600 p-3 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900">Gold + Green palette</div>
                <div className="mt-1 text-sm text-slate-600">
                  Styled to match your navbar theme.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-green-600 text-white shadow">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-black text-slate-900">Admin Register</div>
                <div className="text-xs font-semibold text-green-700">
                  Blend & Beam · Admin Portal
                </div>
              </div>
            </div>

            {/* Errors */}
            {(localError || error) && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {localError || error}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-extrabold text-slate-800">
                  Full name
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-green-200">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Nkansah"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-extrabold text-slate-800">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-green-200">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@email.com"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-sm font-extrabold text-slate-800">
                  Password
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-amber-200">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-extrabold text-slate-700 hover:bg-slate-100"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1 block text-sm font-extrabold text-slate-800">
                  Confirm password
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-amber-200">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    type={showConfirmPw ? "text" : "password"}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-extrabold text-slate-700 hover:bg-slate-100"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                disabled={loading}
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-green-600/20 transition hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating..." : "Create admin"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>

              <div className="text-center text-sm">
                <span className="font-semibold text-slate-600">Already have an account?</span>{" "}
                <Link
                  to="/admin/login"
                  className="font-extrabold text-amber-700 hover:text-amber-800"
                >
                  Sign in
                </Link>
              </div>

            </form>
          </div>

          {/* mobile-only brand */}
          <div className="mx-auto mt-6 max-w-md text-center text-xs font-semibold text-slate-500 lg:hidden">
            Blend & Beam · Admin Portal
          </div>
        </div>
      </div>
    </div>
  );
}