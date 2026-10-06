import csv
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from education.models import (
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
    QuestionBank,
    LoginLog,
    CourseAccessPackage,
    UserCourseAccess,
)


class Command(BaseCommand):
    help = "Import the BTMath master CSV containing multiple model types."

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_file",
            nargs="?",
            default="data/btmath_test_data.csv",
            help="Path to the BTMath master CSV file.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        csv_file = Path(options["csv_file"])

        if not csv_file.exists():
            raise CommandError(f"CSV file not found: {csv_file}")

        self.stdout.write(f"Reading: {csv_file}")

        with csv_file.open("r", encoding="utf-8-sig", newline="") as f:
            rows = list(csv.DictReader(f))

        if not rows:
            raise CommandError("CSV file is empty.")

        self.stdout.write(f"Found {len(rows)} records.")

        by_type = {}
        for row in rows:
            entity = row.get("entity_type", "").strip()
            by_type.setdefault(entity, []).append(row)

        keys = {}
        counts = {}

        def value(row, key, default=""):
            return (row.get(key, default) or default).strip()

        def boolean(row, key, default=False):
            v = value(row, key, str(default)).lower()
            return v in {"true", "1", "yes", "y", "on"}

        def integer(row, key, default=1):
            v = value(row, key, str(default))
            return int(v or default)

        def remember(entity, key, obj):
            if key:
                keys[key] = obj

        def count(entity, created):
            label = f"{entity}_{'created' if created else 'updated'}"
            counts[label] = counts.get(label, 0) + 1

        # ---------------------------------------------------------
        # 1. CATEGORIES
        # ---------------------------------------------------------
        for row in by_type.get("Category", []):
            obj, created = Category.objects.update_or_create(
                level=value(row, "level"),
                defaults={
                    "name": value(row, "name"),
                    "description": value(row, "description"),
                },
            )
            remember("Category", value(row, "record_key"), obj)
            count("Category", created)

        # ---------------------------------------------------------
        # 2. PROGRAMS
        # ---------------------------------------------------------
        for row in by_type.get("Program", []):
            category = keys.get(value(row, "category_key"))
            if not category:
                raise CommandError(
                    f"Program {value(row, 'record_key')} references missing "
                    f"category_key={value(row, 'category_key')}"
                )

            obj, created = Program.objects.update_or_create(
                category=category,
                name=value(row, "name"),
                defaults={
                    "description": value(row, "description"),
                    "duration_info": value(row, "duration_info"),
                },
            )
            remember("Program", value(row, "record_key"), obj)
            count("Program", created)

        # ---------------------------------------------------------
        # 3. SEMESTERS
        # ---------------------------------------------------------
        for row in by_type.get("Semester", []):
            program = keys.get(value(row, "program_key"))

            obj, created = Semester.objects.update_or_create(
                program=program,
                name=value(row, "name"),
                defaults={"order": integer(row, "order", 1)},
            )
            remember("Semester", value(row, "record_key"), obj)
            count("Semester", created)

        # ---------------------------------------------------------
        # 4. ACADEMIC PERIODS
        # First create all periods without parents, then attach parents.
        # ---------------------------------------------------------
        pending_parents = []

        for row in by_type.get("AcademicPeriod", []):
            program = keys.get(value(row, "program_key"))

            obj, created = AcademicPeriod.objects.update_or_create(
                program=program,
                name=value(row, "name"),
                defaults={
                    "period_type": value(row, "period_type", "semester"),
                    "order": integer(row, "order", 1),
                    "description": value(row, "description"),
                },
            )
            remember("AcademicPeriod", value(row, "record_key"), obj)
            pending_parents.append((obj, value(row, "parent_key")))
            count("AcademicPeriod", created)

        for obj, parent_key in pending_parents:
            if parent_key:
                parent = keys.get(parent_key)
                if not parent:
                    raise CommandError(
                        f"AcademicPeriod {obj.name} references missing "
                        f"parent_key={parent_key}"
                    )
                obj.parent = parent
                obj.save(update_fields=["parent"])

        # ---------------------------------------------------------
        # 5. SUBJECTS
        # ---------------------------------------------------------
        for row in by_type.get("Subject", []):
            program = keys.get(value(row, "program_key"))
            academic_period = keys.get(value(row, "academic_period_key"))

            obj = Subject.objects.filter(
                program=program,
                name=value(row, "name"),
            ).first()

            created = obj is None
            if created:
                obj = Subject.objects.create(
                    program=program,
                    academic_period=academic_period,
                    name=value(row, "name"),
                    code=value(row, "code"),
                    description=value(row, "description"),
                )
            else:
                obj.academic_period = academic_period
                obj.code = value(row, "code")
                obj.description = value(row, "description")
                obj.save()

            remember("Subject", value(row, "record_key"), obj)
            count("Subject", created)

        # ---------------------------------------------------------
        # 6. COURSES
        # ---------------------------------------------------------
        for row in by_type.get("Course", []):
            semester = keys.get(value(row, "semester_key"))
            academic_period = keys.get(value(row, "academic_period_key"))
            program = keys.get(value(row, "program_key"))
            subject = keys.get(value(row, "subject_key"))

            obj, created = Course.objects.update_or_create(
                slug=value(row, "slug"),
                defaults={
                    "semester": semester,
                    "academic_period": academic_period,
                    "program": program,
                    "subject": subject,
                    "title": value(row, "title"),
                    "description": value(row, "description"),
                    "price": value(row, "price", "0") or "0",
                    "discount_price": value(row, "discount_price", "0") or "0",
                    "course_type": value(row, "course_type", "paid") or "paid",
                    "instructor": value(row, "instructor", "BTMath Faculty")
                    or "BTMath Faculty",
                    "is_published": boolean(row, "is_published", True),
                },
            )
            remember("Course", value(row, "record_key"), obj)
            count("Course", created)

        # ---------------------------------------------------------
        # 7. CHAPTERS
        # ---------------------------------------------------------
        for row in by_type.get("Chapter", []):
            course = keys.get(value(row, "course_key"))
            program = keys.get(value(row, "program_key"))

            obj, created = Chapter.objects.update_or_create(
                course=course,
                title=value(row, "title"),
                defaults={
                    "program": program,
                    "description": value(row, "description"),
                    "order": integer(row, "order", 1),
                },
            )
            remember("Chapter", value(row, "record_key"), obj)
            count("Chapter", created)

        # ---------------------------------------------------------
        # 8. MATERIALS
        # ---------------------------------------------------------
        for row in by_type.get("Material", []):
            course = keys.get(value(row, "course_key"))
            chapter = keys.get(value(row, "chapter_key"))

            obj, created = Material.objects.update_or_create(
                course=course,
                chapter=chapter,
                title=value(row, "title"),
                defaults={
                    "material_type": value(row, "material_type", "pdf") or "pdf",
                    "access_type": value(row, "access_type", "free") or "free",
                    "video_url": value(row, "video_url"),
                    "resource_url": value(row, "resource_url"),
                    "content_text": value(row, "content_text"),
                    "order": integer(row, "order", 1),
                    "description": value(row, "description"),
                },
            )
            remember("Material", value(row, "record_key"), obj)
            count("Material", created)

        # ---------------------------------------------------------
        # 9. USERS
        # ---------------------------------------------------------
        User = get_user_model()

        for row in by_type.get("User", []):
            username = value(row, "user_username")
            email = value(row, "user_email")

            obj, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email},
            )

            if email and obj.email != email:
                obj.email = email
                obj.save(update_fields=["email"])

            if created:
                obj.set_unusable_password()
                obj.save(update_fields=["password"])

            remember("User", value(row, "record_key"), obj)
            keys[f"user:{username}"] = obj
            count("User", created)

        # ---------------------------------------------------------
        # 10. USER PROFILES
        # ---------------------------------------------------------
        for row in by_type.get("UserProfile", []):
            username = value(row, "user_username")
            user = keys.get(f"user:{username}")

            if not user:
                raise CommandError(f"Profile user not found: {username}")

            obj, created = UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    "full_name": value(row, "full_name"),
                    "phone": value(row, "phone"),
                    "bio": value(row, "bio"),
                    "role": value(row, "role", "student") or "student",
                },
            )
            remember("UserProfile", value(row, "record_key"), obj)
            count("UserProfile", created)

        # ---------------------------------------------------------
        # 11. SUBSCRIPTION PLANS
        # ---------------------------------------------------------
        for row in by_type.get("SubscriptionPlan", []):
            obj, created = SubscriptionPlan.objects.update_or_create(
                name=value(row, "name"),
                defaults={
                    "duration_type": value(row, "duration_type", "monthly")
                    or "monthly",
                    "price": value(row, "price", "0") or "0",
                    "features_list": value(row, "features_list"),
                    "is_active": boolean(row, "is_active", True),
                },
            )
            remember("SubscriptionPlan", value(row, "record_key"), obj)
            count("SubscriptionPlan", created)

        # ---------------------------------------------------------
        # 12. ENROLLMENTS
        # ---------------------------------------------------------
        for row in by_type.get("Enrollment", []):
            user = keys.get(f"user:{value(row, 'user_username')}")
            course = keys.get(value(row, "course_key"))

            obj, created = Enrollment.objects.update_or_create(
                user=user,
                course=course,
                defaults={
                    "status": value(row, "status", "active") or "active",
                    "expiry_date": value(row, "expiry_date") or None,
                },
            )
            remember("Enrollment", value(row, "record_key"), obj)
            count("Enrollment", created)

        # ---------------------------------------------------------
        # 13. PAYMENTS
        # ---------------------------------------------------------
        for row in by_type.get("Payment", []):
            user = keys.get(f"user:{value(row, 'user_username')}")
            course = keys.get(value(row, "course_key"))
            verified_by = keys.get(
                f"user:{value(row, 'verified_by_username')}"
            )

            transaction_code = value(row, "transaction_code")

            lookup = {"user": user, "transaction_code": transaction_code}
            if not transaction_code:
                lookup = {
                    "user": user,
                    "course": course,
                    "amount": value(row, "amount", "0") or "0",
                }

            obj, created = Payment.objects.update_or_create(
                **lookup,
                defaults={
                    "course": course,
                    "amount": value(row, "amount", "0") or "0",
                    "payment_method": value(row, "payment_method"),
                    "status": value(row, "status", "pending") or "pending",
                    "rejection_reason": value(row, "rejection_reason"),
                    "verified_by": verified_by,
                },
            )
            remember("Payment", value(row, "record_key"), obj)
            count("Payment", created)

        # ---------------------------------------------------------
        # 14. USER SUBSCRIPTIONS
        # ---------------------------------------------------------
        for row in by_type.get("UserSubscription", []):
            user = keys.get(f"user:{value(row, 'user_username')}")
            plan = keys.get(value(row, "parent_key"))

            if not plan:
                raise CommandError(
                    f"Subscription plan not found: {value(row, 'parent_key')}"
                )

            # UserSubscription has no unique constraint in the supplied models,
            # so use the most recent matching record or create one.
            obj = UserSubscription.objects.filter(
                user=user, plan=plan
            ).order_by("-id").first()

            created = obj is None
            if created:
                obj = UserSubscription.objects.create(
                    user=user,
                    plan=plan,
                    status=value(row, "status", "active") or "active",
                    expiry_date=value(row, "expiry_date"),
                )
            else:
                obj.status = value(row, "status", "active") or "active"
                obj.expiry_date = value(row, "expiry_date")
                obj.save()

            remember("UserSubscription", value(row, "record_key"), obj)
            count("UserSubscription", created)

        # ---------------------------------------------------------
        # 15. MATERIAL PROGRESS
        # ---------------------------------------------------------
        for row in by_type.get("MaterialProgress", []):
            user = keys.get(f"user:{value(row, 'user_username')}")
            material = keys.get(value(row, "material_key"))

            obj, created = MaterialProgress.objects.update_or_create(
                user=user,
                material=material,
                defaults={
                    "is_completed": boolean(row, "is_completed", True),
                },
            )
            remember("MaterialProgress", value(row, "record_key"), obj)
            count("MaterialProgress", created)

        # ---------------------------------------------------------
        # 16. QUESTION BANK
        # ---------------------------------------------------------
        for row in by_type.get("QuestionBank", []):
            program = keys.get(value(row, "program_key"))
            subject = keys.get(value(row, "subject_key"))
            course = keys.get(value(row, "course_key"))
            chapter = keys.get(value(row, "chapter_key"))

            question_text = value(row, "question_text")

            obj = QuestionBank.objects.filter(
                question_text=question_text,
                course=course,
            ).first()

            created = obj is None
            if created:
                obj = QuestionBank.objects.create(
                    program=program,
                    subject=subject,
                    course=course,
                    chapter=chapter,
                    question_text=question_text,
                    solution_text=value(row, "solution_text"),
                    marks=integer(row, "marks", 1),
                    difficulty=value(row, "difficulty", "medium") or "medium",
                    year_source=value(row, "year_source"),
                    exam_source=value(row, "exam_source"),
                    is_solved=boolean(row, "is_solved", True),
                )
            else:
                obj.program = program
                obj.subject = subject
                obj.chapter = chapter
                obj.solution_text = value(row, "solution_text")
                obj.marks = integer(row, "marks", 1)
                obj.difficulty = value(row, "difficulty", "medium") or "medium"
                obj.year_source = value(row, "year_source")
                obj.exam_source = value(row, "exam_source")
                obj.is_solved = boolean(row, "is_solved", True)
                obj.save()

            remember("QuestionBank", value(row, "record_key"), obj)
            count("QuestionBank", created)

        # ---------------------------------------------------------
        # 17. LOGIN LOGS
        # ---------------------------------------------------------
        for row in by_type.get("LoginLog", []):
            user = keys.get(f"user:{value(row, 'user_username')}")

            obj = LoginLog.objects.create(
                user=user,
                ip_address=value(row, "ip_address") or None,
            )
            remember("LoginLog", value(row, "record_key"), obj)
            count("LoginLog", True)

        # ---------------------------------------------------------
        # 18. COURSE ACCESS PACKAGES
        # ---------------------------------------------------------
        for row in by_type.get("CourseAccessPackage", []):
            obj, created = CourseAccessPackage.objects.update_or_create(
                level=value(row, "level"),
                defaults={
                    "name": value(row, "name"),
                    "price": value(row, "price", "499") or "499",
                    "description": value(row, "description"),
                    "is_active": boolean(row, "is_active", True),
                },
            )
            remember("CourseAccessPackage", value(row, "record_key"), obj)
            count("CourseAccessPackage", created)

        # ---------------------------------------------------------
        # 19. USER COURSE ACCESS
        # ---------------------------------------------------------
        for row in by_type.get("UserCourseAccess", []):
            user = keys.get(f"user:{value(row, 'user_username')}")

            obj, created = UserCourseAccess.objects.update_or_create(
                user=user,
                defaults={
                    "package": value(row, "package", "BTMath Complete Access")
                    or "BTMath Complete Access",
                    "is_active": boolean(row, "is_active", False),
                    "expires_at": value(row, "expires_at") or None,
                },
            )
            remember("UserCourseAccess", value(row, "record_key"), obj)
            count("UserCourseAccess", created)

        # ---------------------------------------------------------
        # RESULT
        # ---------------------------------------------------------
        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS("BTMath master CSV import completed successfully.")
        )

        entity_order = [
            "Category",
            "Program",
            "Semester",
            "AcademicPeriod",
            "Subject",
            "Course",
            "Chapter",
            "Material",
            "User",
            "UserProfile",
            "Enrollment",
            "SubscriptionPlan",
            "Payment",
            "UserSubscription",
            "MaterialProgress",
            "QuestionBank",
            "LoginLog",
            "CourseAccessPackage",
            "UserCourseAccess",
        ]

        for entity in entity_order:
            created = counts.get(f"{entity}_created", 0)
            updated = counts.get(f"{entity}_updated", 0)
            if created or updated:
                self.stdout.write(
                    f"{entity}: {created} created, {updated} updated"
                )
