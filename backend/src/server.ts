import app from './app'
import 'dotenv/config'

// import mongoose from 'mongoose'
const PORT = process.env.PORT;

app.listen(PORT,async ()=>{
    console.log("listening to port ",PORT);
})