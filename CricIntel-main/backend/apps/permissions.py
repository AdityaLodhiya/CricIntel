from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrReadOnly(BasePermission):
    """
    Public reads are allowed, but writes to reference data require staff access.
    """

    message = 'Only administrators can modify this resource.'

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsAuthenticatedCreateOrAdminWrite(BasePermission):
    """
    Authenticated users may create request-style resources; destructive or
    arbitrary updates still require staff access.
    """

    message = 'Authentication is required, and only administrators can modify existing records.'

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS or request.method == 'POST':
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
