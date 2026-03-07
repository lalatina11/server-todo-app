import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { logger } from "hono/logger";
import api from "./api";
import ENV from "./lib/env";
import openApiDoc from "./lib/open-api-docs";

const app = new Hono();

app.use(logger());

// Serve the OpenAPI document
app.get("/doc", (c) => c.json(openApiDoc));

// Use the middleware to serve Swagger UI at /ui
app.get("/ui", swaggerUI({ url: "/doc" }));

app.route("/api", api);

app.get("/", (c) => {
	return c.json({ success: true }, 200);
});

app.onError(({ message }) => {
	return Response.json(
		{
			success: false,
			message:
				ENV.NODE_ENV === "production" ? "Internal server error" : message,
		},
		{ status: 500 },
	);
});

app.notFound((c) => {
	return c.json({ success: false, message: "Not found URL" }, 404);
});

export default app;
