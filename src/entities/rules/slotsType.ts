import { Document, Schema, Types } from "mongoose";


 interface Slot extends Document {
  start: Date;
  end: Date;
  availability: boolean;
  bookedBy?: Types.ObjectId | null;
  locked:boolean;
  lockedBy:Types.ObjectId|null;
  lockExpiration:Date|null
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
