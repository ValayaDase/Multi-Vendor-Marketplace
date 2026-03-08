import Product from "../models/Product.js";

export const globalSearch = async (req, res) => {
  try {
    const q = req.query.query ? req.query.query.trim() : "";

    // Agar search query khali hai, toh empty list bhej dein
    if (!q) {
      return res.json({ products: [] });
    }

    // Regex ka use karke search, 'i' ka matlab hai Case Insensitive (e.g., 'art' search karne par 'Art' bhi dikhega)
    const regex = new RegExp(q, "i");

    // Sirf Product model se data nikal rahe hain
    const products = await Product.find({
      $or: [
        { title: regex },
        { category: regex }, // Agar aap category bhi search mein chahte hain
      ],
    })
      .select("title price images _id")
      .limit(20) // Limit lagana zaroori hai performance ke liye
      .lean(); // Lean ka use memory bachane ke liye

    res.json({ products });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ msg: "Server error, search nahi ho pa raha hai" });
  }
};
