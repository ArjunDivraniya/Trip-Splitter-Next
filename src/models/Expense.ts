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
    // REMOVED ENUM to allow custom categories from "Other" input
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
  // Split type: equally, unequally, percentage, shares
  splitType: {
    type: String,
    enum: ["equally", "unequally", "percentage", "shares"],
    default: "equally",
  },
  // Custom split amounts for each user (for unequally, percentage, shares)
  splitAmounts: {
    type: Map,
    of: Number,
    default: {},
  },
  // Split percentages for each user (for percentage split type)
  splitPercentages: {
    type: Map,
    of: Number,
    default: {},
  },
  // Split shares for each user (for shares split type)
  splitShares: {
    type: Map,
    of: Number,
    default: {},
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);