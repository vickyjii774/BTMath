from django.core.serializers import python
from django.db import models
from django.conf import settings
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone
import secrets



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
    duration_info = models.CharField(
        max_length=100,
        blank=True,
        help_text="e.g. 4 Years / 8 Semesters, 2 Years, or 3 Years"
    )

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class Semester(models.Model):
    """
    Kept for complete backward-compatibility with existing database tables and code.
    New programs and flexible structures will also populate/use AcademicPeriod.
    """
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


class AcademicPeriod(models.Model):
    """
    Flexible academic structure:
    Supports Year, Semester, Term, Grade (Class 11/12), or Custom structures.
    Supports nesting (e.g. Year 1 -> Semester 1).
    """
    PERIOD_TYPES = [
        ("year", "Year"),
        ("semester", "Semester"),
        ("term", "Term"),
        ("grade", "Grade"),
        ("custom", "Custom"),
    ]

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name="academic_periods"
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="sub_periods",
        help_text="Optional parent period (e.g. Year 1 containing Semester 1)"
    )
    period_type = models.CharField(
        max_length=20,
        choices=PERIOD_TYPES,
        default="semester"
    )
    name = models.CharField(
        max_length=100,
        help_text="e.g. Year 1, Semester 3, Grade 11"
    )
    order = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        if self.parent:
            return f"{self.program.name} - {self.parent.name} -> {self.name}"
        return f"{self.program.name} - {self.name}"


class Subject(models.Model):
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name="subjects",
        null=True,
        blank=True
    )
    academic_period = models.ForeignKey(
        AcademicPeriod,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subjects"
    )
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})" if self.code else self.name


class AccessGroup(models.Model):
    """
    An Access Group determines what a student receives after purchasing a product or course.
    Examples: PLUS_TWO, BACHELOR, MASTER, IOE, CSIT, BCA, BIM, BSC.
    Admin can create/edit access groups dynamically without code changes.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserAccessGroup(models.Model):
    """
    Associates a student with an AccessGroup upon approved purchase or manual admin grant.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user_access_groups"
    )
    access_group = models.ForeignKey(
        AccessGroup,
        on_delete=models.CASCADE,
        related_name="user_access_groups"
    )
    is_active = models.BooleanField(default=True)
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    granted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="granted_user_access_groups"
    )

    class Meta:
        unique_together = ["user", "access_group"]
        ordering = ["-granted_at"]

    def __str__(self):
        return f"{self.user.username} -> {self.access_group.name} ({'Active' if self.is_active else 'Inactive'})"


class Course(models.Model):
    COURSE_TYPES = [
        ("free", "Free"),
        ("paid", "Paid"),
        ("subscription", "Subscription Only"),
    ]

    semester = models.ForeignKey(
        Semester,
        on_delete=models.SET_NULL,
        related_name="courses",
        null=True,
        blank=True
    )

    academic_period = models.ForeignKey(
        AcademicPeriod,
        on_delete=models.SET_NULL,
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

    subject = models.ForeignKey(
        Subject,
        on_delete=models.SET_NULL,
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

    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Discounted promotional price if applicable"
    )

    course_type = models.CharField(
        max_length=20,
        choices=COURSE_TYPES,
        default="paid"
    )

    instructor = models.CharField(
        max_length=100,
        blank=True,
        default="BTMath Faculty"
    )

    thumbnail = models.ImageField(
        upload_to="courses/",
        blank=True,
        null=True
    )

    access_group = models.ForeignKey(
        AccessGroup,
        on_delete=models.SET_NULL,
        related_name="courses",
        null=True,
        blank=True,
        help_text="Access Group assigned to this course (e.g. PLUS_TWO, BACHELOR, etc.)"
    )

    is_free = models.BooleanField(
        default=False,
        help_text="If true, course is free for all registered students"
    )

    featured = models.BooleanField(
        default=False,
        help_text="Feature this course on home/landing pages"
    )

    order = models.PositiveIntegerField(
        default=1,
        help_text="Display order"
    )

    is_published = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("course_detail", args=[self.slug])


class Chapter(models.Model):
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
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        if self.course:
            return f"{self.course.title} - {self.title}"
        if self.program:
            return f"{self.program.name} - {self.title}"
        return self.title


class Lesson(models.Model):
    """
    A lesson represents a specific lecture or sub-topic within a chapter.
    Supports YouTube embed URLs, markdown/notes, and attached materials.
    """
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.CASCADE,
        related_name="lessons"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    content = models.TextField(
        blank=True,
        help_text="Rich content, lecture notes or markdown explanation."
    )
    video_url = models.URLField(
        blank=True,
        help_text="YouTube video URL or embed link"
    )
    order = models.PositiveIntegerField(default=1)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.chapter.title} - {self.title}"


