import z from "zod";

export const todoSchema = z.object({
	title: z.string().min(3, { message: "Title must be at least 3 characters" }),
	description: z.string().optional(),
});

export type TodoSchemaType = z.infer<typeof todoSchema>;

export const todoParamId = z.object({ id: z.coerce.number() });

export type TodoParamIdSchemaType = z.infer<typeof todoParamId>;
