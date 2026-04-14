import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🚀 ¡La API (Login Gen) está 100% online y funcionando!';
  }
}
