import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 1. The user connects using their exact username
        self.username = self.scope['url_route']['kwargs']['room_name']
        
        # 2. Create a personal mailbox group just for this user
        self.personal_group = f"user_{self.username}"
        
        # 3. Join the personal mailbox AND the general room simultaneously
        await self.channel_layer.group_add(self.personal_group, self.channel_name)
        await self.channel_layer.group_add("general_room", self.channel_name)
        
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.personal_group, self.channel_name)
        await self.channel_layer.group_discard("general_room", self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender = text_data_json['sender']
        
        # React will now tell us exactly which room this belongs to
        room_name = text_data_json.get('room_name', 'general')

        # Save to database
        await self.save_message(sender, message, room_name)

        # Route the message like a Post Office
        if room_name == 'general':
            await self.channel_layer.group_send(
                "general_room",
                { 'type': 'chat_message', 'message': message, 'sender': sender, 'room_name': room_name }
            )
        else:
            # Private chat! The room name looks like "adarsh0303_testuser2"
            # Split it apart, and send the message to BOTH users' personal mailboxes!
            users = room_name.split('_')
            for user in users:
                await self.channel_layer.group_send(
                    f"user_{user}",
                    { 'type': 'chat_message', 'message': message, 'sender': sender, 'room_name': room_name }
                )

    async def chat_message(self, event):
        # Send the routed message down to the React app
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'room_name': event['room_name']
        }))

    @database_sync_to_async
    def save_message(self, sender, text, room_name):
        Message.objects.create(sender=sender, text=text, room_name=room_name)