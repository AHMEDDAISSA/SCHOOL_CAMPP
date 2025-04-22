import mongoose, {Schema} from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    categories: [{type: Schema.Types.ObjectId, ref: 'Category', required: true}]
})

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

export default Subscription;
