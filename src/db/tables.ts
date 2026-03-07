import * as authSchema from "./schema/auth-schema.js";
import * as indexSchema from "./schema/index.js";
import * as relationsSchema from "./schema/relations.js";

const tables = { ...indexSchema, ...authSchema, ...relationsSchema };

export default tables;
