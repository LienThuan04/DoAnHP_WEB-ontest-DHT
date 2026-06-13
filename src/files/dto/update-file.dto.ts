import { PartialType } from '@nestjs/swagger';
import { CreateFileDto } from '@/files/dto/create-file.dto';

export class UpdateFileDto extends PartialType(CreateFileDto) {}
