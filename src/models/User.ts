import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false, // Security: Don't return password by default
  },
  phone: {
    type: String,
    default: "",
  },
  // Cloudinary Data
  profileImage: {
    type: String,
    default: "",
  },
  publicId: { // Used to delete image from Cloudinary
    type: String,
    default: "",
  },
  qrCode: {
    type: String,
    default: "",
  },
  qrPublicId: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent model overwrite error in dev mode
export default mongoose.models.User || mongoose.model("User", UserSchema);