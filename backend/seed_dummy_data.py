import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core.management import call_command

if __name__ == "__main__":
    print("Executing BTMath comprehensive database seed...")
    call_command("seed_dummy_data")
