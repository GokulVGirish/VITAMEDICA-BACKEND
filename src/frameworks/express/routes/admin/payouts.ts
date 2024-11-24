import express from "express"
import PayoutControllers from "../../../../interface_adapters/controllers/admin/payouts"
import AdminPayoutsInteractor from "../../../../use_cases/admin/payouts"
import AdminRepository from "../../../../interface_adapters/repositories/adminRepository"
import authMiddleware from "../../middlewares/authentication"
import verifyRole from "../../middlewares/role-Authenticate"
import AwsS3 from "../../../services/awsS3"

const repository=new AdminRepository()
const awsS3=new AwsS3()
const interactor=new AdminPayoutsInteractor(repository,awsS3)
const controller=new PayoutControllers(interactor)

const payoutRouter=express.Router()
payoutRouter.get(`/refunds`,authMiddleware,verifyRole("admin"),controller.getRefundsList.bind(controller))
payoutRouter.get(`/refunds/:id`,authMiddleware,verifyRole("admin"),controller.getRefundDetail.bind(controller));
payoutRouter.get("/withdrawals",authMiddleware,verifyRole("admin"),controller.getWithdrawalList.bind(controller))



export default payoutRouter