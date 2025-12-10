import React, { useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Select,
  message,
} from "antd";

import { useDispatch, useSelector } from "react-redux";
import { createOrderThunk, resetOrderState } from "../Redux/slice/orderSlice";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get cart from Redux
  const cartState = useSelector((state) => state.cart.cart);
  const cartItems = cartState?.items || [];
  const itemsPrice = cartState?.itemsPrice || 0;
  const shippingPrice = cartState?.shippingPrice || 0;
  const taxPrice = cartState?.taxPrice || 0;
  const totalPrice = cartState?.totalAmount || 0;

  const { loading, error, success, currentOrder } = useSelector(
    (state) => state.orders
  );
  const { userInfo } = useSelector((state) => state.auth);

  const [form] = Form.useForm();

  // Redirect after successful order
  useEffect(() => {
    if (success && currentOrder) {
      message.success("Order created successfully!");
      dispatch(resetOrderState());
      navigate(`/order/${currentOrder._id}`);
    }
  }, [success, currentOrder, navigate, dispatch]);

  // Display error messages
  useEffect(() => {
    if (error) message.error(error);
  }, [error]);
const handlePlaceOrder = (values) => {
  if (!cartItems.length) return message.error("Your cart is empty!");
  if (!values.paymentMethod) return message.error("Select a payment method");

  const orderData = {
    cartId: cartState._id, // <-- backend expects cartId
    paymentMethod: values.paymentMethod,
    shippingAddress: {
      name: values.fullName,
      street: values.street,
      city: values.city,
      state: values.state,
      zipCode: values.zipCode,
      country: values.country,
      phone: values.phone,
    },
    orderItems: cartItems.map((item) => ({
      productId: item.product, // matches schema
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
    })),
    itemsPrice: cartState.itemsPrice,
    taxPrice: cartState.taxPrice,
    shippingPrice: cartState.shippingPrice,
    totalPrice: cartState.totalAmount,
  };

  dispatch(
    createOrderThunk({
      orderData,
      token: userInfo?.token,
    })
  );
};


  return (
    <Row gutter={[24, 24]} style={{ padding: "20px" }}>
      {/* Shipping Form */}
      <Col xs={24} md={16}>
        <Card title="Shipping Information" bordered={false}>
          <Form layout="vertical" form={form} onFinish={handlePlaceOrder}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true }]}
            >
              <Input placeholder="John Doe" />
            </Form.Item>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[{ required: true }]}
            >
              <Input placeholder="0550000000" />
            </Form.Item>
            <Form.Item
              label="Street Address"
              name="street"
              rules={[{ required: true }]}
            >
              <Input placeholder="Street / House Number" />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Accra" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="State/Region" name="state">
                  <Input placeholder="Greater Accra" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="Zip Code" name="zipCode">
                  <Input placeholder="0000" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Country"
                  name="country"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Ghana" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Payment Method"
              name="paymentMethod"
              rules={[
                { required: true, message: "Please select payment method" },
              ]}
            >
              <Select placeholder="Select Payment Method">
                <Select.Option value="card">Card Payment</Select.Option>
                <Select.Option value="mobile Money">Mobile Money</Select.Option>
                <Select.Option value="cash_on_delivery">
                  Cash on Delivery
                </Select.Option>
              </Select>
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%", marginTop: "10px" }}
            >
              Place Order
            </Button>
          </Form>
        </Card>
      </Col>

      {/* Order Summary */}
      <Col xs={24} md={8}>
        <Card title="Order Summary">
          {cartItems.length === 0 ? (
            <Text>Your cart is empty</Text>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id}
                style={{
                  marginBottom: 12,
                  paddingBottom: 10,
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Row>
                  <Col span={6}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", borderRadius: 4 }}
                    />
                  </Col>
                  <Col span={10}>
                    <Text strong>{item.name}</Text>
                    <br />
                    <Text type="secondary">Qty: {item.quantity}</Text>
                  </Col>
                  <Col span={8} style={{ textAlign: "right" }}>
                    <Text>₵ {item.price * item.quantity}</Text>
                  </Col>
                </Row>
              </div>
            ))
          )}

          <Divider />

          <Row>
            <Col span={12}>Items Price</Col>
            <Col span={12} style={{ textAlign: "right" }}>
              ₵ {itemsPrice}
            </Col>
          </Row>
          <Row>
            <Col span={12}>Tax</Col>
            <Col span={12} style={{ textAlign: "right" }}>
              ₵ {taxPrice}
            </Col>
          </Row>
          <Row>
            <Col span={12}>Shipping</Col>
            <Col span={12} style={{ textAlign: "right" }}>
              ₵ {shippingPrice}
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={12}>
              <Text strong>Total</Text>
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              <Text strong>₵ {totalPrice}</Text>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default CheckoutPage;
