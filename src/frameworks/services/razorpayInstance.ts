import Razorpay from "razorpay";

let instance = new Razorpay({
  key_id: process.env.RazorPayId as string,
  key_secret: process.env.RazorPaySecret,
});
export default instance
