from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q, Count
from django.utils import timezone
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .models import UserSectionAccess
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminUser
from .permissions import IsAdminUser
from .models import (

    Course,

    Enrollment,

    Payment,

    UserRequest,

)
from .models import (
    Category,
    Program,
    AcademicPeriod,
    Subject,
    AccessGroup,
    UserAccessGroup,
    Course,
    Chapter,
    Lesson,
    Material,
    UserProfile,
    Enrollment,
    Payment,
    Purchase,
    MaterialProgress,
    LoginLog,
    UserRequest,
    ContactMessage,
    SocialLink,
    SiteStatistic,
    AuditLog,
    PasswordResetToken,
)
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    CategorySerializer,
    ProgramSerializer,
    CourseSerializer,
    CourseListSerializer,
    ChapterSerializer,
    LessonSerializer,
    MaterialSerializer,
    PaymentSerializer,
    AccessGroupSerializer,
    UserAccessGroupSerializer,
    PurchaseSerializer,
    ContactMessageSerializer,
    SocialLinkSerializer,
    SiteStatisticSerializer,
    AuditLogSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)


# 1. CATEGORIES & ACADEMIC HIERARCHY

class CategoriesAPIView(APIView):

    def get(self, request):

        categories = Category.objects.all().order_by("id")

        serializer = CategorySerializer(categories, many=True)

        return Response(serializer.data)

class ProgramDetailAPIView(APIView):

    """

    Returns full details of any program, including whatever academic

    structure (years, semesters, terms, or none) is defined.

    """

    def get(self, request, pk_or_slug):

        try:

            if str(pk_or_slug).isdigit():

                program = Program.objects.get(pk=pk_or_slug)

            else:

                program = Program.objects.get(name__iexact=pk_or_slug)

        except Program.DoesNotExist:

            return Response({"error": "Program not found"}, status=status.HTTP_404_NOT_FOUND)



        serializer = ProgramSerializer(program, context={"request": request})

        return Response(serializer.data)


class BachelorProgramAPIView(APIView):

    def get(self, request):

        programs = (

            Program.objects

            .filter(category__level="bachelor")

            .prefetch_related("academic_periods__sub_periods", "semesters__courses", "courses")

        )

        serializer = ProgramSerializer(programs, many=True, context={"request": request})

        return Response(serializer.data)



class PlusTwoProgramAPIView(APIView):

    def get(self, request):

        programs = (

            Program.objects

            .filter(category__level="plus2")

            .prefetch_related("academic_periods__sub_periods", "semesters__courses", "courses")

        )

        serializer = ProgramSerializer(programs, many=True, context={"request": request})

        return Response(serializer.data)





class MasterProgramAPIView(APIView):

    def get(self, request):

        programs = (

            Program.objects

            .filter(category__level="master")

            .prefetch_related("academic_periods__sub_periods", "semesters__courses", "courses")

        )

        serializer = ProgramSerializer(programs, many=True, context={"request": request})

        return Response(serializer.data)





class IOEProgramAPIView(APIView):

    def get(self, request):

        programs = (

            Program.objects

            .filter(category__level="ioe")

            .prefetch_related("courses__materials", "academic_periods", "courses")

        )

        serializer = ProgramSerializer(programs, many=True, context={"request": request})

        return Response(serializer.data)







class CourseListAPIView(APIView):

    def get(self, request):

        queryset = Course.objects.filter(is_published=True).select_related(

            "program", "program__category", "academic_period", "subject"

        )



        level = request.query_params.get("level")

        if level:

            queryset = queryset.filter(program__category__level=level)



        program_id = request.query_params.get("program")

        if program_id:

            queryset = queryset.filter(program_id=program_id)



        period_id = request.query_params.get("period")

        if period_id:

            queryset = queryset.filter(academic_period_id=period_id)



        search = request.query_params.get("search")

        if search:

            queryset = queryset.filter(

                Q(title__icontains=search) |

                Q(description__icontains=search) |

                Q(subject__name__icontains=search)

            )



        serializer = CourseListSerializer(queryset, many=True, context={"request": request})

        return Response(serializer.data)





class CourseDetailAPIView(APIView):

    def get(self, request, slug):

        try:

            course = Course.objects.select_related(

                "program", "program__category", "academic_period", "subject"

            ).prefetch_related("chapters__materials", "materials").get(slug=slug, is_published=True)

        except Course.DoesNotExist:

            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)



        serializer = CourseSerializer(course, context={"request": request})

        return Response(serializer.data)





class ToggleMaterialProgressAPIView(APIView):

    permission_classes = [IsAuthenticated]



    def post(self, request, material_id):

        try:

            material = Material.objects.get(pk=material_id)

        except Material.DoesNotExist:

            return Response({"error": "Material not found"}, status=status.HTTP_404_NOT_FOUND)



        progress, created = MaterialProgress.objects.get_or_create(

            user=request.user,

            material=material,

            defaults={"is_completed": True}

        )

        if not created:

            progress.is_completed = not progress.is_completed

            progress.save()



        return Response({

            "material_id": material.id,

            "is_completed": progress.is_completed

        })





# ==========================================

# 3. AUTHENTICATION & PROFILE

# ==========================================



class RegisterAPIView(APIView):
    def post(self, request):
        email = request.data.get("email", "").strip()
        username = request.data.get("username", "").strip() or email
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")
        full_name = request.data.get("full_name", "").strip()
        phone = request.data.get("phone", "").strip()
        education_level = request.data.get("education_level", "").strip()
        address = request.data.get("address", "").strip()
        date_of_birth = request.data.get("date_of_birth") or None

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if confirm_password and password != confirm_password:
            return Response(
                {"error": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username/Email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=full_name
        )

        profile = UserProfile.objects.create(
            user=user,
            full_name=full_name,
            phone=phone,
            education_level=education_level,
            address=address,
            date_of_birth=date_of_birth,
            role="student"
        )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "success": True,
                "message": "Registration successful.",
                "student_id": profile.student_id,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )

