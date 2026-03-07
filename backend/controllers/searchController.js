import User from "../models/User.js";
import Product from "../models/Product.js";
// import Studio from "../models/Studio.js";

export const globalSearch = async (req, res) => {
  try {
    const q = req.query.query || "";

    if (!q.trim()) {
      return res.json({ artists: [], products: [] });
    }

    const regex = { $regex: q, $options: "i" };

    // 1️⃣ Find matching sellers
    let artists = await User.find({
      role: "seller",
      name: regex
    }).select("name sellerBio bio _id");

    // 2️⃣ Get all seller IDs who have a studio
    const studios = await Studio.find().select("seller");
    const sellersWithStudio = new Set(studios.map(s => s.seller.toString()));

    // 3️⃣ Filter out sellers who do NOT have a studio
    artists = artists.filter(a => sellersWithStudio.has(a._id.toString()));

    // 4️⃣ Products search (unchanged)
    const products = await Product.find({
      title: regex
    }).select("title price images _id");

    res.json({ artists, products });

  } catch (err) {
    res.status(500).json({ msg: "Search error", error: err });
  }
};
