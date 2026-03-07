import { isAPIError } from "better-auth/api";
import { auth } from "../lib/auth";

export const handleLoginRepository = async ({
	email,
	password,
}: {
	email: string;
	password: string;
}) => {
	try {
		const result = await auth.api.signInEmail({
			body: {
				email,
				password,
			},
			// This endpoint requires session cookies.
		});
		return {
			success: true,
			message: "Success",
			data: { token: result.token, user: result.user },
		};
	} catch (error) {
		if (isAPIError(error)) {
			switch (error.status) {
				case 401:
					return {
						success: false,
						message: "Invalid Password",
						data: null,
					};
				case 403:
					return {
						success: false,
						message: "Access denied",
						data: null,
					};
				case 429:
					return {
						success: false,
						message: "Rate limit exceeded. Please try again later.",
						data: null,
					};
				default:
					return {
						success: false,
						message: "Invalid Password!",
						data: null,
					};
			}
		} else {
			return {
				success: false,
				message: "An unexpected error occurred",
				data: null,
			};
		}
	}
};
