from rest_framework import serializers

from .models import (
    Category,
    Program,
    Course,
    Semester,
    Chapter,
    Material,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProgramSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = Program
        fields = [
            "id",
            "name",
            "description",
            "category",
            "category_name",
        ]


class CourseSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(
        source="program.name",
        read_only=True
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "thumbnail",
            "is_published",
            "program",
            "program_name",
            "category",
            "category_name",
        ]


class SemesterSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(
        source="course.title",
        read_only=True
    )

    class Meta:
        model = Semester
        fields = [
            "id",
            "name",
            "order",
            "course",
            "course_name",
        ]


class ChapterSerializer(serializers.ModelSerializer):
    semester_name = serializers.CharField(
        source="semester.name",
        read_only=True
    )

    class Meta:
        model = Chapter
        fields = [
            "id",
            "title",
            "description",
            "order",
            "semester",
            "semester_name",
        ]


class MaterialSerializer(serializers.ModelSerializer):
    chapter_name = serializers.CharField(
        source="chapter.title",
        read_only=True
    )

    class Meta:
        model = Material
        fields = [
            "id",
            "title",
            "material_type",
            "file",
            "video_url",
            "description",
            "created_at",
            "chapter",
            "chapter_name",
        ]