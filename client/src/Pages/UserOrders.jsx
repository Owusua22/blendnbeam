// src/pages/UserOrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchUserOrdersThunk,
  fetchOrderByIdThunk,
  resetOrderState,
} from "../Redux/slice/orderSlice"; // adjust path

const formatGHS = (value) => {
  const n = Number(value || 0);
  return n.toLocaleString("en-GH", { style: "currency", currency: "GHS" });
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("en-GB");
};

const statusMeta = (status = "pending") => {
  const s = status.toLowerCase();
  if (s === "delivered") return { label: "Delivered", color: "#16a34a", bg: "#dcfce7" };
  if (s === "shipped") return { label: "Shipped", color: "#2563eb", bg: "#dbeafe" };
  if (s === "processing") return { label: "Processing", color: "#ea580c", bg: "#ffedd5" };
  if (s === "cancelled") return { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" };
  return { label: "Pending", color: "#64748b", bg: "#f1f5f9" };
};

const sumQty = (items = []) => items.reduce((acc, it) => acc + Number(it.quantity || 0), 0);

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
      <div style={{ color: "#64748b", fontSize: 13 }}>{label}</div>
      <div style={{ color: "#0f172a", fontWeight: 600, textAlign: "right" }}>{value}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#e2e8f0", margin: "12px 0" }} />;
}

