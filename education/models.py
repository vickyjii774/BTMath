from django.db import models
from django.urls import reverse


class Category(models.Model):
    LEVEL_CHOICES = [
        ("plus2", "+2"),
        ("bachelor", "Bachelor"),
        ("master", "Master"),
        ("ioe", "IOE"),
    ]

    name = models.CharField(max_length=100)

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        unique=True
    )

    description = models.TextField(blank=True)

    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Program(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="programs"
    )

    name = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class Course(models.Model):
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name="courses",
        null=True,
        blank=True
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="courses"
    )

    title = models.CharField(max_length=200)

    slug = models.SlugField(unique=True)

    description = models.TextField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    thumbnail = models.ImageField(
        upload_to="courses/",
        blank=True,
        null=True
    )

    is_published = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse(
            "course_detail",
            args=[self.slug]
        )


class Semester(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="semesters"
    )

    name = models.CharField(max_length=100)

    order = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.course.title} - {self.name}"

    class Meta:
        ordering = ["order"]


class Chapter(models.Model):
    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name="chapters"
    )

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    order = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.semester.name} - {self.title}"

    class Meta:
        ordering = ["order"]


class Material(models.Model):
    MATERIAL_TYPES = [
        ("pdf", "PDF"),
        ("video", "Video"),
        ("note", "Note"),
        ("question", "Question Paper"),
    ]

    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.CASCADE,
        related_name="materials"
    )

    title = models.CharField(max_length=200)

    material_type = models.CharField(
        max_length=20,
        choices=MATERIAL_TYPES,
        default="pdf"
    )

    file = models.FileField(
        upload_to="materials/",
        blank=True,
        null=True
    )

    video_url = models.URLField(blank=True)

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title