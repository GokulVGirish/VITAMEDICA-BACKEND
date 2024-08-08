import { IDoctorRepository } from "../../entities/irepositories/idoctorRepository";
import { MongoDoctor,OtpDoctor } from "../../entities/rules/doctor";
import doctorOtpModel from "../../frameworks/mongoose/models/TempDoctor";
import MongoDepartment from "../../entities/rules/departments";
import departmentModel from "../../frameworks/mongoose/models/departmentSchema";
import doctorModel from "../../frameworks/mongoose/models/DoctorSchema";
import { Types } from "mongoose";
import { RejectedDoctor } from "../../entities/rules/rejectedDoctor";
import rejectedDoctorModel from "../../frameworks/mongoose/models/RejectedDoctor";
import { DoctorSlots } from "../../entities/rules/slotsType";
import doctorSlotsModel from "../../frameworks/mongoose/models/DoctorSlotsSchema";

class DoctorRepository implements IDoctorRepository {
  async doctorExists(email: string): Promise<null | MongoDoctor> {
    try {
      const doctor = await doctorModel.findOne({ email: email });
      return doctor;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async tempOtpDoctor(data: OtpDoctor): Promise<{ status: true | false }> {
    try {
      const otpDoc = await doctorOtpModel.create(data);
      if (otpDoc) {
        return { status: true };
      } else {
        return { status: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async createDoctorOtp(
    otp: string
  ): Promise<{ status: boolean; message: string; doctor?: MongoDoctor }> {
    try {
      const otpDoctor = await doctorOtpModel.findOne({ otp: otp });
      if (!otpDoctor) {
        return { status: false, message: "invalid otp" };
      }
      const now = new Date();
      const expirationTime = new Date(
        otpDoctor?.time.getTime() + 2 * 60 * 1000
      );
      if (expirationTime < now) {
        return { status: false, message: "expired otp" };
      }
      const doc = await doctorModel.create({
        name: otpDoctor.name,
        email: otpDoctor.email,
        password: otpDoctor.password,
        phone: otpDoctor.phone,
        gender: otpDoctor.gender,
        department: otpDoctor.department,
      });
      return { status: true, message: "created", doctor: doc };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getDoctor(email: string): Promise<MongoDoctor | null> {
    try {
      const doctor = await doctorModel.findOne({ email: email });
      return doctor;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getDepartments(): Promise<{
    status: boolean;
    departments?: MongoDepartment[];
  }> {
    try {
      const departments = await departmentModel.find();
      if (departments) {
        return { status: true, departments: departments };
      } else {
        return {
          status: false,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async documentsUpdate(
    docId: string,
    key1: string,
    key2: string,
    key3: string,
    key4: string
  ): Promise<void> {
    try {
      await doctorModel.updateOne(
        { _id: docId },
        {
          $set: {
            documents: {
              certificateImage: key1,
              qualificationImage: key2,
              aadarFrontImage: key3,
              aadarBackImage: key4,
            },
          },
        }
      );
      await doctorModel.updateOne(
        { _id: docId },
        {
          $set: {
            documentsUploaded: true,
          },
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async docStatusChange(id: string, status: string): Promise<void> {
    try {
      await doctorModel.updateOne({ _id: id }, { $set: { status: status } });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async resendOtp(otp: string, email: string): Promise<boolean> {
    try {
      const otpDoc = await doctorOtpModel.findOne({ email: email });
      if (otpDoc) {
        otpDoc.otp = otp;
        otpDoc.time = new Date();
        await otpDoc.save();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateProfileImage(id: Types.ObjectId, imagePath: string): Promise<boolean> {
      try{
        const result=await doctorModel.updateOne({_id:id},{$set:{image:imagePath}})
        return result.modifiedCount>0

      }
      catch(error){
        throw error
      }
  }
  async profileUpdate(id: Types.ObjectId, data: { name: string; phone: string;description:string ;fees:string;degree:string}): Promise<boolean> {
      try{
        const result=await doctorModel.updateOne({_id:id},{$set:{name:data.name,phone:data.phone,description:data.description,fees:data.fees,degree:data.degree,complete:true}})
        if(result.modifiedCount>0)return true
        else return false

      }
      catch(error){
        throw error
      }
  }
  async getRejectedDoctor(email: string): Promise<RejectedDoctor | null> {
      try{
        const result=await rejectedDoctorModel.findOne({email:email})
        return result

      }
      catch(error){
        throw error
      }
  }
  async getSlot(date: Date,id:Types.ObjectId): Promise<DoctorSlots|null> {
      try{
        const result=await doctorSlotsModel.findOne({date:date,doctorId:id})
        return result

      }
      catch(error){
        throw error
      }
  }
  async createSlot(id: Types.ObjectId, data: DoctorSlots): Promise<boolean> {
      try{
        const slot=await doctorSlotsModel.create({
          doctorId:id,
          date:data.date,
          slots:data.slots.map((slot)=>({start:slot.start,end:slot.end}))

        })
       if(slot) return true
       else return false

      }
      catch(error){
        throw error
      }
  }
}
export default DoctorRepository