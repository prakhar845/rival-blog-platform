import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Prisma } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BlogsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('blog-summary') private summaryQueue: Queue,
  ) {}

  async getPublicFeed(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
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
      this.prisma.blog.count({
        where: { isPublished: true },
      }),
    ]);

    return {
      data: blogs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug, isPublished: true },
      include: {
        user: { select: { email: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!blog) throw new NotFoundException('Blog not found.');
    return blog;
  }

  async create(userId: string, dto: CreateBlogDto) {
    const slug =
      dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const blog = await this.prisma.blog.create({
      data: { ...dto, slug, userId },
    });

    await this.summaryQueue.add('generate-summary', {
      blogId: blog.id,
      content: blog.content,
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

  async update(userId: string, blogId: string, dto: UpdateBlogDto) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found.');
    if (blog.userId !== userId)
      throw new ForbiddenException('Not authorized to edit this post.');

    return this.prisma.blog.update({
      where: { id: blogId },
      data: dto,
    });
  }

  async remove(userId: string, blogId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found.');
    if (blog.userId !== userId)
      throw new ForbiddenException('Not authorized to delete this post.');

    return this.prisma.blog.delete({ where: { id: blogId } });
  }

  async likeBlog(userId: string, blogId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found.');

    try {
      await this.prisma.like.create({
        data: { userId, blogId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('You already liked this post.');
      }
      throw error;
    }

    const likeCount = await this.prisma.like.count({ where: { blogId } });
    return { likeCount };
  }

  async unlikeBlog(userId: string, blogId: string) {
    try {
      await this.prisma.like.delete({
        where: { userId_blogId: { userId, blogId } },
      });
    } catch {
      throw new BadRequestException('You have not liked this post.');
    }

    const likeCount = await this.prisma.like.count({ where: { blogId } });
    return { likeCount };
  }

  async checkLikeStatus(userId: string, blogId: string) {
    const like = await this.prisma.like.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });
    return { isLiked: !!like };
  }

  async addComment(userId: string, blogId: string, content: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found.');

    return this.prisma.comment.create({
      data: { content, userId, blogId },
      include: { user: { select: { email: true } } },
    });
  }

  async getComments(blogId: string) {
    return this.prisma.comment.findMany({
      where: { blogId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
    });
  }
}
