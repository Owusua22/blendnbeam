import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
} from "antd";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  addCategory,
  editCategory,
  removeCategory,
} from "../../Redux/slice/categorySlice";

const Categories = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Open modal for add or edit
  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) form.setFieldsValue(category);
    else form.resetFields();
    setIsModalOpen(true);
  };

  // Handle add/edit submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("token");

      if (editingCategory) {
        await dispatch(
          editCategory({
            id: editingCategory._id,
            categoryData: values,
            token,
          })
        ).unwrap();
        message.success("Category updated successfully");
      } else {
        await dispatch(addCategory({ categoryData: values, token })).unwrap();
        message.success("Category added successfully");
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      form.resetFields();
    } catch (err) {
      message.error(err.message || "Something went wrong");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await dispatch(removeCategory({ id, token })).unwrap();
      message.success("Category deleted successfully");
    } catch (err) {
      message.error("Failed to delete category");
    }
  };

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<Edit3 size={16} />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontWeight: 600 }}>Categories</h2>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => openModal()}
        >
          Add Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editingCategory ? "Update" : "Create"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="Category name" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
