import dotenv from "dotenv";
dotenv.config();

import Sentry from "@sentry/node";
import syncFrontend from "./frontend/index.js";
import syncBackend from "./backend/index.js";
import syncReplay from "./replay/index.js";
import syncIngest from "./ingest/index.js";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

syncFrontend();
syncBackend();
syncReplay();
// syncIngest();
