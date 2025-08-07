import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CollabEditorWebpublishService {
  constructor(private readonly prisma: PrismaService) {}

  // doc생성
  async createDoc(data: { roomId: string; fileName: string; update: Uint8Array }) {
    // 정수로 변경
    const roomId = parseInt(data.roomId);

    const update = Buffer.from(data.update);

    console.log('createDoc');
    return await this.prisma.codeDoc.create({
      data: {
        session: { connect: { id: roomId } },
        fileName: data.fileName,
        binaryDoc: update,
      },
      select: {
        fileName: true,
        sessionId: true,
      },
    });
  }

  // doc 값 가져오기
  async getDoc(data: { roomId: string; fileName: string }) {
    // 정수로 변경
    const roomId = parseInt(data.roomId);
    console.log('getDoc binary값 가져오기');

    return await this.prisma.codeDoc.findFirst({
      where: {
        sessionId: roomId,
        fileName: data.fileName,
      },

      select: {
        binaryDoc: true,
      },
    });
  }

  // doc 값 업데이트
  async updateDoc(data: { roomId: string; fileName: string; mergedUpdate: Uint8Array }) {
    // 정수로 변경
    const roomId = parseInt(data.roomId);
    const update = Buffer.from(data.mergedUpdate);

    console.log('updateDoc');

    return await this.prisma.codeDoc.updateMany({
      where: {
        sessionId: roomId,
        fileName: data.fileName,
      },

      data: {
        binaryDoc: update,
      },
    });
  }
}
