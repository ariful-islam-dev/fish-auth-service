import http from "http";
import dotenv from "dotenv";
import app from "./app";
dotenv.config();

const PORT = process.env.PORT || 4003;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`${process.env.SERVICE_NAME} Server is running on http://localhost:${PORT}`);
});
