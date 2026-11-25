from decimal import Decimal
from django.test import TestCase, override_settings
from django.core import mail
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from .models import (
    Category,
    Program,
    AcademicPeriod,
    Subject,
    AccessGroup,
    UserAccessGroup,
    Course,
    Chapter,
    Lesson,
    Material,
    UserProfile,
    Payment,
    Purchase,
    Enrollment,
    ContactMessage,
    SocialLink,
    SiteStatistic,
    AuditLog,
    PasswordResetToken,
    UserCourseAccess,
)
from .access import has_course_access


class BTMathBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Admin
        self.admin_user = User.objects.create_superuser(
            username="admin@btmath.com",
            email="admin@btmath.com",
            password="AdminPassword123"
        )
        UserProfile.objects.create(
            user=self.admin_user,
            full_name="Admin Faculty",
            role="admin"
        )

        # Create Category & Program
        self.category_plus2 = Category.objects.create(
            name="+2 Science",
            level="plus2",
            description="+2 Science Stream"
        )
        self.program_plus2 = Program.objects.create(
            category=self.category_plus2,
            name="Class 11 Science",
            duration_info="1 Year"
        )

        # Create Academic Period & Subject
        self.period_11 = AcademicPeriod.objects.create(
            program=self.program_plus2,
            name="Grade 11",
            period_type="grade"
        )
        self.subject_math = Subject.objects.create(
            program=self.program_plus2,
            academic_period=self.period_11,
            name="Mathematics",
            code="MTH-11"
        )

        # Create Access Group
        self.ag_plus_two = AccessGroup.objects.create(
            name="PLUS_TWO",
            slug="plus_two",
            description="Access for all +2 Mathematics courses"
        )

        # Create Course assigned to AccessGroup
        self.course_math11 = Course.objects.create(
            title="Science 11 Mathematics",
            slug="science-11-mathematics",
            description="Complete Grade 11 Mathematics",
            program=self.program_plus2,
            academic_period=self.period_11,
            subject=self.subject_math,
            access_group=self.ag_plus_two,
            price=Decimal("1500.00"),
            course_type="paid",
            is_published=True
        )

        # Create Chapter, Lesson, and Material
        self.chapter = Chapter.objects.create(
            course=self.course_math11,
            title="Chapter 1: Sets & Functions",
            order=1
        )
        self.lesson = Lesson.objects.create(
            chapter=self.chapter,
            title="Lesson 1.1: Introduction to Sets",
            video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            content="Premium lesson explanation that must stay private.",
            order=1
        )
        self.material_premium = Material.objects.create(
            course=self.course_math11,
            chapter=self.chapter,
            lesson=self.lesson,
            title="Complete Sets Notes & Practice PDF",
            material_type="pdf",
            access_type="premium",
            content_text="Private protected lecture notes on sets and cardinality.",
            order=1
        )

    # =========================================================================
    # 1. Registration & Unique Student ID (BTM-XXXXXX)
    # =========================================================================
    def test_student_registration_and_id_generation(self):
        payload = {
            "full_name": "Ramesh Adhikari",
            "email": "ramesh@example.com",
            "password": "Password123",
            "confirm_password": "Password123",
            "phone": "9800000001",
            "education_level": "+2 Science"
        }
        res = self.client.post("/api/auth/register/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data.get("success"))
        student_id = res.data.get("student_id")
        self.assertTrue(student_id.startswith("BTM-"))

        # Check in DB
        user = User.objects.get(email="ramesh@example.com")
        self.assertEqual(user.profile.student_id, student_id)
        self.assertEqual(user.profile.phone, "9800000001")

    # =========================================================================
    # 2. Login with Email or Student ID & Disabled Account Blocking
    # =========================================================================
    def test_login_with_email_and_student_id(self):
        # Register student
        user = User.objects.create_user(
            username="student_test@example.com",
            email="student_test@example.com",
            password="SecurePassword123"
        )
        profile = UserProfile.objects.create(
            user=user,
            full_name="Student Test",
            role="student"
        )
        student_id = profile.student_id
        self.assertTrue(student_id.startswith("BTM-"))

        # Login by email
        res_email = self.client.post("/api/auth/login/", {
            "username": "student_test@example.com",
            "password": "SecurePassword123"
        }, format="json")
        self.assertEqual(res_email.status_code, status.HTTP_200_OK)
        self.assertIn("access", res_email.data)

        # Login by student ID
        res_sid = self.client.post("/api/auth/login/", {
            "username": student_id,
            "password": "SecurePassword123"
        }, format="json")
        self.assertEqual(res_sid.status_code, status.HTTP_200_OK)
        self.assertIn("access", res_sid.data)

        # Disable student and verify login blocked
        profile.is_disabled = True
        profile.save()
        res_disabled = self.client.post("/api/auth/login/", {
            "username": student_id,
            "password": "SecurePassword123"
        }, format="json")
        self.assertEqual(res_disabled.status_code, status.HTTP_403_FORBIDDEN)

    # =========================================================================
    # 3. Password Reset Workflow
    # =========================================================================
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", DEFAULT_FROM_EMAIL="BTMath <test@btmath.local>", FRONTEND_URL="https://btmath.example")
    def test_password_reset_flow(self):
        user = User.objects.create_user(
            username="forgot_pwd@example.com",
            email="forgot_pwd@example.com",
            password="OldPassword123"
        )
        UserProfile.objects.create(user=user)

        # Request reset
        res_forgot = self.client.post("/api/auth/forgot-password/", {
            "email": "forgot_pwd@example.com"
        }, format="json")
        self.assertEqual(res_forgot.status_code, status.HTTP_200_OK)
        self.assertNotIn("dev_reset_token", res_forgot.data)
        self.assertEqual(len(mail.outbox), 1)
        token_obj = PasswordResetToken.objects.get(user=user, is_used=False)
        token = token_obj.token
        self.assertIn(token, mail.outbox[0].body)

        # Reset password
        res_reset = self.client.post("/api/auth/reset-password/", {
            "token": token,
            "new_password": "NewStrongPassword123",
            "confirm_password": "NewStrongPassword123"
        }, format="json")
        self.assertEqual(res_reset.status_code, status.HTTP_200_OK)

        # Authenticate with new password
        res_login = self.client.post("/api/auth/login/", {
            "username": "forgot_pwd@example.com",
            "password": "NewStrongPassword123"
        }, format="json")
        self.assertEqual(res_login.status_code, status.HTTP_200_OK)

    # =========================================================================
    # 4. Critical Access Control Test (Section 111)
    # =========================================================================
    def test_access_group_controls_course_content_access(self):
        # Student A with PLUS_TWO access
        student_a = User.objects.create_user(
            username="student_a@example.com",
            email="student_a@example.com",
            password="Password123"
        )
        UserProfile.objects.create(user=student_a)
        UserAccessGroup.objects.create(
            user=student_a,
            access_group=self.ag_plus_two,
            is_active=True
        )

        # Student B with NO access
        student_b = User.objects.create_user(
            username="student_b@example.com",
            email="student_b@example.com",
            password="Password123"
        )
        UserProfile.objects.create(user=student_b)

        # Check Django access engine
        self.assertTrue(has_course_access(student_a, self.course_math11))
        self.assertFalse(has_course_access(student_b, self.course_math11))

        # Test DRF API response for Student A
        self.client.force_authenticate(user=student_a)
        res_a = self.client.get(f"/api/courses/{self.course_math11.slug}/")
        self.assertEqual(res_a.status_code, status.HTTP_200_OK)
        lesson_a = res_a.data["chapters"][0]["lessons"][0]
        self.assertFalse(lesson_a["is_locked"])
        self.assertIn("Premium lesson explanation", lesson_a["content"])
        self.assertTrue(lesson_a["video_url"])
        material_a = res_a.data["materials"][0]
        self.assertFalse(material_a["is_locked"])
        self.assertIn("Private protected lecture notes", material_a["content_text"])

        # Test DRF API response for Student B
        self.client.force_authenticate(user=student_b)
        res_b = self.client.get(f"/api/courses/{self.course_math11.slug}/")
        self.assertEqual(res_b.status_code, status.HTTP_200_OK)
        lesson_b = res_b.data["chapters"][0]["lessons"][0]
        self.assertTrue(lesson_b["is_locked"])
        self.assertEqual(lesson_b["content"], "")
        self.assertEqual(lesson_b["video_url"], "")
        material_b = res_b.data["materials"][0]
        self.assertTrue(material_b["is_locked"])
        self.assertIn("This content is premium", material_b["content_text"])

    # =========================================================================
    # 5. Critical Payment Approval & Purchase & Audit Test (Section 112)
    # =========================================================================
    def test_payment_approval_activates_access_group_and_purchase_and_audit(self):
        student = User.objects.create_user(
            username="payer@example.com",
            email="payer@example.com",
            password="Password123"
        )
        UserProfile.objects.create(user=student)

        # 1. Initially student has NO access
        self.assertFalse(has_course_access(student, self.course_math11))

        # 2. Student submits payment
        self.client.force_authenticate(user=student)
        res_pay = self.client.post("/api/payments/submit/", {
            "course_id": self.course_math11.id,
            "amount": "1500.00",
            "payment_method": "esewa",
            "transaction_code": "ESW99887766",
            "note": "Paid via eSewa app"
        }, format="json")
        self.assertEqual(res_pay.status_code, status.HTTP_201_CREATED)
        payment_id = res_pay.data["payment"]["id"]

        # Student still has NO access while payment is pending
        self.assertFalse(has_course_access(student, self.course_math11))

        # 3. Admin approves payment
        self.client.force_authenticate(user=self.admin_user)
        res_approve = self.client.post(f"/api/admin/payments/{payment_id}/approve/")
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)

        # 4. Verify Payment is approved
        payment = Payment.objects.get(pk=payment_id)
        self.assertEqual(payment.status, "approved")
        self.assertEqual(payment.verified_by, self.admin_user)

        # 5. Verify Student automatically received PLUS_TWO Access Group
        user_ag = UserAccessGroup.objects.filter(
            user=student,
            access_group=self.ag_plus_two,
            is_active=True
        ).first()
        self.assertIsNotNone(user_ag)

        # 6. Verify Purchase record is created and active
        purchase = Purchase.objects.filter(
            user=student,
            payment=payment,
            is_active=True
        ).first()
        self.assertIsNotNone(purchase)
        self.assertEqual(purchase.access_group, self.ag_plus_two)

        # 7. Verify Student now has full course access!
        self.assertTrue(has_course_access(student, self.course_math11))

        # 8. Verify AuditLog recorded the approval
        audit = AuditLog.objects.filter(
            admin=self.admin_user,
            action="PAYMENT_APPROVED",
            target_id=str(payment_id)
        ).first()
        self.assertIsNotNone(audit)

        # Re-approving the same payment must not duplicate entitlement or audit side effects.
        self.client.post(f"/api/admin/payments/{payment_id}/approve/")
        self.assertEqual(
            AuditLog.objects.filter(
                admin=self.admin_user,
                action="PAYMENT_APPROVED",
                target_id=str(payment_id),
            ).count(),
            1,
        )

    # =========================================================================
    # 6. Payment Rejection
    # =========================================================================
    def test_payment_rejection_leaves_access_inactive(self):
        student = User.objects.create_user(
            username="rejected_payer@example.com",
            email="rejected_payer@example.com",
            password="Password123"
        )
        UserProfile.objects.create(user=student)

        payment = Payment.objects.create(
            user=student,
            course=self.course_math11,
            access_group=self.ag_plus_two,
            amount=Decimal("1500.00"),
            payment_method="bank_transfer",
            transaction_code="BANK12345",
            status="pending"
        )

        self.client.force_authenticate(user=self.admin_user)
        res_reject = self.client.post(f"/api/admin/payments/{payment.id}/reject/", {
            "rejection_reason": "Voucher receipt blurry, reference not matched"
        }, format="json")
        self.assertEqual(res_reject.status_code, status.HTTP_200_OK)

        payment.refresh_from_db()
        self.assertEqual(payment.status, "rejected")
        self.assertIn("blurry", payment.rejection_reason)
        self.assertFalse(has_course_access(student, self.course_math11))

        # Check rejection audit log
        audit = AuditLog.objects.filter(
            admin=self.admin_user,
            action="PAYMENT_REJECTED",
            target_id=str(payment.id)
        ).first()
        self.assertIsNotNone(audit)

    # =========================================================================
    # 7. Admin Permission Enforcement (Section 113)
    # =========================================================================
    def test_student_cannot_call_admin_endpoints(self):
        student = User.objects.create_user(
            username="sneaky_student@example.com",
            email="sneaky_student@example.com",
            password="Password123"
        )
        UserProfile.objects.create(user=student)

        self.client.force_authenticate(user=student)

        # Calling admin dashboard must return 403 Forbidden
        res_dash = self.client.get("/api/admin/dashboard/")
        self.assertEqual(res_dash.status_code, status.HTTP_403_FORBIDDEN)

        # Calling admin users must return 403 Forbidden
        res_users = self.client.get("/api/admin/users/")
        self.assertEqual(res_users.status_code, status.HTTP_403_FORBIDDEN)

        # Admin user succeeds
        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.get("/api/admin/dashboard/")
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)

    # =========================================================================
    # 8. Site Statistics & Contact Messages
    # =========================================================================
    def test_site_statistics_and_contact(self):
        # Record site visit
        res_visit = self.client.post("/api/statistics/record-visit/", {
            "is_new_visitor": True
        }, format="json")
        self.assertEqual(res_visit.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res_visit.data["total_visitors"], 1)

        # Get counters
        res_counters = self.client.get("/api/statistics/counters/")
        self.assertEqual(res_counters.status_code, status.HTTP_200_OK)
        self.assertIn("total_visitors", res_counters.data)
        self.assertIn("total_courses", res_counters.data)

        # Submit contact message
        res_contact = self.client.post("/api/contact/", {
            "name": "Bikash Pal",
            "email": "bikash@example.com",
            "phone": "9812345678",
            "subject": "Inquiry about IOE mathematics tricks",
            "message": "When will the 2081 model questions be uploaded?"
        }, format="json")
        self.assertEqual(res_contact.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_payment_submission_uses_server_price_and_rejects_tampering(self):
        student = User.objects.create_user(
            username="tamper@example.com",
            email="tamper@example.com",
            password="Password123",
        )
        UserProfile.objects.create(user=student)
        self.client.force_authenticate(user=student)

        response = self.client.post("/api/payments/submit/", {
            "course_id": self.course_math11.id,
            "amount": "1.00",
            "payment_method": "esewa",
            "transaction_code": "TAMPER-001",
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Payment.objects.filter(user=student).count(), 0)

        response = self.client.post("/api/payments/submit/", {
            "course_id": self.course_math11.id,
            "amount": "1500.00",
            "payment_method": "esewa",
            "transaction_code": "VALID-001",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(str(response.data["payment"]["amount"])), Decimal("1500.00"))

    def test_unrelated_legacy_access_does_not_unlock_paid_course(self):
        student = User.objects.create_user(
            username="legacy@example.com",
            email="legacy@example.com",
            password="Password123",
        )
        UserProfile.objects.create(user=student)
        UserCourseAccess.objects.create(
            user=student,
            package="Old unrelated package",
            is_active=True,
        )
        self.assertFalse(has_course_access(student, self.course_math11))

    def test_expired_access_group_does_not_unlock_paid_course(self):
        student = User.objects.create_user(
            username="expired@example.com",
            email="expired@example.com",
            password="Password123",
        )
        UserProfile.objects.create(user=student)
        UserAccessGroup.objects.create(
            user=student,
            access_group=self.ag_plus_two,
            is_active=True,
            expires_at=timezone.now() - timezone.timedelta(days=1),
        )
        self.assertFalse(has_course_access(student, self.course_math11))

    def test_locked_material_progress_cannot_be_toggled(self):
        student = User.objects.create_user(
            username="progress-locked@example.com",
            email="progress-locked@example.com",
            password="Password123",
        )
        UserProfile.objects.create(user=student)
        self.client.force_authenticate(user=student)

        response = self.client.post(f"/api/progress/toggle/{self.material_premium.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_expired_course_purchase_does_not_unlock_course(self):
        student = User.objects.create_user(
            username="expired-purchase@example.com",
            email="expired-purchase@example.com",
            password="Password123",
        )
        UserProfile.objects.create(user=student)
        Purchase.objects.create(
            user=student,
            course=self.course_math11,
            amount=Decimal("1500.00"),
            is_active=True,
            expires_at=timezone.now() - timezone.timedelta(days=1),
        )
        self.assertFalse(has_course_access(student, self.course_math11))


class AcademicAdminHierarchyTests(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username="academic-admin",
            email="academic-admin@example.com",
            password="TestAdminPassword123!",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin_user)

    def test_admin_can_create_sections_programs_and_nested_periods(self):
        section_response = self.client.post(
            "/api/admin/categories/",
            {
                "name": "Foundation",
                "level": "foundation",
                "description": "Additional academic section",
            },
            format="json",
        )
        self.assertEqual(section_response.status_code, status.HTTP_201_CREATED)
        section_id = section_response.data["id"]

        program_response = self.client.post(
            "/api/admin/programs/",
            {
                "category": section_id,
                "name": "Secondary Mathematics",
                "description": "",
                "duration_info": "2 years",
            },
            format="json",
        )
        self.assertEqual(program_response.status_code, status.HTTP_201_CREATED)
        program_id = program_response.data["id"]

        grade_response = self.client.post(
            "/api/admin/academic-periods/",
            {
                "program": program_id,
                "parent": None,
                "name": "Grade 11",
                "period_type": "grade",
                "order": 1,
                "description": "",
            },
            format="json",
        )
        self.assertEqual(grade_response.status_code, status.HTTP_201_CREATED)
        grade_id = grade_response.data["id"]

        semester_response = self.client.post(
            "/api/admin/academic-periods/",
            {
                "program": program_id,
                "parent": grade_id,
                "name": "Term 1",
                "period_type": "term",
                "order": 1,
                "description": "",
            },
            format="json",
        )
        self.assertEqual(semester_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(semester_response.data["parent"], grade_id)

        sections_response = self.client.get("/api/admin/categories/")
        self.assertEqual(sections_response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            any(item["id"] == section_id for item in sections_response.data)
        )
