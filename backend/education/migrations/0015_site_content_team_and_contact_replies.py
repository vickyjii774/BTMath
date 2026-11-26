from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def create_main_site_content(apps, schema_editor):
    SiteContent = apps.get_model("education", "SiteContent")
    SiteContent.objects.get_or_create(
        key="main",
        defaults={
            "about_title": "About BTMath",
            "about_intro": "BTMath is an online mathematics learning platform for students preparing for +2, Bachelor, Master and IOE entrance examinations.",
            "about_story": "We make mathematics easier to understand through structured lessons, clear explanations and focused practice.",
            "mission": "To make quality mathematics education accessible and understandable for every learner.",
            "vision": "To become a trusted learning companion for mathematics students across Nepal.",
            "values": "Clarity, consistency, accessibility and student success.",
            "contact_email": "support@btmath.com",
            "address": "Kathmandu, Nepal",
            "contact_description": "Have a question about courses or learning materials? Our team is here to help.",
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ("education", "0014_migrate_legacy_semesters_to_periods"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(model_name="contactmessage", name="reply_message", field=models.TextField(blank=True)),
        migrations.AddField(model_name="contactmessage", name="replied_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="contactmessage", name="replied_by", field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="contact_replies", to=settings.AUTH_USER_MODEL)),
        migrations.CreateModel(name="SiteContent", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("key", models.SlugField(default="main", max_length=40, unique=True)),
            ("about_title", models.CharField(default="About BTMath", max_length=200)),
            ("about_intro", models.TextField(blank=True)), ("about_story", models.TextField(blank=True)),
            ("mission", models.TextField(blank=True)), ("vision", models.TextField(blank=True)),
            ("values", models.TextField(blank=True)), ("contact_email", models.EmailField(blank=True, max_length=254)),
            ("contact_phone", models.CharField(blank=True, max_length=50)), ("whatsapp_number", models.CharField(blank=True, max_length=50)),
            ("address", models.CharField(blank=True, max_length=255)), ("support_hours", models.CharField(blank=True, max_length=255)),
            ("contact_description", models.TextField(blank=True)), ("updated_at", models.DateTimeField(auto_now=True)),
        ]),
        migrations.CreateModel(name="TeamMember", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("name", models.CharField(max_length=150)), ("role", models.CharField(max_length=150)),
            ("bio", models.TextField(blank=True)), ("image_url", models.URLField(blank=True)),
            ("email", models.EmailField(blank=True, max_length=254)), ("linkedin_url", models.URLField(blank=True)),
            ("order", models.PositiveIntegerField(default=1)), ("is_active", models.BooleanField(default=True)),
        ], options={"ordering": ["order", "id"]}),
        migrations.RunPython(create_main_site_content, migrations.RunPython.noop),
    ]
