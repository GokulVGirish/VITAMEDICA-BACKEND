import jwt from "jsonwebtoken"

export interface IJwtService{
    generateToken(payload:Object,options:jwt.SignOptions):string
    generateRefreshToken(payload:Object,otpions:jwt.SignOptions):string


}
