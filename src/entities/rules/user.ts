
import { Types,Document } from "mongoose";
export interface Address {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: number | null;
}

export interface User extends Document {
  name: string;
  email: string;
  phone: string | null;
  dob: Date | null;
  image?: string | null;
  gender: "male" | "female" | null;
  isBlocked: boolean;
  password: string;
  address?: Address | null;
  otp?: string;
  bloodGroup: string | null;
  register: string;
  isComplete:boolean
}
export interface MongoUser extends User {}