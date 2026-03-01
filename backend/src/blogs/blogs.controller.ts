import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

interface RequestWithUser {
  user: { userId: string };
}

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get('public/feed')
  async getPublicFeed(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.blogsService.getPublicFeed(+page, +limit);
  }

  @Get('public/:slug')
  async getPublicBlogBySlug(@Param('slug') slug: string) {
    return this.blogsService.getPublicBlogBySlug(slug);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createBlogDto: CreateBlogDto, @Req() req: RequestWithUser) {
    return this.blogsService.create(createBlogDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findMyBlogs(@Req() req: RequestWithUser) {
    return this.blogsService.findMyBlogs(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Req() req: RequestWithUser,
  ) {
    return this.blogsService.update(id, updateBlogDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.blogsService.remove(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/like')
  likeBlog(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.blogsService.likeBlog(id, req.user.userId);
  }
}
