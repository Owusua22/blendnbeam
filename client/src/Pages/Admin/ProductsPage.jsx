import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Typography,
  notification,
  Upload,
  Image,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Divider,
  Descriptions,
} from "antd";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  TrendingUp, 
  AlertCircle,
  Search,
  Upload as UploadIcon,
  X,
  Palette,
  Layers,
  
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  addProduct,
  editProduct,
  removeProduct,
  fetchProductById,
} from "../../Redux/slice/productSlice";
import { fetchCategories } from "../../Redux/slice/categorySlice";
import { fetchShowrooms } from "../../Redux/slice/showroomSlice";


const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to safely parse arrays from strings or nested arrays
const parseArray = (value) => {
  if (!value) return [];
  
  // If already an array, return it
  if (Array.isArray(value)) {
    return value.map(item => {
      // If item is a string that might contain JSON, try to parse it
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item);
          // If the parsed result is an array, flatten it
          if (Array.isArray(parsed)) {
            return parsed;
          }
          return item;
        } catch {
          return item;
        }
      }
      return item;
    }).flat(); // Flatten any nested arrays
  }
  
  // If it's a string, try to parse it as JSON
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [parsed];
    } catch {
      // If it's not valid JSON, split by commas
      return value.split(',').map(item => item.trim()).filter(item => item);
    }
  }
  
  return [];
};

