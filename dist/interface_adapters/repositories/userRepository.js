"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OtpSchema_1 = __importDefault(require("../../frameworks/mongoose/models/OtpSchema"));
const UserSchema_1 = __importDefault(require("../../frameworks/mongoose/models/UserSchema"));
class UserRepository {
    async tempOtpUser(data) {
        try {
            const tempUser = await OtpSchema_1.default.create(data);
            if (tempUser) {
                return { status: true };
            }
            else {
                return { status: false };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async userExist(email) {
        const user = await UserSchema_1.default.findOne({ email: email });
        return !!user;
    }
    async createUserOtp(otp) {
        try {
            const otpUser = await OtpSchema_1.default.findOne({ otp: otp });
            if (otpUser) {
                const now = new Date();
                const expirationTime = new Date(otpUser?.time.getTime() + 2 * 60 * 1000);
                if (now < expirationTime) {
                    const user = await UserSchema_1.default.create({
                        name: otpUser.name,
                        email: otpUser.email,
                        phone: otpUser.phone,
                        password: otpUser.password,
                        gender: otpUser.gender,
                        bloodGroup: otpUser.bloodGroup,
                        dob: otpUser.dob
                    });
                    return { status: true, user };
                }
                else {
                    return { status: false };
                }
            }
            else {
                return { status: false };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getUser(email) {
        try {
            const user = await UserSchema_1.default.findOne({ email: email });
            return user;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async googleSignup(email, name, password) {
        try {
            const user = await UserSchema_1.default.create({
                name: name,
                email: email,
                password: password,
                register: "Google"
            });
            if (user) {
                return {
                    status: true,
                    message: "Signed Up Sucessfully"
                };
            }
            else {
                return {
                    status: false,
                    message: "error signing up"
                };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateProfile(data) {
        try {
            const response = await UserSchema_1.default.updateOne({ _id: data._id }, {
                name: data.name,
                phone: data.phone,
                dob: data.dob,
                gender: data.gender,
                bloodGroup: data.bloodGroup,
                address: {
                    street: data.address?.street,
                    city: data.address?.city,
                    state: data.address?.state,
                    postalCode: data.address?.postalCode,
                },
                image: data.image
            });
            if (response) {
                return { success: true };
            }
            else {
                return { success: false };
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async resendOtp(otp, email) {
        try {
            const otpDoc = await OtpSchema_1.default.findOne({ email: email });
            if (otpDoc) {
                otpDoc.otp = otp;
                otpDoc.time = new Date();
                await otpDoc.save();
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
exports.default = UserRepository;
