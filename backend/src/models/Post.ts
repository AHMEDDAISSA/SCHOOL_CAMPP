import mongoose from "mongoose";
const { Schema } = mongoose;

const PostSchema = new mongoose.Schema({
    email: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    contact_info: { type: String},
    is_published: { type: Boolean, default: true },
    category: { type: String, required: true},
    type: { type: String, required: true },
    camp: { type: String, required: true },
    published_by: { type: Schema.Types.ObjectId, ref: 'User'}
});

const Post = mongoose.model('Post', PostSchema);

export default Post;
