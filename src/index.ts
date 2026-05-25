import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter.ts";
import adminRouter from "./routes/admin/adminRouter.ts";
import categoryRouter from "./routes/categoryRouter.ts";
import postRouter from "./routes/postRouter.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/category", categoryRouter);
app.use("/post", postRouter);

app.listen(PORT, () => {
    console.log(`Server listening on : http://localhost:${PORT}`);
});
