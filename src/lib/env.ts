import z from "zod";
import "dotenv/config";

const envSchema = z.object({
	DATABASE_URL: z.url(),
	NODE_ENV: z.enum(["development", "production"]),
});

const { success, error, data } = envSchema.safeParse(process.env);

if (!success) {
	throw new Error(
		`Error Loading ENV in ${error.issues[0].path} \n message: ${error.issues[0].message}`,
	);
}

const ENV = data;

export default ENV;
