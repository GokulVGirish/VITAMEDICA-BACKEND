import { Types } from "mongoose";
import IUserAppointmentInteractor from "../../entities/iuse_cases/user/iAppointments";
import IUserRepository from "../../entities/irepositories/iuserRepository";
import instance from "../../frameworks/services/razorpayInstance";
import IAppointment from "../../entities/rules/appointments";
import mongoose from "mongoose";
import moment from "moment";
import crypto from "crypto";
import  { IawsS3 } from "../../entities/services/awsS3";




class UserAppointmentsInteractor implements IUserAppointmentInteractor {
  constructor(private readonly Repository: IUserRepository,private readonly AwsS3:IawsS3) {}

  async razorPayOrderGenerate(
    amount: string,
    currency: string,
    receipt: string
  ): Promise<{ status: boolean; order?: any; message: string }> {
    try {
      const totalAmount = Math.round(parseFloat(amount) * 100);
      const order = await instance.orders.create({
        amount: totalAmount.toString(),
        currency,
        receipt,
      });
      if (!order) return { status: false, message: "Something Went Wrong" };
      return { status: true, message: "Success", order: order };
    } catch (error) {
      throw error;
    }
  }
  async razorPayValidateBook(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    docId: Types.ObjectId,
    slotDetails: any,
    userId: Types.ObjectId,
    fees: string
  ): Promise<{
    status: boolean;
    message?: string;
    appointment?: IAppointment;
  }> {
    try {
      console.log("docId", docId, "slotDetails", slotDetails);
      const razorPaySecret = process.env.RazorPaySecret;

      const sha = crypto.createHmac("sha256", razorPaySecret as string);
      sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = sha.digest("hex");

      if (digest !== razorpay_signature) {
        return { status: false, message: "Payment failure" };
      }
      const slotId = slotDetails.slotTime._id;
      const isoDate = new Date(slotDetails.date).toISOString();
      const start = new Date(slotDetails.slotTime.start).toISOString();
      const end = new Date(slotDetails.slotTime.end).toISOString();
      const slotBooking = await this.Repository.bookSlot(
        docId,
        userId,
        slotId,
        isoDate
      );
      if (!slotBooking)
        return {
          status: false,
          message: "Slot is not locked by you or lock has expired.",
        };
      const totalFees = parseFloat(fees);
      const appointmentFees = (totalFees * 0.8).toFixed(2);
      const result = await this.Repository.createAppointment(
        userId,
        docId,
        isoDate,
        start,
        end,
        fees,
        razorpay_payment_id,
        appointmentFees.toString()
      );
      if (!result) return { status: false, message: "Something Went Wrong" };
      await this.Repository.doctorWalletUpdate(
        docId,
        result._id as Types.ObjectId,
        Number(appointmentFees),
        "credit",
        "Appointment Booked",
        "razorpay"
      );
      return { status: true, message: "Success", appointment: result };
    } catch (error) {
      throw error;
    }
  }

  async lockSlot(
    userId: Types.ObjectId,
    docId: Types.ObjectId,
    date: Date,
    slotId: Types.ObjectId
  ): Promise<{ status: boolean; message?: string; errorCode?: string }> {
    try {
      const lockExpiration = new Date(Date.now() + 5 * 60 * 1000);
      const isoDate = new Date(date).toISOString();
      const response = await this.Repository.lockSlot(
        userId,
        docId,
        isoDate,
        slotId,
        lockExpiration
      );
      if (!response)
        return {
          status: false,
          message: "Slot is already locked or not available.",
        };
      return { status: true, message: "Slot locked successfully." };
    } catch (error) {
      throw error;
    }
  }
  async getAppointments(
    page: number,
    limit: number,
    userId: Types.ObjectId
  ): Promise<{
    status: boolean;
    message: string;
    appointments?: IAppointment[];
    totalPages?: number;
  }> {
    try {
      const response = await this.Repository.getAppointments(
        page,
        limit,
        userId
      );

      if (!response.status)
        return { status: false, message: "No appointments" };
      return {
        status: true,
        appointments: response.appointments,
        totalPages: response.totalPages,
        message: "success",
      };
    } catch (error) {
      throw error;
    }
  }

