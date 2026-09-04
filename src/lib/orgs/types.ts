export const orgRoles = ["owner", "admin", "member"] as const;

export type OrgRole = (typeof orgRoles)[number];

export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type OrgMembership = {
  role: OrgRole;
  organization: Organization;
};
