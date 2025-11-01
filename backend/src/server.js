import express from 'express';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import path from 'path';
import { connectDB } from './lib/db.js';

dotenv.config();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 3000;

app.use(express.json())

// Return a friendly 400 error when body-parser/express.json() fails to parse invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//make ready for deployment
if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // Serve index.html for all other routes in production
    app.use((_, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

app.listen(PORT, ()=> {
    console.log(`server running on port ${PORT}`)
    connectDB();
});