import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Popconfirm,
  Row,
  Col,
  message,
  Typography,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchShippingList,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
  fetchShippingById,
} from "../../Redux/slice/shippingSlice";

const { Title, Paragraph } = Typography;

const ShippingForm = ({ visible, onCancel, onSave, initial }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initial) {
      form.setFieldsValue({
        name: initial.name,
        code: initial.code,
        deliveryCharge: initial.deliveryCharge,
        estimate: initial.estimate,
        isActive: initial.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ deliveryCharge: 0, isActive: true });
    }
  }, [initial, form, visible]);

  const handleFinish = async (values) => {
    await onSave(values);
  };

  return (
    <Modal
      visible={visible}
      title={initial ? "Edit Shipping Zone" : "Create Shipping Zone"}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => form.submit()}
      okText={initial ? "Update" : "Create"}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="Location Name"
          rules={[{ required: true, message: "Please enter a location name" }]}
        >
          <Input placeholder="e.g. Accra" />
        </Form.Item>

        <Form.Item name="code" label="Code / Key">
          <Input placeholder="e.g. ACCRA or GT-ACC" />
        </Form.Item>

        <Form.Item
          name="deliveryCharge"
          label="Delivery Charge (₵)"
          rules={[{ required: true, message: "Please enter delivery charge" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="estimate" label="Estimate">
          <Input placeholder="e.g. 1-2 business days" />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Active"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const AdminShippingPage = () => {
  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((state) => state.shipping || {});

  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null); // shipping object when editing

  useEffect(() => {
    dispatch(fetchShippingList());
  }, [dispatch]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  useEffect(() => {
    // simple filter by name/code
    if (!search) return setFiltered(list);
    const q = search.trim().toLowerCase();
    setFiltered(
      (list || []).filter(
        (z) =>
          (z.name || "").toLowerCase().includes(q) ||
          (z.code || "").toLowerCase().includes(q)
      )
    );
  }, [list, search]);

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = async (record) => {
    try {
      const result = await dispatch(fetchShippingById(record._id));
      if (result.meta?.requestStatus === "fulfilled") {
        setEditing(result.payload);
        setModalVisible(true);
      } else {
        message.error("Failed to load shipping zone");
      }
    } catch (err) {
      message.error("Failed to load shipping zone");
    }
  };

  const handleSave = async (values) => {
    try {
      if (editing) {
        const payload = { id: editing._id, shippingData: values };
        const res = await dispatch(updateShippingZone(payload));
        if (res.meta?.requestStatus === "fulfilled") {
          message.success("Shipping zone updated");
          setModalVisible(false);
          setEditing(null);
        } else {
          message.error(res.payload?.message || "Failed to update");
        }
      } else {
        const res = await dispatch(createShippingZone(values));
        if (res.meta?.requestStatus === "fulfilled") {
          message.success("Shipping zone created");
          setModalVisible(false);
        } else {
          message.error(res.payload?.message || "Failed to create");
        }
      }
    } catch (err) {
      message.error(err.message || "Operation failed");
    } finally {
      dispatch(fetchShippingList());
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await dispatch(deleteShippingZone(id));
      if (res.meta?.requestStatus === "fulfilled") {
        message.success("Shipping zone deleted");
      } else {
        message.error(res.payload?.message || "Failed to delete");
      }
    } catch (err) {
      message.error(err.message || "Delete failed");
    } finally {
      dispatch(fetchShippingList());
    }
  };

  const toggleActive = async (record) => {
    try {
      const res = await dispatch(
        updateShippingZone({ id: record._id, shippingData: { isActive: !record.isActive } })
      );
      if (res.meta?.requestStatus === "fulfilled") {
        message.success(
          `${record.name} is now ${!record.isActive ? "active" : "inactive"}`
        );
      } else {
        message.error(res.payload?.message || "Failed to update status");
      }
    } catch (err) {
      message.error(err.message || "Status toggle failed");
    } finally {
      dispatch(fetchShippingList());
    }
  };

  const columns = [
    {
      title: "Location",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      render: (text) => text || "—",
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text) => text || "—",
    },
    {
      title: "Charge (₵)",
      dataIndex: "deliveryCharge",
      key: "deliveryCharge",
      sorter: (a, b) => (Number(a.deliveryCharge) || 0) - (Number(b.deliveryCharge) || 0),
      render: (v) => `₵ ${Number(v || 0).toFixed(2)}`,
    },
    {
      title: "Estimate",
      dataIndex: "estimate",
      key: "estimate",
      render: (text) => text || "—",
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (_, record) => (
        <Switch
          checked={!!record.isActive}
          onChange={() => toggleActive(record)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            size="small"
          />
          <Popconfirm
            title={`Delete ${record.name}?`}
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Shipping Zones
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Manage delivery locations and charges
          </Paragraph>
        </Col>
        <Col>
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
          >
            New Shipping Zone
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card>
            <Row style={{ marginBottom: 16 }} gutter={[12, 12]}>
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Search by name or code"
                  allowClear
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Space>
                  <Button onClick={() => dispatch(fetchShippingList())}>
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>

            <Table
              rowKey={(record) => record._id}
              dataSource={filtered}
              columns={columns}
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: "No shipping zones found" }}
            />
          </Card>
        </Col>
      </Row>

      <ShippingForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
};

export default AdminShippingPage;