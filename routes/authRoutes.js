import express from 'express'
import authCtrl from '../controllers/authCtrl.js';

const router = express.Router();

// signin route
router.post("/signin" , authCtrl.signin)

// signout route
router.get("/signout" , authCtrl.signout)

// forgot password route
router.post("/forgot-password" , )


// export the router
export default router;