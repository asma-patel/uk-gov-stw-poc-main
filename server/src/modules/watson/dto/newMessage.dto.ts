import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import AssistantV2 from 'ibm-watson/assistant/v2';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ChosenCharacteristics } from 'modules/three-ce/interface/threeCECharacteristics.interface';

export class NewMessageDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  threeCEOption?: ChosenCharacteristics;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty()
  @IsBoolean()
  isFirstCall?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  context: { skills: AssistantV2.MessageContextSkill };
}
