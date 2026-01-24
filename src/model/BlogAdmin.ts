import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../config/Types";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
        email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    verificationTokenExpiresAt: {
      type: Date,
    },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User<IUser> || mongoose.model<IUser>("User", UserSchema);
export default User;
