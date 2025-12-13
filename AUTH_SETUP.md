AUTH_SETUP.md

SkateHubba – Production Authentication Architecture

This document defines the full authentication system for SkateHubba using:

Auth0 (identity, MFA, orgs, roles)

Firebase (data, realtime, storage, notifications)

Next.js (frontend)

A backend token-bridge (Auth0 → Firebase)

Codex, GitHub Copilot, and any Replit agent can follow this file step-by-step to automate the build.

1. Architecture Overview
Auth0 → Access Token → Backend → Firebase Custom Token → Firestore


Auth0 is the source of truth for identity, roles, organization membership, and verification.

Firebase is used for:

user data

spot submissions

video storage

real-time game logic

FCM notifications

caching role snapshots for UI only

No roles or permissions ever come from Firestore.

2. Required Auth0 Components

Auth0 must have the following configured:

2.1 Roles (create these)

Required roles:

member

verified_pro

shop

moderator

admin

Rules:

member is default for all new signups.

verified_pro can verify new pros + legendary spots.

shop is assigned only after business verification.

moderator monitors reports and cheat detection.

admin manages everything.

2.2 Custom Claims (must be namespaced)

Auth0 tokens must include:

https://skatehubba.com/roles
https://skatehubba.com/user_id
https://skatehubba.com/org_id


Example Access Token payload:

{
  "sub": "auth0|abc123",
  "email": "user@example.com",
  "https://skatehubba.com/roles": ["member"],
  "https://skatehubba.com/user_id": "auth0|abc123",
  "https://skatehubba.com/org_id": "org_main"
}

2.3 Auth0 Actions (Post-Login)

Create a Post-Login Action with:

Inject roles into token

Inject org ID

Enforce verified email

Enforce MFA for:

admin

moderator

verified_pro

Codex Notes:
When writing this Action, use the event.authorization.roles array and modify the api.idToken.setCustomClaim() and api.accessToken.setCustomClaim() methods.

3. Token Bridge (Backend)

Firebase must never accept the Auth0 ID token directly.

We use a backend endpoint:

POST /api/auth/auth0-to-firebase

Steps:

Receive Auth0 Access Token from client

Validate the token signature using Auth0 JWKS

Extract roles + org ID

Issue a Firebase Custom Token with these claims:

{
  "roles": ["member", "verified_pro"],
  "orgId": "org_main"
}


Return custom token to client

Client signs into Firebase with:

signInWithCustomToken(firebaseAuth, customToken);

4. Firebase Rules (final and strict)

Firestore must trust only the custom claims.

Example rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Basic read for authenticated users
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }

    // Moderators or Admins can manage reports
    match /reports/{id} {
      allow read, write: if request.auth.token.roles.hasAny(['moderator', 'admin']);
    }

    // Verified Pros can submit legendary spot validations
    match /spots/{id} {
      allow create: if request.auth.token.roles.hasAny(['verified_pro']);
      allow update, delete: if request.auth.token.roles.hasAny(['admin']);
    }
  }
}


Rules never reference Firestore-stored roles.

5. Frontend (Next.js) Integration
5.1 Login Flow

User logs in via Auth0 Universal Login

Browser receives Auth0 Access Token

Frontend calls backend /api/auth/auth0-to-firebase with the token

Receive Firebase custom token

Sign into Firebase

Store role snapshot in Zustand for UI only

5.2 Role Handling in UI

Do not trust client-side values for permissions.

Use:

const roles = user.token.roles; // from Firebase custom token


UI can hide or show elements, but never enforce permission logic.

Backend or Firestore rules enforce security.

6. What Must Be Deleted From Old Auth

Remove:

Firebase email/password auth

Firebase Google provider (Auth0 handles it)

Any Firestore isAdmin, isPro, or role fields used for permission logic

Any client-only “role” checks controlling security

Any “user.role = 'admin'” code in React

Keep Firebase ONLY for data, not identity.

7. Folder Structure (recommended)
/app
  /api
    /auth
      auth0-to-firebase.ts   # token bridge

/lib
  auth0/
  firebase/
  tokens/
  jwks/

AUTH_SETUP.md

/functions
  auth-token-bridge.ts       # optional Cloud Function

8. Environment Variables Required

Create .env.local and .env.server:

Auth0
AUTH0_DOMAIN=skatehubba.us.auth0.com
AUTH0_CLIENT_ID=xxxx
AUTH0_CLIENT_SECRET=xxxx
AUTH0_AUDIENCE=https://skatehubba.com/api
AUTH0_MANAGEMENT_CLIENT_ID=xxxx
AUTH0_MANAGEMENT_CLIENT_SECRET=xxxx

Firebase Admin (server only)
FIREBASE_PROJECT_ID=sk8hub-d7806
FIREBASE_PRIVATE_KEY=xxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@sk8hub-d7806.iam.gserviceaccount.com


Nothing sensitive goes into client-side .env.

9. Testing Matrix (required before deployment)

Create six test accounts:

member

verified_pro

shop

moderator

admin

disabled / banned user

Test:

login

spot creation

spot verification

report submission

admin dashboard

moderator tools

10. Final Checklist

✔ Auth0 roles created
✔ Auth0 Actions implemented
✔ Custom claims injected
✔ Token bridge endpoint running
✔ Firebase accepts custom tokens
✔ Firestore rules updated
✔ Old auth removed
✔ UI uses role snapshot only
✔ Environment variables set
✔ All user classes tested

At this point, authentication is production-ready.