from django.urls import path
from .views import (
    CategoriesAPIView,
    ProgramDetailAPIView,
    BachelorProgramAPIView,
    PlusTwoProgramAPIView,
    MasterProgramAPIView,
    IOEProgramAPIView,
    CourseListAPIView,
    CourseDetailAPIView,
    ToggleMaterialProgressAPIView,
    RegisterAPIView,
    LoginAPIView,
    MeAPIView,
    UpdateProfileAPIView,
    ChangePasswordAPIView,
    StudentDashboardAPIView,
    PaymentSubmitAPIView,
    UserPaymentsListAPIView,
    CountersAPIView,
)

urlpatterns = [
    # Categories & Hierarchy
    path("categories/", CategoriesAPIView.as_view(), name="categories-api"),
    path("programs/<str:pk_or_slug>/", ProgramDetailAPIView.as_view(), name="program-detail-api"),
    path("bachelor/", BachelorProgramAPIView.as_view(), name="bachelor-api"),
    path("plus-two/", PlusTwoProgramAPIView.as_view(), name="plus-two-api"),
    path("master/", MasterProgramAPIView.as_view(), name="master-api"),
    path("ioe/", IOEProgramAPIView.as_view(), name="ioe-api"),

    # Courses
    path("courses/", CourseListAPIView.as_view(), name="course-list-api"),
    path("courses/<slug:slug>/", CourseDetailAPIView.as_view(), name="course-detail-api"),

    # Learning & Progress
    path("progress/toggle/<int:material_id>/", ToggleMaterialProgressAPIView.as_view(), name="toggle-progress-api"),

    # Authentication & Profile
    path("auth/register/", RegisterAPIView.as_view(), name="register-api"),
    path("auth/login/", LoginAPIView.as_view(), name="login-api"),
    path("auth/me/", MeAPIView.as_view(), name="me-api"),
    path("auth/profile/", UpdateProfileAPIView.as_view(), name="profile-api"),
    path("auth/change-password/", ChangePasswordAPIView.as_view(), name="change-password-api"),

    # Student Dashboard
    path("dashboard/", StudentDashboardAPIView.as_view(), name="student-dashboard-api"),

    # Payments & Purchase
    path("payments/submit/", PaymentSubmitAPIView.as_view(), name="payment-submit-api"),
    path("payments/history/", UserPaymentsListAPIView.as_view(), name="payment-history-api"),

    
   
    # Real Database Counters & Statistics
    path("statistics/counters/", CountersAPIView.as_view(), name="counters-api"),
]

