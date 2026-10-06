from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Only Django staff/superuser accounts can access admin APIs.
    """

    message = "You do not have permission to access the admin area."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.is_superuser
            )
        )