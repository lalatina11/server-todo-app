import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { timeStamps } from "../../lib/schema-helper";
import { user } from "./auth-schema";

export const todo = pgTable("todos", {
	id: serial().primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	authorId: text("author_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	...timeStamps,
});
