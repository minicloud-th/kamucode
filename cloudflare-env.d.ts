declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL?: string;
    GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string;
    DISCORD_CLIENT_ID?: string; DISCORD_CLIENT_SECRET?: string;
    LINE_CLIENT_ID?: string; LINE_CLIENT_SECRET?: string;
    GITHUB_CLIENT_ID?: string; GITHUB_CLIENT_SECRET?: string;
    MICROSOFT_CLIENT_ID?: string; MICROSOFT_CLIENT_SECRET?: string;
    GITLAB_CLIENT_ID?: string; GITLAB_CLIENT_SECRET?: string;
  }
}
