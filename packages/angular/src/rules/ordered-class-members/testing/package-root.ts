import { fileURLToPath } from "node:url";

export const packageRoot: string = fileURLToPath(new URL("../../../../", import.meta.url));
