import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";
import type { AuthType } from "@/types/auth";

export interface MiddlewareContext {
	Variables: AuthType;
}

export const getSessionByHeaders = async (headers: Headers) => {
	try {
		return await auth.api.getSession({ headers });
	} catch {
		return null;
	}
};

export const authMiddleware = createMiddleware<MiddlewareContext>(
	async (c, next) => {
		const { headers } = c.req.raw;
		const res = await getSessionByHeaders(headers);
		if (!res || !res.session) {
			return c.json({ success: false, message: "Not Authenticated!" });
		}
		c.set("session", res.session);
		c.set("user", res.user);
		await next();
	},
);

export const guestMiddleware = createMiddleware<MiddlewareContext>(
	async (c, next) => {
		const { headers } = c.req.raw;
		const res = await getSessionByHeaders(headers);

		if (res !== null) {
			return c.json({ success: false, message: "Already authenticated!" });
		}

		await next();
	},
);
