# Google OAuth Web Login Playbook

## Core Flow

1. Start the OAuth redirect.
   - Generate and persist `state`.
   - Add requested scopes deliberately.
   - Use a trusted redirect URI.
2. Handle the callback.
   - Verify `state` before token exchange.
   - Reject missing or mismatched state.
3. Exchange code for tokens server-side.
   - Never expose client secrets in the browser.
4. Retrieve or validate identity claims.
   - Email
   - Subject identifier
   - Hosted domain when relevant
5. Hand off the authenticated identity.
   - Account linking
   - Session creation
   - Role mapping
6. Redirect to a safe post-login destination.

## Security Checklist

- `state` is generated per login attempt and validated on callback
- Redirect targets are allowlisted or normalized to safe internal paths
- Token exchange happens only on the server
- Sensitive tokens are not stored in client-readable locations unless intentionally designed that way
- Callback failure paths are explicit and safe

## Failure Modes

- Skipping `state` validation
- Treating Google email alone as sufficient authorization without DB checks
- Supporting arbitrary redirect URLs and creating open redirect risk
- Mixing Google login flow with app session creation so tightly that debugging becomes difficult