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
    Course,
    Chapter,
    Material,
    UserProfile,
    Enrollment,
    Payment,
    MaterialProgress,

    LoginLog,
)
from .serializers import (
    UserSerializer,
    CategorySerializer,
    ProgramSerializer,
    CourseSerializer,
    CourseListSerializer,
    ChapterSerializer,
    MaterialSerializer,
    PaymentSerializer,
    
)


# ==========================================
# 1. CATEGORIES & ACADEMIC HIERARCHY
# ==========================================

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
        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip()
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")
        full_name = request.data.get("full_name", "").strip()
        phone = request.data.get("phone", "").strip()

        if not username or not email or not password:
            return Response(
                {"error": "Username, email, and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if confirm_password and password != confirm_password:
            return Response(
                {"error": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists."},
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

        UserProfile.objects.create(
            user=user,
            full_name=full_name,
            phone=phone,
            role="student"
        )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Registration successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


class LoginAPIView(APIView):
    def post(self, request):
        username_or_email = request.data.get("username", "").strip()
        password = request.data.get("password")

        if not username_or_email or not password:
            return Response(
                {"error": "Please provide username/email and password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Allow login by email or username
        user = authenticate(username=username_or_email, password=password)
        if user is None:
            user_obj = User.objects.filter(email=username_or_email).first()
            if user_obj:
                user = authenticate(username=user_obj.username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Track distinct login in LoginLog
        ip = request.META.get("HTTP_X_FORWARDED_FOR") or request.META.get("REMOTE_ADDR")
        LoginLog.objects.create(user=user, ip_address=ip)

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data
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
        amount = request.data.get("amount")
        payment_method = request.data.get("payment_method")
        transaction_code = request.data.get("transaction_code", "").strip()
        payment_proof = request.FILES.get("payment_proof")

        if not course_id or not amount or not payment_method:
            return Response(
                {"error": "course_id, amount, and payment_method are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        payment = Payment.objects.create(
            user=request.user,
            course=course,
            amount=Decimal(str(amount)),
            payment_method=payment_method,
            transaction_code=transaction_code,
            payment_proof=payment_proof,
            status="pending"
        )

        return Response(
            {
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




class CountersAPIView(APIView):
    """
    Source of truth counters directly from database aggregations.
    No artificial values.
    """
    def get(self, request):
        now = timezone.now()
        today = now.date()

        total_students = User.objects.count()
        total_courses = Course.objects.filter(is_published=True).count()
        total_purchases = Payment.objects.filter(status="approved").count()
       
        

        logins_today = LoginLog.objects.filter(logged_at__date=today).values("user").distinct().count()
        registrations_today = User.objects.filter(date_joined__date=today).count()
        registrations_month = User.objects.filter(
            date_joined__year=today.year,
            date_joined__month=today.month
        ).count()

        return Response({
            "total_students": total_students,
            "total_courses": total_courses,
            "total_purchases": total_purchases,
           
            "logins_today": logins_today,
            "registrations_today": registrations_today,
            "registrations_month": registrations_month,
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


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response({
            "students": UserProfile.objects.count(),
            "courses": Course.objects.count(),
            "pending_requests": UserRequest.objects.filter(
                status="pending"
            ).count(),
            "enrollments": Enrollment.objects.count(),
            "payments": Payment.objects.count(),
        })


from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .permissions import IsAdminUser

User = get_user_model()


class AdminUsersAPIView(APIView):
    """
    Admin API for viewing all registered users.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by("-date_joined")

        data = []

        for user in users:
            data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "date_joined": user.date_joined,
                "last_login": user.last_login,
            })

        return Response({
            "count": len(data),
            "users": data,
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

class AdminResourceAPIView(APIView):
    """
    Generic admin CRUD API for BTMath administration.

    Supports:
        GET    /api/admin/<resource>/
        POST   /api/admin/<resource>/
        PUT    /api/admin/<resource>/<pk>/
        DELETE /api/admin/<resource>/<pk>/

    Only Django staff/superuser accounts can use these endpoints.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    RESOURCE_MODELS = {
        "requests": UserRequest,
        "programs": Program,
        "courses": Course,
        "subjects": Subject,
        "chapters": Chapter,
        "materials": Material,
        "enrollments": Enrollment,
        "payments": Payment,
    }

    def get_model(self, resource):
        return self.RESOURCE_MODELS.get(resource)

    def serialize_value(self, value):
        """
        Convert Django/model values into JSON-safe values.
        """

        if value is None:
            return None

        # Date/time values
        if hasattr(value, "isoformat"):
            try:
                return value.isoformat()
            except Exception:
                pass

        # Decimal
        from decimal import Decimal

        if isinstance(value, Decimal):
            return float(value)

        # Django model instance / ForeignKey
        if hasattr(value, "pk"):
            return value.pk

        # FileField / ImageField
        if hasattr(value, "url"):
            try:
                return value.url
            except Exception:
                pass

        # Basic JSON-safe values
        if isinstance(value, (str, int, float, bool)):
            return value

        # Lists / tuples
        if isinstance(value, (list, tuple)):
            return [
                self.serialize_value(item)
                for item in value
            ]

        # Dictionaries
        if isinstance(value, dict):
            return {
                str(key): self.serialize_value(val)
                for key, val in value.items()
            }

        # Fallback
        return str(value)

    def serialize_object(self, obj):
        """
        Convert a Django model instance into JSON-safe data.
        """

        data = {}

        for field in obj._meta.fields:
            try:
                value = getattr(obj, field.name)
                data[field.name] = self.serialize_value(value)
            except Exception:
                data[field.name] = None

        return data

    def get(self, request, resource):
        model = self.get_model(resource)

        if not model:
            return Response(
                {"detail": "Unknown admin resource."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            objects = model.objects.all().order_by("-pk")

            data = [
                self.serialize_object(obj)
                for obj in objects
            ]

            return Response(
                data,
                status=status.HTTP_200_OK,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": "Unable to load resource.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request, resource):
        model = self.get_model(resource)

        if not model:
            return Response(
                {"detail": "Unknown admin resource."},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = request.data.copy()

        try:
            obj = model.objects.create(**data)

            return Response(
                self.serialize_object(obj),
                status=status.HTTP_201_CREATED,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": "Unable to create resource.",
                    "error": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

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

        try:
            for key, value in data.items():

                # Never allow changing the primary key
                if key == "id":
                    continue

                # Only update real model fields
                if hasattr(obj, key):
                    setattr(obj, key, value)

            obj.save()

            return Response(
                self.serialize_object(obj),
                status=status.HTTP_200_OK,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": "Unable to update resource.",
                    "error": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    def delete(self, request, resource, pk):
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

        try:
            obj.delete()

            return Response(
                {"message": "Resource deleted successfully."},
                status=status.HTTP_200_OK,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": "Unable to delete resource.",
                    "error": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
