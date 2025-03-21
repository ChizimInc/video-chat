import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createChat(chatId: string) {
    return this.prisma.chat.create({
      data: { id: chatId },
    });
  }

  async getChat(chatId: string) {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
    });
  }
}
