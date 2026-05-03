import Category from "../models/Category.js";

const defaultCategories = [
  {
    name: "Fashion & Apparel",
    slug: "fashion",
    description: "Trending outfits, accessories, and style essentials.",
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Smart living, decor, and kitchen utility products.",
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Gadgets, accessories, and everyday tech.",
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty",
    description: "Beauty, skincare, and wellness essentials.",
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Comfort-first shoes, sandals, and sneakers.",
  },
];

export async function seedCategories() {
  const count = await Category.countDocuments();
  if (count > 0) return;
  await Category.insertMany(defaultCategories);
}
