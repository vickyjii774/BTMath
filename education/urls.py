from django.urls import path

from .views import (
    CategoriesAPIView,
    BachelorProgramAPIView,
    PlusTwoProgramAPIView,
    MasterProgramAPIView,
    IOEProgramAPIView,
)

urlpatterns = [
    path(
        "categories/",
        CategoriesAPIView.as_view(),
        name="categories-api",
    ),

    path(
        "bachelor/",
        BachelorProgramAPIView.as_view(),
        name="bachelor-api",
    ),

    path(
        "plus-two/",
        PlusTwoProgramAPIView.as_view(),
        name="plus-two-api",
    ),
    path(
    "master/",
    MasterProgramAPIView.as_view(),
    name="master-api",
    ),

    path(
        "ioe/",
        IOEProgramAPIView.as_view(),
        name="ioe-api",

    )
]
