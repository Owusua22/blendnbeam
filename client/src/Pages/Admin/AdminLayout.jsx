import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import { List, Building2, LogOut, Home, User } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "/admin/categories",
      icon: <List size={18} />,
      label: <Link to="/admin/categories">Categories</Link>,
    },
    {
      key: "/admin/showrooms",
      icon: <Building2 size={18} />,
      label: <Link to="/admin/showrooms">Showrooms</Link>,
    },
    {
      key: "/admin/products",
      icon: <Home size={18} />,
      label: <Link to="/admin/products">Products</Link>,
    },
    {
      key: "/admin/customers",
      icon: <User size={18} />,
      label: <Link to="/admin/customers">Customers</Link>,
    },
    {
      key: "/admin/orders",
      icon: <List size={18} />,
      label: <Link to="/admin/orders">Orders</Link>,
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            color: "#fff",
            textAlign: "center",
            padding: "16px 0",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          {collapsed ? "AD" : "Admin Panel"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />

        <div style={{ padding: "12px" }}>
          <Button
            type="text"
            icon={<LogOut color="#fff" size={18} />}
            onClick={handleLogout}
            style={{
              width: "100%",
              color: "#fff",
              textAlign: "left",
            }}
          >
            Logout
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            fontWeight: 600,
            fontSize: "16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          Admin Panel
        </Header>

        {/* ✅ This is where Categories/Showrooms pages appear */}
        <Content style={{ margin: "16px", padding: 24, background: "#fff" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
