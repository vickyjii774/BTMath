from django.urls import path

from .views import (
    # Categories & academic hierarchy
    CategoriesAPIView,
    ProgramDetailAPIView,
    BachelorProgramAPIView,
    PlusTwoProgramAPIView,
    MasterProgramAPIView,
    IOEProgramAPIView,

    # Courses
    CourseListAPIView,
    CourseDetailAPIView,

    # Learning
    ToggleMaterialProgressAPIView,

    # Authentication & profile
    RegisterAPIView,
    LoginAPIView,
    MeAPIView,
    UpdateProfileAPIView,
    ChangePasswordAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,

    # Student Access & Dashboard
    StudentDashboardAPIView,
    MySectionAccessAPIView,
    MyAccessGroupsAPIView,
    UserPurchasesListAPIView,

    # Payments
    PaymentSubmitAPIView,
    UserPaymentsListAPIView,

    # Website, Contact & Statistics
    CountersAPIView,
    RecordSiteVisitAPIView,
    ContactMessageCreateAPIView,
    SocialLinkListAPIView,

    # Admin Management
    AdminDashboardView,
    AdminUsersAPIView,
    AdminUserDetailAPIView,
    AdminUserToggleDisableAPIView,
    AdminUserResetPasswordAPIView,
    AdminUserManageAccessAPIView,
    AdminPaymentApproveAPIView,
    AdminPaymentRejectAPIView,
    AdminResourceAPIView,
    AdminSectionAccessAPIView,
)


