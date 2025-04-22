import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    published_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Ensure this exists
});


const Category = mongoose.model('Category', CategorySchema);

export default Category;
