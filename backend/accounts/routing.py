from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # This acts like a URL pattern for WebSockets!
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
]