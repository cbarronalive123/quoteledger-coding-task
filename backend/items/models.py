from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q
from django.utils import timezone


class Item(models.Model):
    class Group(models.TextChoices):
        AUTO = "auto", "Auto"
        HOME = "home", "Home"
        LIFE = "life", "Life"
        COMMERCIAL = "commercial", "Commercial"
        SPECIALTY = "specialty", "Specialty / HNW"
        NONSTANDARD_AUTO = "nonstandard_auto", "Non-standard Auto"
        COLLECTOR = "collector", "Collector"
        TRAVEL = "travel", "Travel"
        DISABILITY = "disability", "Disability"
        RESIDUAL = "residual", "Residual Market"

    name = models.CharField(max_length=255)
    group = models.CharField(max_length=32, choices=Group.choices)
    annual_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    monthly_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    reference_code = models.CharField(
        max_length=100, null=True, blank=True, unique=True
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        db_table = "items"
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "group"],
                name="items_name_group_uniq",
            ),
            models.UniqueConstraint(
                fields=["annual_price"],
                name="items_annual_price_uniq",
            ),
            models.UniqueConstraint(
                fields=["monthly_price"],
                name="items_monthly_price_uniq",
            ),
            models.UniqueConstraint(
                fields=["created_at"],
                name="items_created_at_uniq",
            ),
            models.UniqueConstraint(
                fields=["updated_at"],
                name="items_updated_at_uniq",
            ),
            models.CheckConstraint(
                condition=Q(annual_price__isnull=True) | Q(annual_price__gte=0),
                name="items_annual_price_nonneg",
            ),
            models.CheckConstraint(
                condition=Q(monthly_price__isnull=True) | Q(monthly_price__gte=0),
                name="items_monthly_price_nonneg",
            ),
            models.CheckConstraint(
                condition=Q(annual_price__isnull=True)
                | Q(monthly_price__isnull=True)
                | ~Q(annual_price=F("monthly_price")),
                name="items_annual_ne_monthly",
            ),
            models.CheckConstraint(
                condition=~Q(created_at=F("updated_at")),
                name="items_created_ne_updated",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.group})"

    def save(self, *args, **kwargs):
        now = timezone.now()
        if self._state.adding:
            if not self.created_at:
                self.created_at = now
            self.created_at = self._next_unique_created_at(self.created_at)

        preferred_updated = now
        if self._state.adding:
            preferred_updated = self.created_at + timedelta(microseconds=1)
        self.updated_at = self._next_unique_updated_at(preferred_updated)

        if self.annual_price is not None and self.monthly_price is not None:
            if self.annual_price == self.monthly_price:
                raise ValidationError("annual_price and monthly_price must differ.")

        super().save(*args, **kwargs)

    def _next_unique_created_at(self, preferred):
        candidate = preferred
        qs = Item.objects.all()
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        while qs.filter(created_at=candidate).exists() or qs.filter(updated_at=candidate).exists():
            candidate += timedelta(microseconds=1)
        return candidate

    def _next_unique_updated_at(self, preferred):
        candidate = preferred
        qs = Item.objects.all()
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        while (
            qs.filter(updated_at=candidate).exists()
            or qs.filter(created_at=candidate).exists()
            or candidate == self.created_at
        ):
            candidate += timedelta(microseconds=1)
        return candidate
