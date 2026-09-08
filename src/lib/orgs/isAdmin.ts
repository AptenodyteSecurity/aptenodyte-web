import { getMemberships } from "@/lib/orgs/getMemberships";

const APTENODYTE_SLUG = "aptenodyte";
const ADMIN_ROLES = new Set(["owner", "admin"]);

/**
 * True when the signed-in user is an Aptenodyte owner or admin.
 * Membership rows are already scoped by RLS to auth.uid().
 */
export async function isAptenodyteAdmin(): Promise<boolean> {
  const memberships = await getMemberships();
  return memberships.some(
    (membership) =>
      membership.organization.slug === APTENODYTE_SLUG &&
      ADMIN_ROLES.has(membership.role),
  );
}
