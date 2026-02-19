// src/Pages/AuthPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { loginUserThunk, registerUserThunk, clearAuthError } from "../Redux/slice/authSlice";
import {
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  LogIn,
  UserPlus,
  KeyRound,
  AtSign,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Info,
  PartyPopper,
} from "lucide-react";

/* ═══════════════════ Inline Notification Banner ═══════════════════ */

const NotificationBanner = ({ notification, onDismiss }) => {
  if (!notification) return null;

  const { type, title, message: msg } = notification;

  const config = {
    error: {
      bg: "bg-gradient-to-r from-rose-50 to-red-50",
      border: "border-rose-200",
      icon: XCircle,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-100",
      titleColor: "text-rose-800",
      msgColor: "text-rose-600",
      dismissHover: "hover:bg-rose-100",
      pulse: "animate-[shake_0.5s_ease-in-out]",
    },
    success: {
      bg: "bg-gradient-to-r from-emerald-50 to-teal-50",
      border: "border-emerald-200",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-100",
      titleColor: "text-emerald-800",
      msgColor: "text-emerald-600",
      dismissHover: "hover:bg-emerald-100",
      pulse: "",
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
      border: "border-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-100",
      titleColor: "text-amber-800",
      msgColor: "text-amber-600",
      dismissHover: "hover:bg-amber-100",
      pulse: "",
    },
    info: {
      bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
      border: "border-blue-200",
      icon: Info,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
      titleColor: "text-blue-800",
      msgColor: "text-blue-600",
      dismissHover: "hover:bg-blue-100",
      pulse: "",
    },
  };

  const c = config[type] || config.error;
  const IconComponent = c.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} ${c.pulse}`}
      role="alert"
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          type === "error"
            ? "bg-gradient-to-r from-rose-400 via-red-400 to-rose-400"
            : type === "success"
              ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"
              : type === "warning"
                ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400"
                : "bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400"
        }`}
      />

      <div className="flex items-start gap-3 p-3.5">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-xl ${c.iconBg} flex items-center 
            justify-center ${c.iconColor}`}
        >
          <IconComponent size={18} strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <p className={`text-sm font-bold ${c.titleColor} leading-tight`}>
              {title}
            </p>
          )}
          <p className={`text-[13px] ${c.msgColor} mt-0.5 leading-relaxed`}>
            {msg}
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center 
            ${c.iconColor} opacity-60 ${c.dismissHover} hover:opacity-100 transition-all`}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════ Success Toast Overlay ═══════════════════ */

const SuccessOverlay = ({ show, name }) => {
  if (!show) return null;

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center 
        bg-white/95 backdrop-blur-sm rounded-3xl animate-[fadeIn_0.3s_ease-out]"
    >
      <div className="relative mb-4">
        <div
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 
            flex items-center justify-center animate-[bounceIn_0.5s_ease-out]"
        >
          <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={2} />
        </div>
        <div className="absolute -top-1 -right-1">
          <PartyPopper size={20} className="text-amber-500 animate-bounce" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900">Welcome!</h3>
      {name && (
        <p className="text-sm text-gray-500 mt-1">
          Great to see you, <span className="font-semibold text-emerald-600">{name}</span>
        </p>
      )}
      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
        <Sparkles size={12} className="text-emerald-400" />
        Redirecting you now...
      </p>
    </div>
  );
};

/* ═══════════════════ Floating Label Input ═══════════════════ */

const FloatingInput = ({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  error,
  name,
  autoComplete,
  required = false,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value && value.length > 0;
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative group">
      <div
        className={`relative flex items-center rounded-2xl border-2 transition-all duration-300
          bg-white overflow-hidden
          ${error
            ? "border-rose-300 shadow-[0_0_0_3px_rgba(244,63,94,0.1)]"
            : focused
              ? "border-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
              : "border-gray-200 hover:border-gray-300"
          }`}
      >
        <div
          className={`flex items-center justify-center w-12 h-full transition-colors duration-300
            ${focused ? "text-emerald-500" : error ? "text-rose-400" : "text-gray-400"}`}
        >
          <Icon size={18} strokeWidth={2} />
        </div>

        <div className="relative flex-1 py-3 pr-3">
          <label
            className={`absolute left-0 transition-all duration-300 pointer-events-none
              ${hasValue || focused
                ? "text-[10px] font-semibold uppercase tracking-wider -top-0.5"
                : "text-sm top-1/2 -translate-y-1/2"
              }
              ${focused
                ? "text-emerald-600"
                : error
                  ? "text-rose-400"
                  : "text-gray-400"
              }`}
          >
            {label}
            {required && <span className="text-rose-400 ml-0.5">*</span>}
          </label>
          <input
            type={inputType}
            name={name}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete={autoComplete}
            className={`w-full bg-transparent outline-none text-gray-900 text-sm font-medium
              placeholder-transparent
              ${hasValue || focused ? "pt-3" : "pt-0"}`}
          />
        </div>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="flex items-center justify-center w-11 h-full text-gray-400
              hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 ml-1 text-xs font-medium text-rose-500 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
    </div>
  );
};

