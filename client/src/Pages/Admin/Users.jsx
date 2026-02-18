import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsersThunk, clearAuthError } from "../../Redux/slice/authSlice";
import {
  Users,
  Search,
  Shield,
  User as UserIcon,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB");
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "U";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

async function copyToClipboard(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const { users, loading, error, userInfo } = useSelector((s) => s.auth);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | admin | customer
  const [pageSize, setPageSize] = useState(12);
  const [visibleCount, setVisibleCount] = useState(12);

  // "copied" feedback: { [key]: true }
  const [copied, setCopied] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(fetchAllUsersThunk());
  }, [dispatch]);

  const isAdmin = userInfo?.role === "admin";

  // reset pagination when query/filter/pagesize changes
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [q, filter, pageSize]);

  const counts = useMemo(() => {
    const all = users || [];
    const admins = all.filter((u) => u.role === "admin").length;
    const normal = all.filter((u) => u.role !== "admin").length;
    return { total: all.length, admins, normal };
  }, [users]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = users || [];

    // filter chip
    if (filter === "admin") list = list.filter((u) => u.role === "admin");
    if (filter === "customer") list = list.filter((u) => u.role !== "admin");

    // search
    if (!query) return list;
    return list.filter((u) => {
      const name = (u?.name || "").toLowerCase();
      const email = (u?.email || "").toLowerCase();
      const phone = (u?.phone || "").toLowerCase();
      const role = (u?.role || "").toLowerCase();
      const id = (u?._id || "").toLowerCase();
      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        role.includes(query) ||
        id.includes(query)
      );
    });
  }, [users, q, filter]);

  const visibleUsers = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const canLoadMore = visibleCount < filtered.length;

  const onCopy = async (key, text) => {
    const ok = await copyToClipboard(text);
    if (!ok) return;

    setCopied((prev) => ({ ...prev, [key]: true }));
    window.clearTimeout(onCopy._t);
    onCopy._t = window.setTimeout(() => {
      setCopied((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 900);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-2 py-2">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
              <Users className="h-4 w-4" />
              Admin · Users
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Users
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-600">
              Search, filter, and manage user accounts.
            </p>
          </div>

          <button
            onClick={() => dispatch(fetchAllUsersThunk())}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
            title="Refresh"
          >
            <RefreshCw className={classNames("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            title="Total users"
            value={counts.total}
            accent="from-emerald-600 to-emerald-700"
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Admins"
            value={counts.admins}
            accent="from-amber-500 to-amber-600"
            icon={<Shield className="h-5 w-5" />}
          />
          <StatCard
            title="Customers"
            value={counts.normal}
            accent="from-slate-700 to-slate-900"
            icon={<UserIcon className="h-5 w-5" />}
          />
        </div>

        {/* Main Card */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
          {/* Top controls */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, phone, role, id..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm font-semibold text-slate-900 outline-none ring-emerald-200 focus:bg-white focus:ring-2"
              />
            </div>

            {/* Filter chips + page size */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                  icon={<Users className="h-4 w-4" />}
                  label={`All (${counts.total})`}
                />
                <Chip
                  active={filter === "admin"}
                  onClick={() => setFilter("admin")}
                  icon={<Shield className="h-4 w-4" />}
                  label={`Admins (${counts.admins})`}
                />
                <Chip
                  active={filter === "customer"}
                  onClick={() => setFilter("customer")}
                  icon={<UserIcon className="h-4 w-4" />}
                  label={`Customers (${counts.normal})`}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs font-extrabold text-slate-600">Page size</div>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-2 pr-9 text-sm font-extrabold text-slate-800 outline-none ring-emerald-200 focus:ring-2"
                  >
                    {[6, 12, 24, 48].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Status line */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-slate-600">
              Showing{" "}
              <span className="font-black text-slate-900">{visibleUsers.length}</span>{" "}
              of{" "}
              <span className="font-black text-slate-900">{filtered.length}</span>{" "}
              result(s)
            </div>

            {canLoadMore && !loading && (
              <div className="text-xs font-semibold text-slate-500">
                Tip: Click <span className="font-black text-slate-700">Load more</span> to see more users.
              </div>
            )}
          </div>

          {/* Not admin / error */}
          {!isAdmin && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              Admin access required.
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: Math.min(pageSize, 12) }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white"
                />
              ))}
            </div>
          )}

          {/* Cards */}
          {!loading && !error && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleUsers.map((u) => {
                const emailKey = `${u._id}-email`;
                const idKey = `${u._id}-id`;
                return (
                  <div
                    key={u._id}
                    className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-600 text-sm font-black text-white shadow-sm">
                          {initials(u?.name)}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-slate-900">
                            {u?.name || "Unnamed"}
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate">{u?.email || "-"}</span>

                            {/* copy email */}
                            {u?.email && (
                              <CopyButton
                                copied={Boolean(copied[emailKey])}
                                onClick={() => onCopy(emailKey, u.email)}
                                label="Copy email"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <RolePill role={u?.role} />
                    </div>

                    <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-700">
                      <InfoRow
                        icon={<Phone className="h-4 w-4 text-slate-400" />}
                        label="Phone"
                        value={u?.phone || "—"}
                      />
                      <InfoRow
                        icon={<Calendar className="h-4 w-4 text-slate-400" />}
                        label="Joined"
                        value={formatDate(u?.createdAt)}
                      />

                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate-500">ID:</span>
                        <span className="truncate font-mono text-[11px] text-slate-700">
                          {u?._id}
                        </span>

                        {/* copy id */}
                        {u?._id && (
                          <CopyButton
                            copied={Boolean(copied[idKey])}
                            onClick={() => onCopy(idKey, u._id)}
                            label="Copy ID"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm">
                <Users className="h-5 w-5 text-slate-700" />
              </div>
              <div className="mt-3 text-sm font-black text-slate-900">
                No users found
              </div>
              <div className="mt-1 text-sm font-medium text-slate-600">
                Try a different search term or filter.
              </div>
            </div>
          )}

          {/* Pagination: Load more */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-center gap-3">
              {canLoadMore ? (
                <button
                  onClick={() => setVisibleCount((v) => Math.min(v + pageSize, filtered.length))}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.99]"
                >
                  Load more
                </button>
              ) : (
                <div className="text-xs font-semibold text-slate-500">
                  You’ve reached the end.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-extrabold transition active:scale-[0.99]",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function CopyButton({ copied, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="ml-1 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-black text-slate-700 hover:bg-slate-50"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {icon}
      <span className="text-slate-500">{label}:</span>
      <span className="truncate text-slate-800">{value}</span>
    </div>
  );
}

function RolePill({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black",
        isAdmin
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      )}
      title={role}
    >
      {isAdmin ? <Shield className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

function StatCard({ title, value, icon, accent }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold text-slate-600">{title}</div>
          <div className="mt-1 text-3xl font-black text-slate-900">{value}</div>
        </div>
        <div className={classNames("grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm", accent)}>
          {icon}
        </div>
      </div>
    </div>
  );
}