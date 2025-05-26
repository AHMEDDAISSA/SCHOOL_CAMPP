import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        first_name: { type: String, default: '' },
        last_name: { type: String, default: '' },
        phone: { type: String, default: '' },
        camp: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp', required: true },
        role: { type: String, enum: ['parent', 'admin','exploitant'], required: true },
        canPost: { type: Boolean, default: false },
        verificationCode: { type: String, default: null },
        isVerified: { type: Boolean, default: true },
        profileImage: { type: String, default: '' },
        profileImageUrl: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Define a compound unique index on `email` and `camp`
UserSchema.index({ email: 1, camp: 1 }, { unique: true });

//normalize the email (e.g., convert to lowercase) before saving
UserSchema.pre('save', function (next) {
    this.email = this.email.toLowerCase();
    next();
});

UserSchema.pre('save', function(next) {
    if (this.profileImage) {
        // Cette URL sera complétée dans le contrôleur avec le baseUrl
        this.profileImageUrl = this.profileImage;
    }
    next();
});

const User = mongoose.model('User', UserSchema);

export default User;
