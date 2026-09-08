import secrets
import string
from datetime import timedelta
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers

from .models import Item


def generate_reference_code(group: str) -> str:
    """Create a unique quote/policy reference, e.g. Q-AUTO-A1B2C3D4."""
    prefix = "".join(ch for ch in group.upper() if ch.isalnum())[:8] or "ITEM"
    alphabet = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(8))
    return f"Q-{prefix}-{suffix}"


def allocate_unique_created_at() -> timezone.datetime:
    candidate = timezone.now()
    while Item.objects.filter(created_at=candidate).exists():
        candidate += timedelta(microseconds=1)
    return candidate


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = [
            "id",
            "name",
            "group",
            "annual_price",
            "monthly_price",
            "reference_code",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "reference_code", "created_at", "updated_at"]

    def validate_name(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name cannot be blank.")
        return value

    def validate(self, attrs):
        name = attrs.get("name")
        group = attrs.get("group")
        annual = attrs.get("annual_price", serializers.empty)
        monthly = attrs.get("monthly_price", serializers.empty)

        if self.instance is not None:
            name = name if name is not None else self.instance.name
            group = group if group is not None else self.instance.group
            if annual is serializers.empty:
                annual = self.instance.annual_price
            if monthly is serializers.empty:
                monthly = self.instance.monthly_price
        else:
            annual = None if annual is serializers.empty else annual
            monthly = None if monthly is serializers.empty else monthly

        errors = {}

        if name and group:
            qs = Item.objects.filter(name__iexact=name, group=group)
            if self.instance is not None:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                errors["name"] = (
                    f"An item named '{name}' already exists in the '{group}' group."
                )

        if annual is not None and monthly is not None and annual == monthly:
            errors["monthly_price"] = (
                "Monthly price must be different from annual price."
            )

        if annual is not None:
            qs = Item.objects.filter(annual_price=annual)
            if self.instance is not None:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                errors["annual_price"] = (
                    "This annual price is already used by another item."
                )
            # Disallow using a value that already appears as any monthly price
            mq = Item.objects.filter(monthly_price=annual)
            if self.instance is not None:
                mq = mq.exclude(pk=self.instance.pk)
            if mq.exists():
                errors["annual_price"] = (
                    "This annual price matches an existing monthly price; "
                    "prices must all be distinct across both columns."
                )

        if monthly is not None:
            qs = Item.objects.filter(monthly_price=monthly)
            if self.instance is not None:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                errors["monthly_price"] = (
                    "This monthly price is already used by another item."
                )
            aq = Item.objects.filter(annual_price=monthly)
            if self.instance is not None:
                aq = aq.exclude(pk=self.instance.pk)
            if aq.exists():
                errors["monthly_price"] = (
                    "This monthly price matches an existing annual price; "
                    "prices must all be distinct across both columns."
                )

        if errors:
            raise serializers.ValidationError(errors)
        return attrs

    def create(self, validated_data):
        group = validated_data["group"]
        validated_data["created_at"] = allocate_unique_created_at()
        for _ in range(8):
            validated_data["reference_code"] = generate_reference_code(group)
            try:
                with transaction.atomic():
                    return super().create(validated_data)
            except IntegrityError:
                validated_data["created_at"] = allocate_unique_created_at()
                continue
        raise serializers.ValidationError(
            {"reference_code": "Could not allocate a unique reference code."}
        )
