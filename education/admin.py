
from django.contrib import admin
from .models import Category, Program, Semester, Course, Chapter, Material


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "level", "created_at")
    list_filter = ("level",)
    search_fields = ("name",)


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("name", "category")
    list_filter = ("category",)
    search_fields = ("name",)


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ("name", "program", "order")
    list_filter = ("program",)
    search_fields = ("name", "program__name")
    ordering = ("program", "order")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "semester",
        "program",
        "is_published",
        "created_at",
    )
    list_filter = ("is_published", "semester__program__category")
    search_fields = (
        "title",
        "description",
        "semester__name",
        "semester__program__name",
    )
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "program", "order")
    list_filter = ("course", "program")
    search_fields = (
        "title",
        "course__title",
    )
    ordering = ("course", "order")


from django.contrib import admin
from .models import (
    Category,
    Program,
    Semester,
    Course,
    Chapter,
    Material,
)


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "material_type",
        "course",
        "chapter",
        "created_at",
    )

    list_filter = (
        "material_type",
        "course",
        "chapter",
    )

    search_fields = (
        "title",
        "description",
    )
    