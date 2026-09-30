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


class Semester(models.Model):
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name="semesters",
        null=True,
        blank=True
    )
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order"]
        unique_together = ["program", "name"]

    def __str__(self):
        if self.program:
            return f"{self.program.name} - {self.name}"
        return self.name


class Course(models.Model):
    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name="courses",
        null=True,
        blank=True
    )

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name="courses",
        null=True,
        blank=True
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

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


class Chapter(models.Model):
    # Used for normal courses such as BCA Mathematics
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="chapters",
        null=True,
        blank=True
    )

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name="chapters",
        null=True,
        blank=True
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        if self.course:
            return f"{self.course.title} - {self.title}"

        if self.program:
            return f"{self.program.name} - {self.title}"

        return self.title
    
    class Meta:
        ordering = ["order"]

    def __str__(self):
        if self.course:
            return f"{self.course.title} - {self.title}"
        return self.title

class Material(models.Model):
    MATERIAL_TYPES = [
        ("pdf", "PDF"),
        ("video", "Video"),
        ("note", "Note"),
        ("question", "Question Paper"),
        ("trick", "Short Trick"),
    ]

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="materials",
        null=True,
        blank=True
    )

    # Optional: material can belong to a chapter
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.CASCADE,
        related_name="materials",
        null=True,
        blank=True
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

