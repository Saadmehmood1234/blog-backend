import mongoose, { Schema } from "mongoose";
import { SubscriberType } from "../config/Types";

const BlogSubscriberSchema = new Schema<SubscriberType>(
  {
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

    isUnsubscribed: {
      type: Boolean,
      default: false,
    },

    unsubscribedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.models.BlogSubscriber<SubscriberType> ||
  mongoose.model<SubscriberType>("BlogSubscriber", BlogSubscriberSchema);
