import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { BullModule } from '@nestjs/bullmq';
import { BlogSummaryProcessor } from './blog-summary.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'blog-summary',
    }),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogSummaryProcessor],
})
export class BlogsModule {}
