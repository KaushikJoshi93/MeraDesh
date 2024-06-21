import mongoose from "mongoose";
import crypto from 'crypto'

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is required'
    },
    about:{
        type:String,
        trim: true
    },
    photo:{
        data: Buffer,
        contentType: String
    },
    followers:[{
        type: mongoose.Schema.ObjectId,
        index:{unique: "Email already exists!!"},
        ref: 'Users'

    }],
    following:[{
        type: mongoose.Schema.ObjectId,
        index:{unique: "Email already exists!!"},
        ref: 'Users'

    }],
    email: {
        type: String,
        trim: true,
        index:{unique: "Email already exists!!"},
        validate: {
            validator: function (value) {
                return this.isEmail(value)
            },
            message: props => `${props.value} is not a valid email`
        },
        required: 'Email is required'
    },
    hashed_password: {
        type: String,
        required: 'Password is required!'
    },
    salt: {
        type: String
    }

}, { timestamps: true })

UserSchema.virtual('password').set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
}).get(function () {
    return this._password;
});

UserSchema.path('hashed_password').validate(function(v){
    if(this._password && this._password.length < 6 ){
        this.invalidate('password' , "Password must be atleast 6 characters!!");
    }
    if(this.isNew && !this._password){
        this.invalidate('password' , "Password is required!!");
    }
} , null);

UserSchema.methods = {
    isEmail: function (value) {
        return /.+\@.+\..+/.test(value);
    },
    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        } catch (err) {
            return '';
        }
    },
    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    }
}

UserSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      next(new Error('Email already exists!!'));
    } else {
      next();
    }
  });

export default mongoose.model('Users',UserSchema);