from django.utils import timezone
from .models import (
    UserSectionAccess,
    UserAccessGroup,
    Enrollment,
    Purchase,
    UserCourseAccess,
)


VALID_SECTIONS = {
    "plus2",
    "bachelor",
    "master",
    "ioe",
}


def get_course_section(course):
    """
    Returns the BTMath section that owns this course.
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


def has_section_access(user, section):
    """
    Check whether a user has active access to a BTMath section.
    """
    if not user or not user.is_authenticated:
        return False

    if user.is_staff or user.is_superuser:
        return True

    profile = getattr(user, "profile", None)
    if profile and profile.is_disabled:
        return False

    if section not in VALID_SECTIONS:
        return False

    # Check dynamic access group with matching code/name first (e.g. PLUS_TWO)
    access_group = UserAccessGroup.objects.filter(
        user=user,
        access_group__slug__iexact=section.replace("-", "_"),
        is_active=True,
    ).first()
    if access_group:
        if not access_group.expires_at or access_group.expires_at > timezone.now():
            return True

    # Fallback to UserSectionAccess table
    access = UserSectionAccess.objects.filter(
        user=user,
        section=section,
        is_active=True,
    ).first()

    if not access:
        return False

    if access.expires_at and access.expires_at <= timezone.now():
        return False

    return True


def has_course_access(user, course):
    """
    Primary Access Check:
    1. Superuser / Staff has full access
    2. Disabled accounts have no access
    3. Free courses are accessible to all authenticated users
    4. Direct active Enrollment grants access
    5. Active AccessGroup assigned to the course grants access
    6. Active Purchase for course or its AccessGroup grants access
    7. Backward-compatible fallback to section access
    """
    if not user or not user.is_authenticated:
        return False

    if user.is_staff or user.is_superuser:
        return True

    profile = getattr(user, "profile", None)
    if profile and profile.is_disabled:
        return False

    if not course:
        return False

    # Free course
    if getattr(course, "is_free", False) or getattr(course, "course_type", "") == "free":
        return True

    # Check direct active enrollment
    if Enrollment.objects.filter(user=user, course=course, status="active").exists():
        return True

    # Check Access Group if course belongs to one
    if course.access_group:
        user_ag = UserAccessGroup.objects.filter(
            user=user,
            access_group=course.access_group,
            is_active=True,
        ).first()
        if user_ag:
            if not user_ag.expires_at or user_ag.expires_at > timezone.now():
                return True

    # Check active Purchase
    purchase = Purchase.objects.filter(
        user=user,
        is_active=True,
    ).filter(
        course=course
    ) | Purchase.objects.filter(
        user=user,
        is_active=True,
        access_group=course.access_group
    ) if course.access_group else Purchase.objects.filter(user=user, course=course, is_active=True)

    if purchase.exists():
        return True

    # Fallback to legacy UserCourseAccess
    if UserCourseAccess.objects.filter(user=user, is_active=True).exists():
        return True

    # Fallback to legacy section access
    section = get_course_section(course)
    if section:
        return has_section_access(user, section)

    return False

