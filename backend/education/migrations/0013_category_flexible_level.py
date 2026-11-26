from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("education", "0012_accessgroup_contactmessage_sitestatistic_sociallink_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="category",
            name="level",
            field=models.SlugField(max_length=20, unique=True),
        ),
    ]
