
from urllib import request

from .access import has_course_access
from rest_framework import serializers
from .access import has_course_access, get_course_section
from django.db import models
from django.contrib.auth.models import User
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
    ContactMessage,
    SocialLink,
    SiteStatistic,
    AuditLog,
    PasswordResetToken,
)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "student_id",
            "full_name",
            "phone",
            "profile_picture",
            "bio",
            "education_level",
            "address",
            "date_of_birth",
            "is_disabled",
            "role",
            "created_at",
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff", "profile"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "level", "description", "image"]


class AcademicPeriodSerializer(serializers.ModelSerializer):
    sub_periods = serializers.SerializerMethodField()

    class Meta:
        model = AcademicPeriod
        fields = [
            "id",
            "name",
            "period_type",
            "parent",
            "order",
            "description",
            "sub_periods",
        ]

    def get_sub_periods(self, obj):
        children = obj.sub_periods.all().order_by("order")
        return AcademicPeriodSerializer(children, many=True, context=self.context).data


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "code", "description", "academic_period", "program"]


class MaterialSerializer(serializers.ModelSerializer):
    is_locked = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            "id",
            "title",
            "material_type",
            "access_type",
            "is_locked",
            "is_completed",
            "file",
            "video_url",
            "resource_url",
            "content_text",
            "description",
            "order",
            "is_published",
            "created_at",
        ]

    def _has_access(self, obj):
        # Free and preview materials are always available
        if obj.access_type in ["free", "preview"]:
            return True

        request = self.context.get("request")
        if not request:
            return False

        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_staff or user.is_superuser:
            return True

        course = None
        if obj.course_id:
            course = obj.course
        elif obj.chapter and obj.chapter.course_id:
            course = obj.chapter.course
        elif obj.lesson and obj.lesson.chapter and obj.lesson.chapter.course_id:
            course = obj.lesson.chapter.course

        if not course:
            return False

        return has_course_access(user, course)

    def get_is_locked(self, obj):
        return not self._has_access(obj)

    def get_is_completed(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return MaterialProgress.objects.filter(
            user=request.user,
            material=obj,
            is_completed=True,
        ).exists()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get("is_locked"):
            data["file"] = None
            data["video_url"] = ""
            data["resource_url"] = ""
            data["content_text"] = (
                "This content is premium. "
                "Please purchase access to this section/access group to unlock it."
            )
        return data


class LessonSerializer(serializers.ModelSerializer):
    materials = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id",
            "chapter",
            "title",
            "description",
            "content",
            "video_url",
            "order",
            "is_published",
            "materials",
            "created_at",
        ]

    def get_materials(self, obj):
        materials = obj.materials.filter(is_published=True).order_by("order", "id")
        return MaterialSerializer(materials, many=True, context=self.context).data


class ChapterSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()
    materials = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = [
            "id",
            "title",
            "description",
            "order",
            "is_published",
            "lessons",
            "materials",
        ]

    def get_lessons(self, obj):
        lessons = obj.lessons.filter(is_published=True).order_by("order", "id")
        return LessonSerializer(lessons, many=True, context=self.context).data

    def get_materials(self, obj):
        materials = obj.materials.filter(is_published=True).order_by("order", "id")
        return MaterialSerializer(materials, many=True, context=self.context).data


class CourseListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="program.category.name", read_only=True)
    category_level = serializers.CharField(source="program.category.level", read_only=True)
    program_name = serializers.CharField(source="program.name", read_only=True)
    academic_period_name = serializers.CharField(source="academic_period.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    access_group_name = serializers.CharField(source="access_group.name", read_only=True)
    chapters_count = serializers.IntegerField(source="chapters.count", read_only=True)
    materials_count = serializers.IntegerField(source="materials.count", read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "discount_price",
            "course_type",
            "instructor",
            "thumbnail",
            "is_published",
            "is_free",
            "featured",
            "order",
            "access_group",
            "access_group_name",
            "category_name",
            "category_level",
            "program_name",
            "academic_period_name",
            "subject_name",
            "chapters_count",
            "materials_count",
            "is_enrolled",
            "created_at",
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return has_course_access(request.user, obj)


class CourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    materials = MaterialSerializer(many=True, read_only=True)
    program_name = serializers.CharField(source="program.name", read_only=True)
    academic_period_name = serializers.CharField(source="academic_period.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    access_group_name = serializers.CharField(source="access_group.name", read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    has_access = serializers.SerializerMethodField()
    section = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "discount_price",
            "course_type",
            "instructor",
            "thumbnail",
            "is_published",
            "is_free",
            "featured",
            "order",
            "access_group",
            "access_group_name",
            "program",
            "program_name",
            "academic_period",
            "academic_period_name",
            "subject",
            "subject_name",
            "is_enrolled",
            "has_access",
            "section",
            "progress_percentage",
            "chapters",
            "materials",
            "created_at",
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return has_course_access(request.user, obj)

    def get_has_access(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return has_course_access(request.user, obj)

    def get_section(self, obj):
        return get_course_section(obj)

    def get_progress_percentage(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return 0
        total_materials = Material.objects.filter(
            models.Q(course=obj) | models.Q(chapter__course=obj)
        ).count()
        if total_materials == 0:
            return 0
        completed = MaterialProgress.objects.filter(
            user=request.user,
            material__in=Material.objects.filter(
                models.Q(course=obj) | models.Q(chapter__course=obj)
            ),
            is_completed=True
        ).count()
        return round((completed / total_materials) * 100)


class SemesterSerializer(serializers.ModelSerializer):
    courses = CourseListSerializer(many=True, read_only=True)

    class Meta:
        model = Semester
        fields = ["id", "name", "order", "courses"]


class ProgramSerializer(serializers.ModelSerializer):
    academic_periods = serializers.SerializerMethodField()
    semesters = SemesterSerializer(many=True, read_only=True)
    courses = CourseListSerializer(many=True, read_only=True)

    class Meta:
        model = Program
        fields = [
            "id",
            "name",
            "description",
            "duration_info",
            "academic_periods",
            "semesters",
            "courses",
        ]

    def get_academic_periods(self, obj):
        # Top-level periods
        top_periods = obj.academic_periods.filter(parent__isnull=True).order_by("order")
        return AcademicPeriodSerializer(top_periods, many=True, context=self.context).data


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "course", "status", "start_date", "expiry_date"]


class PaymentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "user_username",
            "course",
            "course_title",
            "amount",
            "payment_method",
            "transaction_code",
            "payment_proof",
            "status",
            "rejection_reason",
            "created_at",
            "verified_at",
        ]
        read_only_fields = ["id", "user", "status", "rejection_reason", "created_at", "verified_at"]

from rest_framework import serializers

from django.db import models
from django.contrib.auth.models import User

from .access import (
    has_course_access,
    get_course_section,
)

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
)


# =========================================================
# USER PROFILE
# =========================================================

class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile

        fields = [
            "full_name",
            "phone",
            "profile_picture",
            "bio",
            "role",
            "created_at",
        ]


# =========================================================
# USER
# =========================================================

class UserSerializer(serializers.ModelSerializer):

    profile = UserProfileSerializer(
        read_only=True
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "profile",
        ]


# =========================================================
# CATEGORY
# =========================================================

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category

        fields = [
            "id",
            "name",
            "level",
            "description",
            "image",
        ]


# =========================================================
# ACADEMIC PERIOD
# =========================================================

class AcademicPeriodSerializer(serializers.ModelSerializer):

    sub_periods = serializers.SerializerMethodField()

    class Meta:
        model = AcademicPeriod

        fields = [
            "id",
            "name",
            "period_type",
            "parent",
            "order",
            "description",
            "sub_periods",
        ]

    def get_sub_periods(self, obj):

        children = (
            obj.sub_periods
            .all()
            .order_by("order")
        )

        return AcademicPeriodSerializer(
            children,
            many=True,
            context=self.context
        ).data


# =========================================================
# SUBJECT
# =========================================================

class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subject

        fields = [
            "id",
            "name",
            "code",
            "description",
            "academic_period",
            "program",
        ]


# =========================================================
# MATERIAL
# =========================================================

class MaterialSerializer(serializers.ModelSerializer):

    is_locked = serializers.SerializerMethodField()

    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Material

        fields = [
            "id",
            "title",
            "material_type",
            "access_type",

            "is_locked",
            "is_completed",

            "file",
            "video_url",
            "resource_url",
            "content_text",

            "description",
            "order",
            "created_at",
        ]

    # -----------------------------------------------------
    # CHECK MATERIAL ACCESS
    # -----------------------------------------------------

    def _has_access(self, obj):

        # Free and preview materials are always available
        if obj.access_type in [
            "free",
            "preview",
        ]:
            return True

        request = self.context.get("request")

        if not request:
            return False

        user = request.user

        if (
            not user
            or not user.is_authenticated
        ):
            return False

        # Admins can access everything
        if (
            user.is_staff
            or user.is_superuser
        ):
            return True

        course = None

        # Material directly belongs to a course
        if obj.course_id:
            course = obj.course

        # Material belongs to a chapter
        elif (
            obj.chapter
            and obj.chapter.course_id
        ):
            course = obj.chapter.course

        if not course:
            return False

        # IMPORTANT:
        # Access is now section-based.
        return has_course_access(
            user,
            course
        )

    # -----------------------------------------------------
    # LOCKED
    # -----------------------------------------------------

    def get_is_locked(self, obj):

        return not self._has_access(obj)

    # -----------------------------------------------------
    # COMPLETED
    # -----------------------------------------------------

    def get_is_completed(self, obj):

        request = self.context.get("request")

        if (
            not request
            or not request.user
            or not request.user.is_authenticated
        ):
            return False

        return MaterialProgress.objects.filter(
            user=request.user,
            material=obj,
            is_completed=True,
        ).exists()

    # -----------------------------------------------------
    # PROTECT PREMIUM CONTENT
    # -----------------------------------------------------

    def to_representation(self, instance):

        data = super().to_representation(
            instance
        )

        if data.get("is_locked"):

            data["file"] = None

            data["video_url"] = ""

            data["resource_url"] = ""

            data["content_text"] = (
                "This content is premium. "
                "Please purchase access to this section "
                "to unlock it."
            )

        return data


# =========================================================
# CHAPTER
# =========================================================

class ChapterSerializer(serializers.ModelSerializer):

    materials = serializers.SerializerMethodField()

    class Meta:
        model = Chapter

        fields = [
            "id",
            "title",
            "description",
            "order",
            "materials",
        ]

    def get_materials(self, obj):

        materials = (
            obj.materials
            .all()
            .order_by(
                "order",
                "id"
            )
        )

        return MaterialSerializer(
            materials,
            many=True,
            context=self.context
        ).data


# =========================================================
# COURSE LIST SERIALIZER
# =========================================================

class CourseListSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="program.category.name",
        read_only=True
    )

    category_level = serializers.CharField(
        source="program.category.level",
        read_only=True
    )

    program_name = serializers.CharField(
        source="program.name",
        read_only=True
    )

    academic_period_name = serializers.CharField(
        source="academic_period.name",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    chapters_count = serializers.IntegerField(
        source="chapters.count",
        read_only=True
    )

    materials_count = serializers.IntegerField(
        source="materials.count",
        read_only=True
    )

    is_enrolled = serializers.SerializerMethodField()

    has_access = serializers.SerializerMethodField()

    section = serializers.SerializerMethodField()

    class Meta:
        model = Course

        fields = [
            "id",
            "title",
            "slug",
            "description",

            "price",
            "discount_price",
            "course_type",

            "instructor",
            "thumbnail",
            "is_published",

            "category_name",
            "category_level",

            "program_name",
            "academic_period_name",
            "subject_name",

            "chapters_count",
            "materials_count",

            "is_enrolled",
            "has_access",
            "section",

            "created_at",
        ]

    # -----------------------------------------------------
    # ACCESS
    # -----------------------------------------------------

    def get_is_enrolled(self, obj):

        request = self.context.get("request")

        if not request:
            return False

        if not request.user.is_authenticated:
            return False

        return has_course_access(
            request.user,
            obj
        )

    # -----------------------------------------------------
    # HAS ACCESS
    # -----------------------------------------------------

    def get_has_access(self, obj):

        request = self.context.get("request")

        if not request:
            return False

        if not request.user.is_authenticated:
            return False

        return has_course_access(
            request.user,
            obj
        )

    # -----------------------------------------------------
    # SECTION
    # -----------------------------------------------------

    def get_section(self, obj):

        return get_course_section(obj)


# =========================================================
# COURSE DETAIL SERIALIZER
# =========================================================

class CourseSerializer(serializers.ModelSerializer):

    chapters = ChapterSerializer(
        many=True,
        read_only=True
    )

    materials = MaterialSerializer(
        many=True,
        read_only=True
    )

    program_name = serializers.CharField(
        source="program.name",
        read_only=True
    )

    academic_period_name = serializers.CharField(
        source="academic_period.name",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    is_enrolled = serializers.SerializerMethodField()

    has_access = serializers.SerializerMethodField()

    section = serializers.SerializerMethodField()

    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Course

        fields = [
            "id",
            "title",
            "slug",
            "description",

            "price",
            "discount_price",
            "course_type",

            "instructor",
            "thumbnail",
            "is_published",

            "program",
            "program_name",

            "academic_period",
            "academic_period_name",

            "subject",
            "subject_name",

            "is_enrolled",
            "has_access",
            "section",

            "progress_percentage",

            "chapters",
            "materials",

            "created_at",
        ]

    # -----------------------------------------------------
    # ACCESS
    # -----------------------------------------------------

    def get_is_enrolled(self, obj):

        request = self.context.get("request")

        if not request:
            return False

        if not request.user.is_authenticated:
            return False

        return has_course_access(
            request.user,
            obj
        )

    # -----------------------------------------------------
    # HAS ACCESS
    # -----------------------------------------------------

    def get_has_access(self, obj):

        request = self.context.get("request")

        if not request:
            return False

        if not request.user.is_authenticated:
            return False

        return has_course_access(
            request.user,
            obj
        )

    # -----------------------------------------------------
    # SECTION
    # -----------------------------------------------------

    def get_section(self, obj):

        return get_course_section(obj)

    # -----------------------------------------------------
    # PROGRESS
    # -----------------------------------------------------

    def get_progress_percentage(self, obj):

        request = self.context.get("request")

        if (
            not request
            or not request.user
            or not request.user.is_authenticated
        ):
            return 0

        total_materials = Material.objects.filter(
            models.Q(course=obj)
            | models.Q(
                chapter__course=obj
            )
        ).count()

        if total_materials == 0:
            return 0

        course_materials = Material.objects.filter(
            models.Q(course=obj)
            | models.Q(
                chapter__course=obj
            )
        )

        completed = MaterialProgress.objects.filter(
            user=request.user,
            material__in=course_materials,
            is_completed=True,
        ).count()

        return round(
            (
                completed
                / total_materials
            ) * 100
        )


# =========================================================
# SEMESTER
# =========================================================

class SemesterSerializer(serializers.ModelSerializer):

    courses = CourseListSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Semester

        fields = [
            "id",
            "name",
            "order",
            "courses",
        ]


# =========================================================
# PROGRAM
# =========================================================

class ProgramSerializer(serializers.ModelSerializer):

    academic_periods = serializers.SerializerMethodField()

    semesters = SemesterSerializer(
        many=True,
        read_only=True
    )

    courses = CourseListSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Program

        fields = [
            "id",
            "name",
            "description",
            "duration_info",

            "academic_periods",
            "semesters",
            "courses",
        ]

    def get_academic_periods(self, obj):

        # Top-level academic periods
        top_periods = (
            obj.academic_periods
            .filter(parent__isnull=True)
            .order_by("order")
        )

        return AcademicPeriodSerializer(
            top_periods,
            many=True,
            context=self.context
        ).data


# =========================================================
# ENROLLMENT
# =========================================================

class EnrollmentSerializer(serializers.ModelSerializer):

    course = CourseListSerializer(
        read_only=True
    )

    class Meta:
        model = Enrollment

        fields = [
            "id",
            "course",
            "status",
            "start_date",
            "expiry_date",
        ]


# =========================================================
# PAYMENT
# =========================================================

class PaymentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(
        source="course.title",
        read_only=True
    )
    access_group_name = serializers.CharField(
        source="access_group.name",
        read_only=True
    )
    user_username = serializers.CharField(
        source="user.username",
        read_only=True
    )
    user_student_id = serializers.CharField(
        source="user.profile.student_id",
        read_only=True,
        default=""
    )
    verified_by_username = serializers.CharField(
        source="verified_by.username",
        read_only=True,
        default=""
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "user_username",
            "user_student_id",
            "course",
            "course_title",
            "access_group",
            "access_group_name",
            "amount",
            "payment_method",
            "transaction_code",
            "payment_proof",
            "note",
            "status",
            "rejection_reason",
            "verified_by",
            "verified_by_username",
            "created_at",
            "verified_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
            "rejection_reason",
            "verified_by",
            "verified_at",
            "created_at",
        ]


# =========================================================
# ACCESS GROUP & PURCHASES
# =========================================================

class AccessGroupSerializer(serializers.ModelSerializer):
    courses_count = serializers.IntegerField(source="courses.count", read_only=True)

    class Meta:
        model = AccessGroup
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "is_active",
            "courses_count",
            "created_at",
            "updated_at",
        ]


class UserAccessGroupSerializer(serializers.ModelSerializer):
    access_group_name = serializers.CharField(source="access_group.name", read_only=True)
    access_group_slug = serializers.CharField(source="access_group.slug", read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)
    student_id = serializers.CharField(source="user.profile.student_id", read_only=True)

    class Meta:
        model = UserAccessGroup
        fields = [
            "id",
            "user",
            "user_username",
            "student_id",
            "access_group",
            "access_group_name",
            "access_group_slug",
            "is_active",
            "granted_at",
            "expires_at",
            "granted_by",
        ]


class PurchaseSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    student_id = serializers.CharField(source="user.profile.student_id", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True, default="")
    access_group_name = serializers.CharField(source="access_group.name", read_only=True, default="")

    class Meta:
        model = Purchase
        fields = [
            "id",
            "user",
            "user_username",
            "student_id",
            "course",
            "course_title",
            "access_group",
            "access_group_name",
            "payment",
            "amount",
            "is_active",
            "created_at",
            "expires_at",
        ]


# =========================================================
# CONTACT & SOCIAL MEDIA
# =========================================================

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "subject",
            "message",
            "is_read",
            "is_replied",
            "is_archived",
            "admin_notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = [
            "id",
            "platform",
            "title",
            "url",
            "icon",
            "is_active",
            "order",
        ]


# =========================================================
# WEBSITE STATISTICS & AUDIT LOGS
# =========================================================

class SiteStatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteStatistic
        fields = [
            "total_visitors",
            "total_page_views",
            "updated_at",
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source="admin.username", read_only=True, default="System")

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "admin",
            "admin_username",
            "action",
            "target_type",
            "target_id",
            "description",
            "ip_address",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# =========================================================
# PASSWORD RECOVERY
# =========================================================

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6)