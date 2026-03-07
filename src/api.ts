import { Hono } from "hono";
import authRouter from "./routes/auth";
import todoRouter from "./routes/todos";

const api = new Hono();

api.route("/todos", todoRouter);
api.route("/auth", authRouter);

export default api;