  async cancelAppointment(
    userId: Types.ObjectId,
    appointmentId: string,
    date: Date,
    startTime: Date,
    reason: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const appointment = await this.Repository.getAppointment(appointmentId);
      if (!appointment)
        return { status: false, message: "Something went wrong" };

      const now = moment();
      const appointmentCreationTime = moment(appointment.createdAt);
      if (now.diff(appointmentCreationTime, "hours") > 4) {
        return {
          status: false,
          message:
            "You can only cancel the appointment within 4 hours of making it.",
        };
      }

      const refundAmount = Number(appointment.fees) * 0.8;

      const appointmentCancel = await this.Repository.cancelAppointment(
        appointmentId
      );
      if (!appointmentCancel.status)
        return { status: false, message: "Something Went Wrong" };
      const cancelSlot = await this.Repository.unbookSlot(
        appointmentCancel.docId as Types.ObjectId,
        date,
        startTime
      );
      if (!cancelSlot)
        return { status: false, message: "Slot Cancellation Failed" };

      const doctorWalletDeduction = await this.Repository.doctorWalletUpdate(
        appointmentCancel.docId as Types.ObjectId,
        new mongoose.Types.ObjectId(appointmentId),
        refundAmount,
        "debit",
        "User Cancelled Appointment",
        "razorpay"
      );
      const cancellationAppointment =
        await this.Repository.createCancelledAppointment(
          appointmentCancel.docId as Types.ObjectId,
          new mongoose.Types.ObjectId(appointmentId),
          refundAmount.toString(),
          "user",
          reason
        );
      if (!doctorWalletDeduction)
        return { status: false, message: "failure doing refunds" };
      const userWalletUpdate = await this.Repository.userWalletUpdate(
        userId,
        new mongoose.Types.ObjectId(appointmentId),
        refundAmount,
        "credit",
        "cancelled appointment refund",
        "razorpay"
      );
      if (!userWalletUpdate)
        return { status: false, message: "something went wrong" };
      return { status: true, message: "Sucessfully Cancelled" };
    } catch (error) {
      throw error;
    }
  }

  async getAppointmentDetail(id: string): Promise<{
    status: boolean;
    message: string;
    appointmentDetail?: IAppointment;
  }> {
    try {
      const response = await this.Repository.getAppointment(id);
      if (response && "docImage" in response && response.docImage) {
       
        const command = this.AwsS3.getObjectCommandS3(
          response.docImage as string
        );
        const url=await this.AwsS3.getSignedUrlS3(command,3600)
        
        response.docImage = url;
      }
      if (
        response?.status === "completed" &&
        "prescription" in response &&
        response.prescription
      ) {
       
        const command = this.AwsS3.getObjectCommandS3(
          response.prescription as string
        );
       const url = await this.AwsS3.getSignedUrlS3(command, 3600);
        response.prescription = url;
      }
      if (response)
        return {
          status: true,
          message: "success",
          appointmentDetail: response,
        };
      return { status: false, message: "something went wrong" };
    } catch (error) {
      throw error;
    }
  }
  async addReview(
    appointmentId: string,
    userId: Types.ObjectId,
    docId: string,
    rating: number,
    description?: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const response = await this.Repository.addReview(
        appointmentId,
        userId,
        docId,
        rating,
        description
      );
      const appointmentUpdated=await this.Repository.addUserReviewToAppointment(appointmentId,rating,description)
      if (response && appointmentUpdated)
        return { status: true, message: "review added sucessfully" };
      return { status: false, message: "Internal server Error" };
    } catch (error) {
      throw error;
    }
  }
}
export default UserAppointmentsInteractor