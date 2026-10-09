from django.contrib import admin
from django.utils import timezone
from .models import (
    Category,
    Program,
    Semester,
    AcademicPeriod,
    Subject,
    AccessGroup,
    UserAccessGroup,
    Course,
    Chapter,
    Lesson,
    Material,
    UserProfile,
    Enrollment,
    Payment,
    Purchase,
    SubscriptionPlan,
    UserSubscription,
    MaterialProgress,
    LoginLog,
    ContactMessage,
    SocialLink,
    SiteStatistic,
    AuditLog,
    PasswordResetToken,
    UserRequest,
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
        "access_group",
        "price",
        "discount_price",
        "is_free",
        "course_type",
        "is_published",
        "created_at",
    )
    list_filter = (
        "is_published",
        "is_free",
        "access_group",
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
    list_display = ("student_id", "user", "full_name", "phone", "education_level", "role", "is_disabled", "created_at")
    list_filter = ("role", "is_disabled", "education_level")
    search_fields = ("student_id", "user__username", "user__email", "full_name", "phone")


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

    @admin.action(description="Approve selected payments & activate access groups/purchases")
    def approve_payments(self, request, queryset):
        from .views import process_payment_decision
        count = 0
        for payment in queryset:
            process_payment_decision(payment, "approved", admin_user=request.user)
            count += 1
        self.message_user(
            request,
            f"{count} payment(s) approved, purchases created, and access groups granted."
        )

    @admin.action(description="Reject selected payments")
    def reject_payments(self, request, queryset):
        from .views import process_payment_decision
        count = 0
        for payment in queryset:
            process_payment_decision(payment, "rejected", admin_user=request.user, rejection_reason="Rejected by admin action.")
            count += 1
        self.message_user(
            request,
            f"{count} payment(s) rejected."
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


from django.contrib import admin
from .models import UserRequest


@admin.register(UserRequest)
class UserRequestAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "request_type",
        "course",
        "status",
        "reviewed_by",
        "created_at",
    )

    list_filter = (
        "request_type",
        "status",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "message",
        "admin_note",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "reviewed_at",
    )

    ordering = (
        "-created_at",
    )


@admin.register(AccessGroup)
class AccessGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(UserAccessGroup)
class UserAccessGroupAdmin(admin.ModelAdmin):
    list_display = ("user", "access_group", "is_active", "granted_at", "expires_at", "granted_by")
    list_filter = ("is_active", "access_group")
    search_fields = ("user__username", "user__email", "access_group__name")


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "chapter", "order", "is_published", "created_at")
    list_filter = ("is_published", "chapter__course")
    search_fields = ("title", "description", "chapter__title")
    ordering = ("chapter", "order")


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "access_group", "amount", "is_active", "created_at")
    list_filter = ("is_active", "access_group")
    search_fields = ("user__username", "user__email", "course__title")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "subject", "is_read", "is_replied", "is_archived", "created_at")
    list_filter = ("is_read", "is_replied", "is_archived", "created_at")
    search_fields = ("name", "email", "phone", "subject", "message")
    ordering = ("-created_at",)


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ("title", "platform", "url", "is_active", "order")
    list_filter = ("is_active", "platform")
    search_fields = ("title", "url")
    ordering = ("order",)


@admin.register(SiteStatistic)
class SiteStatisticAdmin(admin.ModelAdmin):
    list_display = ("total_visitors", "total_page_views", "updated_at")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("admin", "action", "target_type", "target_id", "ip_address", "created_at")
    list_filter = ("action", "target_type", "created_at")
    search_fields = ("admin__username", "description", "target_id")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "token", "is_used", "expires_at", "created_at")
    list_filter = ("is_used", "created_at")
    search_fields = ("user__username", "user__email", "token")

