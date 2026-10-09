"use client";

import AdminResourcePage from "../../../components/AdminResourcePage";

export default function PurchasesAdminPage() {
  return (
    <AdminResourcePage
      resource="purchases"
      title="Student Purchases & Entitlements"
      description="View verified student purchases linking payments, access groups, courses, and active validity periods."
    />
  );
}
