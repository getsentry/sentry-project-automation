import dotenv from "dotenv";
dotenv.config();

import syncFrontend from "./frontend/index.js";
import syncBackend from "./backend/index.js";

syncFrontend();
syncBackend();
