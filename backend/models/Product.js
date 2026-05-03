import mongoose from "mongoose";

const ecoScoreSchema = new mongoose.Schema(
  {
    materialType: { type: String, default: "mixed" },
    packagingType: { type: String, default: "standard" },
    carbonImpact: { type: String, default: "medium" },
    score: { type: Number, default: 0 },
    badgeColor: {
      type: String,
      enum: ["green", "yellow", "red"],
      default: "yellow",
    },
  },
  { _id: false },
);

const productLocationSchema = new mongoose.Schema(
  {
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "India" },
    pincode: { type: String, default: "" },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    thumbnail: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      default: 1,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    origin: {
      type: String,
      default: "",
      trim: true,
    },

    weight: {
      type: String,
      default: "",
      trim: true,
    },

    warranty: {
      type: String,
      default: "",
      trim: true,
    },

    ecoScore: {
      type: ecoScoreSchema,
      default: () => ({}),
    },

    location: {
      type: productLocationSchema,
      default: () => ({}),
    },

    deliveryAreas: [
      {
        type: String,
        trim: true,
      },
    ],

    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'inactive'], 
      default: 'pending' 
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedBy: {
      type: String,
      enum: ["seller", "admin", null],
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
    
    adminRemark: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
