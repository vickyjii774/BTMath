from rest_framework import serializers
from django.db import models
from django.contrib.auth.models import User
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


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["full_name", "phone", "profile_picture", "bio", "role", "created_at"]


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
            "created_at",
        ]

    def _has_access(self, obj):
        if obj.access_type in ["free", "preview"]:
            return True

        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff or request.user.is_superuser:
            return True

        # Check course enrollment
        if obj.course_id:
            return Enrollment.objects.filter(
                user=request.user,
                course_id=obj.course_id,
                status="active"
            ).exists()

        if obj.chapter and obj.chapter.course_id:
            return Enrollment.objects.filter(
                user=request.user,
                course_id=obj.chapter.course_id,
                status="active"
            ).exists()

        return False

    def get_is_locked(self, obj):
        return not self._has_access(obj)

    def get_is_completed(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return MaterialProgress.objects.filter(
            user=request.user,
            material=obj,
            is_completed=True
        ).exists()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Protect premium files and video URLs if locked
        if data.get("is_locked"):
            data["file"] = None
            data["video_url"] = ""
            data["resource_url"] = ""
            data["content_text"] = "This content is premium. Please enroll or purchase this course to access full materials."
        return data


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
        materials = obj.materials.all().order_by("order", "id")
        return MaterialSerializer(materials, many=True, context=self.context).data


class CourseListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="program.category.name", read_only=True)
    category_level = serializers.CharField(source="program.category.level", read_only=True)
    program_name = serializers.CharField(source="program.name", read_only=True)
    academic_period_name = serializers.CharField(source="academic_period.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
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
        return Enrollment.objects.filter(
            user=request.user,
            course=obj,
            status="active"
        ).exists()


class CourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    materials = MaterialSerializer(many=True, read_only=True)
    program_name = serializers.CharField(source="program.name", read_only=True)
    academic_period_name = serializers.CharField(source="academic_period.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    is_enrolled = serializers.SerializerMethodField()
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
            "progress_percentage",
            "chapters",
            "materials",
            "created_at",
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return Enrollment.objects.filter(
            user=request.user,
            course=obj,
            status="active"
        ).exists()

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

