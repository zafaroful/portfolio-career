/**
 * Sentry integration placeholder.
 * Install @sentry/nextjs and initialize when SENTRY_DSN is set.
 */
export function initSentry() {
  if (process.env.SENTRY_DSN) {
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.init({ dsn: process.env.SENTRY_DSN });
  }
}
