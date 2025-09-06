# Google OAuth Setup for Coachiles

Follow these steps to enable Google authentication with Supabase:

## 1. Create Google Cloud OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create (or select) a project.
3. Enable the `Google+ APIs` or simply proceed (modern console does not require explicit enable for basic profile).
4. In the left menu: APIs & Services > Credentials.
5. Click `Create Credentials` > `OAuth client ID`.
6. Application type: `Web application`.
7. Add authorized JavaScript origins:
   - `http://localhost:5173` (Vite dev server) or your local dev URL.
   - Production domain, e.g. `https://app.coachiles.com`.
8. Add authorized redirect URIs (VERY IMPORTANT):
   - `http://localhost:5173/auth/callback`
   - `https://app.coachiles.com/auth/callback`
   - (Optional) Any other environment domains.

Note: Supabase uses a single callback pattern; in the Supabase dashboard you will set the redirect rather than in code when using PKCE.

## 2. Configure Supabase Authentication

1. Open Supabase project dashboard.
2. Go to `Authentication > Providers > Google`.
3. Toggle Google provider ON.
4. Fill in:
   - Client ID
   - Client Secret
5. Save.
6. In `Authentication > URL Configuration` set:
   - `Site URL`: `http://localhost:5173` for dev (later your prod URL)
   - `Additional Redirect URLs` include:
     - `http://localhost:5173/auth` (since we send redirectTo there)
     - `http://localhost:5173/auth?provider=google`
     - Production equivalents: `https://app.coachiles.com/auth` and `https://app.coachiles.com/auth?provider=google`

(You can also list `/auth/callback` if you later introduce a dedicated callback route.)

## 3. Environment Variables (.env)

Ensure these are present:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

No extra Google secrets are required client-side because Supabase handles the OAuth handshake server-side.

## 4. Frontend Integration Summary

- `AuthForm.vue` and `CoachSignup.vue` call `authStore.signInWithProvider('google')` (signup page direct supabase call can be refactored similarly if desired).
- `auth.ts` store exposes `signInWithProvider` using PKCE.
- After redirect back to `/auth?provider=google` the `authStore.initialize()` (already invoked in `main.ts`) plus `onAuthStateChange` listener finalizes the session.
- Router guard redirects the authenticated coach accordingly.

## 5. Post-Login Flow

If a user signs in with Google for the first time and no coach profile exists:

- `isCoach` will be false.
- Navigation to protected coach routes triggers redirect to `/coach/registration` (guard logic already implemented).

## 6. Troubleshooting

| Issue                           | Cause                                 | Fix                                                                                                       |
| ------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Popup blocked                   | Browser blocked window                | Supabase uses full redirect (PKCE); ensure not using popup mode.                                          |
| `redirect_url_not_allowed`      | Missing redirect in Supabase settings | Add exact URL (including query) to Auth > URL Configuration.                                              |
| Infinite redirect loop          | Local storage corrupted               | Use DevTools > Application > Local Storage: clear keys starting with `supabase` & `coachiles-auth-token`. |
| Sign in succeeds but no profile | Coach row not auto-created            | User must complete registration at `/coach/registration`.                                                 |
| Consent every time              | Missing offline access config         | Keep `prompt=consent` only if you need refresh token renewal; otherwise remove.                           |

## 7. Optional Enhancements

- Add a dedicated `OAuthCallback.vue` to show a spinner.
- Capture marketing campaign params and store in `user_metadata` after first login.
- Implement telemetry on auth events.
- Add error toast on `signInWithProvider` catch.

## 8. Security Notes

- Never expose the Google client secret in the frontend.
- PKCE enabled in Supabase client config (`flowType: 'pkce'`).
- Consider restricting allowed domains if only professional emails are allowed.

---

This file documents the complete Google OAuth setup for current architecture. Update if redirect patterns change.
