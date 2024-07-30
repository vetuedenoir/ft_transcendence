# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from asgiref.sync import sync_to_async
# from django.utils import timezone
# from .models import Username
# import asyncio

# class MyConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         if self.scope["user"].is_authenticated:
#             self.user = self.scope["user"]
#             self.username_instance = await self.get_username_instance()
#             self.room_group_name = f'user_{self.username_instance.username}_group'
#             self.heartbeat_task = None

#             # Mark user as connected
#             await self.mark_user_connected(self.username_instance.username)

#             # Join room group
#             await self.channel_layer.group_add(
#                 self.room_group_name,
#                 self.channel_name
#             )

#             await self.accept()

#             # Start heartbeat
#             self.heartbeat_task = asyncio.create_task(self.heartbeat())

#             # Notify that the user has connected
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'user_connected',
#                     'message': f'User {self.username_instance.username} connected'
#                 }
#             )
#         else:
#             await self.close()

#     async def disconnect(self, close_code):
#        if self.scope["user"].is_authenticated:
#             # Cancel heartbeat task
#             if self.heartbeat_task:
#                 self.heartbeat_task.cancel()

#             # Mark user as disconnected
#             await self.mark_user_disconnected(self.username_instance.username)

#             # Notify that the user has disconnected
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'user_disconnected',
#                     'message': f'User {self.username_instance.username} disconnected'
#                 }
#             )

#             # Leave room group
#             await self.channel_layer.group_discard(
#                 self.room_group_name,
#                 self.channel_name
#             )

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']

#         if message == 'heartbeat':
#             # Update last seen time
#             await self.update_last_seen(self.username_instance.username)
#         else:
#             # Echo message back to WebSocket
#             await self.send(text_data=json.dumps({
#                 'message': message
#             }))

#     async def heartbeat(self):
#         while True:
#             await asyncio.sleep(30)  # Send heartbeat every 30 seconds
#             try:
#                 await self.send(text_data=json.dumps({'message': 'heartbeat'}))
#             except Exception:
#                 # Connection is closed, exit heartbeat loop
#                 break


#     async def user_connected(self, event):
#         message = event['message']

#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'message': message
#         }))

#     async def user_disconnected(self, event):
#         message = event['message']

#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'message': message
#         }))

#     async def mark_user_connected(self, username):
#         username_instance = await self.get_username_instance_by_username(username)
#         if username_instance:
#             username_instance.status_online = True
#             username_instance.last_seen = timezone.now()
#             await sync_to_async(username_instance.save)()

#     async def mark_user_disconnected(self, username):
#         username_instance = await self.get_username_instance_by_username(username)
#         if username_instance:
#             username_instance.status_online = False
#             username_instance.last_seen = timezone.now()
#             await sync_to_async(username_instance.save)()

#     async def update_last_seen(self, username):
#         username_instance = await self.get_username_instance_by_username(username)
#         if username_instance:
#             username_instance.last_seen = timezone.now()
#             await sync_to_async(username_instance.save)()

#     @database_sync_to_async
#     def get_username_instance(self):
#         return Username.objects.get(user=self.scope["user"])

#     @database_sync_to_async
#     def get_username_instance_by_username(self, username):
#         return Username.objects.get(username=username)

