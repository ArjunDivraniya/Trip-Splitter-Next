import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide an expense title"],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Please provide an amount"],
  },
  category: {
    type: String,
    required: true,
    enum: ["food", "travel", "hotel", "shopping", "entertainment", "other"],
    default: "other",
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  // Array of user IDs who are splitting this expense
  splitBetween: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);