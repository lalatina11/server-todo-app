import * as indexSchema from "./schema";
import * as authSchema from "./schema/auth-schema";
import * as relationsSchema from "./schema/relations";

const tables = { ...indexSchema, ...authSchema, ...relationsSchema };

export default tables;
