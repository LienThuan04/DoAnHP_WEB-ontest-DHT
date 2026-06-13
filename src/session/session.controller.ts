import { Controller } from '@nestjs/common';
import { SessionService } from '@/session/session.service';
import type { ISessionController } from '@/session/interfaces/session.controller.interface';

@Controller('session')
export class SessionController implements ISessionController {
  constructor(private readonly sessionService: SessionService) {}

}
