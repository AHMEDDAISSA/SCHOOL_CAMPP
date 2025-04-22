import mongoose from "mongoose";

const CampSchema = new mongoose.Schema({
    type: String,
    year: Number,
    location: String,
    description: String,

});

const Camp = mongoose.model('Camp', CampSchema);

export default Camp;
