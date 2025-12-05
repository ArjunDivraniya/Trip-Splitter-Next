import mongoose from "mongoose";

const PackingItemSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: "Other", // Default category
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.PackingItem || mongoose.model("PackingItem", PackingItemSchema);