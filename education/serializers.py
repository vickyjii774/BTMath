from rest_framework import serializers
from .models import Program, Semester, Course


class CourseSerializer(serializers.ModelSerializer):
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
        ]


class SemesterSerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)

    class Meta:
        model = Semester
        fields = [
            "id",
            "name",
            "order",
            "courses",
        ]


class ProgramSerializer(serializers.ModelSerializer):
    semesters = SemesterSerializer(many=True, read_only=True)

    class Meta:
        model = Program
        fields = [
            "id",
            "name",
            "description",
            "semesters",
        ]