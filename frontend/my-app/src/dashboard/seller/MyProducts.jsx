import React, { useEffect, useState } from "react";
import { FiBox, FiEdit3, FiPackage, FiPlus, FiTrash2 } from "react-icons/fi";
import ProductForm from "./ProductForm";
import api, { getImageUrl } from "../../config/api";
import { ecoBadgeClasses, formatCurrency, getEcoLabel } from "../../utils/marketplace";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = () => {
    api.get("/products/mine").then((res) => setProducts(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product? It will be hidden from buyers but kept safely in the system.")) return;
    try {
      const res = await api.delete(`/products/delete/${id}`);
      alert(res.data.msg || "Product hidden from buyers.");
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900">My Products</h1>
          <p className="mt-2 text-sm text-slate-500">Add, edit, delete, and review approval status for every listing.</p>
        </div>
        <button
          onClick={() => setOpenForm(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          <FiPlus />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white py-24 text-center">
          <FiBox size={46} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-2xl font-semibold text-slate-900">No products yet</h3>
          <p className="mt-2 text-slate-500">Create your first listing with up to 5 product images and eco details.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div key={product._id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="relative h-64 bg-slate-100">
                <img src={getImageUrl(product.thumbnail || product.images?.[0])} alt={product.title} className="h-full w-full object-cover" />
                <div className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${ecoBadgeClasses[product.ecoScore?.badgeColor || "yellow"]}`}>
                  {getEcoLabel(product.ecoScore?.score)}
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{product.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{product.category}</p>
                  </div>
                  <p className="text-xl font-black text-slate-900">{formatCurrency(product.price)}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2"><FiPackage /> {product.stock} stock</span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${
                    product.isDeleted
                      ? "bg-rose-50 text-rose-600"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {product.isDeleted ? "hidden" : product.status}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setOpenForm(true);
                    }}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    <span className="inline-flex items-center gap-2"><FiEdit3 /> Edit</span>
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"
                    title="Product will be hidden from buyers"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {openForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[2rem] bg-white shadow-2xl">
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
