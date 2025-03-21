import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ConnectedSocket } from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { Logger } from "@nestjs/common";

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private chatRooms: Map<string, Set<string>> = new Map();
  private logger: Logger = new Logger("ChatGateway");

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log("WebSocket server initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.removeUserFromRooms(client);
  }

  @SubscribeMessage("join-room")
  async handleJoinRoom(@MessageBody() data: { chatId: string }, @ConnectedSocket() client: Socket) {
    const { chatId } = data;

    // Verificăm dacă chat-ul există în baza de date
    const chat = await this.chatService.getChat(chatId);
    if (!chat) {
      this.logger.warn(`Chat ID ${chatId} does not exist.`);
      client.emit("error", { message: "Chat does not exist" });
      return;
    }

    client.join(chatId);
    this.logger.log(`Client ${client.id} joined room ${chatId}`);

    if (!this.chatRooms.has(chatId)) {
      this.chatRooms.set(chatId, new Set());
    }
    this.chatRooms.get(chatId)?.add(client.id);

    this.emitUsersUpdate(chatId);
  }

  @SubscribeMessage("leave-room")
  handleLeaveRoom(@MessageBody() data: { chatId: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.chatId);
    this.chatRooms.get(data.chatId)?.delete(client.id);

    this.emitUsersUpdate(data.chatId);
    client.broadcast.to(data.chatId).emit("user-left", { message: "A user has left the chat" });

    this.logger.log(`Client ${client.id} left room ${data.chatId}`);
  }

  @SubscribeMessage("offer")
  handleOffer(client: Socket, data: { chatId: string; offer: RTCSessionDescription }) {
    client.to(data.chatId).emit("offer", data.offer);
    this.logger.log(`Offer sent in room ${data.chatId}`);
  }

  @SubscribeMessage("answer")
  handleAnswer(client: Socket, data: { chatId: string; answer: RTCSessionDescription }) {
    client.to(data.chatId).emit("answer", data.answer);
    this.logger.log(`Answer sent in room ${data.chatId}`);
  }

  @SubscribeMessage("ice-candidate")
  handleIceCandidate(client: Socket, data: { chatId: string; candidate: RTCIceCandidate }) {
    client.to(data.chatId).emit("ice-candidate", data.candidate);
    this.logger.log(`ICE candidate sent in room ${data.chatId}`);
  }

  @SubscribeMessage("chat-message")
  handleChatMessage(client: Socket, data: { chatId: string; message: string }) {
    if (!data.message.trim()) return;

    const user = client.id.substring(0, 5);
    this.logger.log(`Message from ${user} in room ${data.chatId}: ${data.message}`);

    this.server.to(data.chatId).except(client.id).emit("chat-message", { user, text: data.message });
  }

  private emitUsersUpdate(chatId: string) {
    const users = Array.from(this.chatRooms.get(chatId) || []);
    this.server.to(chatId).emit("users-update", users);
  }

  private removeUserFromRooms(client: Socket) {
    this.chatRooms.forEach((users, chatId) => {
      if (users.has(client.id)) {
        users.delete(client.id);
        this.emitUsersUpdate(chatId);
        this.logger.log(`Removed user ${client.id} from room ${chatId}`);
      }
    });
  }
}