urlpatterns = [

    # ============================================================
    # CATEGORIES & ACADEMIC HIERARCHY
    # ============================================================

    path(
        "categories/",
        CategoriesAPIView.as_view(),
        name="categories-api",
    ),

    path(
        "programs/<str:pk_or_slug>/",
        ProgramDetailAPIView.as_view(),
        name="program-detail-api",
    ),

    path(
        "bachelor/",
        BachelorProgramAPIView.as_view(),
        name="bachelor-api",
    ),

    path(
        "plus-two/",
        PlusTwoProgramAPIView.as_view(),
        name="plus-two-api",
    ),

    path(
        "master/",
        MasterProgramAPIView.as_view(),
        name="master-api",
    ),

    path(
        "ioe/",
        IOEProgramAPIView.as_view(),
        name="ioe-api",
    ),


    # ============================================================
    # COURSES
    # ============================================================

    path(
        "courses/",
        CourseListAPIView.as_view(),
        name="course-list-api",
    ),

    path(
        "courses/<slug:slug>/",
        CourseDetailAPIView.as_view(),
        name="course-detail-api",
    ),


    # ============================================================
    # LEARNING & PROGRESS
    # ============================================================

    path(
        "progress/toggle/<int:material_id>/",
        ToggleMaterialProgressAPIView.as_view(),
        name="toggle-progress-api",
    ),


    # ============================================================
    # AUTHENTICATION & PROFILE
    # ============================================================

    path(
        "auth/register/",
        RegisterAPIView.as_view(),
        name="register-api",
    ),

    path(
        "auth/login/",
        LoginAPIView.as_view(),
        name="login-api",
    ),

    path(
        "auth/me/",
        MeAPIView.as_view(),
        name="me-api",
    ),

    path(
        "auth/profile/",
        UpdateProfileAPIView.as_view(),
        name="profile-api",
    ),

    path(
        "auth/change-password/",
        ChangePasswordAPIView.as_view(),
        name="change-password-api",
    ),

    path(
        "auth/forgot-password/",
        ForgotPasswordAPIView.as_view(),
        name="forgot-password-api",
    ),

    path(
        "auth/reset-password/",
        ResetPasswordAPIView.as_view(),
        name="reset-password-api",
    ),

    # Student's unlocked sections & access groups
    path(
        "auth/section-access/",
        MySectionAccessAPIView.as_view(),
        name="my-section-access",
    ),

    path(
        "auth/access-groups/",
        MyAccessGroupsAPIView.as_view(),
        name="my-access-groups",
    ),

    path(
        "auth/purchases/",
        UserPurchasesListAPIView.as_view(),
        name="my-purchases",
    ),


    # ============================================================
    # STUDENT DASHBOARD
    # ============================================================

    path(
        "dashboard/",
        StudentDashboardAPIView.as_view(),
        name="student-dashboard-api",
    ),


    # ============================================================
    # PAYMENTS & PURCHASE
    # ============================================================

    path(
        "payments/submit/",
        PaymentSubmitAPIView.as_view(),
        name="payment-submit-api",
    ),

    path(
        "payments/history/",
        UserPaymentsListAPIView.as_view(),
        name="payment-history-api",
    ),


    # ============================================================
    # REAL DATABASE COUNTERS, CONTACT & SOCIAL
    # ============================================================

    path(
        "statistics/",
        CountersAPIView.as_view(),
        name="statistics-summary-api",
    ),

    path(
        "statistics/counters/",
        CountersAPIView.as_view(),
        name="counters-api",
    ),

    path(
        "statistics/record-visit/",
        RecordSiteVisitAPIView.as_view(),
        name="record-site-visit-api",
    ),

    path(
        "contact/",
        ContactMessageCreateAPIView.as_view(),
        name="contact-message-create-api",
    ),

    path(
        "social-links/",
        SocialLinkListAPIView.as_view(),
        name="social-links-list-api",
    ),


    # ============================================================
    # ADMIN DASHBOARD & USER MANAGEMENT
    # ============================================================

    path(
        "admin/dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
    ),

    path(
        "admin/users/",
        AdminUsersAPIView.as_view(),
        name="admin-users",
    ),

    path(
        "admin/users/<str:pk_or_student_id>/detail/",
        AdminUserDetailAPIView.as_view(),
        name="admin-user-detail-search",
    ),

    path(
        "admin/users/<int:pk>/",
        AdminUserDetailAPIView.as_view(),
        name="admin-user-detail",
    ),

    path(
        "admin/users/<int:pk>/toggle-disable/",
        AdminUserToggleDisableAPIView.as_view(),
        name="admin-user-toggle-disable",
    ),

    path(
        "admin/users/<int:pk>/reset-password/",
        AdminUserResetPasswordAPIView.as_view(),
        name="admin-user-reset-password",
    ),

    path(
        "admin/users/<int:pk>/manage-access/",
        AdminUserManageAccessAPIView.as_view(),
        name="admin-user-manage-access",
    ),

    path(
        "admin/payments/<int:pk>/approve/",
        AdminPaymentApproveAPIView.as_view(),
        name="admin-payment-approve",
    ),

    path(
        "admin/payments/<int:pk>/reject/",
        AdminPaymentRejectAPIView.as_view(),
        name="admin-payment-reject",
    ),


    # ============================================================
    # ADMIN SECTION ACCESS
    # ============================================================

    # List all section access records
    # Create/grant section access
    path(
        "admin/section-access/",
        AdminSectionAccessAPIView.as_view(),
        name="admin-section-access",
    ),

    # Update or remove one section access record
    path(
        "admin/section-access/<int:pk>/",
        AdminSectionAccessAPIView.as_view(),
        name="admin-section-access-detail",
    ),


    # ============================================================
    # ADMIN MANAGEMENT
    # ============================================================

    # ------------------------------------------------------------
    # USER REQUESTS
    # ------------------------------------------------------------

    path(
        "admin/requests/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "requests",
        },
        name="admin-requests",
    ),

    path(
        "admin/requests/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "requests",
        },
        name="admin-request-detail",
    ),


    # ------------------------------------------------------------
    # PROGRAMS
    # ------------------------------------------------------------

    path(
        "admin/programs/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "programs",
        },
        name="admin-programs",
    ),

    path(
        "admin/programs/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "programs",
        },
        name="admin-program-detail",
    ),


    # ------------------------------------------------------------
    # ACADEMIC PERIODS
    # ------------------------------------------------------------

    path(
        "admin/academic-periods/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "academic-periods",
        },
        name="admin-academic-periods",
    ),

    path(
        "admin/academic-periods/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "academic-periods",
        },
        name="admin-academic-period-detail",
    ),


    # ------------------------------------------------------------
    # SUBJECTS
    # ------------------------------------------------------------

    path(
        "admin/subjects/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "subjects",
        },
        name="admin-subjects",
    ),

    path(
        "admin/subjects/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "subjects",
        },
        name="admin-subject-detail",
    ),


    # ------------------------------------------------------------
    # COURSES
    # ------------------------------------------------------------

    path(
        "admin/courses/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "courses",
        },
        name="admin-courses",
    ),

    path(
        "admin/courses/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "courses",
        },
        name="admin-course-detail",
    ),


    # ------------------------------------------------------------
    # CHAPTERS
    # ------------------------------------------------------------

    path(
        "admin/chapters/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "chapters",
        },
        name="admin-chapters",
    ),

    path(
        "admin/chapters/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "chapters",
        },
        name="admin-chapter-detail",
    ),


    # ------------------------------------------------------------
    # MATERIALS
    # ------------------------------------------------------------

    path(
        "admin/materials/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "materials",
        },
        name="admin-materials",
    ),

    path(
        "admin/materials/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "materials",
        },
        name="admin-material-detail",
    ),


    # ------------------------------------------------------------
    # ENROLLMENTS
    # ------------------------------------------------------------

    path(
        "admin/enrollments/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "enrollments",
        },
        name="admin-enrollments",
    ),

    path(
        "admin/enrollments/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "enrollments",
        },
        name="admin-enrollment-detail",
    ),


    # ------------------------------------------------------------
    # PAYMENTS
    # ------------------------------------------------------------

    path(
        "admin/payments/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "payments",
        },
        name="admin-payments",
    ),

    path(
        "admin/payments/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "payments",
        },
        name="admin-payment-detail",
    ),

    # ------------------------------------------------------------
    # LESSONS
    # ------------------------------------------------------------

    path(
        "admin/lessons/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "lessons",
        },
        name="admin-lessons",
    ),

    path(
        "admin/lessons/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "lessons",
        },
        name="admin-lesson-detail",
    ),

    # ------------------------------------------------------------
    # ACCESS GROUPS
    # ------------------------------------------------------------

    path(
        "admin/access-groups/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "access-groups",
        },
        name="admin-access-groups",
    ),

    path(
        "admin/access-groups/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "access-groups",
        },
        name="admin-access-group-detail",
    ),

    # ------------------------------------------------------------
    # PURCHASES
    # ------------------------------------------------------------

    path(
        "admin/purchases/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "purchases",
        },
        name="admin-purchases",
    ),

    path(
        "admin/purchases/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "purchases",
        },
        name="admin-purchase-detail",
    ),

    # ------------------------------------------------------------
    # CONTACT MESSAGES
    # ------------------------------------------------------------

    path(
        "admin/contacts/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "contacts",
        },
        name="admin-contacts",
    ),

    path(
        "admin/contacts/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "contacts",
        },
        name="admin-contact-detail",
    ),

    # ------------------------------------------------------------
    # SOCIAL LINKS
    # ------------------------------------------------------------

    path(
        "admin/social-links/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "social-links",
        },
        name="admin-social-links",
    ),

    path(
        "admin/social-links/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "social-links",
        },
        name="admin-social-link-detail",
    ),

    # ------------------------------------------------------------
    # AUDIT LOGS
    # ------------------------------------------------------------

    path(
        "admin/audit-logs/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "audit-logs",
        },
        name="admin-audit-logs",
    ),

    path(
        "admin/audit-logs/<int:pk>/",
        AdminResourceAPIView.as_view(),
        {
            "resource": "audit-logs",
        },
        name="admin-audit-log-detail",
    ),

    path("dashboard/", StudentDashboardAPIView.as_view(), name="student-dashboard"),
    path("my-access-groups/", MyAccessGroupsAPIView.as_view(), name="my-access-groups"),
    path("my-purchases/", UserPurchasesListAPIView.as_view(), name="my-purchases"),
]