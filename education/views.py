from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Category, Program
from .serializers import ProgramSerializer


class CategoriesAPIView(APIView):

    def get(self, request):
        categories = Category.objects.all().order_by("id")

        data = []

        for category in categories:
            data.append({
                "id": category.id,
                "name": category.name,
                "level": category.level,
                "description": category.description,
            })

        return Response(data)

class BachelorProgramAPIView(APIView):

    def get(self, request):
        programs = (
            Program.objects
            .filter(category__level="bachelor")
            .prefetch_related("semesters__courses")
        )

        serializer = ProgramSerializer(programs, many=True)

        return Response(serializer.data)


class PlusTwoProgramAPIView(APIView):

    def get(self, request):
        programs = (
            Program.objects
            .filter(category__level="plus2")
            .prefetch_related("semesters__courses")
        )

        serializer = ProgramSerializer(programs, many=True)

        return Response(serializer.data)

class MasterProgramAPIView(APIView):

    def get(self, request):
        programs = (
            Program.objects
            .filter(category__level="master")
            .prefetch_related("semesters__courses")
        )

        serializer = ProgramSerializer(programs, many=True)

        return Response(serializer.data)

class IOEProgramAPIView(APIView):

    def get(self, request):
        programs = (
            Program.objects
            .filter(category__level="ioe")
            .prefetch_related(
                "chapters__materials"
            )
        )

        data = []

        for program in programs:
            chapters = []

            for chapter in program.chapters.all():
                materials = []

                for material in chapter.materials.all():
                    materials.append({
                        "id": material.id,
                        "title": material.title,
                        "material_type": material.material_type,
                        "file": material.file.url if material.file else None,
                        "video_url": material.video_url,
                        "description": material.description,
                    })

                chapters.append({
                    "id": chapter.id,
                    "title": chapter.title,
                    "description": chapter.description,
                    "order": chapter.order,
                    "materials": materials,
                })

            data.append({
                "id": program.id,
                "name": program.name,
                "description": program.description,
                "chapters": chapters,
            })

        return Response(data)