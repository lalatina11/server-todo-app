import type { Context } from "hono";
import type { auth } from "@/lib/auth";

export type AuthType = {
	user: typeof auth.$Infer.Session.user | null;
	session: typeof auth.$Infer.Session.session | null;
};

export type ContextWithAuth = Context<{ Variables: AuthType }>;
