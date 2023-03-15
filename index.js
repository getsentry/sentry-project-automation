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

async function traceFn(fn) {
  Sentry.withScope(async scope => {
    const transaction = Sentry.startTransaction({name: fn.name});
    scope.setSpan(transaction);
    await fn();
    transaction.finish();
  });
}

await Promise.all([
  traceFn(syncFrontend),
  traceFn(syncBackend),
  traceFn(syncReplay),
  traceFn(syncIngest),
]);