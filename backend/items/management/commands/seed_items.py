from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from items.models import Item
from items.serializers import generate_reference_code

# (name, group) only — prices/timestamps allocated uniquely below
SEED_COMPANIES = [
    ("Allstate", "auto"),
    ("Aviva Direct", "auto"),
    ("belairdirect", "auto"),
    ("Sonnet", "auto"),
    ("Co-operators", "auto"),
    ("The Personal", "auto"),
    ("TD Insurance", "auto"),
    ("CAA Insurance", "auto"),
    ("Wawanesa", "auto"),
    ("Travelers", "auto"),
    ("Gore Mutual", "auto"),
    ("Square One", "auto"),
    ("Intact", "auto"),
    ("Economical", "auto"),
    ("Desjardins", "auto"),
    ("RBC Insurance", "auto"),
    ("Zenith", "auto"),
    ("Pembridge", "auto"),
    ("Surex", "auto"),
    ("Rates.ca", "auto"),
    ("Allstate", "home"),
    ("Aviva Direct", "home"),
    ("belairdirect", "home"),
    ("Sonnet", "home"),
    ("Co-operators", "home"),
    ("The Personal", "home"),
    ("TD Insurance", "home"),
    ("CAA Insurance", "home"),
    ("Wawanesa", "home"),
    ("Travelers", "home"),
    ("Gore Mutual", "home"),
    ("Square One", "home"),
    ("Intact", "home"),
    ("Economical", "home"),
    ("Chubb", "home"),
    ("PURE", "home"),
    ("Manulife", "life"),
    ("Sun Life", "life"),
    ("Canada Life", "life"),
    ("iA Financial Group", "life"),
    ("Empire Life", "life"),
    ("Equitable", "life"),
    ("Co-operators Life", "life"),
    ("Desjardins", "life"),
    ("RBC Insurance", "life"),
    ("Foresters Financial", "life"),
    ("Intact", "commercial"),
    ("Aviva", "commercial"),
    ("Northbridge", "commercial"),
    ("Travelers", "commercial"),
    ("Co-operators", "commercial"),
    ("Gore Mutual", "commercial"),
    ("AIG", "commercial"),
    ("Liberty Mutual", "commercial"),
    ("Chubb", "specialty"),
    ("PURE", "specialty"),
    ("AIG", "specialty"),
    ("Hagerty", "specialty"),
    ("Burns & Wilcox", "specialty"),
    ("Aviva", "specialty"),
    ("Pafco", "nonstandard_auto"),
    ("Jevco", "nonstandard_auto"),
    ("Echelon", "nonstandard_auto"),
    ("Coachman", "nonstandard_auto"),
    ("Hagerty", "collector"),
    ("CAA Insurance", "travel"),
    ("Manulife", "travel"),
    ("APRIL Canada", "travel"),
    ("Manulife", "disability"),
    ("Sun Life", "disability"),
    ("Canada Life", "disability"),
    ("iA Financial Group", "disability"),
    ("Empire Life", "disability"),
    ("Co-operators Life", "disability"),
    ("Facility Association", "residual"),
]


class Command(BaseCommand):
    help = "Seed the items table with demo insurance quote rows."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing items before seeding.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            deleted, _ = Item.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing items."))

        created = 0
        skipped = 0
        base = timezone.now() - timedelta(days=len(SEED_COMPANIES) + 2)

        for index, (name, group) in enumerate(SEED_COMPANIES):
            if Item.objects.filter(name__iexact=name, group=group).exists():
                skipped += 1
                continue

            # Disjoint unique price spaces: annual in 5xxx, monthly in 1xx.xx
            annual = Decimal("5000.00") + Decimal(index) + Decimal("0.01") * (index % 100)
            monthly = Decimal("100.00") + Decimal(index) + Decimal("0.07") * (index % 100)
            if annual == monthly:
                monthly += Decimal("0.11")

            code = generate_reference_code(group)
            while Item.objects.filter(reference_code=code).exists():
                code = generate_reference_code(group)

            created_at = base + timedelta(seconds=index * 2, microseconds=index)
            updated_at = created_at + timedelta(seconds=1, microseconds=index + 3)

            item = Item(
                name=name,
                group=group,
                annual_price=annual,
                monthly_price=monthly,
                reference_code=code,
                created_at=created_at,
                updated_at=updated_at,
            )
            # Bypass save() uniqueness bumping by using _state + update after insert
            item.save()
            Item.objects.filter(pk=item.pk).update(
                created_at=created_at,
                updated_at=updated_at,
            )
            created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete. created={created} skipped={skipped} total={Item.objects.count()}"
            )
        )
