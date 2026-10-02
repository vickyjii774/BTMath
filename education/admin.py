from django.contrib import admin
from django.utils import timezone
from .models import (
    Category,
    Program,
    Semester,
    AcademicPeriod,
    Subject,
    Course,
    Chapter,
    Material,
    UserProfile,
    Enrollment,
    Payment,
    SubscriptionPlan,
    UserSubscription,
    MaterialProgress,

    LoginLog,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "level", "created_at")
    list_filter = ("level",)
    search_fields = ("name",)


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "duration_info")
    list_filter = ("category",)
    search_fields = ("name",)


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ("name", "program", "order")
    list_filter = ("program",)
    search_fields = ("name", "program__name")
    ordering = ("program", "order")


@admin.register(AcademicPeriod)
class AcademicPeriodAdmin(admin.ModelAdmin):
    list_display = ("name", "program", "period_type", "parent", "order")
    list_filter = ("period_type", "program__category", "program")
    search_fields = ("name", "program__name")
    ordering = ("program", "order")


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "program", "academic_period")
    list_filter = ("program__category", "program")
    search_fields = ("name", "code")


class MaterialInline(admin.TabularInline):
    model = Material
    extra = 1
    fields = (
        "title",
        "material_type",
        "access_type",
        "file",
        "video_url",
        "order",
    )


class ChapterInline(admin.StackedInline):
    model = Chapter
    extra = 1
    fields = (
        "title",
        "description",
        "order",
    )


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "program",
        "academic_period",
        "subject",
        "price",
        "discount_price",
        "course_type",
        "is_published",
        "created_at",
    )
    list_filter = (
        "is_published",
        "course_type",
        "program__category",
        "program",
    )
    search_fields = (
        "title",
        "description",
        "program__name",
    )
    prepopulated_fields = {
        "slug": ("title",)
    }
    inlines = [
        ChapterInline,
        MaterialInline,
    ]


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "course",
        "program",
        "order",
    )
    list_filter = (
        "course",
        "program",
    )
    search_fields = (
        "title",
        "course__title",
    )
    ordering = (
        "course",
        "order",
    )


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "material_type",
        "access_type",
        "course",
        "chapter",
        "order",
        "created_at",
    )
    list_filter = (
        "material_type",
        "access_type",
        "course",
    )
    search_fields = (
        "title",
        "description",
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "full_name", "phone", "role", "created_at")
    list_filter = ("role",)
    search_fields = ("user__username", "user__email", "full_name", "phone")


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "status", "start_date", "expiry_date")
    list_filter = ("status", "course")
    search_fields = ("user__username", "user__email", "course__title")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "course",
        "amount",
        "payment_method",
        "transaction_code",
        "status",
        "payment_proof",
        "verified_by",
        "created_at",
    )
    list_filter = ("status", "payment_method", "created_at")
    search_fields = (
        "user__username",
        "user__email",
        "transaction_code",
        "course__title",
    )
    actions = ["approve_payments", "reject_payments"]

    @admin.action(description="Approve selected payments & activate course enrollment")
    def approve_payments(self, request, queryset):
        for payment in queryset:
            payment.status = "approved"
            payment.verified_by = request.user
            payment.verified_at = timezone.now()
            payment.save()

            if payment.course:
                Enrollment.objects.update_or_create(
                    user=payment.user,
                    course=payment.course,
                    defaults={"status": "active"}
                )
        self.message_user(
            request,
            f"{queryset.count()} payment(s) approved and enrollments activated successfully."
        )

    @admin.action(description="Reject selected payments")
    def reject_payments(self, request, queryset):
        queryset.update(
            status="rejected",
            verified_by=request.user,
            verified_at=timezone.now()
        )
        self.message_user(
            request,
            f"{queryset.count()} payment(s) rejected."
        )


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "duration_type", "price", "is_active")
    list_filter = ("duration_type", "is_active")


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "status", "start_date", "expiry_date")
    list_filter = ("status", "plan")


@admin.register(MaterialProgress)
class MaterialProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "material", "is_completed", "completed_at")
    list_filter = ("is_completed",)
    search_fields = ("user__username", "material__title")






@admin.register(LoginLog)
class LoginLogAdmin(admin.ModelAdmin):
    list_display = ("user", "logged_at", "ip_address")
    list_filter = ("logged_at",)
    search_fields = ("user__username", "user__email")

