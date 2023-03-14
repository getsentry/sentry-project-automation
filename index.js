import dotenv from "dotenv";
dotenv.config();

import syncFrontend from "./frontend/index.js";
import syncBackend from "./backend/index.js";
import syncReplay from "./replay/index.js";
import syncIngest from "./ingest/index.js";

import Sentry from "@sentry/node";
import "@sentry/tracing";
import { ProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const frontendTransaction = Sentry.startTransaction({name: "Sync Frontend"});
await syncFrontend();
frontendTransaction.finish();
const backendTransaction = Sentry.startTransaction({name: "Sync Backend"});
await syncBackend();
backendTransaction.finish();
const replayTransaction = Sentry.startTransaction({name: "Sync Replay"});
await syncReplay();
replayTransaction.finish();
const ingestTransaction = Sentry.startTransaction({name: "Sync Ingest"});
await syncIngest();
ingestTransaction.finish();
