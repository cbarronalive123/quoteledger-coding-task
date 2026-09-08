from django.contrib import admin

from .models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "group",
        "annual_price",
        "monthly_price",
        "reference_code",
        "created_at",
        "updated_at",
    )
    list_filter = ("group",)
    search_fields = ("name", "reference_code")
    readonly_fields = ("created_at", "updated_at")
