import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { todo } from "@/db/schema";

export const todoSchema = createInsertSchema(todo);

export type TodoSchemaType = z.infer<typeof todoSchema>;

export const todoParamId = z.object({ id: z.coerce.number() });

export type TodoParamIdSchemaType = z.infer<typeof todoParamId>;
