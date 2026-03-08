import React, { useState, useEffect } from "react";
import ProductForm from "./ProductForm";
import api, { getImageUrl } from "../../config/api";
import { FiPlus, FiEdit3, FiTrash2, FiBox, FiPackage } from "react-icons/fi";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = () => {
    api
      .get("/products/mine")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this artwork?")) return;
    try {
      await api.delete(`/products/delete/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-light text-gray-900 mb-3">
              My Collection
            </h2>
            <p className="text-gray-500 text-base">
              {products.length} Active Listings
            </p>
          </div>

          <button
            onClick={() => setOpenForm(true)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-rose-600 text-white rounded-full font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/20 active:scale-95"
          >
            <FiPlus className="text-lg" />
            Add Collection
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gray-200 mb-12" />

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <div className="p-6 bg-gray-50 rounded-full mb-6">
              <FiBox size={48} className="text-gray-300" />
            </div>
            <h3 className="text-3xl font-light text-gray-900 mb-3">
              Your gallery is empty
            </h3>
            <p className="text-gray-500 text-base">
              Ready to showcase your creativity? Upload your first masterpiece
              today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p) => (
              <div
                key={p._id}
                className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Image Wrapper */}
                <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
                  <img
                    src={getImageUrl(p.images[0])}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black shadow-sm">
                      {p.category || "Original Art"}
                    </span>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setOpenForm(true);
                      }}
                      className="p-3 bg-white text-black rounded-full hover:bg-gray-100 transition"
                    >
                      <FiEdit3 size={18} />
                    </button>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="p-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight truncate mb-2">
                    {p.title}
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-black text-rose-600">
                      ₹{p.price.toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                      <FiPackage /> {p.stock || 0} In Stock
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {openForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl relative">
            <ProductForm
              product={editingProduct}
              onClose={() => {
                setOpenForm(false);
                setEditingProduct(null);
              }}
              onProductAdded={fetchProducts}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
