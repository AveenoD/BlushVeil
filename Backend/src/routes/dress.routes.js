import { Router } from "express";
import { verifyRole } from "../middlewares/role.middleware.js";
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'
import {
    addDress,
    deleteDress,
    updateDress,
    getDressById,
    getAllDresses
} from '../controllers/dress.controllers.js'

const router = Router();

router.route('/').get(getAllDresses)
router.route('/:dressId').get(getDressById)
router.route('/add').post(verifyJWT,verifyRole,upload.single("dressImage"),addDress)
router.route('/update/:dressId').patch(verifyJWT,verifyRole,upload.single("dressImage"),updateDress)
router.route('/delete/:dressId').delete(verifyJWT,verifyRole,deleteDress)

export default router;