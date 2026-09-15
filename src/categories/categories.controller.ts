import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import type { AuthRequest } from 'src/types/auth-request.type';
import { UpdateCategoryDto } from './dto/update-category.dto';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: AuthRequest,
  ) {
    return this.categoryService.create(createCategoryDto, req.user.sub);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.categoryService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.categoryService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: AuthRequest,
  ) {
    return this.categoryService.update(id, updateCategoryDto, req.user.sub);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.categoryService.delete(id, req.user.sub);
  }
}
