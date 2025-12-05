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
  // Trip Status: 'active' or 'completed'
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      email: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
      // Member Status: 'invited' (pending) or 'joined' (accepted)
      status: { type: String, enum: ["invited", "joined"], default: "invited" }, 
    },
  ],
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);