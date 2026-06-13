import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'default',     ttl: 60,   limit: 100  },
        { name: 'short-term',  ttl: 10,   limit: 20   },
        { name: 'medium-term', ttl: 300,  limit: 500  },
        { name: 'long-term',   ttl: 3600, limit: 1000 },
      ],
      errorMessage(context, throttlerLimitDetail) {
        return `You have made ${throttlerLimitDetail.totalHits} requests. Rate limit exceeded, Try again in ${throttlerLimitDetail.ttl} seconds. `;
      },
    }),
  ],
  exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}