function OrderDetailsModal({ open, onClose, order, loading, error }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,6,23,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(920px, 100%)",
          maxHeight: "85vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(2,6,23,0.25)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            borderBottom: "1px solid #e2e8f0",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 2,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 16 }}>
              Order Details
            </div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              {order?._id ? `#${order._id}` : "—"}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "1px solid #e2e8f0",
              background: "#fff",
              padding: "10px 12px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Close
          </button>
        </div>

        <div style={{ padding: 16 }}>
          {loading && (
            <div style={{ padding: 12, borderRadius: 12, background: "#f8fafc", color: "#0f172a" }}>
              Loading order...
            </div>
          )}

          {error && (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#7f1d1d",
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          {!loading && order && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
              {/* Summary cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div style={cardStyle}>
                  <div style={cardTitle}>Status</div>
                  <StatusPill status={order.status} />
                </div>
                <div style={cardStyle}>
                  <div style={cardTitle}>Placed</div>
                  <div style={cardValue}>{formatDate(order.createdAt)}</div>
                </div>
                <div style={cardStyle}>
                  <div style={cardTitle}>Total</div>
                  <div style={cardValue}>{formatGHS(order.totalPrice)}</div>
                </div>
              </div>

              <div style={panelStyle}>
                <div style={panelHeader}>Payment & Delivery</div>
                <Divider />
                <InfoRow label="Payment method" value={order.paymentMethod || "—"} />
                <Divider />
                <InfoRow label="Paid" value={order.isPaid ? `Yes • ${formatDate(order.paidAt)}` : "No"} />
                <Divider />
                <InfoRow
                  label="Delivered"
                  value={order.isDelivered ? `Yes • ${formatDate(order.deliveredAt)}` : "No"}
                />
              </div>

              <div style={panelStyle}>
                <div style={panelHeader}>Shipping</div>
                <Divider />
                <InfoRow label="Zone" value={order?.shippingLocation?.name || "—"} />
                <Divider />
                <InfoRow
                  label="Delivery fee"
                  value={formatGHS(order.shippingPrice)}
                />
                <Divider />
                <InfoRow
                  label="Estimate"
                  value={order?.shippingLocation?.estimate || "—"}
                />
                <Divider />
                <InfoRow
                  label="Address"
                  value={
                    order?.shippingAddress
                      ? [
                          order.shippingAddress.address,
                          order.shippingAddress.city,
                          order.shippingAddress.region,
                          order.shippingAddress.country,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "—"
                  }
                />
              </div>

              {order.note ? (
                <div style={panelStyle}>
                  <div style={panelHeader}>Note</div>
                  <Divider />
                  <div style={{ color: "#0f172a" }}>{order.note}</div>
                </div>
              ) : null}

              <div style={panelStyle}>
                <div style={panelHeader}>Items</div>
                <Divider />
                <div style={{ display: "grid", gap: 10 }}>
                  {order.orderItems?.map((it, idx) => (
                    <div
                      key={`${it.productId || idx}`}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          flex: "0 0 auto",
                        }}
                      >
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : null}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {it.name}
                        </div>
                        <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
                          Qty: {it.quantity}
                          {it.size ? ` • Size: ${it.size}` : ""}
                          {it.color ? ` • Color: ${it.color}` : ""}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#0f172a", fontWeight: 800 }}>
                          {formatGHS(it.price)}
                        </div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>
                          Subtotal: {formatGHS(Number(it.price || 0) * Number(it.quantity || 0))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Divider />

                <div style={{ display: "grid", gap: 10 }}>
                  <InfoRow label="Items" value={formatGHS(order.itemsPrice)} />
                  <InfoRow label="Tax" value={formatGHS(order.taxPrice)} />
                  <InfoRow label="Shipping" value={formatGHS(order.shippingPrice)} />
                  <div style={{ height: 1, background: "#e2e8f0" }} />
                  <InfoRow label="Total" value={formatGHS(order.totalPrice)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const meta = statusMeta(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        background: meta.bg,
        color: meta.color,
        fontWeight: 800,
        fontSize: 13,
        width: "fit-content",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: meta.color,
          display: "inline-block",
        }}
      />
      {meta.label}
    </span>
  );
}

const cardStyle = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 16,
  padding: 14,
};

const cardTitle = { color: "#64748b", fontSize: 13, fontWeight: 700 };
const cardValue = { color: "#0f172a", fontSize: 14, fontWeight: 900, marginTop: 6 };

const panelStyle = {
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 16,
  padding: 14,
};

const panelHeader = { fontWeight: 900, color: "#0f172a" };

export default function UserOrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { userOrders, currentOrder, loading, error } = useSelector((state) => state.orders);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const modalLoading = useMemo(() => {
    // When modal is open, we consider "loading" as details-loading, but slice has one loading flag.
    return detailsOpen && loading && selectedId;
  }, [detailsOpen, loading, selectedId]);

  useEffect(() => {
    if (!userInfo?.token) {
      navigate("/login");
      return;
    }
    dispatch(fetchUserOrdersThunk(userInfo.token));
  }, [dispatch, userInfo?.token, navigate]);

  const onView = async (orderId) => {
    if (!userInfo?.token) return;

    setSelectedId(orderId);
    setDetailsOpen(true);
    dispatch(resetOrderState()); // clears previous currentOrder/error/success
    dispatch(fetchOrderByIdThunk({ id: orderId, token: userInfo.token }));
  };

  const closeModal = () => {
    setDetailsOpen(false);
    setSelectedId(null);
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ padding: "26px 16px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>My Orders</h1>
            <div style={{ marginTop: 6, color: "#64748b" }}>
              Track your purchases and view order details.
            </div>
          </div>

          <div
            style={{
              padding: "10px 12px",
              borderRadius: 999,
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#0f172a",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {userOrders?.length || 0} order(s)
          </div>
        </div>

        {loading && (!detailsOpen || !selectedId) && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: "#fff", border: "1px solid #e2e8f0" }}>
            Loading orders...
          </div>
        )}

        {error && !detailsOpen && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 14,
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#7f1d1d",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (!userOrders || userOrders.length === 0) && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "#fff", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 900, color: "#0f172a" }}>No orders yet</div>
            <div style={{ marginTop: 6, color: "#64748b" }}>
              When you place an order, it will appear here.
            </div>
            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: 12,
                border: "1px solid #e2e8f0",
                background: "#0f172a",
                color: "#fff",
                padding: "10px 12px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Continue shopping
            </button>
          </div>
        )}

        {!loading && !error && userOrders?.length > 0 && (
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
            {userOrders.map((order) => {
              const meta = statusMeta(order.status);
              const itemsCount = sumQty(order.orderItems);
              return (
                <div
                  key={order._id}
                  style={{
                    gridColumn: "span 12",
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    borderRadius: 18,
                    padding: 14,
                    boxShadow: "0 8px 20px rgba(2,6,23,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 950, color: "#0f172a" }}>
                          Order #{order._id?.slice(-8)}
                        </div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: meta.bg,
                            color: meta.color,
                            fontWeight: 900,
                            fontSize: 13,
                          }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: 999, background: meta.color }} />
                          {meta.label}
                        </span>

                        {order.isPaid ? (
                          <span
                            style={{
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: "#dcfce7",
                              color: "#166534",
                              fontWeight: 900,
                              fontSize: 13,
                            }}
                          >
                            Paid
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: "#f1f5f9",
                              color: "#475569",
                              fontWeight: 900,
                              fontSize: 13,
                            }}
                          >
                            Unpaid
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: 8, color: "#64748b", fontSize: 13 }}>
                        Placed: <span style={{ color: "#0f172a", fontWeight: 800 }}>{formatDate(order.createdAt)}</span>
                        {"  "}•{"  "}
                        Items: <span style={{ color: "#0f172a", fontWeight: 800 }}>{itemsCount}</span>
                        {"  "}•{"  "}
                        Shipping:{" "}
                        <span style={{ color: "#0f172a", fontWeight: 800 }}>
                          {order?.shippingLocation?.name || "—"}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#64748b", fontSize: 13, fontWeight: 800 }}>Total</div>
                      <div style={{ color: "#0f172a", fontSize: 18, fontWeight: 950 }}>
                        {formatGHS(order.totalPrice)}
                      </div>

                      <button
                        onClick={() => onView(order._id)}
                        style={{
                          marginTop: 10,
                          width: "100%",
                          border: "1px solid #e2e8f0",
                          background: "#0f172a",
                          color: "#fff",
                          padding: "10px 12px",
                          borderRadius: 12,
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                      >
                        View details
                      </button>
                    </div>
                  </div>

                  {/* small preview of first items */}
                  {order.orderItems?.length ? (
                    <div style={{ marginTop: 12, display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
                      {order.orderItems.slice(0, 4).map((it, idx) => (
                        <div
                          key={`${it.productId || idx}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: 10,
                            borderRadius: 14,
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            minWidth: 240,
                            flex: "0 0 auto",
                          }}
                        >
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: 12,
                              overflow: "hidden",
                              background: "#fff",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {it.image ? (
                              <img
                                src={it.image}
                                alt={it.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : null}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 900,
                                color: "#0f172a",
                                fontSize: 13,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 160,
                              }}
                            >
                              {it.name}
                            </div>
                            <div style={{ color: "#64748b", fontSize: 12 }}>
                              {it.quantity} × {formatGHS(it.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <OrderDetailsModal
        open={detailsOpen}
        onClose={closeModal}
        order={currentOrder}
        loading={modalLoading}
        error={detailsOpen ? error : null}
      />
    </div>
  );
}