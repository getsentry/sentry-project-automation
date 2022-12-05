import dotenv from "dotenv";
dotenv.config();

import syncFrontend from "./frontend/index.js";
import syncBackend from "./backend/index.js";
import syncIngest from "./ingest/index.js";

syncFrontend();
syncBackend();
syncIngest();
