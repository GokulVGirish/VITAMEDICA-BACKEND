import mongoose from "mongoose";
const NotificationContentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["message", "normal"],
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: false
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const NotificationSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  notifications: [NotificationContentSchema],
});

const NotificationModel = mongoose.model("Notification", NotificationSchema);
export default NotificationModel;
