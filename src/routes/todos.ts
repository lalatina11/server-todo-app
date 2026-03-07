import { zValidator } from "@hono/zod-validator";
import { and, eq, ilike, or, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import db from "../db";
import tables from "../db/tables";
import { todoParamId, todoSchema } from "../lib/validations/todo-schema";
import { authMiddleware } from "../middlewares/auth-middleware";
import type { AuthType } from "../types/auth";

const todoRouter = new Hono<{ Variables: AuthType }>();

const r = todoRouter;

r.get("/", authMiddleware, async (c) => {
	const q = c.req.query("q") as string;

	const currentUser = c.get("user");

	if (!currentUser) {
		return c.json({ success: false, message: "Not Auhtorized!" });
	}

	const filters = [eq(tables.todo.authorId, currentUser.id)] as SQL<unknown>[];

	if (q) {
		filters.push(
			or(
				ilike(tables.todo.title, `%${q}%`),
				ilike(tables.todo.description, `%${q}%`),
			) as SQL<unknown>,
		);
	}

	const todos = await db.query.todo.findMany({
		with: { author: true },
		where: and(...filters),
	});
	return c.json({ success: true, message: "OK", data: todos }, 200);
});

r.get("/:id{[0-9]+}", zValidator("param", todoParamId), async (c) => {
	const { id } = c.req.valid("param");

	const existingTodo = await db.query.todo.findFirst({
		where: eq(tables.todo.id, id),
		with: { author: true },
	});

	if (!existingTodo) {
		return c.json(
			{ success: false, message: `Cannot found todo with ID ${id}` },
			200,
		);
	}

	return c.json({ success: true, message: "OK", data: existingTodo }, 200);
});

r.post(
	"/",
	authMiddleware,

	async (c) => {
		const body = await c.req.json();

		if (!body || typeof body !== "object") {
			return c.json({
				success: false,
				message: "please complete all the fields",
			});
		}

		const currentUser = c.get("user");

		if (!currentUser) {
			return c.json({ success: false, message: "Not Authenticated!" });
		}

		const validation = todoSchema.safeParse(body);

		if (!validation.success) {
			return c.json({ success: false, message: validation.error.message });
		}

		const [newTodo] = await db
			.insert(tables.todo)
			.values({ ...validation.data, authorId: currentUser.id })
			.returning();

		const data = await db.query.todo.findFirst({
			where: eq(tables.todo.id, newTodo.id),
			with: { author: true },
		});

		return c.json(
			{
				success: true,
				message: "new todo has been created successfully",
				data,
			},
			200,
		);
	},
);

r.patch(
	"/:id{[0-9]+}",
	authMiddleware,
	zValidator("param", todoParamId),
	async (c) => {
		const { id } = c.req.valid("param");

		const currentUser = c.get("user");

		if (!currentUser) {
			return c.json({ success: false, message: "Not Auhtorized!" });
		}

		const body = await c.req.json();

		if (!body || typeof body !== "object") {
			return c.json({
				success: false,
				message: "please complete all the fields",
			});
		}

		const validation = todoSchema.safeParse(body);

		if (!validation.success) {
			return c.json({ success: false, message: validation.error.message });
		}

		const existingTodo = await db.query.todo.findFirst({
			where: eq(tables.todo.id, id),
			columns: { id: true, authorId: true },
		});

		if (!existingTodo) {
			return c.json(
				{ success: false, message: `Cannot found todo with ID ${id}` },
				200,
			);
		}

		if (existingTodo.authorId !== currentUser.id) {
			return c.json({ success: false, message: "Not Auhtorized!" });
		}

		await db
			.update(tables.todo)
			.set({ ...validation.data })
			.where(eq(tables.todo.id, existingTodo.id));

		const data = await db.query.todo.findFirst({
			where: eq(tables.todo.id, existingTodo.id),
			with: { author: true },
		});

		return c.json(
			{
				success: true,
				message: `todo with ID ${id} has been updated succesfully`,
				data,
			},
			201,
		);
	},
);

r.delete("/:id{[0-9]+}", zValidator("param", todoParamId), async (c) => {
	const { id } = c.req.valid("param");

	const existingTodo = await db.query.todo.findFirst({
		where: eq(tables.todo.id, id),
		columns: { id: true, authorId: true },
	});

	if (!existingTodo) {
		return c.json(
			{ success: false, message: `Cannot found todo with ID ${id}` },
			200,
		);
	}

	const currentUser = c.get("user");

	if (!currentUser) {
		return c.json({ success: false, message: "Not Auhtorized!" });
	}

	if (existingTodo.authorId !== currentUser.id) {
		return c.json({ success: false, message: "Not Auhtorized!" });
	}

	await db.delete(tables.todo).where(eq(tables.todo.id, existingTodo.id));

	return c.json(
		{
			success: true,
			message: `Todo with ID ${id} has been deleted successfully!`,
		},
		200,
	);
});

export default todoRouter;
