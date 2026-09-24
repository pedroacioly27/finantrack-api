import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import type { AuthRequest } from 'src/types/auth-request.type';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { SummaryTransactionsDto } from './dto/summary-transactions.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: AuthRequest,
  ) {
    return this.transactionService.create(createTransactionDto, req.user.sub);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.transactionService.findAll(req.user.sub);
  }

  @Get('summary')
  summary(
    @Req() req: AuthRequest,
    @Query() summaryTransactionsDto: SummaryTransactionsDto,
  ) {
    return this.transactionService.summary(
      req.user.sub,
      summaryTransactionsDto,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.transactionService.findOneFormatted(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Req() req: AuthRequest,
  ) {
    return this.transactionService.update(
      id,
      updateTransactionDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.transactionService.delete(id, req.user.sub);
  }
}
