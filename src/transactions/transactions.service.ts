import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { SummaryTransactionsDto } from './dto/summary-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly categoryService: CategoriesService,
  ) {}

  private formatTransaction(transaction: Transaction) {
    return {
      ...transaction,
      amount: Number((transaction.amount / 100).toFixed(2)),
    };
  }

  async create(createTransactionDto: CreateTransactionDto, userId: number) {
    await this.categoryService.findOne(createTransactionDto.categoryId, userId);

    const transaction = this.transactionRepository.create({
      description: createTransactionDto.description,
      amount: Math.round(createTransactionDto.amount * 100),
      type: createTransactionDto.type,
      category: { id: createTransactionDto.categoryId },
      date: createTransactionDto.date,
      user: { id: userId },
    });

    await this.transactionRepository.save(transaction);

    return this.formatTransaction(transaction);
  }

  async findAll(userId: number) {
    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: { category: true },
    });

    return transactions.map((transaction) =>
      this.formatTransaction(transaction),
    );
  }

  async findOne(id: number, userId: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { category: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findOneFormatted(id: number, userId: number) {
    const transaction = await this.findOne(id, userId);

    return this.formatTransaction(transaction);
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    userId: number,
  ) {
    const transaction = await this.findOne(id, userId);

    if (updateTransactionDto.categoryId !== undefined) {
      const category = await this.categoryService.findOne(
        updateTransactionDto.categoryId,
        userId,
      );
      transaction.category = category;
    }
    if (updateTransactionDto.amount !== undefined) {
      transaction.amount = Math.round(updateTransactionDto.amount * 100);
    }
    if (updateTransactionDto.date !== undefined) {
      transaction.date = new Date(updateTransactionDto.date);
    }
    if (updateTransactionDto.description !== undefined) {
      transaction.description = updateTransactionDto.description;
    }
    if (updateTransactionDto.type !== undefined) {
      transaction.type = updateTransactionDto.type;
    }

    await this.transactionRepository.save(transaction);

    return this.formatTransaction(transaction);
  }

  async delete(id: number, userId: number) {
    await this.findOne(id, userId);

    await this.transactionRepository.delete({ id, user: { id: userId } });

    return { message: 'Transaction successfully deleted' };
  }

  async summary(
    userId: number,
    summaryTransactionsDto: SummaryTransactionsDto,
  ) {
    const where: FindOptionsWhere<Transaction> = {
      user: { id: userId },
    };

    if (summaryTransactionsDto.startDate && summaryTransactionsDto.endDate) {
      where.date = Between(
        new Date(summaryTransactionsDto.startDate),
        new Date(summaryTransactionsDto.endDate),
      );
    } else if (summaryTransactionsDto.startDate) {
      where.date = MoreThanOrEqual(new Date(summaryTransactionsDto.startDate));
    } else if (summaryTransactionsDto.endDate) {
      where.date = LessThanOrEqual(new Date(summaryTransactionsDto.endDate));
    }

    const transactions = await this.transactionRepository.find({
      where,
    });
    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.EXPENSE) {
        totalExpense += Number(transaction.amount);
      }
      if (transaction.type === TransactionType.INCOME) {
        totalIncome += Number(transaction.amount);
      }
    }

    const balance = totalIncome - totalExpense;

    return {
      totalIncome: Number((totalIncome / 100).toFixed(2)),
      totalExpense: Number((totalExpense / 100).toFixed(2)),
      balance: Number((balance / 100).toFixed(2)),
    };
  }
}
