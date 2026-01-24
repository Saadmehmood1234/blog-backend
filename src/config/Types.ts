import mongoose from "mongoose";

export interface CustomError {
  message: string;
  statusCode: number;
}
export interface IView extends Document {
  blog: mongoose.Types.ObjectId;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  isVerified?:boolean;
  verificationToken?:boolean;
  verificationTokenExpiresAt?:Date
  password: string;
  role: "admin";
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: mongoose.Types.ObjectId;
  tags: string[];
  isDeleted:Boolean;
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  status: "draft" | "published";
  views: number;
  readTime: number;
}

export interface QueryType {
  title?: string;
  category?: string;
  isDeleted?:boolean
  isFeatured?: string;
  search?: string;
  tags?: [];
  readTime?: string;
  createdAt?: string;
  page?: number;
  status?: "published" | "draft";
}

export interface SubscriberType {
  email: string;
  isVerified: boolean;
  verificationToken: string;
  verificationTokenExpiresAt: Date;
  isUnsubscribed: boolean;
  unsubscribedAt: Date;
}
