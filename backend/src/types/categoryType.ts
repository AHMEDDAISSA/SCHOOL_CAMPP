import mongoose, { Schema, Document } from "mongoose";


export interface CategoryType {
    name: string
}


interface CategoryDocument extends Document, CategoryType {}


const CategorySchema: Schema<CategoryDocument> = new mongoose.Schema({
    name: { type: String, required: true }
});


const Category = mongoose.model<CategoryDocument>('Category', CategorySchema);

export default Category;
