from rest_framework import mixins, status, viewsets
from rest_framework.response import Response

from .models import Item
from .serializers import ItemSerializer


class ItemViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    GET    /items/       list
    POST   /items/       create
    GET    /items/{id}/  retrieve
    PATCH  /items/{id}/  partial update
    DELETE /items/{id}/  delete
    """

    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
