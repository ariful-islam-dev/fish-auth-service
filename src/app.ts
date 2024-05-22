import express from "express";
import cors from "cors";
import morgan from "morgan";
import { userLogin, userRegistration, verifyEmail, verifyToken } from "./controllers";

const app = express();

app.use([express.json(), cors(), morgan("dev")]);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.post("/auth/register", userRegistration)
app.post("/auth/login", userLogin)
app.post("/auth/verify-token", verifyToken)
app.post("/auth/verify-email", verifyEmail)

// 404 Error
app.use((req, res, next) => {
  res.status(404).json({ code: 404, message: " Resource Not Found" });
});
// Error
app.use((err, _req, res, _next) => {
  console.log(err);
  res.status(500).json({ code: 500, message: "Internal Server Error" });
});

export default app;
