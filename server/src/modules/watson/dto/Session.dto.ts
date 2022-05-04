import { ApiPropertyOptional } from '@nestjs/swagger';

export class SessionDto {
  @ApiPropertyOptional()
  isFirstCall: boolean;

  @ApiPropertyOptional()
  sessionId?: string;
}
