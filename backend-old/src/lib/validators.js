// backend/src/lib/validators.js
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 chars"),
  role: z.enum(["client", "freelancer"]).default("client"),
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const gigSchema = z.object({
  gigTitle: z.string().min(1, "Gig title is required"),
  category: z.string().min(1, "Category is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  price: z.string().min(1, "Price is required"), // You can change this to z.number() if you'd prefer
  deliveryTime: z.string().min(1, "Delivery time is required"),
  revisions: z.string().min(1, "Revisions count is required"),
  additionalNotes: z.string().optional(), // Optional field
});