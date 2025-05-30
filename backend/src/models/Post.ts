import mongoose from "mongoose";
const { Schema } = mongoose;

const PostSchema = new mongoose.Schema({
    email: { type: String, required: true,lowercase: true, trim: true },
    title: { type: String, required: true },
    description: String,
    contact_info: { type: String},
    is_published: { type: Boolean, default: true }, 
    category: { type: String, required: true},
    type: { type: String, required: true },
    camp: { type: String, required: true },
    published_by: { type: Schema.Types.ObjectId, ref: 'User'},
    images: [{ type: String }],
    imageUrl: { type: String },
    price: { type: String },
    duration: { type: String },
    preferredContact: { 
        type: String, 
        enum: ['email', 'phone', 'app'],
        default: 'email' 
    },
    contactEmail: { type: String },
    contactPhone: { type: String },
    contactName: { type: String }, 
    showName: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: true },
    
    
    
    contactStatus: {
    type: String,
    enum: ['available', 'in_contact', 'reserved', 'sold'],
    default: 'available'
},
activeContacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }]
}, { timestamps: true })



PostSchema.pre('save', function(next) {
    if (this.images && this.images.length > 0) {
        this.imageUrl = this.images[0];
    }
    next();
});

const Post = mongoose.model('Post', PostSchema);

export default Post;
