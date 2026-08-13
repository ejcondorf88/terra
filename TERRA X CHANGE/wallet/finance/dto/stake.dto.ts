import { IsString, IsNumber, IsPositive, Min } from 'class-validator'

export class StakeDto {
  @IsString()
  userId: string

  @IsString()
  poolId: string

  @IsNumber()
  @Min(1)
  amount: number
}
