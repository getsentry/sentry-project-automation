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
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

async function traceFn(fn, name) {
  const transaction = Sentry.getCurrentHub().getScope().getTransaction();
  const span = transaction.startChild({ op: name });
  Sentry.getCurrentHub().pushScope();
  Sentry.configureScope(scope => scope.setSpan(span));
  try {
    await fn();
  } catch(e) {
    Sentry.captureException(e);
  } finally {
    span.finish();
  }
}

const transaction = Sentry.startTransaction({ name: "main" });
Sentry.configureScope(scope => scope.setSpan(transaction));

await Promise.all([
  traceFn(syncFrontend, "frontend"),
  traceFn(syncBackend, "backend"),
  traceFn(syncReplay, "replay"),
  traceFn(syncIngest, "ingest"),
]);

transaction.finish();