//imports
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "@src/routes/auth.routes";
import testamentsRoutes from "@src/routes/testaments.routes";
import versesRoutes from "@src/routes/verses.routes";
import cookieParser from "cookie-parser";

const app = express();

//middleware
app.use(express.json()); //Parse JSON requests
app.use(cors()); //Enable Cross-Origin Resource Sharing
app.use(helmet()); //Secure HTTP headers
app.use(cookieParser()); //for token

//routes
app.use("/auth", authRoutes);
//testaments
app.use("/testaments", testamentsRoutes);
//verses
app.use("/verses", versesRoutes);

export default app;
