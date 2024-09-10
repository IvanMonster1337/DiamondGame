import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { IsOdd } from 'src/common/validation/IsOdd';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFieldDto {
  @ApiProperty({ description: 'Client ID' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'Game field dimension', default: 1 })
  @IsInt()
  @Min(1)
  @Max(6)
  dimension: number;

  @ApiProperty({ description: 'Number of diamonds to find', default: 1 })
  @IsInt()
  @Min(1)
  @IsOdd({
    message: 'Diamond count must be odd',
  })
  diamondCount: number;
}
