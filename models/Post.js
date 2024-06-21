import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema({
    text: {
        type: String,
        required: "Text is required"
    },
    photo: [{
        data: Buffer,
        contentType: String
    }],
    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "Users"
    },
    likes: [{type: mongoose.Schema.ObjectId, ref: "Users"}],
    comments: [{
        text: String,
        created: {type: Date, default: Date.now},
        postedBy: {type: mongoose.Schema.ObjectId, ref: "Users"}
    }]
}, {timestamps: true});

export default mongoose.model("Post", PostSchema);
