import { Hono } from "hono";
import authRouter from "./routes/auth.js";
import todoRouter from "./routes/todos.js";

const api = new Hono();

api.route("/todos", todoRouter);
api.route("/auth", authRouter);

export default api;
