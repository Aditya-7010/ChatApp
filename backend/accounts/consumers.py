import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.username = self.scope['url_route']['kwargs']['room_name']
        self.personal_group = f"user_{self.username}"
        
        await self.channel_layer.group_add(self.personal_group, self.channel_name)
        await self.channel_layer.group_add("general_room", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.personal_group, self.channel_name)
        await self.channel_layer.group_discard("general_room", self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action', 'chat_message')
        room_name = text_data_json.get('room_name', 'general')

        # === NEW: HANDLE READ RECEIPTS ===
        if action == 'mark_read':
            msg_id = text_data_json.get('message_id')
            await self.set_message_read(msg_id)
            
            # Broadcast the blue checkmark trigger to the room
            event_data = {
                'type': 'read_receipt',
                'message_id': msg_id,
                'room_name': room_name
            }
            if room_name == 'general':
                await self.channel_layer.group_send("general_room", event_data)
            else:
                for user in room_name.split('_'):
                    await self.channel_layer.group_send(f"user_{user}", event_data)
            return

        # === NORMAL CHAT MESSAGES ===
        message = text_data_json['message']
        sender = text_data_json['sender']
        
        saved_msg = await self.save_message(sender, message, room_name)
        timestamp_str = saved_msg.timestamp.isoformat()

        event_data = {
            'type': 'chat_message',
            'id': saved_msg.id,          # 👈 Include ID for receipts
            'message': message, 
            'sender': sender, 
            'room_name': room_name,
            'is_read': False,            # 👈 Brand new messages are unread
            'timestamp': timestamp_str 
        }

        if room_name == 'general':
            await self.channel_layer.group_send("general_room", event_data)
        else:
            for user in room_name.split('_'):
                await self.channel_layer.group_send(f"user_{user}", event_data)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'id': event['id'],
            'message': event['message'],
            'sender': event['sender'],
            'room_name': event['room_name'],
            'is_read': event['is_read'],
            'timestamp': event.get('timestamp')
        }))

    # NEW: Send the receipt trigger down to React
    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'room_name': event['room_name']
        }))

    @database_sync_to_async
    def save_message(self, sender, text, room_name):
        return Message.objects.create(sender=sender, text=text, room_name=room_name)

    @database_sync_to_async
    def set_message_read(self, msg_id):
        try:
            msg = Message.objects.get(id=msg_id)
            msg.is_read = True
            msg.save()
        except Message.DoesNotExist:
            pass