import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';

interface RequestWithUser extends Request {
  user: { userId: string; email: string };
}

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get('public/feed')
  getPublicFeed(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.blogsService.getPublicFeed(pageNumber, limitNumber);
  }

  @Get('public/:slug')
  getBlogBySlug(@Param('slug') slug: string) {
    return this.blogsService.findOneBySlug(slug);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createBlogDto: CreateBlogDto,
  ) {
    return this.blogsService.create(req.user.userId, createBlogDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findMyBlogs(@Request() req: RequestWithUser) {
    return this.blogsService.findMyBlogs(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogsService.update(req.user.userId, id, updateBlogDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.blogsService.remove(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/like')
  checkLikeStatus(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.blogsService.checkLikeStatus(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/like')
  likeBlog(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.blogsService.likeBlog(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/like')
  unlikeBlog(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.blogsService.unlikeBlog(req.user.userId, id);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.blogsService.getComments(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comments')
  addComment(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.blogsService.addComment(req.user.userId, id, dto.content);
  }
}
