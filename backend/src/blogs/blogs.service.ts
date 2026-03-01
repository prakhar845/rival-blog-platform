import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BlogsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('blog-queue') private blogQueue: Queue,
  ) {}

  async getPublicFeed(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.blog.findMany({
        where: { isPublished: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.blog.count({ where: { isPublished: true } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPublicBlogBySlug(slugOrId: string) {
    const blog = await this.prisma.blog.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
        isPublished: true,
      },
      include: {
        user: { select: { email: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog post not found or not published.');
    }

    return blog;
  }

  async create(createBlogDto: CreateBlogDto, userId: string) {
    const baseSlug = createBlogDto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    const blog = await this.prisma.blog.create({
      data: {
        ...createBlogDto,
        slug: uniqueSlug,
        userId,
      },
    });
    return blog;
  }

  async findMyBlogs(userId: string) {
    return this.prisma.blog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, userId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found.');
    if (blog.userId !== userId)
      throw new UnauthorizedException('You can only edit your own posts.');

    return this.prisma.blog.update({
      where: { id },
      data: updateBlogDto,
    });
  }

  async remove(id: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found.');
    if (blog.userId !== userId)
      throw new UnauthorizedException('You can only delete your own posts.');

    return this.prisma.blog.delete({
      where: { id },
    });
  }

  async likeBlog(id: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found.');

    const existingLike = await this.prisma.like.findFirst({
      where: { blogId: id, userId },
    });

    if (existingLike) {
      await this.prisma.like.delete({ where: { id: existingLike.id } });
      return { message: 'Unliked successfully' };
    } else {
      await this.prisma.like.create({ data: { blogId: id, userId } });
      return { message: 'Liked successfully' };
    }
  }
}
