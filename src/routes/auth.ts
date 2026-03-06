import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { userSchema } from "@/lib/validations/user-schema";
import { authMiddleware, guestMiddleware } from "@/middlewares/auth-middleware";

const authRouter = new Hono();
const r = authRouter;

r.get("/me", authMiddleware, (c) => {
	const data = {
		session: c.get("session"),
		user: c.get("user"),
	};
	return c.json({ success: true, message: "Success to get session", data });
});

r.post("/register", guestMiddleware, async (c) => {
	const body = await c.req.json();
	if (body === null) {
		return c.json({ success: false, message: "required json body" });
	}
	if (typeof body !== "object") {
		return c.json({ success: false, message: "required json body" });
	}
	const validation = userSchema.safeParse(body);

	if (!validation.success) {
		return c.json({
			success: false,
			message: validation.error.issues[0].message,
		});
	}

	return await auth.api.signUpEmail({
		body: { ...validation.data },
		asResponse: true,
	});
});

r.post("/login", guestMiddleware, async (c) => {
	const body = await c.req.json();
	if (body === null) {
		return c.json({ success: false, message: "required json body" });
	}
	if (typeof body !== "object") {
		return c.json({ success: false, message: "required json body" });
	}
	const validation = userSchema.omit({ name: true }).safeParse(body);

	if (!validation.success) {
		return c.json({
			success: false,
			message: validation.error.issues[0].message,
		});
	}

	return await auth.api.signInEmail({
		body: { ...validation.data },
		asResponse: true,
	});
});

r.post("/logout", authMiddleware, async (c) => {
	return await auth.api.signOut({
		headers: c.req.raw.headers,
		asResponse: true,
	});
});

export default authRouter;