class Material(models.Model):
    MATERIAL_TYPES = [
        ("pdf", "PDF"),
        ("docx", "DOCX"),
        ("video", "Video"),
        ("note", "Note"),
        ("past_question", "Past Question"),
        ("formula_sheet", "Formula Sheet"),
        ("practice_set", "Practice Set"),
        ("model_question", "Model Question"),
        ("trick", "Short Trick"),
        ("question", "Question Paper"),
        ("other", "Other"),
    ]

    ACCESS_TYPES = [
        ("free", "Free"),
        ("preview", "Preview / Sample"),
        ("premium", "Premium (Paid Enrolled Only)"),
    ]

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="materials",
        null=True,
        blank=True
    )

    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.CASCADE,
        related_name="materials",
        null=True,
        blank=True
    )

    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.SET_NULL,
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

    access_type = models.CharField(
        max_length=20,
        choices=ACCESS_TYPES,
        default="free"
    )

    file = models.FileField(
        upload_to="materials/",
        blank=True,
        null=True
    )

    video_url = models.URLField(blank=True)

    resource_url = models.URLField(
        blank=True,
        help_text="Optional external link such as Google Drive, website, etc."
    )

    content_text = models.TextField(
        blank=True,
        help_text="Rich content or Markdown notes for this material."
    )

    order = models.PositiveIntegerField(default=1)

    description = models.TextField(blank=True)

    is_published = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("instructor", "Instructor"),
        ("admin", "Admin"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    student_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
        db_index=True,
        help_text="Unique student identifier (e.g. BTM-000001)"
    )
    full_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True
    )
    bio = models.TextField(blank=True)
    education_level = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=255, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    is_disabled = models.BooleanField(
        default=False,
        help_text="Designates whether this account is disabled by admin."
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.student_id:
            last_profile = (
                UserProfile.objects.exclude(student_id__isnull=True)
                .exclude(student_id="")
                .order_by("-id")
                .first()
            )
            next_num = 1
            if last_profile and last_profile.student_id and last_profile.student_id.startswith("BTM-"):
                try:
                    next_num = int(last_profile.student_id.split("-")[1]) + 1
                except (IndexError, ValueError):
                    next_num = UserProfile.objects.count() + 1
            else:
                next_num = UserProfile.objects.count() + 1

            candidate_id = f"BTM-{next_num:06d}"
            while UserProfile.objects.filter(student_id=candidate_id).exists():
                next_num += 1
                candidate_id = f"BTM-{next_num:06d}"

            self.student_id = candidate_id

        super().save(*args, **kwargs)

    def __str__(self):
        sid = f" ({self.student_id})" if self.student_id else ""
        return f"{self.user.username}{sid}'s Profile"


class Enrollment(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("expired", "Expired"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active"
    )
    start_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ["user", "course"]
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.user.username} -> {self.course.title} ({self.status})"


class Payment(models.Model):
    PAYMENT_METHODS = [
        ("esewa", "eSewa"),
        ("khalti", "Khalti"),
        ("bank_transfer", "Bank Transfer"),
    ]

    PAYMENT_STATUS = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("refunded", "Refunded"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="payments"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments"
    )
    access_group = models.ForeignKey(
        AccessGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
        help_text="Target access group requested/paid for"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS
    )
    transaction_code = models.CharField(
        max_length=100,
        blank=True,
        help_text="Transaction ID / Reference Code from eSewa, Khalti, or Bank"
    )
    payment_proof = models.ImageField(
        upload_to="payment_proofs/",
        blank=True,
        null=True,
        help_text="Screenshot or receipt of payment"
    )
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="pending"
    )
    note = models.TextField(blank=True, help_text="Optional student note")
    rejection_reason = models.TextField(blank=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_payments"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        course_title = self.course.title if self.course else (self.access_group.name if self.access_group else "Custom Payment")
        return f"{self.user.username} - Rs.{self.amount} ({self.payment_method}) - {self.status}"


class Purchase(models.Model):
    """
    Separates a financial transaction (Payment) from an activated entitlement (Purchase).
    When an admin approves a payment, an active Purchase is recorded.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="purchases"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchases"
    )
    access_group = models.ForeignKey(
        AccessGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchases"
    )
    payment = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchases"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        item = self.course.title if self.course else (self.access_group.name if self.access_group else "Package Access")
        return f"{self.user.username} - {item} ({'Active' if self.is_active else 'Inactive'})"



class SubscriptionPlan(models.Model):
    PERIOD_CHOICES = [
        ("monthly", "Monthly"),
        ("quarterly", "Quarterly"),
        ("yearly", "Yearly"),
    ]

    name = models.CharField(max_length=100)
    duration_type = models.CharField(
        max_length=20,
        choices=PERIOD_CHOICES,
        default="monthly"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    features_list = models.TextField(
        blank=True,
        help_text="Line-separated list of benefits included"
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - Rs. {self.price}/{self.duration_type}"


class UserSubscription(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="subscriptions"
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.CASCADE,
        related_name="subscriptions"
    )
    status = models.CharField(
        max_length=20,
        choices=[("active", "Active"), ("expired", "Expired"), ("cancelled", "Cancelled")],
        default="active"
    )
    start_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField()

    def __str__(self):
        return f"{self.user.username} - {self.plan.name} ({self.status})"


class MaterialProgress(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="material_progress"
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="progress"
    )
    is_completed = models.BooleanField(default=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "material"]

    def __str__(self):
        return f"{self.user.username} - {self.material.title} (Completed)"


class QuestionBank(models.Model):
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]

    program = models.ForeignKey(
        Program,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="questions"
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="questions"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="questions"
    )
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="questions"
    )
    question_text = models.TextField()
    solution_text = models.TextField(blank=True)
    marks = models.PositiveIntegerField(default=1)
    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default="medium"
    )
    year_source = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g. 2080, 2079, Model Question"
    )
    exam_source = models.CharField(
        max_length=100,
        blank=True,
        help_text="e.g. TU Final, NEB Board, IOE Entrance"
    )
    is_solved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"Q{self.id}: {self.question_text[:50]}..."




class LoginLog(models.Model):
    """
    Tracks authentic distinct logins for accurate daily/monthly active student statistics.
    Does not count generic page views.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="login_logs"
    )
    logged_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-logged_at"]

    def __str__(self):
        return f"{self.user.username} logged in at {self.logged_at}"



