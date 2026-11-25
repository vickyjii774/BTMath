from django.db import migrations


def migrate_legacy_semesters(apps, schema_editor):
    Category = apps.get_model("education", "Category")
    Semester = apps.get_model("education", "Semester")
    AcademicPeriod = apps.get_model("education", "AcademicPeriod")
    Course = apps.get_model("education", "Course")
    database = schema_editor.connection.alias

    default_sections = [
        ("school", "School Level", "School-level mathematics programs."),
        ("plus2", "+2", "+2 mathematics programs."),
        ("bachelor", "Bachelor", "Bachelor mathematics programs."),
        ("master", "Master", "Master mathematics programs."),
        ("ioe", "IOE", "IOE entrance mathematics preparation."),
    ]
    for level, name, description in default_sections:
        Category.objects.using(database).get_or_create(
            level=level,
            defaults={"name": name, "description": description},
        )

    legacy_semesters = (
        Semester.objects.using(database)
        .filter(program__isnull=False)
        .order_by("program_id", "order", "id")
    )

    for semester in legacy_semesters.iterator():
        period = (
            AcademicPeriod.objects.using(database)
            .filter(
                program_id=semester.program_id,
                parent__isnull=True,
                name__iexact=semester.name,
            )
            .order_by("id")
            .first()
        )

        if period is None:
            period = AcademicPeriod.objects.using(database).create(
                program_id=semester.program_id,
                parent_id=None,
                name=semester.name,
                period_type="semester",
                order=semester.order,
                description="Migrated from the previous semester structure.",
                is_active=True,
            )

        # Keep the original Semester foreign key for backwards compatibility.
        # Only fill the new flexible period field when it is currently empty.
        Course.objects.using(database).filter(
            semester_id=semester.id,
            academic_period__isnull=True,
        ).update(academic_period_id=period.id)


class Migration(migrations.Migration):
    dependencies = [
        ("education", "0013_category_flexible_level"),
    ]

    operations = [
        migrations.RunPython(
            migrate_legacy_semesters,
            migrations.RunPython.noop,
        ),
    ]
