import mongoose from "mongoose";

const TripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a trip name"],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, "Please provide a destination"],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, "Please provide a start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please provide an end date"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      email: { type: String, required: true },
      // Optional: Link to a User ID if they already have an account
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
      status: { type: String, default: "invited" }, // 'invited' | 'joined'
    },
  ],
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }], // For future use
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);