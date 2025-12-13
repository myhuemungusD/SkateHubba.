/**
 * SkateHubba Auth0 Post-Login Action
 * Injects roles, org ID, user_id, and enforces MFA
 */

exports.onExecutePostLogin = async (event, api) => {
  const roles = event.authorization?.roles || [];

  // Inject namespaced custom claims
  api.idToken.setCustomClaim("https://skatehubba.com/roles", roles);
  api.accessToken.setCustomClaim("https://skatehubba.com/roles", roles);

  api.idToken.setCustomClaim("https://skatehubba.com/user_id", event.user.user_id);
  api.accessToken.setCustomClaim("https://skatehubba.com/user_id", event.user.user_id);

  api.idToken.setCustomClaim("https://skatehubba.com/org_id", event.organization?.id || "org_main");
  api.accessToken.setCustomClaim("https://skatehubba.com/org_id", event.organization?.id || "org_main");

  // Email must be verified
  if (!event.user.email_verified) {
    api.access.deny("Email must be verified before accessing SkateHubba.");
    return;
  }

  // MFA enforcement for trusted roles
  const mustUseMFA = ["admin", "moderator", "verified_pro"];
  const userHasPrivilegedRole = roles.some(r => mustUseMFA.includes(r));

  if (userHasPrivilegedRole && !event.authentication?.methods?.some(m => m.name === "mfa")) {
    api.multifactor.enable("any");
  }
};
