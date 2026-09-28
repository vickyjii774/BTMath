from django.contrib import admin
from .models import (
    Category,
    Program,
    Course,
    Semester,
    Chapter,
    Material,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "level", "created_at")
    search_fields = ("name",)
    list_filter = ("level",)


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("name", "category")
    list_filter = ("category",)
    search_fields = ("name",)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "program",
        "category",
        "price",
        "is_published",
        "created_at",
    )

    list_filter = (
        "category",
        "program",
        "is_published",
    )

    search_fields = (
        "title",
        "description",
    )

    prepopulated_fields = {
        "slug": ("title",)
    }


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "course",
        "order",
    )

    list_filter = ("course",)
    ordering = ("course", "order")


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "semester",
        "order",
    )

    list_filter = ("semester",)
    ordering = ("semester", "order")


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "chapter",
        "material_type",
        "created_at",
    )

    list_filter = ("material_type",)
    search_fields = ("title",)