import { relations } from "drizzle-orm";
import { todo } from ".";
import { user } from "./auth-schema";

export const userRelations = relations(user, ({ many }) => ({
	todos: many(todo),
}));

export const todoRelations = relations(todo, ({ one }) => ({
	author: one(user, {
		fields: [todo.authorId],
		references: [user.id],
	}),
}));
