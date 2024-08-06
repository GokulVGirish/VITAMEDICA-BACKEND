import { Document, Schema, Types } from "mongoose";


interface Slot {
  start: Date;
  end: Date;
  availability: boolean;
  bookedBy?: Types.ObjectId | null;
}


interface DoctorSlots extends Document {
  doctorId: Types.ObjectId;
  date: Date;
  slots: Slot[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export { Slot, DoctorSlots };
