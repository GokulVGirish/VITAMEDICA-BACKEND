import { Types, Document, ObjectId } from 'mongoose';

export interface Review {
  appointmentId:Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface OtpDoctor {
  name: string;
  email: string;
  phone: string ;
  gender: string;
  department: string;
  password: string;
  otp?: string;
  createdAt?: Date;
}

export interface MongooseOtpDoctor extends OtpDoctor, Document {
  _id: Types.ObjectId;
}

export interface Doctor {
  name: string;
  email: string;
  phone: string;
  gender: string;
  department: ObjectId;
  image: string | null;
  password: string;
  description: string | null;
  documentsUploaded: boolean;
  documents: {
    certificateImage: string | null;
    qualificationImage: string | null;
    aadarFrontImage: string | null;
    aadarBackImage: string | null;
    yearsOfExperience: number | null;
  } | null;
  isBlocked: boolean;
  status: "Pending" | "Submitted" | "Verified";
  degree: null | string;
  fees: null | string;
  complete: boolean;
  wallet: null | Types.ObjectId;
  reviews: Review[];
}

export interface MongoDoctor extends Doctor, Document {
  _id: Types.ObjectId;
}
