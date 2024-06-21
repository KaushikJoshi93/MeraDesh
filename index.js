import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import helmet from 'helmet';
import morgan from 'morgan'
import createError from './helpers/createError.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import bodyParser from 'body-parser'

const app = express();
const connect = () => {
    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.MONGO_URI).then(() =>
        console.log("Database connected...")
    ).catch((err) => console.log("Error detected in connecting with database.." + err));
}

dotenv.config();
// app.use(helmet());
app.use(morgan('common'));
app.use(express.json())
app.use(bodyParser.urlencoded({
    extended:true
}))
app.use(cookieParser())
app.use(cors('all'));
// routes
app.use('/api/user/',userRoutes);
app.use("/api/auth",authRoutes);
app.use("",postRoutes);
// error handler middleware
app.use(createError);
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ "error": err.name + ": " + err.message })
    } else if (err) {
        res.status(400).json({ "error": err.name + ": " + err.message })
    }
})


app.listen(process.env.PORT || 5000, (req, res) => {
    connect();
    console.log("Server started..");

})