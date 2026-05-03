import React, { useEffect, useMemo, useState } from "react";
import { MdClose, MdCloudUpload } from "react-icons/md";
import { Leaf, MapPin, PackageCheck } from "lucide-react";
import api, { getImageUrl } from "../../config/api";

const CATEGORY_LIST = [
  { label: "Fashion & Apparel", value: "fashion" },
  { label: "Home & Kitchen", value: "home-kitchen" },
  { label: "Electronics", value: "electronics" },
  { label: "Beauty & Personal Care", value: "beauty" },
  { label: "Footwear", value: "footwear" },
];

const INPUT_CLASS =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black";

const defaultInputs = {
  title: "",
  description: "",
  price: "",
  stock: 1,
  category: "fashion",
  brand: "",
  origin: "",
  weight: "",
  warranty: "",
  materialType: "mixed",
  packagingType: "standard",
  carbonImpact: "medium",
  city: "",
  state: "",
  pincode: "",
};

const ProductForm = ({ onClose, onProductAdded, product, isAdmin = false }) => {
  const [inputs, setInputs] = useState(defaultInputs);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) {
      setInputs(defaultInputs);
      setExistingImages([]);
      setImageFiles([]);
      return;
    }

    setInputs({
      title: product.title || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || 1,
      category: product.category || "fashion",
      brand: product.brand || "",
      origin: product.origin || "",
      weight: product.weight || "",
      warranty: product.warranty || "",
      materialType: product.ecoScore?.materialType || "mixed",
      packagingType: product.ecoScore?.packagingType || "standard",
      carbonImpact: product.ecoScore?.carbonImpact || "medium",
      city: product.location?.city || "",
      state: product.location?.state || "",
      pincode: product.location?.pincode || "",
    });
    setExistingImages(product.images || []);
    setImageFiles([]);
  }, [product]);

  const previewImages = useMemo(() => {
    if (imageFiles.length > 0) {
      return imageFiles.map((file) => ({
        key: file.name,
        src: URL.createObjectURL(file),
      }));
    }

    return existingImages.map((src) => ({ key: src, src: getImageUrl(src) }));
  }, [existingImages, imageFiles]);

  const updateField = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    if (files.length === 0) return;
    setImageFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    Object.entries(inputs).forEach(([key, value]) => form.append(key, value));
    form.append("existingImages", JSON.stringify(existingImages));

    imageFiles.forEach((file) => {
      form.append("images", file);
    });

    try {
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (product) {
        await api.put(
          isAdmin ? `/admin/products/update/${product._id}` : `/products/update/${product._id}`,
          form,
          config,
        );
        alert(isAdmin ? "Product updated by admin successfully!" : "Product updated successfully!");
      } else {
        if (imageFiles.length === 0) {
          setLoading(false);
          return alert("Please upload between 1 and 5 product images.");
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
            {product ? "Edit Listing" : "New Listing"}
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">
            {isAdmin ? "Admin override mode for product review and correction" : "Add product details, eco data, and location details"}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-black transition">
          <MdClose size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Product Title" required>
            <input
              required
              type="text"
              value={inputs.title}
              className={INPUT_CLASS}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </Field>
          <Field label="Category">
            <select
              className={INPUT_CLASS}
              value={inputs.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              {CATEGORY_LIST.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description" required className="md:col-span-2">
            <textarea
              required
              rows="4"
              value={inputs.description}
              className={INPUT_CLASS}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </Field>
          <Field label="Price (₹)" required>
            <input
              required
              type="number"
              min="0"
              value={inputs.price}
              className={INPUT_CLASS}
              onChange={(e) => updateField("price", e.target.value)}
            />
          </Field>
          <Field label="Stock" required>
            <input
              required
              type="number"
              min="0"
              value={inputs.stock}
              className={INPUT_CLASS}
              onChange={(e) => updateField("stock", e.target.value)}
            />
          </Field>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Brand">
            <input value={inputs.brand} className={INPUT_CLASS} onChange={(e) => updateField("brand", e.target.value)} />
          </Field>
          <Field label="Origin">
            <input value={inputs.origin} className={INPUT_CLASS} onChange={(e) => updateField("origin", e.target.value)} />
          </Field>
          <Field label="Weight">
            <input value={inputs.weight} className={INPUT_CLASS} onChange={(e) => updateField("weight", e.target.value)} />
          </Field>
          <Field label="Warranty">
            <input value={inputs.warranty} className={INPUT_CLASS} onChange={(e) => updateField("warranty", e.target.value)} />
          </Field>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-900">Eco Score Inputs</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Material">
              <select className={INPUT_CLASS} value={inputs.materialType} onChange={(e) => updateField("materialType", e.target.value)}>
                <option value="plastic">Plastic-heavy</option>
                <option value="mixed">Mixed</option>
                <option value="natural">Natural</option>
                <option value="recycled">Recycled</option>
              </select>
            </Field>
            <Field label="Packaging">
              <select className={INPUT_CLASS} value={inputs.packagingType} onChange={(e) => updateField("packagingType", e.target.value)}>
                <option value="plastic">Plastic</option>
                <option value="standard">Standard</option>
                <option value="eco">Eco</option>
              </select>
            </Field>
            <Field label="Carbon Impact">
              <select className={INPUT_CLASS} value={inputs.carbonImpact} onChange={(e) => updateField("carbonImpact", e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </Field>
          </div>
        </section>

        <section className="rounded-3xl border border-sky-100 bg-sky-50/60 p-5">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-sky-700" />
            <h3 className="text-sm font-black uppercase tracking-widest text-sky-900">Product Location & Delivery</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="City" required>
              <input required value={inputs.city} className={INPUT_CLASS} onChange={(e) => updateField("city", e.target.value)} />
            </Field>
            <Field label="State" required>
              <input required value={inputs.state} className={INPUT_CLASS} onChange={(e) => updateField("state", e.target.value)} />
            </Field>
            <Field label="Pincode" required>
              <input required value={inputs.pincode} className={INPUT_CLASS} onChange={(e) => updateField("pincode", e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-100 bg-amber-50/60 p-5">
          <div className="flex items-center gap-3 mb-4">
            <PackageCheck className="w-5 h-5 text-amber-700" />
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-900">Product Images</h3>
          </div>
          <label className="block border-2 border-dashed border-amber-200 rounded-3xl p-5 text-center cursor-pointer hover:bg-white/70 transition">
            <MdCloudUpload size={28} className="mx-auto text-amber-500 mb-2" />
            <p className="text-sm font-semibold text-gray-700">Upload up to 5 images</p>
            <p className="text-xs text-gray-500 mt-1">The first image becomes the thumbnail on buyer cards</p>
            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
          </label>

          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">
              {previewImages.map((image, index) => (
                <div key={image.key} className="space-y-2">
                  <img src={image.src} alt={`Preview ${index + 1}`} className="h-28 w-full object-cover rounded-2xl border border-white shadow-sm" />
                  <p className="text-[11px] text-center font-bold uppercase tracking-widest text-gray-500">
                    {index === 0 ? "Thumbnail" : `Image ${index + 1}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <button
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition duration-300 shadow-xl ${
            loading ? "bg-gray-200 text-gray-400" : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {loading ? "Processing..." : product ? "Update product" : "Publish product"}
        </button>
      </form>
    </div>
  );
};

const Field = ({ label, children, required, className = "" }) => (
  <label className={`space-y-1 ${className}`}>
    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
      {label} {required ? "*" : ""}
    </span>
    {children}
  </label>
);

export default ProductForm;
