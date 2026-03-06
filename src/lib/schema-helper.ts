import { timestamp } from "drizzle-orm/pg-core";

export const timeStamps = {
	createdAt: timestamp("created_at", { mode: "date" })
		.notNull()
		.$defaultFn(() => new Date(Date.now())),
	updatedAt: timestamp("updated_at", { mode: "date" })
		.notNull()
		.$defaultFn(() => new Date(Date.now()))
		.$onUpdateFn(() => new Date(Date.now())),
};
