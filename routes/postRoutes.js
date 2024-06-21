import express from 'express'
import authCtrl from '../controllers/authCtrl.js';
import postCtrl from '../controllers/postCtrl.js';

const router = express.Router();

// route for listing all the post and creating the post
router.route('/api/posts/')
    .get(postCtrl.list)
    .post(authCtrl.requireSignin, postCtrl.create)


// route for getting the photos for any specific post
router.route('/api/posts/photo/:postId/:postIndex')
    .get(postCtrl.photo)


// route for listing random post for any specific user
router.route('/api/posts/feed/:userId')
    .get(authCtrl.requireSignin, postCtrl.listNewsFeed)
    

// route for listing all the post of a specific user
router.route('/api/posts/by/:userId')
    .get(postCtrl.listByUser)


// route for liking a post
router.route('/api/posts/like')
    .put(authCtrl.requireSignin, postCtrl.like)

// route for unliking the post
router.route('/api/posts/unlike')
    .put(authCtrl.requireSignin, postCtrl.unlike)

// route for commenting the post
router.route('/api/posts/comment')
    .put(authCtrl.requireSignin, postCtrl.comment)

// route for getting the post by their postId , updating the post , deleting the post
router.route('/api/posts/:postId')
    .get(authCtrl.requireSignin, postCtrl.read)
    .put(authCtrl.requireSignin, postCtrl.update)
    .delete(authCtrl.requireSignin, postCtrl.remove)

export default router;