import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Card, Tabs, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { loginUserThunk, registerUserThunk} from "../Redux/slice/authSlice";

const { Title } = Typography;
const { TabPane } = Tabs;

const AuthModal = ({ open, onClose, defaultTab = "register" }) => {
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Handle successful login/register
  useEffect(() => {
    if (userInfo) {
      message.success(`Welcome, ${userInfo.name}!`);
      onClose(); // Close modal on success
    }
  }, [userInfo, onClose]);

  // Handle errors
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleLogin = (values) => {
    dispatch(loginUserThunk(values));
  };

  const handleRegister = (values) => {
    dispatch(registerUserThunk(values));
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      width={400}
      destroyOnClose={true}
      className="auth-modal"
    >
      <div className="p-1">
        <Title level={3} className="text-center mb-6">
          {activeTab === "login" ? "Login" : "Register"}
        </Title>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          centered
          className="auth-tabs"
        >
          <TabPane tab="Login" key="login">
            <Form
              layout="vertical"
              onFinish={handleLogin}
              autoComplete="off"
              className="space-y-4"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Please enter your password" }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="mt-2"
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Register" key="register">
            <Form
              layout="vertical"
              onFinish={handleRegister}
              autoComplete="off"
              className="space-y-4"
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter your password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="mt-2"
                >
                  Register
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default AuthModal;