import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: number) {
    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      user: { id: userId },
    });

    return this.categoryRepository.save(category);
  }

  async findAll(userId: number) {
    return this.categoryRepository.find({
      where: { user: { id: userId } },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, userId: number) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        user: { id: userId },
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    userId: number,
  ) {
    const category = await this.findOne(id, userId);

    category.name = updateCategoryDto.name;

    return this.categoryRepository.save(category);
  }

  async delete(id: number, userId: number) {
    await this.findOne(id, userId);

    await this.categoryRepository.delete({ id });

    return { message: 'Category deleted' };
  }
}