class LoginAPIView(APIView):
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request):
        # -------------------------------------------------
        # Make sure request.data is an object/dictionary
        # -------------------------------------------------
        data = request.data

        if not hasattr(data, "get"):
            return Response(
                {
                    "success": False,
                    "error": "Invalid login data. Expected username and password."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # Get login credentials
        # -------------------------------------------------
        username_or_email = str(
            data.get("username", "")
        ).strip()

        password = data.get("password")

        # -------------------------------------------------
        # Validate
        # -------------------------------------------------
        if not username_or_email or not password:
            return Response(
                {
                    "success": False,
                    "error": "Please provide username/email/Student ID and password."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # 1. Try username
        # -------------------------------------------------
        user = authenticate(
            username=username_or_email,
            password=password
        )

        # -------------------------------------------------
        # 2. Try email
        # -------------------------------------------------
        if user is None:
            user_obj = User.objects.filter(
                email__iexact=username_or_email
            ).first()

            if user_obj:
                user = authenticate(
                    username=user_obj.username,
                    password=password
                )

        # -------------------------------------------------
        # 3. Try Student ID
        # -------------------------------------------------
        if user is None:
            profile_obj = UserProfile.objects.filter(
                student_id__iexact=username_or_email
            ).select_related("user").first()

            if profile_obj:
                user = authenticate(
                    username=profile_obj.user.username,
                    password=password
                )

        # -------------------------------------------------
        # Invalid credentials
        # -------------------------------------------------
        if user is None:
            return Response(
                {
                    "success": False,
                    "error": "Invalid credentials."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        # -------------------------------------------------
        # Check disabled account
        # -------------------------------------------------
        profile = getattr(user, "profile", None)

        if profile and profile.is_disabled:
            return Response(
                {
                    "success": False,
                    "error": (
                        "Your account has been disabled. "
                        "Please contact BTMath support."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # Check Django active status
        # -------------------------------------------------
        if not user.is_active:
            return Response(
                {
                    "success": False,
                    "error": (
                        "Your account is inactive. "
                        "Please contact BTMath support."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # Record login
        # -------------------------------------------------
        ip = (
            request.META.get("HTTP_X_FORWARDED_FOR")
            or request.META.get("REMOTE_ADDR")
        )

        LoginLog.objects.create(
            user=user,
            ip_address=ip
        )

        # -------------------------------------------------
        # Generate JWT tokens
        # -------------------------------------------------
        refresh = RefreshToken.for_user(user)

        # -------------------------------------------------
        # Return login response
        # -------------------------------------------------
        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "student_id": getattr(
                    profile,
                    "student_id",
                    ""
                ),
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            },
            status=status.HTTP_200_OK
        )

class ForgotPasswordAPIView(APIView):
    def post(self, request):
        email = request.data.get("email", "").strip()
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({
                "success": True,
                "message": "If an account with this email exists, password reset instructions have been issued."
            })

        token_obj = PasswordResetToken.generate_for_user(user)
        return Response({
            "success": True,
            "message": "Password reset token generated.",
            "dev_reset_token": token_obj.token,
            "dev_reset_url": f"/reset-password?token={token_obj.token}"
        })


class ResetPasswordAPIView(APIView):
    def post(self, request):
        token = request.data.get("token", "").strip()
        new_password = request.data.get("new_password", "").strip()
        confirm_password = request.data.get("confirm_password", "").strip()

        if not token or not new_password:
            return Response({"error": "Token and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if confirm_password and new_password != confirm_password:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        token_obj = PasswordResetToken.objects.filter(
            token=token,
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()

        if not token_obj:
            return Response({"error": "Invalid or expired reset token."}, status=status.HTTP_400_BAD_REQUEST)

        user = token_obj.user
        user.set_password(new_password)
        user.save()

        token_obj.is_used = True
        token_obj.save(update_fields=["is_used"])

        return Response({
            "success": True,
            "message": "Password has been reset successfully. Please log in with your new password."
        })


class MyAccessGroupsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        access_groups = UserAccessGroup.objects.filter(
            user=request.user,
            is_active=True
        ).select_related("access_group")

        valid_groups = []
        for ag in access_groups:
            if ag.expires_at and ag.expires_at <= timezone.now():
                continue
            valid_groups.append(UserAccessGroupSerializer(ag).data)

        return Response({
            "success": True,
            "access_groups": valid_groups
        })


class UserPurchasesListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        purchases = Purchase.objects.filter(
            user=request.user,
            is_active=True
        ).select_related("course", "access_group", "payment")
        serializer = PurchaseSerializer(purchases, many=True)
        return Response({
            "success": True,
            "purchases": serializer.data
        })





class MeAPIView(APIView):

    permission_classes = [IsAuthenticated]



    def get(self, request):

        return Response(UserSerializer(request.user).data)





class UpdateProfileAPIView(APIView):

    permission_classes = [IsAuthenticated]

    parser_classes = [MultiPartParser, FormParser, JSONParser]



    def put(self, request):

        profile, _ = UserProfile.objects.get_or_create(user=request.user)



        full_name = request.data.get("full_name")

        if full_name is not None:

            profile.full_name = full_name

            request.user.first_name = full_name

            request.user.save()



        phone = request.data.get("phone")

        if phone is not None:

            profile.phone = phone



        bio = request.data.get("bio")

        if bio is not None:

            profile.bio = bio



        if "profile_picture" in request.FILES:

            profile.profile_picture = request.FILES["profile_picture"]



        profile.save()

        return Response(UserSerializer(request.user).data)





class ChangePasswordAPIView(APIView):

    permission_classes = [IsAuthenticated]



    def post(self, request):

        old_password = request.data.get("old_password")

        new_password = request.data.get("new_password")



        if not request.user.check_password(old_password):

            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)



        if not new_password or len(new_password) < 6:

            return Response({"error": "New password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)



        request.user.set_password(new_password)

        request.user.save()

        return Response({"message": "Password changed successfully."})







class StudentDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]



    def get(self, request):

        user = request.user



        # Enrolled courses with calculated progress

        enrollments = Enrollment.objects.filter(user=user, status="active").select_related("course")

        courses_data = []

        for en in enrollments:

            course = en.course

            total_materials = Material.objects.filter(

                Q(course=course) | Q(chapter__course=course)

            ).count()

            completed = MaterialProgress.objects.filter(

                user=user,

                material__in=Material.objects.filter(Q(course=course) | Q(chapter__course=course)),

                is_completed=True

            ).count()

            progress = round((completed / total_materials) * 100) if total_materials > 0 else 0



            courses_data.append({

                "enrollment_id": en.id,

                "course_id": course.id,

                "title": course.title,

                "slug": course.slug,

                "thumbnail": course.thumbnail.url if course.thumbnail else None,

                "instructor": course.instructor,

                "progress_percentage": progress,

                "total_materials": total_materials,

                "completed_materials": completed,

                "enrolled_at": en.start_date,

            })



        # Recent payments

        payments = Payment.objects.filter(user=user).order_by("-created_at")[:5]

        payments_data = PaymentSerializer(payments, many=True).data



        return Response({

            "user": UserSerializer(user).data,

            "enrolled_courses": courses_data,



            "payments": payments_data,

            "stats": {

                "active_courses_count": len(courses_data),



                "completed_materials_total": MaterialProgress.objects.filter(user=user, is_completed=True).count(),

            }

        })







class PaymentSubmitAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        course_id = request.data.get("course_id")
        access_group_id = request.data.get("access_group_id")
        amount = request.data.get("amount")
        payment_method = request.data.get("payment_method")
        transaction_code = request.data.get("transaction_code", "").strip()
        payment_proof = request.FILES.get("payment_proof")
        note = request.data.get("note", "").strip()

        if not amount or not payment_method:
            return Response(
                {"error": "Amount and payment_method are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        course = None
        access_group = None

        if course_id:
            try:
                course = Course.objects.get(pk=course_id)
                access_group = course.access_group
            except Course.DoesNotExist:
                return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        if access_group_id and not access_group:
            try:
                access_group = AccessGroup.objects.get(pk=access_group_id)
            except AccessGroup.DoesNotExist:
                return Response({"error": "Access Group not found"}, status=status.HTTP_404_NOT_FOUND)

        payment = Payment.objects.create(
            user=request.user,
            course=course,
            access_group=access_group,
            amount=Decimal(str(amount)),
            payment_method=payment_method,
            transaction_code=transaction_code,
            payment_proof=payment_proof,
            note=note,
            status="pending"
        )

        return Response(
            {
                "success": True,
                "message": "Payment submitted successfully. Awaiting administrative verification.",
                "payment": PaymentSerializer(payment).data
            },
            status=status.HTTP_201_CREATED
        )


class UserPaymentsListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(user=request.user).order_by("-created_at")
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)


class ContactMessageCreateAPIView(APIView):
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "Thank you! Your message has been sent successfully. We will get back to you shortly.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class SocialLinkListAPIView(APIView):
    def get(self, request):
        links = SocialLink.objects.filter(is_active=True).order_by("order", "id")
        serializer = SocialLinkSerializer(links, many=True)
        return Response({
            "success": True,
            "results": serializer.data
        })


class RecordSiteVisitAPIView(APIView):
    """
    Lightweight visitor and page view counter for frontend.
    """
    def post(self, request):
        is_new_visitor = bool(request.data.get("is_new_visitor", False))
        stats = SiteStatistic.increment_view(is_new_visitor=is_new_visitor)
        return Response({
            "success": True,
            "total_visitors": stats.total_visitors,
            "total_page_views": stats.total_page_views,
        })


class CountersAPIView(APIView):
    """
    Source of truth statistics for BTMath footer & landing pages:
    - total_visitors
    - total_page_views
    - total_students
    - total_courses
    - total_enrollments
    - total_purchases
    """
    def get(self, request):
        stats = SiteStatistic.get_stats()
        total_students = User.objects.count()
        total_courses = Course.objects.filter(is_published=True).count()
        total_purchases = Purchase.objects.filter(is_active=True).count() or Payment.objects.filter(status="approved").count()
        total_enrollments = Enrollment.objects.count()

        now = timezone.now()
        today = now.date()
        logins_today = LoginLog.objects.filter(logged_at__date=today).values("user").distinct().count()

        return Response({
            "total_visitors": stats.total_visitors,
            "total_page_views": stats.total_page_views,
            "total_students": total_students,
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "total_purchases": total_purchases,
            "logins_today": logins_today,
        })





from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated



from .permissions import IsAdminUser

from .models import (

    UserProfile,

    Course,

    Enrollment,

    Payment,

    UserRequest,

)





from django.shortcuts import get_object_or_404


def process_payment_decision(payment, decision, admin_user, rejection_reason=""):
    """
    Handles payment approval or rejection:
    1. Sets status ('approved' or 'rejected')
    2. Sets verified_by & verified_at
    3. If approved:
       - Assigns AccessGroup to student (UserAccessGroup)
       - Creates/activates Purchase entry
       - Ensures direct Course Enrollment is active
       - Falls back to UserSectionAccess for legacy compatibility
       - Creates AuditLog entry
    4. If rejected:
       - Sets rejection_reason
       - Creates AuditLog entry
    """
    if decision == "approved":
        payment.status = "approved"
        payment.verified_by = admin_user
        payment.verified_at = timezone.now()
        payment.rejection_reason = ""
        payment.save()

        # Determine target AccessGroup
        target_group = payment.access_group
        if not target_group and payment.course:
            target_group = payment.course.access_group

        if not target_group and payment.course and payment.course.program and payment.course.program.category:
            level = payment.course.program.category.level
            target_group = AccessGroup.objects.filter(slug__iexact=level.replace("-", "_")).first()
            if not target_group:
                target_group = AccessGroup.objects.filter(name__iexact=level).first()

        # Provision Access Group
        if target_group:
            UserAccessGroup.objects.update_or_create(
                user=payment.user,
                access_group=target_group,
                defaults={
                    "is_active": True,
                    "granted_by": admin_user,
                    "expires_at": None,
                }
            )

        # Create or update active Purchase record
        Purchase.objects.update_or_create(
            user=payment.user,
            payment=payment,
            defaults={
                "course": payment.course,
                "access_group": target_group,
                "amount": payment.amount,
                "is_active": True,
            }
        )

        # Ensure direct Enrollment
        if payment.course:
            Enrollment.objects.update_or_create(
                user=payment.user,
                course=payment.course,
                defaults={"status": "active"}
            )

        # Fallback legacy section access
        try:
            grant_section_access_from_payment(payment, admin_user)
        except Exception:
            pass

        # Audit log
        student_id = getattr(getattr(payment.user, "profile", None), "student_id", "")
        AuditLog.objects.create(
            admin=admin_user,
            action="PAYMENT_APPROVED",
            target_type="Payment",
            target_id=str(payment.id),
            description=f"Approved payment #{payment.id} for student {payment.user.username} ({student_id}). Amount: NPR {payment.amount}"
        )

    elif decision == "rejected":
        payment.status = "rejected"
        payment.verified_by = admin_user
        payment.verified_at = timezone.now()
        payment.rejection_reason = rejection_reason
        payment.save()

        # Audit log
        AuditLog.objects.create(
            admin=admin_user,
            action="PAYMENT_REJECTED",
            target_type="Payment",
            target_id=str(payment.id),
            description=f"Rejected payment #{payment.id} for student {payment.user.username}. Reason: {rejection_reason}"
        )

    return payment


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        stats = SiteStatistic.get_stats()
        return Response({
            "total_students": UserProfile.objects.filter(role="student").count() or User.objects.count(),
            "total_courses": Course.objects.count(),
            "total_programs": Program.objects.count(),
            "pending_payments": Payment.objects.filter(status="pending").count(),
            "approved_purchases": Purchase.objects.filter(is_active=True).count(),
            "total_enrollments": Enrollment.objects.count(),
            "total_visitors": stats.total_visitors,
            "total_page_views": stats.total_page_views,
            "total_contact_messages": ContactMessage.objects.count(),
            "unread_contacts": ContactMessage.objects.filter(is_read=False).count(),
            "pending_requests": UserRequest.objects.filter(status="pending").count(),
            "access_groups": AccessGroup.objects.count(),
        })


class AdminUsersAPIView(APIView):
    """
    Admin API for managing registered students.
    Supports search by Student ID (e.g. BTM-000123), Name, Email, Phone.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        query = request.query_params.get("search", "").strip()
        status_filter = request.query_params.get("status", "").strip().lower()

        users_qs = User.objects.all().select_related("profile").order_by("-date_joined")

        if query:
            users_qs = users_qs.filter(
                Q(profile__student_id__icontains=query) |
                Q(username__icontains=query) |
                Q(email__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(profile__phone__icontains=query)
            )

        if status_filter == "active":
            users_qs = users_qs.filter(is_active=True, profile__is_disabled=False)
        elif status_filter == "disabled":
            users_qs = users_qs.filter(Q(is_active=False) | Q(profile__is_disabled=True))

        data = []
        for user in users_qs:
            profile = getattr(user, "profile", None)
            data.append({
                "id": user.id,
                "student_id": getattr(profile, "student_id", None) or f"BTM-{user.id:06d}",
                "username": user.username,
                "email": user.email,
                "full_name": getattr(profile, "full_name", "") or f"{user.first_name} {user.last_name}".strip() or user.username,
                "phone": getattr(profile, "phone", ""),
                "role": getattr(profile, "role", "student"),
                "is_disabled": getattr(profile, "is_disabled", False) or not user.is_active,
                "is_active": user.is_active and not getattr(profile, "is_disabled", False),
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "date_joined": user.date_joined,
                "last_login": user.last_login,
                "purchases_count": getattr(user, "purchases", User.objects.none()).count(),
                "active_access_groups": [
                    ag.access_group.name for ag in user.user_access_groups.filter(is_active=True)
                ],
            })

        return Response({
            "success": True,
            "count": len(data),
            "users": data,
        })


class AdminUserDetailAPIView(APIView):
    """
    Detailed 360-degree student view when searching student ID like BTM-000123.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        pk_or_student_id = pk
        user = None
        if str(pk_or_student_id).isdigit():
            user = User.objects.filter(pk=int(pk_or_student_id)).select_related("profile").first()
        if not user:
            user = User.objects.filter(
                Q(profile__student_id__iexact=str(pk_or_student_id)) |
                Q(username__iexact=str(pk_or_student_id)) |
                Q(email__iexact=str(pk_or_student_id))
            ).select_related("profile").first()

        if not user:
            return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        profile = getattr(user, "profile", None)

        payments = Payment.objects.filter(user=user).select_related("course", "access_group").order_by("-created_at")
        purchases = Purchase.objects.filter(user=user).select_related("course", "access_group", "payment").order_by("-created_at")
        access_groups = UserAccessGroup.objects.filter(user=user).select_related("access_group", "granted_by").order_by("-granted_at")
        enrollments = Enrollment.objects.filter(user=user).select_related("course").order_by("-start_date")

        return Response({
            "success": True,
            "student": {
                "id": user.id,
                "student_id": getattr(profile, "student_id", ""),
                "username": user.username,
                "email": user.email,
                "full_name": getattr(profile, "full_name", "") or user.get_full_name(),
                "phone": getattr(profile, "phone", ""),
                "education_level": getattr(profile, "education_level", ""),
                "address": getattr(profile, "address", ""),
                "date_of_birth": getattr(profile, "date_of_birth", None),
                "is_disabled": getattr(profile, "is_disabled", False) or not user.is_active,
                "date_joined": user.date_joined,
                "last_login": user.last_login,
            },
            "purchases": PurchaseSerializer(purchases, many=True).data,
            "payments": PaymentSerializer(payments, many=True).data,
            "access_groups": UserAccessGroupSerializer(access_groups, many=True).data,
            "enrollments": [
                {
                    "id": en.id,
                    "course_id": en.course.id,
                    "course_title": en.course.title,
                    "status": en.status,
                    "start_date": en.start_date,
                    "expiry_date": en.expiry_date,
                }
                for en in enrollments
            ]
        })


class AdminUserToggleDisableAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        profile = getattr(user, "profile", None)
        if not profile:
            profile = UserProfile.objects.create(user=user)

        profile.is_disabled = not profile.is_disabled
        user.is_active = not profile.is_disabled
        profile.save()
        user.save()

        action = "USER_DISABLED" if profile.is_disabled else "USER_ENABLED"
        AuditLog.objects.create(
            admin=request.user,
            action=action,
            target_type="User",
            target_id=str(user.id),
            description=f"{action}: {user.username} ({profile.student_id})"
        )

        return Response({
            "success": True,
            "message": f"Student {'disabled' if profile.is_disabled else 'enabled'} successfully.",
            "is_disabled": profile.is_disabled,
        })


class AdminUserResetPasswordAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        new_password = request.data.get("new_password", "").strip() or "BTMath@123"

        user.set_password(new_password)
        user.save()

        AuditLog.objects.create(
            admin=request.user,
            action="USER_PASSWORD_RESET",
            target_type="User",
            target_id=str(user.id),
            description=f"Admin reset password for {user.username} ({getattr(user.profile, 'student_id', '')})"
        )

        return Response({
            "success": True,
            "message": f"Password reset successfully for {user.username}.",
            "temporary_password": new_password,
        })


class AdminUserManageAccessAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        access_group_id = request.data.get("access_group_id")
        action = request.data.get("action", "grant")

        if not access_group_id:
            return Response({"error": "access_group_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        group = get_object_or_404(AccessGroup, pk=access_group_id)

        if action == "grant":
            UserAccessGroup.objects.update_or_create(
                user=user,
                access_group=group,
                defaults={"is_active": True, "granted_by": request.user}
            )
            AuditLog.objects.create(
                admin=request.user,
                action="ACCESS_GRANTED",
                target_type="AccessGroup",
                target_id=str(group.id),
                description=f"Granted access to {group.name} for student {user.username} ({getattr(user.profile, 'student_id', '')})"
            )
            return Response({"success": True, "message": f"Granted {group.name} access."})
        else:
            UserAccessGroup.objects.filter(user=user, access_group=group).update(is_active=False)
            AuditLog.objects.create(
                admin=request.user,
                action="ACCESS_REVOKED",
                target_type="AccessGroup",
                target_id=str(group.id),
                description=f"Revoked access to {group.name} for student {user.username} ({getattr(user.profile, 'student_id', '')})"
            )
            return Response({"success": True, "message": f"Revoked {group.name} access."})


class AdminPaymentApproveAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk)
        process_payment_decision(payment, "approved", request.user)
        return Response({
            "success": True,
            "message": f"Payment #{payment.id} approved successfully and access granted to student.",
            "payment": PaymentSerializer(payment).data
        })


class AdminPaymentRejectAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk)
        reason = request.data.get("rejection_reason", "").strip() or "Payment could not be verified."
        process_payment_decision(payment, "rejected", request.user, rejection_reason=reason)
        return Response({
            "success": True,
            "message": f"Payment #{payment.id} rejected.",
            "payment": PaymentSerializer(payment).data
        })





    from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework import status

from rest_framework.permissions import IsAuthenticated



from .permissions import IsAdminUser

from .models import (

    UserRequest,

    Program,

    Course,

    Subject,

    Chapter,

    Material,

    Enrollment,

    Payment,

)





# ============================================================

# ADMIN RESOURCE CRUD

# ============================================================



from decimal import Decimal

from django.core.exceptions import ValidationError

from django.db import transaction

from django.forms.models import model_to_dict



from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework import status

from rest_framework.permissions import IsAuthenticated



from .permissions import IsAdminUser

from .models import (

    UserRequest,

    Program,

    AcademicPeriod,

    Subject,

    Course,

    Chapter,

    Material,

    Enrollment,

    Payment,

)



# ============================================================

# SECTION ACCESS HELPERS

# ============================================================



VALID_SECTIONS = {

    "plus2",

    "bachelor",

    "master",

    "ioe",

}





def get_course_section(course):

    """

    Return the BTMath section for a course.



    +2       -> plus2

    Bachelor -> bachelor

    Master   -> master

    IOE      -> ioe

    """



    if not course:

        return None



    if not course.program:

        return None



    if not course.program.category:

        return None



    section = course.program.category.level



    if section in VALID_SECTIONS:

        return section



    return None





def grant_section_access(user, section, granted_by=None):

    """

    Grant permanent section access unless an expiry is

    explicitly changed later by an administrator.

    """



    if section not in VALID_SECTIONS:

        raise ValueError("Invalid BTMath section.")



    access, created = UserSectionAccess.objects.update_or_create(

        user=user,

        section=section,

        defaults={

            "is_active": True,

            "granted_by": granted_by,

            "expires_at": None,

        },

    )



    return access, created





def grant_section_access_from_payment(payment, admin_user=None):

    """

    When a payment is approved, automatically unlock the

    entire BTMath section containing that course.

    """



    if not payment:

        return None



    if not payment.course:

        return None



    section = get_course_section(payment.course)



    if not section:

        return None



    access, created = grant_section_access(

        user=payment.user,

        section=section,

        granted_by=admin_user,

    )



    return access





class AdminResourceAPIView(APIView):

    """

    Generic CRUD API used by the custom BTMath admin dashboard.



    The admin user does NOT need to know Django or the database.



    GET:

        /api/admin/<resource>/



    POST:

        /api/admin/<resource>/



    PUT:

        /api/admin/<resource>/<pk>/



    DELETE:

        /api/admin/<resource>/<pk>/

    """



    permission_classes = [IsAuthenticated, IsAdminUser]



    RESOURCE_MODELS = {
        "requests": UserRequest,
        "programs": Program,
        "academic-periods": AcademicPeriod,
        "academic-units": AcademicPeriod,
        "subjects": Subject,
        "courses": Course,
        "chapters": Chapter,
        "lessons": Lesson,
        "materials": Material,
        "enrollments": Enrollment,
        "payments": Payment,
        "purchases": Purchase,
        "access-groups": AccessGroup,
        "user-access-groups": UserAccessGroup,
        "contacts": ContactMessage,
        "social-links": SocialLink,
        "audit-logs": AuditLog,
    }



    # --------------------------------------------------------

    # MODEL

    # --------------------------------------------------------



    def get_model(self, resource):

        return self.RESOURCE_MODELS.get(resource)



    # --------------------------------------------------------

    # SERIALIZATION

    # --------------------------------------------------------



    def serialize_value(self, value):



        if value is None:

            return None



        if isinstance(value, Decimal):

            return float(value)



        if hasattr(value, "isoformat"):

            try:

                return value.isoformat()

            except Exception:

                pass



        if hasattr(value, "url"):

            try:

                return value.url

            except Exception:

                pass



        if hasattr(value, "pk"):

            return value.pk



        if isinstance(value, (str, int, float, bool)):

            return value



        if isinstance(value, (list, tuple)):

            return [

                self.serialize_value(item)

                for item in value

            ]



        if isinstance(value, dict):

            return {

                str(key): self.serialize_value(val)

                for key, val in value.items()

            }



        return str(value)



    def serialize_object(self, obj):



        data = {

            "id": obj.pk

        }



        for field in obj._meta.fields:



            try:

                value = getattr(obj, field.name)



                data[field.name] = self.serialize_value(value)



            except Exception:

                data[field.name] = None



        # Human-readable relationship names

        if hasattr(obj, "program_id"):



            try:

                data["program_name"] = (

                    obj.program.name

                    if obj.program

                    else None

                )

            except Exception:

                data["program_name"] = None



        if hasattr(obj, "subject_id"):



            try:

                data["subject_name"] = (

                    obj.subject.name

                    if obj.subject

                    else None

                )

            except Exception:

                data["subject_name"] = None



        if hasattr(obj, "academic_period_id"):



            try:

                data["academic_period_name"] = (

                    obj.academic_period.name

                    if obj.academic_period

                    else None

                )

            except Exception:

                data["academic_period_name"] = None



        if hasattr(obj, "course_id"):



            try:

                data["course_name"] = (

                    obj.course.title

                    if obj.course

                    else None

                )

            except Exception:

                data["course_name"] = None



        if hasattr(obj, "user_id"):



            try:

                data["user_name"] = (

                    obj.user.get_full_name()

                    or obj.user.username

                )

            except Exception:

                data["user_name"] = None



        return data



    # --------------------------------------------------------

    # GET

    # --------------------------------------------------------



    def get(self, request, resource):



        model = self.get_model(resource)



        if not model:

            return Response(

                {"detail": "Unknown admin resource."},

                status=status.HTTP_404_NOT_FOUND

            )



        try:



            queryset = model.objects.all()



            # Course optimization

            if resource == "courses":

                queryset = queryset.select_related(

                    "program",

                    "academic_period",

                    "subject",

                    "semester",

                )



            elif resource == "subjects":

                queryset = queryset.select_related(

                    "program",

                    "academic_period",

                )



            elif resource == "academic-periods":

                queryset = queryset.select_related(

                    "program",

                    "parent",

                )



            elif resource == "chapters":

                queryset = queryset.select_related(

                    "course",

                    "program",

                )



            elif resource == "materials":

                queryset = queryset.select_related(

                    "course",

                    "chapter",

                )



            elif resource == "enrollments":

                queryset = queryset.select_related(

                    "user",

                    "course",

                )



            elif resource == "payments":

                queryset = queryset.select_related(

                    "user",

                    "course",

                )



            elif resource == "requests":

                queryset = queryset.select_related(

                    "user",

                    "course",

                )



            queryset = queryset.order_by("-pk")



            data = [

                self.serialize_object(obj)

                for obj in queryset

            ]



            return Response(data)



        except Exception as exc:



            return Response(

                {

                    "detail": "Unable to load resource.",

                    "error": str(exc),

                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR

            )



    # --------------------------------------------------------

    # CREATE

    # --------------------------------------------------------



    @transaction.atomic

    def post(self, request, resource):



        model = self.get_model(resource)



        if not model:

            return Response(

                {"detail": "Unknown admin resource."},

                status=status.HTTP_404_NOT_FOUND

            )



        data = request.data.copy()



        # Never allow client to choose ID

        data.pop("id", None)



        try:



            # Convert foreign-key IDs correctly

            self.prepare_foreign_keys(

                model,

                data

            )



            obj = model.objects.create(**data)



            obj.full_clean()

            obj.save()



            return Response(

                self.serialize_object(obj),

                status=status.HTTP_201_CREATED

            )



        except ValidationError as exc:



            return Response(

                {

                    "detail": "Validation failed.",

                    "errors": exc.message_dict

                    if hasattr(exc, "message_dict")

                    else exc.messages,

                },

                status=status.HTTP_400_BAD_REQUEST

            )



        except Exception as exc:



            return Response(

                {

                    "detail": "Unable to create resource.",

                    "error": str(exc),

                },

                status=status.HTTP_400_BAD_REQUEST

            )



    # --------------------------------------------------------

    # UPDATE

    # --------------------------------------------------------



    @transaction.atomic
    def put(self, request, resource, pk):
        model = self.get_model(resource)

        if not model:
            return Response(
                {"detail": "Unknown admin resource."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            obj = model.objects.get(pk=pk)
        except model.DoesNotExist:
            return Response(
                {"detail": "Resource not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = request.data.copy()
        data.pop("id", None)

        try:
            self.prepare_foreign_keys(model, data)

            for field_name, value in data.items():
                if field_name == "id":
                    continue
                if not hasattr(obj, field_name):
                    continue
                setattr(obj, field_name, value)

            obj.full_clean()
            obj.save()

            # ========================================================
            # PAYMENT APPROVAL / REJECTION → PROCESS DECISION
            # ========================================================
            if resource == "payments" and obj.status in ("approved", "rejected"):
                process_payment_decision(
                    payment=obj,
                    decision=obj.status,
                    admin_user=request.user,
                    rejection_reason=data.get("rejection_reason", ""),
                )

            return Response(self.serialize_object(obj))

        except ValidationError as exc:
            return Response(
                {
                    "detail": "Validation failed.",
                    "errors": (
                        exc.message_dict
                        if hasattr(exc, "message_dict")
                        else exc.messages
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": "Unable to update resource.",
                    "error": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    # DELETE

    # --------------------------------------------------------



    @transaction.atomic

    def delete(self, request, resource, pk):



        model = self.get_model(resource)



        if not model:

            return Response(

                {"detail": "Unknown admin resource."},

                status=status.HTTP_404_NOT_FOUND

            )



        try:



            obj = model.objects.get(pk=pk)



        except model.DoesNotExist:



            return Response(

                {"detail": "Resource not found."},

                status=status.HTTP_404_NOT_FOUND

            )



        try:



            obj.delete()



            return Response(

                {

                    "message": "Deleted successfully."

                },

                status=status.HTTP_200_OK

            )



        except Exception as exc:



            return Response(

                {

                    "detail": "Unable to delete resource.",

                    "error": str(exc),

                },

                status=status.HTTP_400_BAD_REQUEST

            )



    # --------------------------------------------------------

    # FOREIGN KEYS

    # --------------------------------------------------------



    def prepare_foreign_keys(self, model, data):



        foreign_keys = {
            "program": Program,
            "academic_period": AcademicPeriod,
            "academic_unit": AcademicPeriod,
            "subject": Subject,
            "semester": self.get_semester_model(),
            "course": Course,
            "chapter": Chapter,
            "lesson": Lesson,
            "access_group": AccessGroup,
            "payment": Payment,
            "user": self.get_user_model(),
            "parent": AcademicPeriod,
        }



        for field_name, related_model in foreign_keys.items():



            if field_name not in data:

                continue



            value = data.get(field_name)



            if value in ("", None, "null"):

                data[field_name] = None

                continue



            try:

                data[field_name] = related_model.objects.get(

                    pk=int(value)

                )



            except (

                related_model.DoesNotExist,

                ValueError,

                TypeError,

            ):



                raise ValidationError({

                    field_name: (

                        f"Invalid {field_name}."

                    )

                })



    def get_user_model(self):



        from django.contrib.auth import get_user_model



        return get_user_model()



    def get_semester_model(self):



        from .models import Semester



        return Semester





# ============================================================

# SECTION ACCESS

# ============================================================



VALID_SECTIONS = {

    "plus2",

    "bachelor",

    "master",

    "ioe",

}





class MySectionAccessAPIView(APIView):

    """

    Returns the sections unlocked for the currently logged-in user.

    """



    permission_classes = [IsAuthenticated]



    def get(self, request):

        accesses = (

            UserSectionAccess.objects

            .filter(user=request.user, is_active=True)

            .order_by("section")

        )



        data = []



        for access in accesses:

            # Ignore expired access

            if access.expires_at and access.expires_at <= timezone.now():

                continue



            data.append({

                "id": access.id,

                "section": access.section,

                "section_name": access.get_section_display(),

                "is_active": access.is_active,

                "granted_at": access.granted_at,

                "expires_at": access.expires_at,

            })



        return Response({

            "success": True,

            "sections": data,

        })





class AdminSectionAccessAPIView(APIView):

    """

    Admin endpoint for granting, updating and removing

    section-level access.



    One access record unlocks every course belonging

    to that BTMath section.

    """



    permission_classes = [IsAuthenticated]



    def _is_admin(self, user):

        return user.is_staff or user.is_superuser



    def get(self, request, pk=None):

        if not self._is_admin(request.user):

            return Response(

                {"detail": "Admin access required."},

                status=status.HTTP_403_FORBIDDEN,

            )



        if pk:

            try:

                access = UserSectionAccess.objects.select_related(

                    "user",

                    "granted_by",

                ).get(pk=pk)

            except UserSectionAccess.DoesNotExist:

                return Response(

                    {"detail": "Section access not found."},

                    status=status.HTTP_404_NOT_FOUND,

                )



            return Response({

                "id": access.id,

                "user": access.user.id,

                "username": access.user.username,

                "email": access.user.email,

                "section": access.section,

                "section_name": access.get_section_display(),

                "is_active": access.is_active,

                "granted_at": access.granted_at,

                "expires_at": access.expires_at,

                "granted_by": (

                    access.granted_by.username

                    if access.granted_by

                    else None

                ),

            })



        accesses = (

            UserSectionAccess.objects

            .select_related("user", "granted_by")

            .order_by("-granted_at")

        )



        data = []



        for access in accesses:

            data.append({

                "id": access.id,

                "user": access.user.id,

                "username": access.user.username,

                "email": access.user.email,

                "section": access.section,

                "section_name": access.get_section_display(),

                "is_active": access.is_active,

                "granted_at": access.granted_at,

                "expires_at": access.expires_at,

                "granted_by": (

                    access.granted_by.username

                    if access.granted_by

                    else None

                ),

            })



        return Response({

            "success": True,

            "count": len(data),

            "results": data,

        })



    def post(self, request):

        if not self._is_admin(request.user):

            return Response(

                {"detail": "Admin access required."},

                status=status.HTTP_403_FORBIDDEN,

            )



        user_id = request.data.get("user")

        section = request.data.get("section")

        is_active = request.data.get("is_active", True)

        expires_at = request.data.get("expires_at")



        if not user_id:

            return Response(

                {"detail": "user is required."},

                status=status.HTTP_400_BAD_REQUEST,

            )



        if section not in VALID_SECTIONS:

            return Response(

                {

                    "detail": "Invalid section.",

                    "allowed_sections": list(VALID_SECTIONS),

                },

                status=status.HTTP_400_BAD_REQUEST,

            )



        User = get_user_model()



        try:

            user = User.objects.get(pk=user_id)

        except User.DoesNotExist:

            return Response(

                {"detail": "User not found."},

                status=status.HTTP_404_NOT_FOUND,

            )



        access, created = UserSectionAccess.objects.update_or_create(

            user=user,

            section=section,

            defaults={

                "is_active": bool(is_active),

                "expires_at": expires_at,

                "granted_by": request.user,

            },

        )



        return Response(

            {

                "success": True,

                "created": created,

                "message": (

                    "Section access granted."

                    if access.is_active

                    else "Section access updated."

                ),

                "access": {

                    "id": access.id,

                    "user": access.user.id,

                    "username": access.user.username,

                    "section": access.section,

                    "section_name": access.get_section_display(),

                    "is_active": access.is_active,

                    "expires_at": access.expires_at,

                },

            },

            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,

        )



    def put(self, request, pk=None):

        if not self._is_admin(request.user):

            return Response(

                {"detail": "Admin access required."},

                status=status.HTTP_403_FORBIDDEN,

            )



        if not pk:

            return Response(

                {"detail": "Access ID is required."},

                status=status.HTTP_400_BAD_REQUEST,

            )



        try:

            access = UserSectionAccess.objects.get(pk=pk)

        except UserSectionAccess.DoesNotExist:

            return Response(

                {"detail": "Section access not found."},

                status=status.HTTP_404_NOT_FOUND,

            )



        if "section" in request.data:

            section = request.data.get("section")



            if section not in VALID_SECTIONS:

                return Response(

                    {"detail": "Invalid section."},

                    status=status.HTTP_400_BAD_REQUEST,

                )



            access.section = section



        if "is_active" in request.data:

            access.is_active = bool(request.data.get("is_active"))



        if "expires_at" in request.data:

            access.expires_at = request.data.get("expires_at")



        access.granted_by = request.user

        access.save()



        return Response({

            "success": True,

            "message": "Section access updated successfully.",

            "access": {

                "id": access.id,

                "user": access.user.id,

                "username": access.user.username,

                "section": access.section,

                "section_name": access.get_section_display(),

                "is_active": access.is_active,

                "expires_at": access.expires_at,

            },

        })



    def delete(self, request, pk=None):

        if not self._is_admin(request.user):

            return Response(

                {"detail": "Admin access required."},

                status=status.HTTP_403_FORBIDDEN,

            )



        if not pk:

            return Response(

                {"detail": "Access ID is required."},

                status=status.HTTP_400_BAD_REQUEST,

            )



        try:

            access = UserSectionAccess.objects.get(pk=pk)

        except UserSectionAccess.DoesNotExist:

            return Response(

                {"detail": "Section access not found."},

                status=status.HTTP_404_NOT_FOUND,

            )



        access.delete()



        return Response({

            "success": True,

            "message": "Section access removed successfully.",

        })


