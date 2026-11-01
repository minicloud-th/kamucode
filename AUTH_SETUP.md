# Enable social sign-in

Existing email-account login works independently; new email signup is disabled. To enable a social button, the shop owner creates an OAuth application at that provider and enters its client ID and secret through the Site's runtime environment settings. The supported setting names are listed only in .env.example. Never commit secrets or paste them into page code.

Use the production Site origin below. If the Site slug changes, update its runtime base URL and every provider's allowed callback.

| Provider | Exact callback URL |
| --- | --- |
| Google | https://kamucode.kawertyff-2.chatgpt.site/api/auth/callback/google |
| Discord | https://kamucode.kawertyff-2.chatgpt.site/api/auth/callback/discord |
| LINE | https://kamucode.kawertyff-2.chatgpt.site/api/auth/callback/line |
| GitHub | https://kamucode.kawertyff-2.chatgpt.site/api/auth/callback/github |
| Microsoft | https://kamucode.kawertyff-2.chatgpt.site/api/auth/callback/microsoft |
| GitLab | https://kamucode.kawertyff-2.chatgpt.site/api/auth/callback/gitlab |

Provider consoles:

- Google: https://console.cloud.google.com/apis/credentials
- Discord: https://discord.com/developers/applications
- LINE: https://developers.line.biz/console/
- GitHub: https://github.com/settings/developers
- Microsoft: https://entra.microsoft.com/
- GitLab: https://gitlab.com/-/user_settings/applications

LINE must be allowed to request the email scope in its developer console; the store requires an email for membership. Microsoft uses the common tenant and skips the profile-photo request. Register the web redirect URI and select the intended supported account types in the provider console. Account linking is disabled: the app does not silently merge accounts sharing an email.

Once a provider is configured, verify one real login with an account the owner controls. Check the callback, email, session, logout and direct redirect to the store. Adapters have been integrated and compiled, but provider end-to-end login cannot be tested without those OAuth applications.

The existing Site access gate remains separate. Social and email accounts do not make an owner-private Site accessible to the public.

## Email delivery

New email signup is disabled. Existing email accounts retain their verification status. To add email verification or self-service password recovery, connect a mail delivery service with a verified sending identity, implement the delivery hooks, then enable the corresponding Better Auth features. Do not claim verification or automatic reset emails until delivery is tested.
