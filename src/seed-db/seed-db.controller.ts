import { Controller } from '@nestjs/common';
import { SeedDbService } from '@/seed-db/seed-db.service';

@Controller('seed-db')
export class SeedDbController {
  constructor(private readonly seedDbService: SeedDbService) {}
}
