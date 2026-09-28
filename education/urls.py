from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    ProgramViewSet,
    CourseViewSet,
    SemesterViewSet,
    ChapterViewSet,
    MaterialViewSet,
)


router = DefaultRouter()

router.register(
    "categories",
    CategoryViewSet,
    basename="category"
)

router.register(
    "programs",
    ProgramViewSet,
    basename="program"
)

router.register(
    "courses",
    CourseViewSet,
    basename="course"
)

router.register(
    "semesters",
    SemesterViewSet,
    basename="semester"
)

router.register(
    "chapters",
    ChapterViewSet,
    basename="chapter"
)

router.register(
    "materials",
    MaterialViewSet,
    basename="material"
)


urlpatterns = router.urls