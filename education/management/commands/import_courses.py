from pathlib import Path
import csv

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from education.models import (
Category,
Program,
AcademicPeriod,
Subject,
Course,
Chapter,
Material,
)

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Import BTMath courses, chapters and materials from CSV files."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("Import command is working.")
        )

@transaction.atomic
def handle(self, *args, **options):
    data_dir = Path(options["data_dir"])

    courses_file = data_dir / "courses.csv"
    chapters_file = data_dir / "chapters.csv"
    materials_file = data_dir / "materials.csv"

    if not courses_file.exists():
        raise CommandError(f"Missing file: {courses_file}")

    if not chapters_file.exists():
        raise CommandError(f"Missing file: {chapters_file}")

    if not materials_file.exists():
        raise CommandError(f"Missing file: {materials_file}")

    self.stdout.write("Starting BTMath course import...")

    courses_created = 0
    courses_updated = 0
    chapters_created = 0
    chapters_updated = 0
    materials_created = 0
    materials_updated = 0

    # ---------------------------------------------------------
    # 1. COURSES
    # ---------------------------------------------------------

    with open(courses_file, "r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            level = row["level"].strip()
            program_name = row["program"].strip()
            subject_name = row.get("subject", "").strip()

            title = row["title"].strip()
            slug = row["slug"].strip()

            description = row.get("description", "").strip()

            price = row.get("price", "0").strip() or "0"
            discount_price = (
                row.get("discount_price", "0").strip() or "0"
            )

            course_type = (
                row.get("course_type", "paid").strip() or "paid"
            )

            instructor = (
                row.get("instructor", "BTMath Faculty").strip()
                or "BTMath Faculty"
            )

            is_published = (
                row.get("is_published", "true").strip().lower()
                in ["true", "1", "yes"]
            )

            # Category
            category, _ = Category.objects.get_or_create(
                level=level,
                defaults={
                    "name": level.upper(),
                    "description": "",
                },
            )

            # Program
            program, _ = Program.objects.get_or_create(
                category=category,
                name=program_name,
                defaults={
                    "description": "",
                },
            )

            # Subject
            subject = None

            if subject_name:
                subject, _ = Subject.objects.get_or_create(
                    program=program,
                    name=subject_name,
                    defaults={
                        "description": "",
                    },
                )

            # Course
            course, created = Course.objects.update_or_create(
                slug=slug,
                defaults={
                    "program": program,
                    "subject": subject,
                    "title": title,
                    "description": description,
                    "price": price,
                    "discount_price": discount_price,
                    "course_type": course_type,
                    "instructor": instructor,
                    "is_published": is_published,
                },
            )

            if created:
                courses_created += 1
            else:
                courses_updated += 1

    # ---------------------------------------------------------
    # 2. CHAPTERS
    # ---------------------------------------------------------

    with open(chapters_file, "r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            course_slug = row["course_slug"].strip()
            chapter_title = row["chapter_title"].strip()

            description = row.get("description", "").strip()

            order = int(
                row.get("order", "1").strip() or "1"
            )

            try:
                course = Course.objects.get(slug=course_slug)
            except Course.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"Skipping chapter. Course not found: {course_slug}"
                    )
                )
                continue

            chapter, created = Chapter.objects.update_or_create(
                course=course,
                title=chapter_title,
                defaults={
                    "program": course.program,
                    "description": description,
                    "order": order,
                },
            )

            if created:
                chapters_created += 1
            else:
                chapters_updated += 1

    # ---------------------------------------------------------
    # 3. MATERIALS
    # ---------------------------------------------------------

    with open(materials_file, "r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)

        for row in reader:
            course_slug = row["course_slug"].strip()
            chapter_title = row["chapter_title"].strip()

            title = row["title"].strip()

            material_type = (
                row.get("material_type", "note").strip()
                or "note"
            )

            access_type = (
                row.get("access_type", "free").strip()
                or "free"
            )

            description = row.get("description", "").strip()
            video_url = row.get("video_url", "").strip()
            resource_url = row.get("resource_url", "").strip()
            content_text = row.get("content_text", "").strip()

            order = int(
                row.get("order", "1").strip() or "1"
            )

            try:
                course = Course.objects.get(slug=course_slug)
            except Course.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"Skipping material. Course not found: {course_slug}"
                    )
                )
                continue

            try:
                chapter = Chapter.objects.get(
                    course=course,
                    title=chapter_title,
                )
            except Chapter.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"Skipping material. Chapter not found: "
                        f"{course_slug} -> {chapter_title}"
                    )
                )
                continue

            material, created = Material.objects.update_or_create(
                course=course,
                chapter=chapter,
                title=title,
                defaults={
                    "material_type": material_type,
                    "access_type": access_type,
                    "description": description,
                    "video_url": video_url,
                    "resource_url": resource_url,
                    "content_text": content_text,
                    "order": order,
                },
            )

            if created:
                materials_created += 1
            else:
                materials_updated += 1

    # ---------------------------------------------------------
    # RESULT
    # ---------------------------------------------------------

    self.stdout.write("")
    self.stdout.write(
        self.style.SUCCESS("BTMath import completed successfully.")
    )

    self.stdout.write(
        f"Courses: {courses_created} created, "
        f"{courses_updated} updated"
    )

    self.stdout.write(
        f"Chapters: {chapters_created} created, "
        f"{chapters_updated} updated"
    )

    self.stdout.write(
        f"Materials: {materials_created} created, "
        f"{materials_updated} updated"
    )