class CourseAccessPackage(models.Model):
    name = models.CharField(max_length=200)
    level = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=499)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class UserCourseAccess(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="course_access"
    )

    package = models.CharField(
        max_length=100,
        default="BTMath Complete Access"
    )

    is_active = models.BooleanField(default=False)

    purchased_at = models.DateTimeField(auto_now_add=True)

    expires_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.user} - {self.package}"


class UserSectionAccess(models.Model):
    SECTION_CHOICES = [
        ("plus2", "Plus Two"),
        ("bachelor", "Bachelor"),
        ("master", "Master"),
        ("ioe", "IOE"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="section_access",
    )

    section = models.CharField(
        max_length=20,
        choices=SECTION_CHOICES,
    )

    is_active = models.BooleanField(default=True)

    granted_at = models.DateTimeField(auto_now_add=True)

    expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="granted_section_access",
    )

    class Meta:
        unique_together = ("user", "section")
        ordering = ["section"]

    def __str__(self):
        return f"{self.user.username} - {self.get_section_display()}"

class UserRequest(models.Model):
    REQUEST_TYPES = [
        ("verification", "Account Verification"),
        ("enrollment", "Course Enrollment"),
        ("course_access", "Course Access"),
        ("instructor", "Instructor Request"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="requests",
    )

    request_type = models.CharField(
        max_length=30,
        choices=REQUEST_TYPES,
        default="other",
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_requests",
    )

    message = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    admin_note = models.TextField(blank=True)

    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_user_requests",
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.get_request_type_display()} - "
            f"{self.status}"
        )


