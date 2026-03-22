import * as Sentry from "@sentry/nestjs"

Sentry.init({
  dsn: "https://653a54fbe4ddb2ac65fcc583fe585249@o4510936998346753.ingest.de.sentry.io/4510937000968272",

  // Send structured logs to Sentry
  enableLogs: true,
  integrations: [
      Sentry.consoleLoggingIntegration({ levels: ['log', 'info', 'warn', 'error'] })
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});