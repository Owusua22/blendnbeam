import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginAdminThunk, clearAuthError } from "../Redux/slice/authSlice";

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, loading, error } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const redirectTo =
    new URLSearchParams(location.search).get("redirect") || "/admin/products";

  useEffect(() => {
    const isAdmin = userInfo?.role === "admin";
    if (userInfo?.token && isAdmin) {
      navigate(redirectTo, { replace: true });
    }
  }, [userInfo?.token, userInfo?.role, navigate, redirectTo]);

  useEffect(() => {
    // clear stale errors when entering page
    dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginAdminThunk({ email, password }));
  };

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.title}>Admin Sign in</div>
        <div style={styles.subTitle}>Use your admin credentials.</div>

        {error && <div style={styles.alert}>{error}</div>}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={styles.label}>Password</label>
            <div style={styles.pwWrap}>
              <input
                style={styles.pwInput}
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} style={styles.pwBtn}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button disabled={loading} style={styles.primaryBtn} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div style={{ fontSize: 13 }}>
            <span style={{ color: "#64748b" }}>No admin account?</span>{" "}
            <Link to="/admin/signup" style={styles.link}>Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, rgba(21,128,61,0.10) 0%, rgba(245,158,11,0.10) 100%)",
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  card: {
    width: "min(460px, 100%)",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 24px 70px rgba(2,6,23,0.18)",
  },
  title: { fontSize: 18, fontWeight: 950, color: "#0f172a" },
  subTitle: { marginTop: 6, color: "#64748b", fontSize: 13 },
  alert: {
    marginTop: 12,
    background: "rgba(220,38,38,0.10)",
    border: "1px solid rgba(220,38,38,0.25)",
    color: "#991b1b",
    padding: 12,
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 13,
  },
  label: { fontSize: 13, color: "#334155", fontWeight: 900 },
  input: {
    height: 46,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    padding: "0 12px",
    fontWeight: 700,
    outline: "none",
  },
  pwWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    padding: "0 8px",
    height: 46,
  },
  pwInput: { border: "none", outline: "none", flex: 1, height: 44, fontWeight: 700 },
  pwBtn: {
    border: "1px solid rgba(21,128,61,0.20)",
    background: "rgba(21,128,61,0.08)",
    height: 32,
    padding: "0 10px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 950,
    color: "#15803d",
    fontSize: 12,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 14,
    border: "1px solid #16a34a",
    background: "linear-gradient(90deg, #16a34a 0%, #15803d 100%)",
    color: "#fff",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(21,128,61,0.18)",
  },
  link: { color: "#d97706", fontWeight: 950, textDecoration: "none" },
};