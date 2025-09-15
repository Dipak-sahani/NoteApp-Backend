import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { createServer } from 'http'

const app = express()

const server = createServer(app);

const allowedOrigins = [ 
  "https://notes-app-frontend-ryeq.vercel.app", // prod frontend (with https!)
  "http://localhost:5173",   // local dev (Vite default)
  "https://notes-app-frontend-ryeq-git-main-dipak-sahanis-projects.vercel.app"    // local dev (CRA default, if needed)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



//routes import
import userRouter from './routes/user.routes.js'
import adminRouter from './routes/admin.routes.js'


//routes declaration
//app.use("/api/v1/healthcheck", healthcheckRouter)

app.get('/health',(req,res)=>{
    res.status(200).json({"status":"ok"})
})
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin",adminRouter);



// app.use("/api/v1/tweets", tweetRouter)
// app.use("/api/v1/subscriptions", subscriptionRouter)
// app.use("/api/v1/videos", videoRouter)
// app.use("/api/v1/comments", commentRouter)
// app.use("/api/v1/likes", likeRouter)
// app.use("/api/v1/playlist", playlistRouter)
// app.use("/api/v1/dashboard", dashboardRouter)

// http://localhost:8000/api/v1/users/register

export { server }