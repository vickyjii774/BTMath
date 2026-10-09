"use client";

import AdminResourcePage from "../../../components/AdminResourcePage";

export default function AuditLogsAdminPage() {
  return (
    <AdminResourcePage
      resource="audit-logs"
      title="System Audit Logs"
      description="Track administrator actions including payment approvals, rejections, manual access grants, and account changes."
    />
  );
}
