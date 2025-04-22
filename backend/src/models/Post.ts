import mongoose from "mongoose";
const { Schema } = mongoose;

const PostSchema = new mongoose.Schema({
    email: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    contact_info: { type: String, required: true },
    is_published: { type: Boolean, default: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    type: { type: String, required: true },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: "Camp", required: true },
    published_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const Post = mongoose.model('Post', PostSchema);

export default Post;
