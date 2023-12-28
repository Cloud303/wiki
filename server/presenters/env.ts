import { IntegrationType, PublicEnv } from "@shared/types";
import { Environment } from "@server/env";
import { Integration } from "@server/models";

// Note: This entire object is stringified in the HTML exposed to the client
// do not add anything here that should be a secret or password
export default function present(
  env: Environment,
  options: {
    analytics?: Integration<IntegrationType.Analytics> | null;
    rootShareId?: string | null;
  } = {}
): PublicEnv {
  return {
    URL: env.URL.replace(/\/$/, ""),
    AWS_S3_UPLOAD_BUCKET_URL: env.AWS_S3_UPLOAD_BUCKET_URL || "",
    AWS_S3_ACCELERATE_URL: env.AWS_S3_ACCELERATE_URL || "",
    CDN_URL: (env.CDN_URL || "").replace(/\/$/, ""),
    COLLABORATION_URL: (env.COLLABORATION_URL || env.URL)
      .replace(/\/$/, "")
      .replace(/^http/, "ws"),
    ENVIRONMENT: env.ENVIRONMENT,
    SENTRY_DSN: env.SENTRY_DSN,
    SENTRY_TUNNEL: env.SENTRY_TUNNEL,
    SLACK_CLIENT_ID: env.SLACK_CLIENT_ID,
    SLACK_APP_ID: env.SLACK_APP_ID,
    MAXIMUM_IMPORT_SIZE: env.MAXIMUM_IMPORT_SIZE,
    PDF_EXPORT_ENABLED: false,
    DEFAULT_LANGUAGE: env.DEFAULT_LANGUAGE,
    EMAIL_ENABLED: !!env.SMTP_HOST || env.isDevelopment,
    GOOGLE_ANALYTICS_ID: env.GOOGLE_ANALYTICS_ID,
    CHATWOOT_MODE: env.CHATWOOT_MODE,
    CHATWOOT_BASE_URL: env.CHATWOOT_BASE_URL,
    CHATWOOT_WEBSITE_TOKEN: env.CHATWOOT_WEBSITE_TOKEN,
    ODOO_WEBHOOK_ENDPOINT: env.ODOO_WEBHOOK_ENDPOINT,
    SOW_COLLECTION_IDS: env.SOW_COLLECTION_IDS,
    ODOO_WEBHOOK_SECRET: env.ODOO_WEBHOOK_SECRET,
    OIDC_LOGOUT_URL: env.OIDC_LOGOUT_URL,
    RELEASE:
      process.env.SOURCE_COMMIT || process.env.SOURCE_VERSION || undefined,
    APP_NAME: env.APP_NAME,
    ROOT_SHARE_ID: options.rootShareId || undefined,

    analytics: {
      service: options.analytics?.service,
      settings: options.analytics?.settings,
    },
  };
}
