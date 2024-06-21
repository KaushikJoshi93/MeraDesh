import customError from '../helpers/customError.js';
import User from '../models/User.js'
import formidable from 'formidable'
import fs from 'fs'
import mongoose from 'mongoose';


// handler function to create the user inside the database 
const create = async (req, res, next) => {
    const user = new User(req.body);
    try {
        await user.save();
        return res.status(200).json({
            message: 'Successfully! signed up!'
        })
    } catch (err) {
        next(err);
    }   
}

// handler function to get all the users present in the database
const list = async (req, res, next) => {
    let limit_no = req.query.limit;
    try {
        let users = limit_no ? await User.find().select('_id name email ').limit(limit_no) : await User.find().select('_id name email ');
        res.status(200).json(users);

    } catch (err) {
        next(err);
    }
}

// handler funciton to read the information of specific user by their userid
const read = async (req, res, next) => {
    try {
      const userId = req.params.userId; // Extract user ID directly
  
      // Validate user ID format (optional, but recommended)
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(customError(400, "Invalid user ID format"));
      }
  
      const user = await User.findById(userId) // Use findById without creating ObjectId
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .select("name email photo about followers following")
        .exec();
  
      if (!user) {
        return next(customError(404, "User not found!"));
      }
  
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };
  

  const update = async (req, res, next) => {
    try {
        const form = formidable();
      const parseForm = new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ fields, files });
        });
      });
  
      const { fields, files } = await parseForm; // Await parsing results
  
      const userDetails = {};
      for (const key in fields) {
        userDetails[key] = fields[key][0];
      }
  
      if (files.photo) {
        userDetails.photo = {
          data: fs.readFileSync(files.photo[0].filepath),
          contentType: files.photo[0].mimetype,
        };
      }
  
      const user = await User.findById({ "_id": req.params.userId }); // Await user lookup
  
      if (!user) {
        return next(customError(404, "User not found"));
      }
  
      user.name = userDetails.name || user.name;
      user.email = userDetails.email || user.email;
      user.about = userDetails.about || user.about;
      user.photo.data = userDetails.photo?.data || user.photo.data;
      user.photo.contentType = userDetails.photo?.contentType || user.photo.contentType;
  
      if (userDetails.password) {
        user.hashed_password = user.encryptPassword(userDetails.password);
        user.salt = user.makeSalt();
      }
  
      await user.save(); // Await user save
  
      res.status(200).json({
        success: 'true',
        message: "User updated!!",
      });
    } catch (err) {
      next(err);
    }
  };
  
  

// handler function to remove the user from the database or to delete the account
const remove = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        await User.deleteOne({ "_id": userId });
        res.status(200).json({
            success: "true",
            message: "User deleted!!"
        })
    } catch (err) {
        next(err);
    }
}

const photo = async (req, res, next) => {
    try {
      const user = await User.findById({ "_id": req.params.userId });
  
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      if (!user.photo || !user.photo.data) {
        return res.status(404).send("Photo not found");
      }
  
      res.setHeader('Content-Type', user.photo.contentType);
      res.setHeader('Cross-Origin-Resource-Policy','cross-origin');
      res.status(200).send(user.photo.data);
    } catch (err) {
      next(err);
    }
  };
  

// handler function to add following to the user's following array
const addFollowing = async(req , res , next)=>{
    try {
        await User.findByIdAndUpdate(req.body.userId , {$push : {following:req.body.followId}});
        next();
    } catch (err) {
        next(err);
    }
}

// handler function to add followers to the user's followers array
const addFollowers = async(req , res , next)=>{
    try {
        let result = await User.findByIdAndUpdate(req.body.followId , {$push : {followers:req.body.userId}} , {new:true})
                                .populate('following' , '_id name')
                                .populate('followers' , '_id name')
                                .select('name email photo about followers following')
                                .exec();

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

// handler function to remove following from the user's following array
const removeFollowing = async(req , res , next)=>{
    try {
        await User.findByIdAndUpdate(req.body.userId , {$pull : {following:req.body.unfollowId}});
        next();
    } catch (err) {
        next(err);
    }
};

// handler function to remove followers from the user's followers array
const removeFollowers = async(req , res , next)=>{
    try {
        let result = await User.findByIdAndUpdate(req.body.unfollowId , {$pull: {followers:req.body.userId}} , {new:true})
                            .populate('following' , '_id name')
                            .populate('followers' , '_id name')
                            .select('name email photo about followers following')
                            .exec();
        res.status(200).json(result);
    
    } catch (err) {
        next(err);
    }
}







export default { create, list, read, update, remove , photo  , addFollowers , addFollowing , removeFollowing , removeFollowers}