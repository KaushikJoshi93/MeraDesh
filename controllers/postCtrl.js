import Post from "../models/Post.js";
import customError from "../helpers/customError.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import formidable from "formidable";
import fs from 'fs';




// create the post inside the database
const create = async (req, res, next) => {
    console.log('inside create..');
    let userDetails = {};
    let form = formidable();
    try {
        form.multiples = true;
        form.options.maxFileSize = 50 * 1024 * 1024;
        // console.log(form);

        form.parse(req, async(err, fields, files) => {
            if (err) {
                next(customError(400, "Photo could not be uploaded!"));
            }
            console.log('inside formparsing..');

            let key = "";
            for (key in fields) {
                userDetails = { ...userDetails, [key]: fields[key][0] };
            }
            
            for (let i in files) {
                if (!("photo" in userDetails)) userDetails = { ...userDetails, "photo": [{ data: fs.readFileSync(files[i][0].filepath), contentType: files[i][0].mimetype }] };
                else userDetails.photo.push({ data: fs.readFileSync(files[i][0].filepath), contentType: files[i][0].mimetype })
            }
            userDetails = {...userDetails , "postedBy":req.auth._id};
            const post = new Post(userDetails);
            await post.save();
            res.status(200).json("success");
        })
    } catch (err) {
        next(err);
    }

};

// get all the posts present in the database
const list = async (req, res, next) => {
    console.log('inside list');

    try {
        let posts = await Post.find()
            .populate("postedBy", "_id name")
            .populate("comments.postedBy", "_id name")
            .limit(10)
            .sort("-created")
            .exec();
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

// get all the post of a specific user from the database
const listByUser = async (req, res, next) => {
    console.log('inside listbyuser');

    try {
        let posts = await Post.find({ postedBy: req.params.userId })
            .populate("postedBy", "_id name")
            .populate("comments.postedBy", "_id name")
            .sort("-created")
            .exec();
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

// get all the post of the user that the user is following
const listNewsFeed = async (req, res, next) => {
    console.log('inside listnewsfeed', req.auth._id); // Optional logging
  
    try {
      const userId = req.auth._id; // Extract user ID directly
  
      // Validate user ID format (optional, but recommended)
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(customError(400, "Invalid user ID format"));
      }
  
      // Get the user's following list
      const following = await User.findById(userId, 'following').exec();
  
      if (!following) {
        return next(customError(404, "User not found!"));
      }
  
      // Find posts where postedBy is in the user's following list
      const posts = await Post.find({
        postedBy: { $in: following.following }
      })
      .populate('postedBy', '_id name')
      .populate('comments.postedBy', '_id name')
      .sort('-created')
      .exec();
  
      res.status(200).json(posts);
    } catch (err) {
      next(err);
    }
  };
  

// delete the post of a specific id from the database
const remove = async (req, res, next) => {
    console.log('inside remove.');

    try {
        let post = await Post.findById(req.params.postId).exec();
        if (post.postedBy._id.toString() === req.auth._id.toString()) {
            let deletedPost = await Post.findByIdAndDelete(req.params.postId);
            res.status(200).json(deletedPost);
        } else {
            next(customError(403, "Unauthorized!"));
        }
    } catch (err) {
        next(err);
    }
};

// update the post of a specific id from the database
const update = async (req, res, next) => {
    console.log('inside update..');

    try {
        let post = await Post.findById(req.params.postId).exec();
        if (post.postedBy._id.toString() === req.auth._id.toString()) {
            post = Object.assign(post, req.body);
            let updatedPost = await post.save();
            res.status(200).json(updatedPost);
        } else {
            next(customError(403, "Unauthorized!"));
        }
    } catch (err) {
        next(err);
    }
};

// get the post of a specific id from the database
const read = async (req, res, next) => {
    console.log('inside read...');

    try {
        let post = await Post.findById(req.params.postId)
            .populate("postedBy", "_id name")
            .populate("comments.postedBy", "_id name")
            .exec();
        res.status(200).json(post);
    } catch (err) {
        next(err);
    }
};

// like the post of a specific id from the database
const like = async (req, res, next) => {
    console.log('inside like..');
  
    try {
      const userId = req.auth._id; // Extract user ID directly
      const postId = req.body.postId;
  
      // Validate user ID and post ID formats (optional, but recommended)
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
        return next(customError(400, "Invalid user ID or post ID format"));
      }
  
      // Check if user already liked the post
      const post = await Post.findOne({ likes: { $in: userId }, _id: postId });
  
      if (post) {
        return res.status(200).json({ message: "Already liked the post" }); // Informative message
      }
  
      // Like the post (add user ID to likes array)
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $push: { likes: userId } },
        { new: true } // Return the updated document
      );
  
      if (!updatedPost) {
        return next(customError(404, "Post not found!"));
      }
  
      res.status(200).json(updatedPost);
    } catch (err) {
      next(err);
    }
  };
  

// unlike the post of a specific id from the database
const unlike = async (req, res, next) => {
    console.log('inside unlike..');

    try {
        let result = await Post.findByIdAndUpdate(
            req.body.postId,
            { $pull: { likes: req.auth._id } },
            { new: true }
        ).exec();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

// comment on the post of a specific id from the database
const comment = async (req, res, next) => {
    console.log('inside comment');

    let comment = req.body.comment;
    comment.postedBy = req.auth._id;
    try {
        let result = await Post.findByIdAndUpdate(
            req.body.postId,
            { $push: { comments: comment } },
            { new: true }
        )
            .populate("comments.postedBy", "_id name")
            .populate("postedBy", "_id name")
            .exec();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

const photo = async (req, res, next) => {
    console.log('inside photo..');
  
    try {
      const post = await Post.findById({ "_id": req.params.postId }); // Await post lookup
  
      if (!post) {
        return next(customError(404, "Post not found")); // Handle post not found
      }
  
      if (!('photo' in post) || !post.photo[req.params.postIndex]?.data) {
        return res.status(404).send("Photo not found"); // Handle photo not found
      }
  
      const contentType = post.photo[req.params.postIndex].contentType;
      const photoData = post.photo[req.params.postIndex].data;
  
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.status(200).send(photoData);
    } catch (err) {
      next(err);
    }
  };
  

export default { comment, unlike, like, read, update, remove, listNewsFeed, listByUser, list, create, photo }