// Helper to safely parse specifications
const parseSpecifications = (specs) => {
  if (!specs) return {};
  
  try {
    // If it's already an object
    if (typeof specs === 'object' && !Array.isArray(specs)) {
      return specs;
    }
    
    // If it's a string, try to parse it
    if (typeof specs === 'string') {
      const parsed = JSON.parse(specs);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    }
    
    // If it's a Map, convert to object
    if (specs instanceof Map) {
      return Object.fromEntries(specs);
    }
    
    return {};
  } catch (error) {
    console.warn('Failed to parse specifications:', error);
    return {};
  }
};

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { products, loadingProducts, loadingProduct, product, updatingProduct, error } =
    useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);
  const { items: showrooms } = useSelector((state) => state.showrooms);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [specFields, setSpecFields] = useState([]);
  const [variantFields, setVariantFields] = useState([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [localProducts, setLocalProducts] = useState([]);

  // Generate SKU automatically
  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SKU-${timestamp}${random}`;
  };

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchShowrooms());
  }, [dispatch]);

  // Update local products when Redux products change
  useEffect(() => {
    const productList = Array.isArray(products) ? products : products?.data || [];
    const allProducts = productList.filter(p => p && p._id);
    
    // Normalize product data
    const normalizedProducts = allProducts.map(product => ({
      ...product,
      color: parseArray(product.color),
      features: parseArray(product.features),
      specifications: parseSpecifications(product.specifications)
    }));
    
    setLocalProducts(normalizedProducts);
  }, [products]);

  // Search functionality
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredProducts(localProducts);
    } else {
      const searchLower = searchText.toLowerCase();
      const filtered = localProducts.filter(product => {
        return (
          product.name?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower) ||
          product.category?.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.color?.some(color => color.toLowerCase().includes(searchLower)) ||
          product.features?.some(feature => feature.toLowerCase().includes(searchLower))
        );
      });
      setFilteredProducts(filtered);
    }
  }, [searchText, localProducts]);

  const openNotification = (type, message) => {
    notification[type]({
      message,
      placement: "topRight",
    });
  };

  // Calculate stats
  const totalProducts = localProducts.length;
  const activeProducts = localProducts.filter(p => p.isActive && p.stock > 0).length;
  const lowStockProducts = localProducts.filter(p => p.stock > 0 && p.stock < 10 && p.isActive).length;
  const outOfStockProducts = localProducts.filter(p => p.stock === 0 || !p.isActive).length;

  // Fixed color display component
  const ColorList = ({ colors }) => {
    const parsedColors = parseArray(colors);
    
    if (parsedColors.length === 0) {
      return <Text type="secondary">No colors</Text>;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {parsedColors.slice(0, 5).map((color, index) => (
          <div key={index} className="flex items-center gap-1">
            <div 
              className="w-4 h-4 rounded-full border"
              style={{
                backgroundColor: color.toLowerCase(),
                borderColor: '#d9d9d9'
              }}
            />
            <Tag color="blue" className="m-0 text-xs">
              {color}
            </Tag>
          </div>
        ))}
        {parsedColors.length > 5 && (
          <Tooltip title={parsedColors.slice(5).join(', ')}>
            <Tag color="cyan" className="cursor-help m-0">
              +{parsedColors.length - 5}
            </Tag>
          </Tooltip>
        )}
      </div>
    );
  };

  // Fixed features display component
  const FeaturesList = ({ features }) => {
    const parsedFeatures = parseArray(features);
    
    if (parsedFeatures.length === 0) {
      return <Text type="secondary">No features</Text>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {parsedFeatures.slice(0, 3).map((feature, index) => (
          <Tag key={index} color="cyan" className="m-0 text-xs">
            {feature}
          </Tag>
        ))}
        {parsedFeatures.length > 3 && (
          <Tooltip title={parsedFeatures.slice(3).join(', ')}>
            <Tag color="purple" className="cursor-help m-0">
              +{parsedFeatures.length - 3}
            </Tag>
          </Tooltip>
        )}
      </div>
    );
  };

  // Display specifications properly
  const SpecificationsDisplay = ({ specifications }) => {
    const parsedSpecs = parseSpecifications(specifications);
    
    if (!parsedSpecs || Object.keys(parsedSpecs).length === 0) {
      return <Text type="secondary">No specifications</Text>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(parsedSpecs).map(([key, value], index) => (
          <div key={index} className="flex items-center gap-2">
            <Text strong className="min-w-[120px] text-sm">{key}:</Text>
            <Text className="text-sm">{value}</Text>
          </div>
        ))}
      </div>
    );
  };

  // Display variants
  const VariantDisplay = ({ variants, basePrice }) => {
    if (!variants || variants.length === 0) {
      return (
        <div>
          <div className="font-bold text-green-600">₵{basePrice?.toFixed(2) || '0.00'}</div>
          <Text type="secondary" className="text-xs">Single price</Text>
        </div>
      );
    }

    const minPrice = Math.min(...variants.map(v => v.price || 0));
    const maxPrice = Math.max(...variants.map(v => v.price || 0));

    return (
      <div>
        <div className="font-bold text-green-600">
          {minPrice === maxPrice ? (
            `₵${minPrice.toFixed(2)}`
          ) : (
            `₵${minPrice.toFixed(2)} - ₵${maxPrice.toFixed(2)}`
          )}
        </div>
        <Tooltip 
          title={
            <div className="space-y-1">
              {variants.map((v, i) => (
                <div key={i} className="flex justify-between">
                  <span>{v.size}:</span>
                  <span>₵{v.price?.toFixed(2)} ({v.stock || 0} in stock)</span>
                </div>
              ))}
            </div>
          }
        >
          <Text type="secondary" className="text-xs cursor-help">
            {variants.length} variant{variants.length > 1 ? 's' : ''}
          </Text>
        </Tooltip>
      </div>
    );
  };

  // Variant management
  const addVariantField = () => {
    setVariantFields([...variantFields, { size: '', price: 0, stock: 0 }]);
  };

  const removeVariantField = (index) => {
    const newFields = variantFields.filter((_, i) => i !== index);
    setVariantFields(newFields);
    if (newFields.length === 0) {
      setHasVariants(false);
    }
  };

  const updateVariantField = (index, field, value) => {
    const newFields = [...variantFields];
    newFields[index][field] = value;
    setVariantFields(newFields);
  };

  // Spec management
  const addSpecField = () => {
    setSpecFields([...specFields, { key: '', value: '' }]);
  };

  const removeSpecField = (index) => {
    const newFields = specFields.filter((_, i) => i !== index);
    setSpecFields(newFields);
  };

  const updateSpecField = (index, field, value) => {
    const newFields = [...specFields];
    newFields[index][field] = value;
    setSpecFields(newFields);
  };

  // Handle modal opening
  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setFileList([]);
    setSpecFields([]);
    setVariantFields([]);
    setHasVariants(false);
    
    if (product) {
      const hasProductVariants = product.variants && product.variants.length > 0;
      setHasVariants(hasProductVariants);

      if (hasProductVariants) {
        setVariantFields(product.variants.map(v => ({
          size: v.size,
          price: v.price,
          stock: v.stock || 0
        })));
      }

      // Parse specifications for editing
      const parsedSpecs = parseSpecifications(product.specifications);
      const specsArray = Object.entries(parsedSpecs).map(([key, value]) => ({ 
        key, 
        value: String(value) 
      }));
      setSpecFields(specsArray);

      // Parse colors and features for form
      const parsedColors = parseArray(product.color);
      const parsedFeatures = parseArray(product.features);

      form.setFieldsValue({
        ...product,
        category: product.category?._id || product.category,
        showroom: product.showroom?._id || product.showroom,
        isActive: product.isActive,
        color: parsedColors,
        features: parsedFeatures,
        price: hasProductVariants ? null : product.price,
        stock: hasProductVariants ? null : product.stock,
      });
      
      if (product.images) {
        setFileList(
          product.images.map((img, index) => ({
            uid: img.publicId || index,
            name: `Image-${index + 1}`,
            status: "done",
            url: img.url,
            publicId: img.publicId,
          }))
        );
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        sku: generateSKU(),
        isActive: true,
        color: [],
        features: [],
      });
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
    setSpecFields([]);
    setVariantFields([]);
    setHasVariants(false);
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleVariantToggle = (checked) => {
    setHasVariants(checked);
    if (checked && variantFields.length === 0) {
      setVariantFields([{ size: '', price: 0, stock: 0 }]);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("token");

      // Validate variants if enabled
      if (hasVariants) {
        if (variantFields.length === 0) {
          openNotification("error", "Please add at least one variant");
          return;
        }
        
        const hasEmptyVariants = variantFields.some(v => !v.size || v.price <= 0);
        if (hasEmptyVariants) {
          openNotification("error", "Please fill all variant fields (size and price)");
          return;
        }

        const sizes = variantFields.map(v => v.size.toLowerCase().trim());
        const duplicates = sizes.filter((size, index) => sizes.indexOf(size) !== index);
        if (duplicates.length > 0) {
          openNotification("error", `Duplicate size found: ${duplicates[0]}`);
          return;
        }
      } else {
        if (!values.price || values.price <= 0) {
          openNotification("error", "Please enter a valid price");
          return;
        }
        if (values.stock === undefined || values.stock < 0) {
          openNotification("error", "Please enter a valid stock quantity");
          return;
        }
      }

      const formData = new FormData();
      
      // Handle regular fields
      Object.keys(values).forEach((key) => {
        if (key === 'color' || key === 'features') {
          // Ensure we're sending clean arrays
          const cleanArray = Array.isArray(values[key]) 
            ? values[key].filter(item => item && item.trim())
            : [];
          formData.append(key, JSON.stringify(cleanArray));
        } else if (key !== 'specifications' && key !== 'price' && key !== 'stock') {
          formData.append(key, values[key]);
        }
      });

      // Handle oldPrice
      if (!values.oldPrice || values.oldPrice === 0) {
        delete values.oldPrice;
      }

      // Handle variants or base price
      if (hasVariants) {
        formData.append('variants', JSON.stringify(variantFields));
      } else {
        formData.append('price', values.price);
        formData.append('stock', values.stock);
        formData.append('variants', JSON.stringify([]));
      }

      // Handle specifications - send as array of [key, value] pairs for Map
      const specifications = specFields
        .filter(spec => spec.key && spec.value)
        .reduce((acc, spec) => {
          acc[spec.key] = spec.value;
          return acc;
        }, {});

      if (Object.keys(specifications).length > 0) {
        // Convert object to array of [key, value] pairs for Mongoose Map
        const specsArray = Object.entries(specifications);
        formData.append('specifications', JSON.stringify(specsArray));
      }

      // Handle images
      fileList.forEach((file) => {
        if (!file.url) {
          formData.append("images", file.originFileObj);
        }
      });

      // Include publicIds for existing images (editing)
      if (editingProduct && fileList.length > 0) {
        const existingIds = fileList.filter((f) => f.url).map((f) => f.publicId);
        if (existingIds.length > 0) {
          formData.append("existingImages", JSON.stringify(existingIds));
        }
      }

      if (editingProduct) {
        const result = await dispatch(
          editProduct({ id: editingProduct._id, productData: formData, token })
        ).unwrap();
        
        setLocalProducts(prev => 
          prev.map(p => p._id === editingProduct._id ? result : p)
        );
        
        openNotification("success", "✅ Product updated successfully");
      } else {
        const result = await dispatch(addProduct({ productData: formData, token })).unwrap();
        
        setLocalProducts(prev => [result, ...prev]);
        
        openNotification("success", "✅ Product added successfully");
      }

      handleCancel();
      dispatch(fetchProducts());
    } catch (err) {
      console.error('Submit error:', err);
      openNotification("error", err.message || "❌ Failed to save product");
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (id, currentStatus) => {
    const token = localStorage.getItem("token");
    
    const productToUpdate = localProducts.find(p => p._id === id);
    if (!productToUpdate) return;

    setLocalProducts(prev =>
      prev.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p)
    );

    const formData = new FormData();
    formData.append('isActive', !currentStatus);
    
    try {
      await dispatch(editProduct({ id, productData: formData, token })).unwrap();
      openNotification("success", `Product ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      dispatch(fetchProducts());
    } catch (err) {
      setLocalProducts(prev =>
        prev.map(p => p._id === id ? { ...p, isActive: currentStatus } : p)
      );
      openNotification("error", "❌ Failed to update product status");
    }
  };

  // Delete Product
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    
    setLocalProducts(prev => prev.filter(p => p._id !== id));
    openNotification("success", "🗑️ Product deleted successfully");
    
    try {
      await dispatch(removeProduct({ id, token })).unwrap();
      dispatch(fetchProducts());
    } catch (error) {
      console.error("Delete error:", error);
      openNotification("error", "❌ Failed to delete product. Refreshing list...");
      dispatch(fetchProducts());
    }
  };

  // View Product Details
  const handleViewProduct = async (id) => {
    await dispatch(fetchProductById(id)).unwrap();
    setViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    setViewModalVisible(false);
  };

  // Get product status
  const getProductStatus = (product) => {
    if (!product.isActive) {
      return { text: 'Inactive', color: 'default' };
    }
    
    // Calculate total stock for variants
    let totalStock = product.stock || 0;
    if (product.variants && product.variants.length > 0) {
      totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    
    if (totalStock === 0) {
      return { text: 'Out of Stock', color: 'red' };
    }
    return { text: 'Active', color: 'success' };
  };

  // Table Columns
  const columns = [
    {
      title: "Image",
      dataIndex: "images",
      key: "images",
      width: 100,
      render: (images) => {
        if (images && images.length > 0) {
          return (
            <Badge count={images.length > 1 ? images.length : 0} offset={[-5, 5]}>
              <Image
                src={images[0].url}
                alt="Product"
                width={60}
                height={60}
                style={{ objectFit: "cover", borderRadius: 8 }}
                preview={{
                  mask: <Eye size={16} />,
                }}
              />
            </Badge>
          );
        }
        return (
          <div className="flex items-center justify-center w-15 h-15 bg-gray-100 rounded-lg">
            <Package size={24} className="text-gray-400" />
          </div>
        );
      },
    },
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-semibold text-gray-800">{text}</div>
          <Text type="secondary" className="text-xs">
            SKU: {record.sku}
          </Text>
          <div className="mt-1">
            <ColorList colors={record.color} />
          </div>
          <div className="mt-1">
            <FeaturesList features={record.features} />
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price, record) => (
        <div>
          <VariantDisplay variants={record.variants} basePrice={price} />
          {record.oldPrice > 0 && (
            <Text delete type="secondary" className="text-xs">
              ₵{record.oldPrice?.toFixed(2)}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      key: "category",
      render: (name) => name ? <Tag color="blue">{name}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: "Showroom",
      dataIndex: ["showroom", "name"],
      key: "showroom",
      render: (name) => name ? <Tag color="purple">{name}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock, record) => {
        if (record.variants && record.variants.length > 0) {
          const totalStock = record.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          return (
            <Tooltip title={record.variants.map(v => `${v.size}: ${v.stock || 0}`).join(', ')}>
              <Tag color={totalStock === 0 ? "red" : totalStock < 10 ? "orange" : "green"}>
                {totalStock} total
              </Tag>
            </Tooltip>
          );
        }
        
        return (
          <div className="flex items-center gap-2">
            {stock === 0 ? (
              <Tag color="red">Out</Tag>
            ) : stock < 10 ? (
              <Tag color="orange">{stock}</Tag>
            ) : (
              <Tag color="green">{stock}</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = getProductStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 250,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              icon={<Eye size={16} />}
              onClick={() => handleViewProduct(record._id)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit Product">
            <Button
              icon={<Edit size={16} />}
              onClick={() => handleOpenModal(record)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Deactivate" : "Activate"}>
            <Switch
              checked={record.isActive}
              onChange={() => handleToggleStatus(record._id, record.isActive)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete Product">
            <Button
              icon={<Trash2 size={16} />}
              danger
              onClick={() => handleDelete(record._id)}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2} className="mb-1">Product Management</Title>
            <Text type="secondary">Manage your product inventory with variants</Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusCircle size={18} />}
            onClick={() => handleOpenModal()}
            className="shadow-lg"
          >
            Add Product
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Total Products"
                value={totalProducts}
                prefix={<Package size={20} className="text-blue-500" />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Active Products"
                value={activeProducts}
                prefix={<TrendingUp size={20} className="text-green-500" />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Low Stock Alert"
                value={lowStockProducts}
                prefix={<AlertCircle size={20} className="text-orange-500" />}
                valueStyle={{ color: lowStockProducts > 0 ? "#fa8c16" : "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Out of Stock"
                value={outOfStockProducts}
                prefix={<AlertCircle size={20} className="text-red-500" />}
                valueStyle={{ color: outOfStockProducts > 0 ? "#ff4d4f" : "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Text type="danger">{error}</Text>
          </div>
        )}

        {/* Search Bar */}
        <Card className="shadow-sm mb-4">
          <div className="relative">
            <Input
              placeholder="Search products by name, SKU, category, or description..."
              prefix={<Search size={18} className="text-gray-400" />}
              suffix={
                searchText && (
                  <X 
                    size={18} 
                    className="text-gray-400 cursor-pointer hover:text-gray-600" 
                    onClick={() => setSearchText("")}
                  />
                )
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </div>
          {searchText && (
            <div className="mt-2 text-sm text-gray-500">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          )}
        </Card>

        {/* Products Table */}
        <Card className="shadow-md">
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="_id"
            loading={loadingProducts}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} products`,
            }}
            scroll={{ x: 1400 }}
            className="custom-table"
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <Package size={20} />
              <span>{editingProduct ? "Edit Product" : "Add New Product"}</span>
            </div>
          }
          open={modalVisible}
          onCancel={handleCancel}
          onOk={handleSubmit}
          okText={editingProduct ? "Update Product" : "Add Product"}
          width={1100}
          confirmLoading={updatingProduct}
          className="custom-modal"
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true, message: "Please enter product name" }]}
                >
                  <Input placeholder="Enter product name" size="large" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="sku"
                  label="SKU"
                  rules={[{ required: true, message: "Please enter SKU" }]}
                  tooltip="Auto-generated SKU. You can edit if needed."
                >
                  <Input placeholder="SKU will be auto-generated" size="large" disabled={!!editingProduct} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: "Please select category" }]}
                >
                  <Select placeholder="Select category" size="large">
                    {categories.map((cat) => (
                      <Option key={cat._id} value={cat._id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: "Please enter description" }]}
                >
                  <Input.TextArea rows={3} placeholder="Enter product description" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="color"
                  label={
                    <span className="flex items-center gap-2">
                      <Palette size={16} />
                      Available Colors
                    </span>
                  }
                  tooltip="Add colors as a list (e.g., Red, Blue, Green)"
                >
                  <Select
                    mode="tags"
                    placeholder="Add colors (e.g., Red, Blue, Black)"
                    size="large"
                    tokenSeparators={[',']}
                    allowClear
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="showroom" label="Showroom (Optional)">
                  <Select placeholder="Select showroom" size="large" allowClear>
                    {showrooms.map((s) => (
                      <Option key={s._id} value={s._id}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Divider orientation="left">
                  <span className="flex items-center gap-2">
                    <Layers size={18} />
                    Pricing Options
                  </span>
                </Divider>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>Enable Size Variants</Text>
                      <div className="text-xs text-gray-600 mt-1">
                        Allow multiple sizes with different prices (e.g., Small, Medium, Large)
                      </div>
                    </div>
                    <Switch 
                      checked={hasVariants} 
                      onChange={handleVariantToggle}
                      checkedChildren="Variants"
                      unCheckedChildren="Single"
                    />
                  </div>
                </div>
              </Col>

              {hasVariants ? (
                <Col span={24}>
                  <div className="mb-3 flex justify-between items-center">
                    <Text strong>Size Variants (Size + Price + Stock)</Text>
                    <Button type="dashed" onClick={addVariantField} size="small">
                      + Add Variant
                    </Button>
                  </div>
                  {variantFields.length === 0 ? (
                    <div className="text-center p-4 bg-gray-50 rounded border border-dashed">
                      <Text type="secondary">No variants added. Click "+ Add Variant" to start.</Text>
                    </div>
                  ) : (
                    variantFields.map((variant, index) => (
                      <Card key={index} className="mb-3" size="small">
                        <Row gutter={8} align="middle">
                          <Col span={8}>
                            <Input
                              placeholder="Size (e.g., Small, Medium)"
                              value={variant.size}
                              onChange={(e) => updateVariantField(index, 'size', e.target.value)}
                              size="large"
                            />
                          </Col>
                          <Col span={6}>
                            <InputNumber
                              placeholder="Price"
                              min={0}
                              prefix="₵"
                              value={variant.price}
                              onChange={(val) => updateVariantField(index, 'price', val)}
                              style={{ width: "100%" }}
                              size="large"
                            />
                          </Col>
                          <Col span={6}>
                            <InputNumber
                              placeholder="Stock"
                              min={0}
                              value={variant.stock}
                              onChange={(val) => updateVariantField(index, 'stock', val)}
                              style={{ width: "100%" }}
                              size="large"
                            />
                          </Col>
                          <Col span={4} className="text-center">
                            {variantFields.length > 1 && (
                              <Button
                                danger
                                type="text"
                                icon={<Trash2 size={16} />}
                                onClick={() => removeVariantField(index)}
                              />
                            )}
                          </Col>
                        </Row>
                      </Card>
                    ))
                  )}
                </Col>
              ) : (
                <>
                  <Col span={12}>
                    <Form.Item
                      name="price"
                      label="Price"
                      rules={[{ required: true, message: "Please enter price" }]}
                    >
                      <InputNumber
                        placeholder="Enter price"
                        min={0}
                        prefix="₵"
                        style={{ width: "100%" }}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="stock"
                      label="Stock Quantity"
                      rules={[{ required: true, message: "Please enter stock quantity" }]}
                    >
                      <InputNumber
                        placeholder="Enter stock quantity"
                        min={0}
                        style={{ width: "100%" }}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </>
              )}

              <Col span={12}>
                <Form.Item name="oldPrice" label="Old Price (Optional)">
                  <InputNumber
                    placeholder="Original price for discounts"
                    min={0}
                    prefix="₵"
                    style={{ width: "100%" }}
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Status"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    defaultChecked
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Divider orientation="left">Product Images</Divider>
                <Form.Item>
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    multiple
                    accept="image/*"
                    beforeUpload={() => false}
                    className="upload-list-inline"
                  >
                    {fileList.length < 10 && (
                      <div className="flex flex-col items-center">
                        <UploadIcon size={20} />
                        <div className="mt-2 text-xs">Upload</div>
                      </div>
                    )}
                  </Upload>
                  <Text type="secondary" className="text-xs">
                    Upload up to 10 images. First image will be the main display.
                  </Text>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Divider orientation="left">Specifications</Divider>
                <div className="mb-3 flex justify-between items-center">
                  <Text strong>Key-Value Pairs</Text>
                  <Button type="dashed" onClick={addSpecField} size="small">
                    + Add Specification
                  </Button>
                </div>
                {specFields.length === 0 ? (
                  <div className="text-center p-4 bg-gray-50 rounded border border-dashed">
                    <Text type="secondary">
                      No specifications added. Click "+ Add Specification" to start.
                    </Text>
                  </div>
                ) : (
                  specFields.map((spec, index) => (
                    <Card key={index} className="mb-3" size="small">
                      <Row gutter={8} align="middle">
                        <Col span={10}>
                          <Input
                            placeholder="Key (e.g., Material)"
                            value={spec.key}
                            onChange={(e) => updateSpecField(index, 'key', e.target.value)}
                            size="large"
                          />
                        </Col>
                        <Col span={12}>
                          <Input
                            placeholder="Value (e.g., 100% Cotton)"
                            value={spec.value}
                            onChange={(e) => updateSpecField(index, 'value', e.target.value)}
                            size="large"
                          />
                        </Col>
                        <Col span={2} className="text-center">
                          <Button
                            danger
                            type="text"
                            icon={<Trash2 size={16} />}
                            onClick={() => removeSpecField(index)}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))
                )}
              </Col>

              <Col span={24}>
                <Form.Item
                  name="features"
                  label="Features"
                  tooltip="Add product features as a list"
                >
                  <Select
                    mode="tags"
                    placeholder="Add features (e.g., Waterproof, Anti-Slip)"
                    size="large"
                    tokenSeparators={[',']}
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* View Product Modal - FIXED VERSION */}
        <Modal
          title="Product Details"
          open={viewModalVisible}
          onCancel={handleCloseViewModal}
          footer={[
            <Button key="close" onClick={handleCloseViewModal}>
              Close
            </Button>,
            product && (
              <Button
                key="edit"
                type="primary"
                icon={<Edit size={16} />}
                onClick={() => {
                  handleCloseViewModal();
                  handleOpenModal(product);
                }}
              >
                Edit Product
              </Button>
            ),
          ]}
          width={900}
        >
          {loadingProduct ? (
            <div className="text-center p-8">Loading product details...</div>
          ) : product ? (
            <div className="space-y-6">
              {/* Product Header */}
              <div className="flex gap-6">
              
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Title level={3}>{product.name}</Title>
                      <div className="flex items-center gap-2 mt-2">
                        <Tag color="blue">SKU: {product.sku}</Tag>
                        <Tag color={product.isActive ? "green" : "red"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Tag>
                      </div>
                    </div>
                    <div className="text-right">
                      {product.variants && product.variants.length > 0 ? (
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            ₵{Math.min(...product.variants.map(v => v.price)).toFixed(2)}
                            {product.variants.length > 1 && (
                              <span className="text-lg">
                                -₵{Math.max(...product.variants.map(v => v.price)).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Text type="secondary" className="text-xs">
                            {product.variants.length} variants
                          </Text>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-green-600">
                          ₵{product.price?.toFixed(2) || '0.00'}
                        </div>
                      )}
                      {product.oldPrice > 0 && (
                        <Text delete type="secondary">
                          ₵{product.oldPrice?.toFixed(2)}
                        </Text>
                      )}
                    </div>
                  </div>
                  
                  <Divider />
                  
                  {/* Stock Information */}
                  <div className="mb-4">
                    <Text strong>Stock Status: </Text>
                    {product.variants && product.variants.length > 0 ? (
                      <Tag color="orange">
                        {product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)} total units
                      </Tag>
                    ) : (
                      <Tag color={product.stock > 0 ? "green" : "red"}>
                        {product.stock || 0} units
                      </Tag>
                    )}
                  </div>

                  {/* Product Info */}
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text strong>Category:</Text>
                      <div>
                        <Tag color="blue">{product.category?.name || "N/A"}</Tag>
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text strong>Showroom:</Text>
                      <div>
                        {product.showroom?.name ? (
                          <Tag color="purple">{product.showroom.name}</Tag>
                        ) : (
                          <Text type="secondary">N/A</Text>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Colors and Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Title level={5} className="flex items-center gap-2 mb-3">
                    <Palette size={18} />
                    Colors
                  </Title>
                  {product.color && parseArray(product.color).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {parseArray(product.color).map((color, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div 
                            className="w-6 h-6 rounded-full border"
                            style={{
                              backgroundColor: color.toLowerCase().includes('black') ? '#000' : 
                                             color.toLowerCase().includes('white') ? '#fff' : 
                                             color.toLowerCase().includes('grey') ? '#808080' : 
                                             color.toLowerCase().includes('gray') ? '#808080' : 
                                             color.toLowerCase().includes('red') ? '#ff0000' : 
                                             color.toLowerCase().includes('blue') ? '#0000ff' : 
                                             color.toLowerCase().includes('green') ? '#00ff00' : 
                                             color.toLowerCase(),
                              borderColor: '#d9d9d9'
                            }}
                          />
                          <Text>{color}</Text>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary">No colors specified</Text>
                  )}
                </div>

                <div>
                  <Title level={5} className="flex items-center gap-2 mb-3">
                 
                    Features
                  </Title>
                  {product.features && parseArray(product.features).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {parseArray(product.features).map((feature, index) => (
                        <Tag key={index} color="cyan" className="text-sm">
                          {feature}
                        </Tag>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary">No features specified</Text>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Title level={5}>Description</Title>
                <Text className="whitespace-pre-line">{product.description || "No description provided"}</Text>
              </div>

              {/* Variants Table */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <Title level={5}>Size Variants</Title>
                  <Table
                    dataSource={product.variants}
                    pagination={false}
                    rowKey="size"
                    columns={[
                      {
                        title: "Size",
                        dataIndex: "size",
                        key: "size",
                        width: '30%',
                      },
                      {
                        title: "Price",
                        dataIndex: "price",
                        key: "price",
                        width: '30%',
                        render: (price) => `₵${price?.toFixed(2)}`,
                      },
                      {
                        title: "Stock",
                        dataIndex: "stock",
                        key: "stock",
                        width: '40%',
                        render: (stock) => (
                          <Tag color={stock > 0 ? "green" : "red"}>
                            {stock || 0} units
                          </Tag>
                        ),
                      },
                    ]}
                  />
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(parseSpecifications(product.specifications)).length > 0 && (
                <div>
                  <Title level={5}>Specifications</Title>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Descriptions column={1} size="small">
                      {Object.entries(parseSpecifications(product.specifications)).map(([key, value], idx) => (
                        <Descriptions.Item key={idx} label={key}>
                          {value}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  </div>
                </div>
              )}

              {/* Gallery */}
              {product.images && product.images.length > 0 && (
                <div>
                  <Title level={5}>Gallery</Title>
                  <Row gutter={[8, 8]}>
                    {product.images.map((image, idx) => (
                      <Col span={6} key={idx}>
                        <Image
                          src={image.url}
                          alt={`${product.name} ${idx + 1}`}
                          className="w-full h-32 object-cover rounded"
                          preview={{
                            mask: <Eye size={16} />,
                          }}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              No product data available
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ProductsPage;