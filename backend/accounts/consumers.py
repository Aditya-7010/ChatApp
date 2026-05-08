from .models import Message
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 1. Grab the room name from the URL (e.g., 'general')
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # 2. Add this user to the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        # 3. Open the door!
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the user from the room when they close the browser
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # 4. Catch a message sent from React
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender = text_data_json.get('sender', 'Anonymous')

        # NEW: Save the message to the database BEFORE broadcasting it!
        # We use .acreate() because WebSockets run asynchronously
        await Message.objects.acreate(sender=sender, text=message)

        # 5. Broadcast that message to everyone in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender
            }
        )

    # 6. Actually push the broadcasted message down the pipe back to React
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender']
        }))