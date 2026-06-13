import { CreateSessionDto } from '@/session/dto/create-session.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {}
