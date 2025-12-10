import React, { useEffect } from "react";
import {
  Table,
  Tag,
  Card,
  Button,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrdersThunk,
  updateOrderStatusThunk,
} from "../../Redux/slice/orderSlice";

const { Title, Text } = Typography;
const { Option } = Select;

const statusColors = {
  pending: "orange",
  processing: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
};

export default function Orders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);
  const token = localStorage.getItem("token");

  useEffect(() => {
    dispatch(fetchAllOrdersThunk(token));
  }, [dispatch, token]);

  const handleStatusChange = (id, status) => {
    dispatch(updateOrderStatusThunk({ id, status, token }))
      .unwrap()
      .then(() => message.success("Order status updated"))
      .catch((err) => message.error(err));
  };

  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <div>
          <Text strong>{user?.name || "N/A"}</Text>
          <br />
          <Text type="secondary">{user?.email}</Text>
          <br />
          <Text type="secondary">📞 {user?.phone || "No phone"}</Text>
        </div>
      ),
    },
    {
      title: "Shipping",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      render: (addr) => (
        <div>
          <Text strong>{addr?.name}</Text>
          <br />
          <Text>{addr?.street}</Text>
          <br />
          <Text>
            {addr?.city}, {addr?.state}
          </Text>
          <br />
          <Text>{addr?.country}</Text>
          <br />
          <Text>📞 {addr?.phone}</Text>
        </div>
      ),
    },
    {
      title: "Items",
      dataIndex: "orderItems",
      key: "orderItems",
      render: (items) => (
        <div>
          {items.map((i, idx) => (
            <div key={idx}>
              <Text>
                {i.name} x {i.quantity} — GH₵{i.price}
              </Text>
              <br />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => <Text strong>GH₵{price}</Text>,
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => <Tag color="blue">{method}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      render: (order) => (
        <Tag
          color={statusColors[order.status]}
          style={{ fontSize: "14px", padding: "4px 10px" }}
        >
          {order.status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (order) => {
        const availableTransitions = {
          pending: ["processing", "cancelled"],
          processing: ["shipped", "cancelled"],
          shipped: ["delivered"],
          delivered: [],
          cancelled: [],
        };

        return (
          <Space>
            <Select
              placeholder="Update Status"
              style={{ width: 160 }}
              onChange={(value) => handleStatusChange(order._id, value)}
              disabled={availableTransitions[order.status].length === 0}
            >
              {availableTransitions[order.status].map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Space>
        );
      },
    },
  ];

  return (
    <Card style={{ margin: 20, borderRadius: 12 }}>
      <Title level={3}>Manage Orders</Title>
      <Text type="secondary">View and manage all store orders</Text>

      <Table
        style={{ marginTop: 20 }}
        columns={columns}
        dataSource={orders}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
