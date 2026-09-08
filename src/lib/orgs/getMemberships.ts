import { createClient } from "@/lib/supabase/server";
import type { OrgMembership, OrgRole, Organization } from "@/lib/orgs/types";

function isOrgRole(value: string): value is OrgRole {
  return value === "owner" || value === "admin" || value === "member";
}

type MemberRow = {
  role: string;
  organizations: Organization | Organization[] | null;
};

/**
 * Memberships for the signed-in user only (enforced by RLS).
 * Never trusts client-supplied org ids.
 */
export async function getMemberships(): Promise<OrgMembership[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("org_members")
    .select("role, organizations ( id, name, slug )");

  if (error || !data) {
    return [];
  }

  const memberships: OrgMembership[] = [];

  for (const row of data as MemberRow[]) {
    const org = Array.isArray(row.organizations)
      ? row.organizations[0]
      : row.organizations;

    if (!org || !isOrgRole(row.role)) {
      continue;
    }

    memberships.push({
      role: row.role,
      organization: org,
    });
  }

  return memberships;
}
