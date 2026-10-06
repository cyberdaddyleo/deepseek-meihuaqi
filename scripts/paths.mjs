import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
export const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
export const commit = "639ed015397290b3745d163aafe02ffee4aa3f84";
