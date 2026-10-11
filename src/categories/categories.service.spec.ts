import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

describe('CategoryService', () => {
  let service: CategoriesService;

  let categoryRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    categoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category for the authenticated user', async () => {
    const createCategoryDto = {
      name: 'Food',
    };

    const category = {
      id: 1,
      name: 'Food',
      user: { id: 1 },
    };

    categoryRepository.create.mockReturnValue(category);
    categoryRepository.save.mockResolvedValue(category);

    const result = await service.create(createCategoryDto, 1);

    expect(categoryRepository.create).toHaveBeenCalledWith({
      name: 'Food',
      user: { id: 1 },
    });
    expect(categoryRepository.save).toHaveBeenCalledWith(category);
    expect(result).toEqual(category);
  });
  it('should find all categories for the authenticated user', async () => {
    const categories = [
      {
        id: 1,
        name: 'Food',
        user: { id: 1 },
      },
      {
        id: 2,
        name: 'Transport',
        user: { id: 1 },
      },
    ];

    categoryRepository.find.mockResolvedValue(categories);

    const result = await service.findAll(1);

    expect(categoryRepository.find).toHaveBeenCalledWith({
      where: {
        user: { id: 1 },
      },
      order: { name: 'ASC' },
    });
    expect(result).toEqual(categories);
  });
  it('should find a category for the authenticated user', async () => {
    const category = {
      id: 1,
      name: 'Food',
      user: { id: 1 },
    };

    categoryRepository.findOne.mockResolvedValue(category);

    const result = await service.findOne(1, 1);

    expect(categoryRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1, user: { id: 1 } },
    });
    expect(result).toEqual(category);
  });

  it('should throw when category is not found', async () => {
    categoryRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(1, 1)).rejects.toThrow('Category not found');
  });

  it('should update a category', async () => {
    const category = {
      id: 1,
      name: 'Food',
      user: { id: 1 },
    };

    categoryRepository.findOne.mockResolvedValue(category);
    categoryRepository.save.mockResolvedValue(category);

    const updateCategoryDto = {
      name: 'Salary',
    };

    const result = await service.update(1, updateCategoryDto, 1);

    expect(result.name).toEqual(updateCategoryDto.name);
    expect(categoryRepository.save).toHaveBeenCalledWith(category);
  });

  it('should delete a category', async () => {
    const category = {
      id: 1,
      name: 'Food',
      user: { id: 1 },
    };

    categoryRepository.findOne.mockResolvedValue(category);

    categoryRepository.delete.mockResolvedValue(undefined);

    const result = await service.delete(1, 1);

    expect(result).toEqual({
      message: 'Category successfully deleted',
    });
    expect(categoryRepository.delete).toHaveBeenCalledWith({
      id: 1,
    });
  });

  it('should throw when deleting a category that is not found', async () => {
    categoryRepository.findOne.mockResolvedValue(null);

    await expect(service.delete(1, 1)).rejects.toThrow('Category not found');
    expect(categoryRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw when updating a category that is not found', async () => {
    categoryRepository.findOne.mockResolvedValue(null);

    await expect(service.update(1, { name: 'Food' }, 1)).rejects.toThrow(
      'Category not found',
    );
    expect(categoryRepository.save).not.toHaveBeenCalled();
  });
});
