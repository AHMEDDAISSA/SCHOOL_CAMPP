import  express, { Application }  from "express";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes";
import campRouter from "./routes/campRoutes";
import postRouter from "./routes/postRoutes";
import categoryRouter from "./routes/categoryRoutes";
import adminRouter from "./routes/categoryRoutes";
import userRouter from "./routes/userRoutes";
import dotenv from "dotenv";
import path from 'path';

dotenv.config();

const app: Application = express()

app.use(express.json());

//registration and login
app.use('/auth', authRouter);
//adding camps
app.use('/camp',campRouter);
//crud for posts
app.use('/post',postRouter);
//crud for categories
app.use('/cat',categoryRouter);
//stats and reset
app.use('/admin',adminRouter);
//acquiring users
app.use('/user',userRouter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

//db connection
mongoose.connect(process.env.MONGO_URI as string)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

export default app;