import { IsDateString, IsOptional } from 'class-validator';

export class SummaryTransactionsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
