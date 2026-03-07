import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AiOutlineHeart, AiFillStar } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api, {getImageUrl} from "../../config/api";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [inCart, setInCart] = useState(false);
  const navigate = useNavigate();

  const buyNow = () => {
    localStorage.setItem(
      "checkoutItem",
      JSON.stringify({
        mode: "single",
        productId: product._id,
        sellerId: product.seller,
        price: product.price,
        quantity: 1
      })
    );

    navigate("/buyer/checkout");
  };


  const checkCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await api.get("/cart");

    const exists = res.data.some((item) => item.product._id === id);
    setInCart(exists);
  };

  useEffect(() => {
  const fetchProductAndSeller = async () => {
    try {
      // 1. Pehle product fetch karein
      const productRes = await api.get(`/products/${id}`);
      const productData = productRes.data;
      setProduct(productData);

      // 2. Ab check karein ki sellerId valid hai ya nahi
      if (productData.seller) {
        const sellerRes = await api.get(`/seller/${productData.seller}`);
        setSeller(sellerRes.data);
      }

      // 3. Cart check karein
      await checkCart();
      
    } catch (err) {
      console.error("Error fetching data:", err);
      // Agar error aaye toh user ko batayein ya state handle karein
    }
  };

  if (id) {
    fetchProductAndSeller();
  }
}, [id]);

  // Function to save product
  const saveProduct = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login");

    const res = await api.post("/products/save",{ productId: id },);
    alert(res.data.msg);
  };

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login");

    const res = await api.post("/cart/add",{ productId: id });

    alert(res.data.msg);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (!product)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading artwork...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-full mb-6 transition-all hover:shadow-md"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT - IMAGE SECTION */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <div className="relative">
                <img
                  src={getImageUrl(product.images[0])}
                  alt={product.title}
                  className="w-full h-[550px] object-cover"
                />

                {/* Free Delivery Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-full shadow-lg">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Free Delivery
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <div className="p-4 flex justify-center border-t border-slate-100">
                <button
                  onClick={saveProduct}
                  className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all"
                >
                  <AiOutlineHeart
                    size={20}
                    className="group-hover:text-red-500 transition-colors"
                  />
                  <span className="font-medium">Save for Later</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT - INFO SECTION */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <h1 className="text-4xl font-light text-slate-900 mb-3">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-bold text-slate-900">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
                <span className="text-slate-500 text-base">
                  inclusive of all taxes
                </span>
              </div>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold">
                  <AiFillStar size={16} />
                  <span>4.3</span>
                </div>
                <p className="text-slate-600 text-sm">
                  1,220 Ratings • 350 Reviews
                </p>
              </div>
            </div>

            {/* Seller Information */}
            {seller && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 rounded-full bg-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Seller Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-sm">Seller Name:</span>
                    <span className="font-medium text-slate-900">
                      {seller.name}
                    </span>
                  </div>

                  
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Select Size
              </h3>
              <button className="px-6 py-2.5 border-2 border-slate-900 text-slate-900 rounded-full hover:bg-slate-900 hover:text-white transition-all font-medium">
                Free Size
              </button>
            </div>

            {/* Product Highlights */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Product Highlights
              </h3>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      Category
                    </p>
                    <p className="font-semibold text-slate-900">
                      {product.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                      Stock Available
                    </p>
                    <p className="font-semibold text-slate-900">
                      {product.stock} units
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                      Description
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 rounded-2xl p-6 shadow-lg">
              <div className="flex gap-4">
                {inCart ? (
                  <button
                    onClick={() => navigate("/buyer/cart")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    View Cart
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await addToCart();
                      setInCart(true); //  Update UI instantly
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                )}

                <button onClick={buyNow} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  Buy Now
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">
                🔒 Secure checkout • Easy returns within 7 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
