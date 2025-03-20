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

@WebSocketGateway({ cors: { origin: "*" } }) // Permitem conexiuni din orice sursă
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log("WebSocket server initialized");
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("join-room")
  handleJoinRoom(client: Socket, chatId: string) {
    client.join(chatId);
    console.log(`Client ${client.id} joined room ${chatId}`);
  }

  @SubscribeMessage("offer")
  handleOffer(client: Socket, data: { chatId: string; offer: RTCSessionDescription }) {
    client.to(data.chatId).emit("offer", data.offer);
  }

  @SubscribeMessage("answer")
  handleAnswer(client: Socket, data: { chatId: string; answer: RTCSessionDescription }) {
    client.to(data.chatId).emit("answer", data.answer);
  }

  @SubscribeMessage("ice-candidate")
  handleIceCandidate(client: Socket, data: { chatId: string; candidate: RTCIceCandidate }) {
    client.to(data.chatId).emit("ice-candidate", data.candidate);
  }

  // 🔥 Adăugăm funcționalitatea de chat text
  @SubscribeMessage("chat-message")
  handleChatMessage(client: Socket, data: { chatId: string; message: string }) {
    const user = client.id.substring(0, 5); // ID scurt ca nume temporar
    console.log(`Message from ${user} in room ${data.chatId}: ${data.message}`);

    // Trimitem mesajul tuturor utilizatorilor din cameră
    this.server.to(data.chatId).emit("chat-message", { user, text: data.message });
  }
}
