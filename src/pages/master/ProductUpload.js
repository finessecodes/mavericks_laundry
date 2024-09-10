import React, { useState, useEffect, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import {
  Box,
  Anchor,
  Button,
  Image,
  Input,
  Label,
  Icon,
  Text,
  Select,
  Option,
  List,
  Item,
} from "../../components/elements";
import { LabelField, LabelTextarea } from "../../components/fields";
import { CardLayout, CardHeader } from "../../components/cards";
import Breadcrumb from "../../components/Breadcrumb";
import PageLayout from "../../layouts/PageLayout";
import data from "../../data/master/productUpload.json";
import axios from "../../axios";
import axiosMain from "axios";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

export default function ProductUpload() {
  const dispatch = useDispatch();
  const menus = useSelector((state) => state.menu.menus);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const access = JSON.parse(localStorage.getItem("pos-token"));
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [uploadFile, setUploadFile] = React.useState("");
  const [dataUri, setDataUri] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [previewOffline, setPreviewOffline] = useState(null);
  const [binaryString, setBinaryString] = useState("");
  const [sendData, setSendData] = useState({
    itemName: "",
    unitPrice: "",
    image: ``,
    category: "",
    countable: true,
    adultMalePrice: {
      ordinary: "",
      ironed: "",
    },
    adultFemalePrice: {
      ordinary: "",
      ironed: "",
    },
    childrenPrice: {
      ordinary: "",
      ironed: "",
    },
  });
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null); // State to track selected category
  const [categoryAmount, setCategoryAmount] = useState({});
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null); // State for category being edited
  const [editedCategoryName, setEditedCategoryName] = useState("");

  const handleAddCategory = async () => {
    try {
      const response = await axios.post("/menu/category", {
        category: newCategory,
      });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `You have successfully created a category.`,
      });
      setCategories([...categories, response.data.data]);
      setNewCategory("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.response?.data?.message || "Something went wrong!",
      });
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category._id);
    setEditedCategoryName(category.category);
  };

  const handleUpdateCategory = async () => {
    try {
      const response = await axios.post(`/menu/category/${editingCategory}`, {
        category: editedCategoryName,
      });
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Category has been successfully updated.",
      });

      // Update the category in the state
      setCategories(
        categories.map((cat) =>
          cat._id === editingCategory
            ? { ...cat, category: editedCategoryName }
            : cat
        )
      );

      setEditingCategory(null);
      setEditedCategoryName("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.response?.data?.message || "Could not update category.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditedCategoryName("");
  };

  const fileToDataUri = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });

  const onChange = (file) => {
    if (!file) {
      setDataUri("");
      return;
    }
    fileToDataUri(file).then((dataUri) => {
      setDataUri(dataUri);
    });
  };

  const handleRemove = async (id) => {
    try {
      const response = await axios.delete(`/menu/category/${id}`);
      setCategories((prevItems) => prevItems.filter((item) => item._id !== id));
    } catch (error) {}
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const nameParts = name.split(".");
    if (name === "image") {
      return setSendData({
        ...sendData,
        [name]: files[0],
      });
    }
    if (nameParts.length > 1) {
      const [mainField, subField] = nameParts;
  
      return setSendData({
        ...sendData,
        [mainField]: {
          ...sendData[mainField],
          [subField]: value,
        },
      });
    }
    return setSendData({
      ...sendData,
      [name]: value,
    });
  };
  

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get("/menu/category");
        setCategories(response.data.data);
      } catch (error) {}
    };
    getCategories();
  }, []);

  const handleSubmitCategory = async () => {
    try {
      const response = await axios.post("/menu/category", {
        category: sendData.category,
      });
      Swal.fire({
        icon: "success",
        title: "Success...",
        text: `You have successfully created a category.`,
      });
      setCategories([...categories, response.data.data]);
    } catch (error) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.response?.data?.message
          ? error?.response?.data?.message
          : "Something went wrong!",
      });
    }
  };

  const handleSubmitMenu = async () => {
    const jsonFormat = {
      itemName: sendData.itemName,
      // unitPrice: sendData.unitPrice,
      image: sendData.image,
      category: sendData.category,
      adultMalePrice: {
        ordinary: sendData.adultMalePrice.ordinary,
        ironed: sendData.adultMalePrice.ironed,
      },
      adultFemalePrice: {
        ordinary: sendData.adultFemalePrice.ordinary,
        ironed: sendData.adultFemalePrice.ironed,
      },
      childrenPrice: {
        ordinary: sendData.childrenPrice.ordinary,
        ironed: sendData.childrenPrice.ironed,
      },
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/menu/list`,
        jsonFormat
      );
      const newData = {
        ...response.data.data,
        image: [sendData.image, previewOffline],
      };
      localStorage.removeItem("pos-menus");
      const newArray = [newData, ...menus];
      localStorage.setItem("pos-menus", JSON.stringify(newArray));
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "You have successfully created a menu.",
      });
      setLoading(false);
      const uploadedData = {
        _id: response.data.data._id,
        itemName: response.data.data.itemName,
        category: response.data.data.category.category,
        adultMalePrice: {
          ordinary: response.data.data.adultMalePrice.ordinary,
          ironed: response.data.data.adultMalePrice.ironed,
        },
        adultFemalePrice: {
          ordinary: response.data.data.adultFemalePrice.ordinary,
          ironed: response.data.data.adultFemalePrice.ironed,
        },
        childrenPrice: {
          ordinary: response.data.data.childrenPrice.ordinary,
          ironed: response.data.data.childrenPrice.ironed,
        },
        createdBy: response.data.data.createdBy._id,
        // unitPrice: response.data.data.unitPrice,
        image: response.data.data.image,
        createdAt: response.data.data.createdAt,
        updatedAt: response.data.data.updatedAt,
      };
      dispatch({
        type: "GET_MENUS",
        payload: [uploadedData, ...menus],
      });
      navigate("/product-list");
    } catch (error) {
      setLoading(true);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.response?.data?.message
          ? error?.response?.data?.message
          : "Something went wrong!",
      });
      setLoading(false);
    }
  };

  /**
   * * Upload image to cloudinary storage
   * @params {string} image_base64
   * @returns {string} uploaded image remote url
   */

  const uploadImage = async (image_base64) => {
    setPreviewOffline(image_base64);
    try {
      const payload = {
        file: `${image_base64}`,
        upload_preset: "bxlilcsc",
      };
      const response = await axiosMain.post(
        "https://api.cloudinary.com/v1_1/dmvaqisig/image/upload",
        payload
      );
      return response?.data?.secure_url;
    } catch (error) {}
  };

  const handleUrlImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(async () => {
        setLoadingImage(true);
        let res = await uploadImage(e.target.result);
        setLoadingImage(false);
        setPreviewImage(res);
        return setSendData({
          ...sendData,
          image: res,
        });
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <PageLayout>
      <Row>
        <Col xl={12}>
          <CardLayout>
            <Breadcrumb title={data?.pageTitle}>
              {data?.breadcrumb.map((item, index) => (
                <li key={index} className="mc-breadcrumb-item">
                  {item.path ? (
                    <Anchor className="mc-breadcrumb-link" href={item.path}>
                      {item.text}
                    </Anchor>
                  ) : (
                    item.text
                  )}
                </li>
              ))}
            </Breadcrumb>
          </CardLayout>
        </Col>
        <Col xl={8}>
          <CardLayout>
            <CardHeader title="basic information" />
            <Row>
              <Col xl={12}>
                <LabelField
                  type="text"
                  label="item name"
                  fieldSize="w-100 h-md"
                  name="itemName"
                  onChange={handleChange}
                  defaultValue={sendData.itemName}
                />
              </Col>

              <Col xl={6}>
                <Box className={`mc-label-field-group label-col`}>
                  <Label className="mc-label-field-title">Category</Label>
                  <Select
                    name="category"
                    onChange={handleChange}
                    className="mc-label-field-select w-100 h-md"
                    defaultValue={sendData.category}
                  >
                    <Option value="">Select Option</Option>
                    {categories.map((item, index) => (
                      <Option key={index} value={item?._id}>
                        {item?.category}
                      </Option>
                    ))}
                  </Select>
                </Box>
              </Col>

              {/* <Col xl={12}>
        <LabelField
          type="text"
          label="regular price"
          fieldSize="w-100 h-md"
          name="unitPrice"
          onChange={handleChange}
          defaultValue={sendData.unitPrice}
        />
      </Col> */}

              {/* Adult Male Price Fields */}
              <Col xl={12}>
                <CardHeader title="Adult Male Price" />
                <Row>
                  <Col xl={6}>
                    <LabelField
                      type="number"
                      label="Ordinary Price"
                      fieldSize="w-100 h-md"
                      name="adultMalePrice.ordinary"
                      onChange={handleChange}
                      defaultValue={sendData.adultMalePrice?.ordinary}
                    />
                  </Col>
                  <Col xl={6}>
                    <LabelField
                      type="number"
                      label="Ironed Price"
                      fieldSize="w-100 h-md"
                      name="adultMalePrice.ironed"
                      onChange={handleChange}
                      defaultValue={sendData.adultMalePrice?.ironed}
                    />
                  </Col>
                </Row>
              </Col>

              {/* Adult Female Price Fields */}
              <Col xl={12}>
                <CardHeader title="Adult Female Price" />
                <Row>
                  <Col xl={6}>
                    <LabelField
                      type="number"
                      label="Ordinary Price"
                      fieldSize="w-100 h-md"
                      name="adultFemalePrice.ordinary"
                      onChange={handleChange}
                      defaultValue={sendData.adultFemalePrice?.ordinary}
                    />
                  </Col>
                  <Col xl={6}>
                    <LabelField
                      type="number"
                      label="Ironed Price"
                      fieldSize="w-100 h-md"
                      name="adultFemalePrice.ironed"
                      onChange={handleChange}
                      defaultValue={sendData.adultFemalePrice?.ironed}
                    />
                  </Col>
                </Row>
              </Col>

              {/* Children Price Fields */}
              <Col xl={12}>
                <CardHeader title="Children Price" />
                <Row>
                  <Col xl={6}>
                    <LabelField
                      type="number"
                      label="Ordinary Price"
                      fieldSize="w-100 h-md"
                      name="childrenPrice.ordinary"
                      onChange={handleChange}
                      defaultValue={sendData.childrenPrice?.ordinary}
                    />
                  </Col>
                  <Col xl={6}>
                    <LabelField
                      type="number"
                      label="Ironed Price"
                      fieldSize="w-100 h-md"
                      name="childrenPrice.ironed"
                      onChange={handleChange}
                      defaultValue={sendData.childrenPrice?.ironed}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </CardLayout>
        </Col>

        <Col xl={4}>
          <CardLayout className="mb-4">
            <CardHeader title="Categories" />
            <Box className="mb-4">
              <Label>Add Category</Label>
              <LabelField
                type="textfield"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category"
              />
              <Button
                onClick={handleAddCategory}
                className="mc-btn primary mt-2"
              >
                Add Category
              </Button>
            </Box>
            <Box className="mc-product-upload-organize p-2">
              <Row>
                {categories.map((cat) => (
                  <Col xl={12} key={cat._id} className="mb-2">
                    {editingCategory === cat._id ? (
                      <>
                        {/* Input field for editing category */}
                        <LabelField
                          type="text"
                          value={editedCategoryName}
                          onChange={(e) =>
                            setEditedCategoryName(e.target.value)
                          }
                          placeholder="Edit category name"
                        />
                        <div className="d-flex gap-1 align-items-center">
                        <Button
                          onClick={handleUpdateCategory}
                          className="mc-btn primary mt-2"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          className="mc-btn btn btn-danger mt-2"
                        >
                          Cancel
                        </Button>
                        </div>
                        
                      </>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center">
                        <div
                          style={{
                            display: "inline-block",
                            marginRight: "10px",
                          }}
                        >
                          {cat.category}
                        </div>
                        <div>
                          <span
                            style={{
                              cursor: "pointer",
                              marginRight: "10px",
                              color: "blue",
                            }}
                            onClick={() => handleEditCategory(cat)}
                          >
                            <i className="fa fa-edit">✎</i>
                          </span>
                          <span
                            style={{ cursor: "pointer", color: "red" }}
                            onClick={() => handleRemove(cat._id)}
                          >
                            <i className="fa fa-trash">x</i>
                          </span>
                        </div>
                      </div>
                    )}
                  </Col>
                ))}
              </Row>
            </Box>
          </CardLayout>
        </Col>
        <Col xl={12}>
          <CardLayout>
            <CardHeader title="media &amp; published" />
            <Box className="mc-product-upload-media">
              {previewOffline ? (
                <Box className="mc-product-upload-image">
                  <Image src={previewOffline} alt="product image" />
                </Box>
              ) : (
                previewImage && (
                  <Box className="mc-product-upload-image">
                    <Image src={previewImage} alt="product image" />
                  </Box>
                )
              )}
              <Box className="mc-product-upload-file">
                <Input
                  type="file"
                  id="product"
                  type="file"
                  name="image"
                  onChange={(e) => handleUrlImage(e.target.files[0])}
                />
                <Label htmlFor="product">
                  <Icon type="collections" />
                  <Text>{loadingImage ? `Uploading....` : uploadFile}</Text>
                </Label>
              </Box>
            </Box>
            <Anchor
              className="mc-btn w-100 primary mt-5"
              onClick={() => handleSubmitMenu()}
              text={
                loadingImage
                  ? `uploading...`
                  : loading
                  ? `publishing...`
                  : `publish`
              }
              icon="cloud_upload"
              href="#"
            />
          </CardLayout>
        </Col>
      </Row>
    </PageLayout>
  );
}
