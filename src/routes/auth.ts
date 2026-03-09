import { eq } from "drizzle-orm";
import { Hono } from "hono";
import db from "../db";
import tables from "../db/tables";
import { auth } from "../lib/auth";
import { userSchema } from "../lib/validations/user-schema";
import {
	authMiddleware,
	guestMiddleware,
} from "../middlewares/auth-middleware";
import {
	handleLoginRepository,
	handleLogOutRepository,
} from "../repositories/auth-repository";

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

	const countExistingEmail = await db.$count(
		tables.user,
		eq(tables.user.email, validation.data.email),
	);

	const isEmailExist = countExistingEmail > 0;

	if (isEmailExist) {
		return c.json({ success: false, message: "Email already taken" });
	}

	const { token, user } = await auth.api.signUpEmail({
		body: { ...validation.data },
	});

	if (!token || !user) {
		return c.json({ success: false, message: "cannot login user" });
	}

	return c.json({
		success: true,
		message: "success to register",
		data: { token, user },
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

	const countExistingUserByEmail = await db.$count(
		tables.user,
		eq(tables.user.email, validation.data.email),
	);

	const isUserExist = countExistingUserByEmail > 0;

	if (!isUserExist) {
		return c.json({ success: false, message: "User not exist!" });
	}

	const loginRes = await handleLoginRepository({
		email: validation.data.email,
		password: validation.data.password,
	});

	if (!loginRes.success || !loginRes.data?.token) {
		return c.json({ success: false, message: loginRes.message });
	}

	return c.json({
		success: true,
		message: "success to register",
		data: loginRes.data,
	});
});

r.post("/logout", authMiddleware, async (c) => {
	const res = await handleLogOutRepository(c.req.raw.headers);
	if (!res.success) {
		return c.json({ success: false, message: res.message });
	}
	return c.json({ success: true, message: "Success to logout" });
});

export default authRouter;