/* ═══════════════════ Password Strength Indicator ═══════════════════ */

const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const checks = [
    { label: "6+ characters", pass: password.length >= 6 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special char", pass: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const strength = checks.filter((c) => c.pass).length;
  const strengthColors = [
    "bg-rose-400",
    "bg-orange-400",
    "bg-amber-400",
    "bg-emerald-400",
  ];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i < strength ? strengthColors[strength - 1] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            strength <= 1
              ? "text-rose-500"
              : strength === 2
                ? "text-amber-500"
                : "text-emerald-500"
          }`}
        >
          {strength > 0 ? strengthLabels[strength - 1] : ""}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(({ label, pass }) => (
          <span
            key={label}
            className={`text-[10px] flex items-center gap-1 transition-colors ${
              pass ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {pass ? (
              <CheckCircle2 size={10} className="flex-shrink-0" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0" />
            )}
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════ Error Message Parser ═══════════════════ */

const parseAuthError = (error, isLogin) => {
  if (!error) return null;

  const errMsg =
    typeof error === "string"
      ? error.toLowerCase()
      : typeof error === "object" && error.message
        ? error.message.toLowerCase()
        : typeof error === "object" && error.error
          ? error.error.toLowerCase()
          : "something went wrong";

  const originalMsg =
    typeof error === "string"
      ? error
      : error?.message || error?.error || "Something went wrong";

  // ─── Login errors ───
  if (isLogin) {
    if (
      errMsg.includes("invalid") ||
      errMsg.includes("incorrect") ||
      errMsg.includes("wrong") ||
      errMsg.includes("password") ||
      errMsg.includes("credentials")
    ) {
      return {
        type: "error",
        title: "Invalid Credentials",
        message:
          "The email or password you entered is incorrect. Please check and try again.",
      };
    }

    if (
      errMsg.includes("not found") ||
      errMsg.includes("no user") ||
      errMsg.includes("does not exist") ||
      errMsg.includes("no account")
    ) {
      return {
        type: "error",
        title: "Account Not Found",
        message:
          "No account found with this email. Would you like to create one?",
      };
    }

    if (
      errMsg.includes("locked") ||
      errMsg.includes("blocked") ||
      errMsg.includes("suspended") ||
      errMsg.includes("disabled")
    ) {
      return {
        type: "warning",
        title: "Account Locked",
        message:
          "Your account has been temporarily locked. Please try again later or contact support.",
      };
    }

    if (
      errMsg.includes("too many") ||
      errMsg.includes("rate limit") ||
      errMsg.includes("attempts")
    ) {
      return {
        type: "warning",
        title: "Too Many Attempts",
        message:
          "You've made too many login attempts. Please wait a few minutes before trying again.",
      };
    }
  }

  // ─── Register errors ───
  if (!isLogin) {
    if (
      errMsg.includes("already exist") ||
      errMsg.includes("already registered") ||
      errMsg.includes("duplicate") ||
      errMsg.includes("already in use") ||
      errMsg.includes("email is already") ||
      errMsg.includes("e11000") ||
      errMsg.includes("unique")
    ) {
      return {
        type: "error",
        title: "Email Already Registered",
        message:
          "An account with this email already exists. Please sign in or use a different email.",
      };
    }

    if (
      errMsg.includes("phone") &&
      (errMsg.includes("exist") ||
        errMsg.includes("duplicate") ||
        errMsg.includes("already"))
    ) {
      return {
        type: "error",
        title: "Phone Already Registered",
        message:
          "This phone number is already associated with an account. Please use a different number.",
      };
    }

    if (
      errMsg.includes("weak password") ||
      errMsg.includes("password strength")
    ) {
      return {
        type: "warning",
        title: "Weak Password",
        message:
          "Please choose a stronger password with a mix of letters, numbers, and special characters.",
      };
    }
  }

  // ─── Generic errors ───
  if (
    errMsg.includes("network") ||
    errMsg.includes("fetch") ||
    errMsg.includes("connect") ||
    errMsg.includes("timeout")
  ) {
    return {
      type: "error",
      title: "Connection Error",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }

  if (errMsg.includes("server") || errMsg.includes("500")) {
    return {
      type: "error",
      title: "Server Error",
      message:
        "Something went wrong on our end. Please try again in a few moments.",
    };
  }

  // Fallback
  return {
    type: "error",
    title: isLogin ? "Login Failed" : "Registration Failed",
    message: originalMsg,
  };
};

/* ═══════════════════ Main Auth Modal ═══════════════════ */

const AuthModal = ({ open, onClose, defaultTab = "register" }) => {
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [notification, setNotification] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Track error changes to handle duplicate errors
  const prevErrorRef = useRef(null);
  const errorCountRef = useRef(0);

  // Sync default tab
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Reset form on tab switch
  useEffect(() => {
    setFormData({ name: "", email: "", phone: "", password: "" });
    setFieldErrors({});
    setTouched({});
    setNotification(null);

    // Clear Redux error when switching tabs
    if (dispatch && clearAuthError) {
      try {
        dispatch(clearAuthError());
      } catch {}
    }
  }, [activeTab, dispatch]);

  // Reset on modal open/close
  useEffect(() => {
    if (!open) {
      setNotification(null);
      setShowSuccess(false);
      prevErrorRef.current = null;
      errorCountRef.current = 0;
    }
  }, [open]);

  // Handle successful auth
  useEffect(() => {
    if (userInfo && open) {
      setNotification(null);
      setShowSuccess(true);

      const timer = setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [userInfo, onClose, open]);

  // Handle Redux errors → show inline notification
  useEffect(() => {
    if (error && open) {
      // Track if same error repeats
      const errorStr = JSON.stringify(error);
      if (errorStr === prevErrorRef.current) {
        errorCountRef.current += 1;
      } else {
        errorCountRef.current = 1;
        prevErrorRef.current = errorStr;
      }

      const isLogin = activeTab === "login";
      const parsed = parseAuthError(error, isLogin);

      if (parsed) {
        // Append attempt count for repeated errors
        const displayMsg =
          errorCountRef.current > 1
            ? `${parsed.message} (attempt ${errorCountRef.current})`
            : parsed.message;

        setNotification({
          type: parsed.type,
          title: parsed.title,
          message: displayMsg,
        });
      }

      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setNotification(null);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, open, activeTab]);

  const updateField = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));

      // Dismiss notification when user starts fixing their input
      if (notification) {
        setNotification(null);
      }
    },
    [notification]
  );

  const validate = useCallback(() => {
    const e = {};
    const { name, email, phone, password } = formData;

    if (activeTab === "register") {
      if (!name.trim()) e.name = "Name is required";
      if (!phone.trim()) {
        e.phone = "Phone number is required";
      } else if (!/^[\d+\-() ]{7,20}$/.test(phone.trim())) {
        e.phone = "Enter a valid phone number";
      }
    }

    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Enter a valid email address";
    }

    if (!password) {
      e.password = "Password is required";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    setFieldErrors(e);

    // Show validation notification if multiple errors
    if (Object.keys(e).length > 1) {
      setNotification({
        type: "warning",
        title: "Missing Information",
        message: "Please fill in all required fields to continue.",
      });
    }

    return Object.keys(e).length === 0;
  }, [formData, activeTab]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setNotification(null);

      if (!validate()) return;

      if (activeTab === "login") {
        dispatch(
          loginUserThunk({
            email: formData.email.trim(),
            password: formData.password,
          })
        );
      } else {
        dispatch(
          registerUserThunk({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
          })
        );
      }
    },
    [activeTab, formData, validate, dispatch]
  );

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const switchToLogin = useCallback(() => {
    setActiveTab("login");
    setNotification(null);
  }, []);

  const switchToRegister = useCallback(() => {
    setActiveTab("register");
    setNotification(null);
  }, []);

  const isLogin = activeTab === "login";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={460}
      destroyOnClose
      closable={false}
      className="auth-modal-wrapper"
      styles={{
        content: { padding: 0, borderRadius: 24, overflow: "hidden" },
        mask: {
          backdropFilter: "blur(8px)",
          background: "rgba(0,0,0,0.45)",
        },
      }}
    >
      <div className="relative">
        {/* Shake animation */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.1); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Success Overlay */}
        <SuccessOverlay show={showSuccess} name={userInfo?.name} />

        {/* ─── Header ─── */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-60" />

          <div className="relative px-6 pt-6 pb-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/20 
                backdrop-blur-sm flex items-center justify-center text-white/80 
                hover:bg-white/30 hover:text-white transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                {isLogin ? (
                  <LogIn size={22} className="text-white" />
                ) : (
                  <UserPlus size={22} className="text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-sm text-white/70 mt-0.5">
                  {isLogin
                    ? "Sign in to continue shopping"
                    : "Join us for the best deals"}
                </p>
              </div>
            </div>

            <div className="flex bg-white/15 backdrop-blur-sm rounded-2xl p-1 gap-1">
              {[
                { key: "login", label: "Sign In", icon: LogIn },
                { key: "register", label: "Sign Up", icon: UserPlus },
              ].map(({ key, label, icon: TabIcon }) => (
                <button
                  key={key}
                  onClick={() =>
                    key === "login" ? switchToLogin() : switchToRegister()
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 
                    rounded-xl text-sm font-semibold transition-all duration-300
                    ${activeTab === key
                      ? "bg-white text-emerald-700 shadow-lg"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <TabIcon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Form Body ─── */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* ══════ INLINE NOTIFICATION ══════ */}
          {notification && (
            <div className="animate-[slideDown_0.3s_ease-out]">
              <NotificationBanner
                notification={notification}
                onDismiss={dismissNotification}
              />

              {/* Quick action buttons based on error type */}
              {notification.title === "Account Not Found" && (
                <button
                  type="button"
                  onClick={switchToRegister}
                  className="mt-2 w-full py-2 rounded-xl bg-emerald-50 border border-emerald-200 
                    text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all
                    flex items-center justify-center gap-1.5"
                >
                  <UserPlus size={13} />
                  Create a new account instead
                </button>
              )}
              {notification.title === "Email Already Registered" && (
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="mt-2 w-full py-2 rounded-xl bg-emerald-50 border border-emerald-200 
                    text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all
                    flex items-center justify-center gap-1.5"
                >
                  <LogIn size={13} />
                  Sign in to your account instead
                </button>
              )}
            </div>
          )}

          {/* Name (register only) */}
          {!isLogin && (
            <FloatingInput
              icon={User}
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={(v) => updateField("name", v)}
              error={touched.name ? fieldErrors.name : ""}
              autoComplete="name"
              required
            />
          )}

          {/* Email */}
          <FloatingInput
            icon={AtSign}
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={(v) => updateField("email", v)}
            error={touched.email ? fieldErrors.email : ""}
            autoComplete="email"
            required
          />

          {/* Phone (register only) */}
          {!isLogin && (
            <FloatingInput
              icon={Phone}
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(v) => updateField("phone", v)}
              error={touched.phone ? fieldErrors.phone : ""}
              autoComplete="tel"
              required
            />
          )}

          {/* Password */}
          <div>
            <FloatingInput
              icon={KeyRound}
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={(v) => updateField("password", v)}
              error={touched.password ? fieldErrors.password : ""}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
            {!isLogin && formData.password && (
              <PasswordStrength password={formData.password} />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`group w-full relative overflow-hidden py-4 rounded-2xl 
              text-white font-bold text-[15px] shadow-lg 
              disabled:opacity-60 disabled:cursor-not-allowed 
              transition-all duration-300 active:scale-[0.98]
              ${notification?.type === "error"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
              }`}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 
                to-transparent -translate-x-full group-hover:translate-x-full 
                transition-transform duration-700"
            />
            <span className="relative flex items-center justify-center gap-2.5">
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>
                    {isLogin ? "Signing in…" : "Creating account…"}
                  </span>
                </>
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  <span>
                    {isLogin ? "Sign In" : "Create Account"}
                  </span>
                  <ArrowRight
                    size={16}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 
                      group-hover:translate-x-0 transition-all duration-300"
                  />
                </>
              )}
            </span>
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                {isLogin ? "New here?" : "Already have an account?"}
              </span>
            </div>
          </div>

          {/* Switch tab */}
          <button
            type="button"
            onClick={isLogin ? switchToRegister : switchToLogin}
            className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-700 
              font-semibold text-sm hover:border-emerald-200 hover:bg-emerald-50/50 
              hover:text-emerald-700 transition-all duration-300 active:scale-[0.98]
              flex items-center justify-center gap-2"
          >
            {isLogin ? (
              <>
                <UserPlus size={16} />
                Create a new account
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign in to existing account
              </>
            )}
          </button>

        </form>
      </div>
    </Modal>
  );
};

export default AuthModal;