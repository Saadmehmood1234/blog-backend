import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../config/Types";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User<IUser> || mongoose.model<IUser>("User", UserSchema);
export default User;
