import { relations } from "drizzle-orm";
import { user } from "./auth-schema";
import { todo } from "./index";

export const userRelations = relations(user, ({ many }) => ({
	todos: many(todo),
}));

export const todoRelations = relations(todo, ({ one }) => ({
	author: one(user, {
		fields: [todo.authorId],
		references: [user.id],
	}),
}));
