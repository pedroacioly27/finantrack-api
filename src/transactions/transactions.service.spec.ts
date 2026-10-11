import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TransactionsService } from './transactions.service';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { NotFoundException } from '@nestjs/common';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };
  let categoryService: {
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,

        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },

        {
          provide: CategoriesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    categoryService = module.get(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should convert amount to cents when creating a transaction', async () => {
    const createTransactionDto = {
      description: 'Test transaction',
      amount: 10.5,
      type: TransactionType.INCOME,
      date: '2026-09-26',
      categoryId: 1,
    };
    categoryService.findOne.mockResolvedValue({
      id: 1,
      name: 'Salary',
    });

    const transaction = {
      id: 1,
      description: createTransactionDto.description,
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      date: createTransactionDto.date,
      category: { id: createTransactionDto.categoryId },
      user: { id: 1 },
    };

    transactionRepository.create.mockReturnValue(transaction);
    transactionRepository.save.mockResolvedValue(transaction);

    await service.create(createTransactionDto, 1);

    expect(transactionRepository.create).toHaveBeenCalledWith({
      description: 'Test transaction',
      amount: 1050,
      type: TransactionType.INCOME,
      category: { id: 1 },
      date: '2026-09-26',
      user: { id: 1 },
    });
  });
  it('should not create a transaction when the category does not exist', async () => {
    const createTransactionDto = {
      description: 'Teste transaction',
      amount: 10.5,
      type: TransactionType.INCOME,
      date: '2026-09-26',
      categoryId: 999,
    };

    categoryService.findOne.mockRejectedValue(
      new NotFoundException('Category not found'),
    );

    await expect(service.create(createTransactionDto, 1)).rejects.toThrow(
      'Category not found',
    );
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('should update the transaction category', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2500,
      type: TransactionType.EXPENSE,
      date: '2026-09-30',
      category: { id: 1, name: 'food' },
      user: { id: 1 },
    };

    const newCategory = {
      id: 2,
      name: 'Transport',
    };

    transactionRepository.findOne.mockResolvedValue(transaction);

    categoryService.findOne.mockResolvedValue(newCategory);

    transactionRepository.save.mockResolvedValue(transaction);

    const updateTransactionDto = {
      categoryId: 2,
    };

    await service.update(1, updateTransactionDto, 1);

    expect(transaction.category).toEqual(newCategory);
  });
  it('should update the transaction without changing the category', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2500,
      type: TransactionType.EXPENSE,
      date: '2026-09-30',
      category: { id: 1, name: 'Food' },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);

    transactionRepository.save.mockResolvedValue(transaction);

    const updateTransactionDto = {
      description: 'Lunch update',
    };

    await service.update(1, updateTransactionDto, 1);

    expect(categoryService.findOne).not.toHaveBeenCalled();
    expect(transaction.description).toBe('Lunch update');
  });
  it('should convert amount to cents when updating a transaction', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2500,
      type: TransactionType.EXPENSE,
      date: '2026-09-30',
      category: { id: 1, name: 'food' },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);
    transactionRepository.save.mockResolvedValue(transaction);

    const updateTransactionDto = {
      amount: 25.5,
    };

    await service.update(1, updateTransactionDto, 1);

    expect(transaction.amount).toBe(2550);
  });
  it('should update the transaction type', async () => {
    const transaction = {
      id: 1,
      description: 'Salary',
      amount: 500000,
      type: TransactionType.EXPENSE,
      date: '2026-09-30',
      category: { id: 1, name: 'salary ' },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);
    transactionRepository.save.mockResolvedValue(transaction);

    const updateTransactionDto = {
      type: TransactionType.INCOME,
    };

    await service.update(1, updateTransactionDto, 1);

    expect(transaction.type).toBe(updateTransactionDto.type);
  });

  it('should find transactions for the authenticated user', async () => {
    const transactions = [
      {
        id: 1,
        description: 'Lunch',
        amount: 2500,
        type: TransactionType.EXPENSE,
        date: '2026-09-30',
        category: { id: 1, name: 'food' },
        user: { id: 1 },
      },
    ];

    transactionRepository.find.mockResolvedValue(transactions);

    await service.findAll(1);

    expect(transactionRepository.find).toHaveBeenCalledWith({
      where: { user: { id: 1 } },
      relations: { category: true },
    });
  });

  it('should return transactions with amounts in reais', async () => {
    const transactions = [
      {
        id: 1,
        description: 'Lunch',
        amount: 2550,
        type: TransactionType.EXPENSE,
        date: '2026-09-30',
        category: { id: 1, name: 'food' },
        user: { id: 1 },
      },
    ];

    transactionRepository.find.mockResolvedValue(transactions);

    const result = await service.findAll(1);

    expect(result[0].amount).toBe(25.5);
  });

  it('should find a transaction by id for the authenticated user', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2550,
      type: TransactionType.EXPENSE,
      date: '2026-10-01',
      category: { id: 1, name: 'Food' },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);

    const result = await service.findOne(1, 1);

    expect(result).toEqual(transaction);
  });

  it('should throw an error when the transaction does not exist', async () => {
    transactionRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999, 1)).rejects.toThrow(
      'Transaction not found',
    );
  });

  it('should find the transaction only for the authenticated user', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2550,
      type: TransactionType.EXPENSE,
      date: '2026-10-01',
      category: { id: 1, name: 'Food' },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);

    await service.findOne(1, 1);

    expect(transactionRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        user: { id: 1 },
      },
      relations: { category: true },
    });
  });

  it('should delete a transaction', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2550,
      type: TransactionType.EXPENSE,
      date: '2026-10-04',
      category: { id: 1, name: 'Food' },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);

    transactionRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.delete(1, 1);

    expect(transactionRepository.delete).toHaveBeenCalledWith({
      id: 1,
    });
    expect(result).toEqual({ message: 'Transaction successfully deleted' });
  });
  it('should not delete a transaction when it does not exist', async () => {
    transactionRepository.findOne.mockResolvedValue(null);

    await expect(service.delete(999, 1)).rejects.toThrow(
      'Transaction not found',
    );

    expect(transactionRepository.delete).not.toHaveBeenCalled();
  });

  it('should calculate the transaction summary', async () => {
    const transactions = [
      {
        id: 1,
        description: 'Salary',
        amount: 500000,
        type: TransactionType.INCOME,
        date: '2026-10-05',
        category: { id: 1, name: 'Salary' },
        user: { id: 1 },
      },
      {
        id: 2,
        description: 'Lunch',
        amount: 2500,
        type: TransactionType.EXPENSE,
        date: '2026-10-05',
        category: { id: 2, name: 'Food' },
        user: { id: 1 },
      },
      {
        id: 3,
        description: 'Transport',
        amount: 1000,
        type: TransactionType.EXPENSE,
        date: '2026-10-05',
        category: { id: 3, name: 'Transport' },
        user: { id: 1 },
      },
    ];

    transactionRepository.find.mockResolvedValue(transactions);

    const result = await service.summary(1, {});

    expect(result).toEqual({
      totalIncome: 5000,
      totalExpense: 35,
      balance: 4965,
    });
  });

  it('should filter the summary by start and end dates', async () => {
    transactionRepository.find.mockResolvedValue([]);

    await service.summary(1, {
      startDate: '2026-09-05',
      endDate: '2026-10-05',
    });

    expect(transactionRepository.find).toHaveBeenCalledWith({
      where: {
        user: { id: 1 },
        date: Between(new Date('2026-09-05'), new Date('2026-10-05')),
      },
    });
  });

  it('should filter the summary from the start date', async () => {
    transactionRepository.find.mockResolvedValue([]);

    await service.summary(1, {
      startDate: '2026-09-05',
    });

    expect(transactionRepository.find).toHaveBeenCalledWith({
      where: {
        user: { id: 1 },
        date: MoreThanOrEqual(new Date('2026-09-05')),
      },
    });
  });

  it('should filter the summary until the end date', async () => {
    transactionRepository.find.mockResolvedValue([]);

    await service.summary(1, {
      endDate: '2026-09-05',
    });

    expect(transactionRepository.find).toHaveBeenCalledWith({
      where: {
        user: { id: 1 },
        date: LessThanOrEqual(new Date('2026-09-05')),
      },
    });
  });

  it('should calculate the summary only for the authenticated user', async () => {
    transactionRepository.find.mockResolvedValue([]);

    await service.summary(5, {});

    expect(transactionRepository.find).toHaveBeenCalledWith({
      where: { user: { id: 5 } },
    });
  });
  it('should separate income and expense transactions in the summary', async () => {
    const transactions = [
      {
        id: 1,
        description: 'Salary',
        amount: 300000,
        type: TransactionType.INCOME,
        date: '2026-09-30',
        category: { id: 1, name: 'Salary' },
        user: { id: 1 },
      },
      {
        id: 2,
        description: 'Freelance',
        amount: 50000,
        type: TransactionType.INCOME,
        date: '2026-09-30',
        category: { id: 2, name: 'Freelance' },
        user: { id: 1 },
      },
      {
        id: 3,
        description: 'Rent',
        amount: 100000,
        type: TransactionType.EXPENSE,
        date: '2026-09-30',
        category: { id: 3, name: 'Housing' },
        user: { id: 1 },
      },
      {
        id: 4,
        description: 'Food',
        amount: 25000,
        type: TransactionType.EXPENSE,
        date: '2026-09-30',
        category: { id: 4, name: 'Food' },
        user: { id: 1 },
      },
    ];

    transactionRepository.find.mockResolvedValue(transactions);

    const result = await service.summary(1, {});

    expect(result).toEqual({
      totalIncome: 3500,
      totalExpense: 1250,
      balance: 2250,
    });
  });

  it('should return zero income when there are no income transactions', async () => {
    const transactions = [
      {
        id: 1,
        description: 'Lunch',
        amount: 2550,
        type: TransactionType.EXPENSE,
        date: '2026-10-07',
        category: { id: 1, name: 'Food' },
        user: { id: 1 },
      },
    ];

    transactionRepository.find.mockResolvedValue(transactions);

    const result = await service.summary(1, {});

    expect(result).toEqual({
      totalIncome: 0,
      totalExpense: 25.5,
      balance: -25.5,
    });
  });
  it('should return zero expense when there are no expense transactions', async () => {
    const transactions = [
      {
        id: 1,
        description: 'Salary',
        amount: 500000,
        type: TransactionType.INCOME,
        date: '2026-10-06',
        category: { id: 1, name: 'Salary' },
        user: { id: 1 },
      },
    ];

    transactionRepository.find.mockResolvedValue(transactions);

    const result = await service.summary(1, {});

    expect(result).toEqual({
      totalIncome: 5000,
      totalExpense: 0,
      balance: 5000,
    });
  });
  it('should return zero values when there are no transactions', async () => {
    transactionRepository.find.mockResolvedValue([]);

    const result = await service.summary(1, {});

    expect(result).toEqual({
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    });
  });

  it('should not update the transaction when the category does not exist', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2550,
      type: TransactionType.EXPENSE,
      date: '2026-10-06',
      category: {
        id: 1,
        name: 'Food',
      },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);

    categoryService.findOne.mockRejectedValue(
      new NotFoundException('Category not found'),
    );

    const updateTransactionDto = {
      categoryId: 999,
    };

    await expect(service.update(1, updateTransactionDto, 1)).rejects.toThrow(
      'Category not found',
    );

    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it('should save the transaction after a valid update', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2550,
      type: TransactionType.EXPENSE,
      date: '2026-10-06',
      category: { id: 1, name: 'Food' },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);
    transactionRepository.save.mockResolvedValue(transaction);

    const updateTransactionDto = {
      description: 'Updated Lunch',
    };

    await service.update(1, updateTransactionDto, 1);

    expect(transaction.description).toBe('Updated Lunch');

    expect(transactionRepository.save).toHaveBeenCalledWith(transaction);
  });

  it('should save the transaction with the updated category', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2550,
      type: TransactionType.EXPENSE,
      date: '2026-10-06',
      category: { id: 2, name: 'Salary' },
      user: { id: 1 },
    };

    const newCategory = {
      id: 1,
      name: 'Food',
    };

    transactionRepository.findOne.mockResolvedValue(transaction);
    categoryService.findOne.mockResolvedValue(newCategory);
    transactionRepository.save(transaction);

    const updateTransactionDto = {
      categoryId: 1,
    };

    await service.update(1, updateTransactionDto, 1);

    expect(transaction.category).toEqual(newCategory);
    expect(transactionRepository.save).toHaveBeenCalledWith(transaction);
  });

  it('should save the transaction with the updated amount in cents', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 5000,
      type: TransactionType.EXPENSE,
      date: '2026-10-06',
      category: { id: 1, name: 'Food' },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);
    transactionRepository.save.mockResolvedValue(transaction);

    const updateTransactionDto = {
      amount: 49.99,
    };

    await service.update(1, updateTransactionDto, 1);

    expect(transaction.amount).toBe(4999);
    expect(transactionRepository.save).toHaveBeenCalledWith(transaction);
  });

  it('should save the transaction with the updated type', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2550,
      type: TransactionType.INCOME,
      date: '2026-10-06',
      category: { id: 1, name: 'Food' },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);
    transactionRepository.save.mockResolvedValue(transaction);

    const updateTransactionDto = {
      type: TransactionType.EXPENSE,
    };

    await service.update(1, updateTransactionDto, 1);

    expect(transaction.type).toBe(TransactionType.EXPENSE);
    expect(transactionRepository.save).toHaveBeenCalledWith(transaction);
  });

  it('should save the transaction with the updated date', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2550,
      type: TransactionType.EXPENSE,
      date: '2026-10-05',
      category: { id: 1, name: 'Food' },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);
    transactionRepository.save.mockResolvedValue(transaction);
    const updateTransactionDto = {
      date: '2026-10-06',
    };

    await service.update(1, updateTransactionDto, 1);

    expect(transaction.date).toEqual(new Date('2026-10-06'));
    expect(transactionRepository.save).toHaveBeenCalledWith(transaction);
  });

  it('should return an empty array when there are no transactions', async () => {
    transactionRepository.find.mockResolvedValue([]);

    const result = await service.findAll(1);

    expect(result).toEqual([]);
    expect(transactionRepository.find).toHaveBeenCalledWith({
      where: {
        user: { id: 1 },
      },
      relations: { category: true },
    });
  });

  it('should return a formatted transaction with the amount in reais', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2550,
      type: TransactionType.EXPENSE,
      date: '2026-10-07',
      category: {
        id: 1,
        name: 'Food',
      },
      user: { id: 1 },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);

    const result = await service.findOneFormatted(1, 1);

    expect(result.amount).toBe(25.5);
    expect(result).toEqual({
      ...transaction,
      amount: 25.5,
    });
  });
  it('should return a success message after deleting a transaction', async () => {
    const transaction = {
      id: 1,
      description: 'Lunch',
      amount: 2550,
      type: TransactionType.EXPENSE,
      date: '2026-10-07',
      category: {
        id: 1,
        name: 'Food',
      },
      user: {
        id: 1,
      },
    };

    transactionRepository.findOne.mockResolvedValue(transaction);

    transactionRepository.delete.mockResolvedValue(undefined);

    const result = await service.delete(1, 1);

    expect(result).toEqual({
      message: 'Transaction successfully deleted',
    });
  });
});
