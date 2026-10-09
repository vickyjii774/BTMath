"use client";

import AdminResourcePage from "../../../components/AdminResourcePage";

export default function AccessGroupsAdminPage() {
  return (
    <AdminResourcePage
      resource="access-groups"
      title="Access Groups"
      description="Manage access groups (PLUS_TWO, BACHELOR, MASTER, IOE). Assigning courses to an access group unlocks them dynamically for entitled students."
    />
  );
}