class ContactMessage(models.Model):
    """
    Public student/visitor contact queries for admin response.
    """
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_replied = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.subject} ({'Read' if self.is_read else 'Unread'})"


class SocialLink(models.Model):
    """
    Configurable social media links for footer/header.
    No code change needed to update links or platforms.
    """
    PLATFORM_CHOICES = [
        ("facebook", "Facebook"),
        ("instagram", "Instagram"),
        ("youtube", "YouTube"),
        ("tiktok", "TikTok"),
        ("linkedin", "LinkedIn"),
        ("twitter", "X / Twitter"),
        ("telegram", "Telegram"),
        ("whatsapp", "WhatsApp"),
        ("other", "Other"),
    ]

    platform = models.CharField(
        max_length=50,
        choices=PLATFORM_CHOICES,
        default="youtube"
    )
    title = models.CharField(max_length=100, blank=True)
    url = models.URLField()
    icon = models.CharField(max_length=50, blank=True, help_text="Optional icon identifier or SVG class")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.get_platform_display()} ({self.url})"


class SiteStatistic(models.Model):
    """
    Lightweight visitor and page view counter for BTMath footer/dashboard.
    """
    total_visitors = models.PositiveBigIntegerField(default=0)
    total_page_views = models.PositiveBigIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Visitors: {self.total_visitors}, Page Views: {self.total_page_views}"

    @classmethod
    def get_stats(cls):
        stat, _ = cls.objects.get_or_create(id=1)
        return stat

    @classmethod
    def increment_view(cls, is_new_visitor=False):
        stat = cls.get_stats()
        stat.total_page_views += 1
        if is_new_visitor:
            stat.total_visitors += 1
        stat.save(update_fields=["total_page_views", "total_visitors", "updated_at"])
        return stat


class AuditLog(models.Model):
    """
    Audit log for critical administrative and financial actions.
    Records payment approvals, rejections, access modifications, and user state changes.
    """
    admin = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs"
    )
    action = models.CharField(
        max_length=100,
        help_text="e.g. PAYMENT_APPROVED, PAYMENT_REJECTED, ACCESS_GRANTED, USER_DISABLED"
    )
    target_type = models.CharField(max_length=100, blank=True)
    target_id = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        admin_name = self.admin.username if self.admin else "System"
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {admin_name}: {self.action}"


class PasswordResetToken(models.Model):
    """
    Secure password reset token for forgot-password workflow.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="password_reset_tokens"
    )
    token = models.CharField(max_length=128, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Reset token for {self.user.email} (used={self.is_used})"

    @classmethod
    def generate_for_user(cls, user):
        token = secrets.token_urlsafe(48)
        expires_at = timezone.now() + timezone.timedelta(hours=24)
        return cls.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )


# Backward-compatible alias for AcademicUnit
AcademicUnit = AcademicPeriod





