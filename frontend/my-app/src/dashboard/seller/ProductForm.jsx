import React, { useState, useEffect } from "react";
import { MdClose, MdCloudUpload } from "react-icons/md";
import api from "../../config/api";

const ProductForm = ({ onClose, onProductAdded, product }) => {
  const [inputs, setInputs] = useState({
    title: "",
    description: "",
    price: "",
    stock: 1,
    category: "fashion",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // const CATEGORY_LIST = [
  //   { label: "Paintings", value: "painting" },
  //   { label: "Home Decor", value: "home-decor" },
  //   { label: "Pottery", value: "pottery" },
  //   { label: "Clay Art", value: "clay-art" },
  //   { label: "Resin Art", value: "resin-art" }
  // ];

  const CATEGORY_LIST = [
  { label: "Fashion & Apparel", value: "fashion" },
  { label: "Home & Kitchen", value: "home-kitchen" },
  { label: "Electronics", value: "electronics" },
  { label: "Beauty & Personal Care", value: "beauty" },
  { label: "Footwear", value: "footwear" },
];

  useEffect(() => {
    if (product) {
      setInputs({
        title: product.title || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || 1,
        category: product.category || "fashion",
      });
    }
  }, [product]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append("title", inputs.title);
    form.append("description", inputs.description);
    form.append("price", inputs.price);
    form.append("stock", inputs.stock);
    form.append("category", inputs.category);

    if (imageFile) {
      form.append("image", imageFile);
    }

    try {
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (product) {
        await api.put(`/products/update/${product._id}`, form, config);
        alert("Product updated successfully!");
      } else {
        if (!imageFile) {
          setLoading(false);
          return alert("Please upload a product image!");
        }
        await api.post("/products/create", form, config);
        alert("Product added successfully!");
      }

      onProductAdded();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
            {product ? "Edit Listing" : "New Listing"}
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">
            Fill in the details for your artwork
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-black transition">
          <MdClose size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Artwork Title</label>
          <input
            required
            type="text"
            value={inputs.title}
            placeholder="e.g. Starry Night Over the Sea"
            className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-sm focus:bg-white focus:border-black outline-none transition-all rounded-sm"
            onChange={(e) => setInputs({ ...inputs, title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
          <textarea
            required
            rows="3"
            value={inputs.description}
            placeholder="Describe the medium, inspiration, and size..."
            className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-sm focus:bg-white focus:border-black outline-none transition-all rounded-sm"
            onChange={(e) => setInputs({ ...inputs, description: e.target.value })}
          />
        </div>

        {/* Price & Stock Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (₹)</label>
            <input
              required
              type="number"
              value={inputs.price}
              placeholder="0.00"
              className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-sm focus:bg-white focus:border-black outline-none transition-all rounded-sm"
              onChange={(e) => setInputs({ ...inputs, price: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</label>
            <input
              required
              type="number"
              value={inputs.stock}
              placeholder="1"
              className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-sm focus:bg-white focus:border-black outline-none transition-all rounded-sm"
              onChange={(e) => setInputs({ ...inputs, stock: e.target.value })}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
          <select
            className="w-full bg-gray-50 border border-gray-100 px-4 py-3 text-sm focus:bg-white focus:border-black outline-none transition-all rounded-sm appearance-none cursor-pointer"
            value={inputs.category}
            onChange={(e) => setInputs({ ...inputs, category: e.target.value })}
          >
            {CATEGORY_LIST.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Image</label>
          <div className="relative group border-2 border-dashed border-gray-100 bg-gray-50 p-4 text-center hover:bg-gray-100 transition rounded-sm">
            <label className="cursor-pointer block">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="h-32 mx-auto object-contain rounded-sm shadow-sm" />
                  <p className="text-[10px] font-bold text-black mt-2 underline">Change Image</p>
                </div>
              ) : (
                <div className="py-4">
                  <MdCloudUpload size={30} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-500 uppercase">Click to upload photo</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          disabled={loading}
          className={`w-full py-4 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition duration-300 shadow-xl ${
            loading ? "bg-gray-200 text-gray-400" : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {loading ? "Processing..." : product ? "Update product" : "Publish product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;