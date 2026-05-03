import Product from "../models/Product.js";
import User from "../models/User.js";

export const globalSearch = async (req, res) => {
  try {
    const q = (req.query.query || "").trim();
    const location = (req.query.location || "").trim();

    if (!q && !location) {
      return res.json({ sellers: [], products: [] });
    }

    const queryConditions = [];

    if (q) {
      queryConditions.push(
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
      );
    }

    const productFilters = { status: "approved", stock: { $gt: 0 }, isDeleted: false };

    if (queryConditions.length > 0) {
      productFilters.$or = queryConditions;
    }

    if (location) {
      productFilters.$and = [
        ...(productFilters.$and || []),
        {
          "location.state": { $regex: location, $options: "i" },
        },
      ];
    }

    const sellerFilters = { role: "seller", status: "active" };
    const sellerSearch = [];

    if (q) {
      sellerSearch.push(
        { name: { $regex: q, $options: "i" } },
        { "businessDetails.businessName": { $regex: q, $options: "i" } },
      );
    }

    if (location) {
      sellerSearch.push(
        { "location.state": { $regex: location, $options: "i" } },
      );
    }

    if (sellerSearch.length > 0) {
      sellerFilters.$or = sellerSearch;
    }

    const [products, sellers] = await Promise.all([
      Product.find(productFilters)
        .select("title price images thumbnail category ecoScore location deliveryAreas brand _id")
        .limit(16)
        .sort({ createdAt: -1 }),
      User.find(sellerFilters)
        .select("name businessDetails sellerRating location _id")
        .limit(8)
        .sort({ createdAt: -1 }),
    ]);

    res.json({ sellers, products });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ msg: "Search error" });
  }
};
