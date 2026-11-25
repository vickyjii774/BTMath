from django.db.models import Q
from django.utils import timezone

from .models import (
    UserSectionAccess,
    UserAccessGroup,
    Enrollment,
    Purchase,
    UserCourseAccess,
)


VALID_SECTIONS = {"plus2", "bachelor", "master", "ioe"}
SECTION_GROUP_SLUGS = {
    "plus2": ("plus2", "plus_two"),
    "bachelor": ("bachelor",),
    "master": ("master",),
    "ioe": ("ioe",),
}


def get_course_section(course):
    """Return the BTMath section that owns a course, if it is recognised."""
    if not course or not course.program or not course.program.category:
        return None
    section = (course.program.category.level or "").strip().lower()
    return section if section in VALID_SECTIONS else None


def _account_is_eligible(user):
    if not user or not user.is_authenticated or not user.is_active:
        return False
    profile = getattr(user, "profile", None)
    return not (profile and profile.is_disabled)


def has_section_access(user, section):
    """Check an active section entitlement, including legacy section grants."""
    if not _account_is_eligible(user):
        return False
    if user.is_staff or user.is_superuser:
        return True

    section = (section or "").strip().lower()
    if section not in VALID_SECTIONS:
        return False

    now = timezone.now()
    slugs = SECTION_GROUP_SLUGS.get(section, (section,))
    group_grant = UserAccessGroup.objects.filter(
        user=user,
        access_group__slug__in=slugs,
        access_group__is_active=True,
        is_active=True,
    ).filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now)).exists()
    if group_grant:
        return True

    return UserSectionAccess.objects.filter(
        user=user,
        section=section,
        is_active=True,
    ).filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now)).exists()


def has_course_access(user, course):
    """
    Resolve course access from explicit, active entitlements only.

    Legacy UserCourseAccess records are honoured only when they explicitly
    represent the named full-platform package; an arbitrary active legacy row
    must never unlock every paid course.
    """
    if not _account_is_eligible(user) or not course:
        return False

    if user.is_staff or user.is_superuser:
        return True

    if getattr(course, "is_free", False) or getattr(course, "course_type", "") == "free":
        return True

    now = timezone.now()
    if Enrollment.objects.filter(
        user=user,
        course=course,
        status="active",
    ).filter(Q(expiry_date__isnull=True) | Q(expiry_date__gt=now)).exists():
        return True

    if course.access_group_id:
        if UserAccessGroup.objects.filter(
            user=user,
            access_group_id=course.access_group_id,
            access_group__is_active=True,
            is_active=True,
        ).filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now)).exists():
            return True

    purchase_scope = Q(course=course)
    if course.access_group_id:
        purchase_scope |= Q(
            access_group_id=course.access_group_id,
            access_group__is_active=True,
        )
    purchase_query = Purchase.objects.filter(
        user=user,
        is_active=True,
    ).filter(
        Q(expires_at__isnull=True) | Q(expires_at__gt=now)
    ).filter(purchase_scope)
    if purchase_query.exists():
        return True

    # Backward compatibility: only the explicitly named all-platform package
    # grants global access. Other legacy rows are not global entitlements.
    if UserCourseAccess.objects.filter(
        user=user,
        is_active=True,
        package__iexact="BTMath Complete Access",
    ).filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now)).exists():
        return True

    section = get_course_section(course)
    return bool(section and has_section_access(user, section))
