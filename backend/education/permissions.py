from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Staff and superuser accounts can access operational admin APIs.
    """
    message = "You do not have permission to access the admin area."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


class IsSuperAdminUser(BasePermission):
    """
    Only Django superusers can manage BTMath's academic structure and content.
    """
    message = "Superadmin permission is required to manage academic content."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.is_superuser
        )
