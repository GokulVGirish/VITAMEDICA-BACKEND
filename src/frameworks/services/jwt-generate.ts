import jwt from "jsonwebtoken"
import { IJwtService } from "../../entities/services/jwtServices"


class  JwtService implements IJwtService{
    constructor(private readonly jwtsecretkey:string,private readonly jwtrefreshkey:string){}
    generateToken(payload:Object,options?:jwt.SignOptions):string{
        return jwt.sign(payload,this.jwtsecretkey,options)

    }
    generateRefreshToken(payload: Object, options: jwt.SignOptions): string {
        return jwt.sign(payload,this.jwtrefreshkey,options)
    }


}
export default JwtService