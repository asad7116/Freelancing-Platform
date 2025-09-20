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
