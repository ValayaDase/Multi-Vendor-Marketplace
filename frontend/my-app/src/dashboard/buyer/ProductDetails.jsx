import React, { useEffect, useState } from "react";
import { Leaf, MapPin, ShieldCheck, Truck } from "lucide-react";
import { AiOutlineHeart, AiFillStar } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import api, { getImageUrl } from "../../config/api";
import {
  ecoBadgeClasses,
  formatCategory,
  formatCurrency,
  formatProductLocation,
  getEcoLabel,
} from "../../utils/marketplace";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [inCart, setInCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const buyNow = () => {
    if (!isAvailable) return;

    localStorage.setItem(
      "checkoutItem",
      JSON.stringify({
        mode: "single",
        productId: product._id,
        sellerId: product.seller?._id || product.seller,
        price: product.price,
        quantity: 1,
        title: product.title,
        image: product.thumbnail || product.images?.[0],
      }),
    );

    navigate("/buyer/checkout");
  };

  const checkCart = async () => {
    if (!localStorage.getItem("token")) return;
    const res = await api.get("/cart");
    setInCart(res.data.some((item) => item.product._id === id));
  };

  useEffect(() => {
    const fetchProductAndSeller = async () => {
      try {
        const productRes = await api.get(`/products/${id}`);
        setProduct(productRes.data);
        setSeller(productRes.data.seller || null);
        await checkCart();
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    if (id) fetchProductAndSeller();
  }, [id]);

  const saveProduct = async () => {
    if (!localStorage.getItem("token")) return alert("Please login");
    const res = await api.post("/products/save", { productId: id });
    alert(res.data.msg);
  };

  const addToCart = async () => {
    if (!isAvailable) return alert("This product is no longer available to buy.");
    if (!localStorage.getItem("token")) return alert("Please login");
    const res = await api.post("/cart/add", { productId: id });
    alert(res.data.msg);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (!product) {
    return <div className="rounded-[2rem] bg-white p-10 shadow-sm">Loading product...</div>;
  }

  const gallery = product.images?.length ? product.images : [product.thumbnail];
  const heroImage = gallery[activeImage] || gallery[0];
  const ecoClass = ecoBadgeClasses[product.ecoScore?.badgeColor || "yellow"];
  const isAvailable = product.status === "approved" && product.stock > 0 && seller?.role === "seller";

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
      >
        Back
      </button>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative">
              <img src={getImageUrl(heroImage)} alt={product.title} className="h-[520px] w-full object-cover" />
              <div className={`absolute left-5 top-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.25em] ${ecoClass}`}>
                <Leaf className="h-4 w-4" />
                Eco {product.ecoScore?.score || 0}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3 p-4">
              {gallery.slice(0, 5).map((image, index) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-2xl border ${activeImage === index ? "border-slate-900" : "border-slate-200"}`}
                >
                  <img src={getImageUrl(image)} alt={`${product.title} ${index + 1}`} className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">Eco & Essential Information</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Eco label" value={getEcoLabel(product.ecoScore?.score)} />
              <Info label="Category" value={formatCategory(product.category)} />
              <Info label="Brand" value={product.brand || "-"} />
              <Info label="Origin" value={product.origin || "-"} />
              <Info label="Weight" value={product.weight || "-"} />
              <Info label="Warranty" value={product.warranty || "-"} />
              <Info label="Material" value={product.ecoScore?.materialType || "-"} />
              <Info label="Packaging" value={product.ecoScore?.packagingType || "-"} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{formatCategory(product.category)}</p>
            <h1 className="mt-2 text-4xl font-light text-slate-900">{product.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <p className="text-4xl font-black text-slate-900">{formatCurrency(product.price)}</p>
                <div className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white">
                  <AiFillStar size={16} />
                  {seller?.sellerRating || seller?.rating || 4.4}
                </div>
            </div>
            <p className="mt-4 text-base leading-7 text-slate-600">{product.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.25em] ${ecoClass}`}>
                {getEcoLabel(product.ecoScore?.score)}
              </span>
              {formatProductLocation(product.location) && (
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                  <MapPin className="h-4 w-4" />
                  {formatProductLocation(product.location)}
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                <Truck className="h-4 w-4" />
                Stock {product.stock}
              </span>
              {!isAvailable && (
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
                  Currently unavailable
                </span>
              )}
            </div>
          </div>

          {seller && (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Seller Information</h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <Info label="Seller Name" value={seller.name} />
                <Info label="Business" value={seller.businessName || seller.businessDetails?.businessName || "Verified marketplace seller"} />
                <Info label="Location" value={formatProductLocation(seller.location || seller)} />
                <Info label="Rating" value={seller.sellerRating || seller.rating || 4.4} />
              </div>
            </div>
          )}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Delivery Coverage</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(product.deliveryAreas || []).length > 0 ? (
                product.deliveryAreas.map((area) => (
                  <span key={area} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    {area}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">Seller has not added delivery area details yet.</p>
              )}
            </div>
          </div>

          <div className="sticky bottom-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
            {!isAvailable && (
              <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                This product cannot be purchased anymore because it is out of stock or the seller is no longer active.
              </div>
            )}
            <div className="flex gap-3">
              {inCart ? (
                <button
                  onClick={() => navigate("/buyer/cart")}
                  disabled={!isAvailable}
                  className="flex-1 rounded-2xl bg-emerald-600 px-5 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  View Cart
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await addToCart();
                    setInCart(true);
                  }}
                  disabled={!isAvailable}
                  className="flex-1 rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add to Cart
                </button>
              )}
              <button
                onClick={buyNow}
                disabled={!isAvailable}
                className="flex-1 rounded-2xl bg-amber-500 px-5 py-4 text-base font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
            <button
              onClick={saveProduct}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-rose-600"
            >
              <AiOutlineHeart size={18} />
              Save for later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}
