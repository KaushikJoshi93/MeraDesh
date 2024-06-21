import express from 'express'
import authCtrl from '../controllers/authCtrl.js';
import userCtrl from '../controllers/userCtrl.js';

const router = express.Router();

router.get('/', userCtrl.list)
router.post('/', userCtrl.create)


router.get('/:userId', authCtrl.requireSignin, userCtrl.read)
router.put('/:userId', authCtrl.requireSignin, userCtrl.update)
router.delete('/:userId', authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)

router.get('/photo/:userId', userCtrl.photo)

router.put('/profile/follow', authCtrl.requireSignin, userCtrl.addFollowing, userCtrl.addFollowers)
router.put('/profile/unfollow', authCtrl.requireSignin, userCtrl.removeFollowing, userCtrl.removeFollowers)


export default router;
