import mongoose, { Schema, Document } from "mongoose";
import { IView } from "../config/Types";

const ViewSchema = new Schema<IView>(
  {
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const View =
  mongoose.models.View<IView> || mongoose.model<IView>("View", ViewSchema);
export default View;
