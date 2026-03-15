import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from '../middlewares/role.middleware.js'
import { 
    placeOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
} from '../controllers/order.controllers.js'

const router = Router();

router.route('/place').post(verifyJWT,placeOrder)
router.route('/my-orders').get(verifyJWT,getUserOrders)
router.route('/all').get(verifyJWT,verifyRole,getAllOrders)
router.route('/status/:orderId').patch(verifyJWT,verifyRole,updateOrderStatus)

export default router;