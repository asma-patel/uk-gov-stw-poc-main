import { ApiPropertyOptional } from '@nestjs/swagger';
import AssistantV2 from 'ibm-watson/assistant/v2';

export class MessageDto {
  /** The type of the message:
   *
   *  - `text`: The user input is processed normally by the assistant.
   *  - `search`: Only search results are returned. (Any dialog or actions skill is bypassed.)
   *
   *  **Note:** A `search` message results in an error if no search skill is configured for the assistant.
   */
  @ApiPropertyOptional()
  message_type?: string;
  /** The text of the user input. This string cannot contain carriage return, newline, or tab characters. */
  @ApiPropertyOptional()
  text?: string;
  /** Intents to use when evaluating the user input. Include intents from the previous response to continue using
   *  those intents rather than trying to recognize intents in the new input.
   */
  @ApiPropertyOptional()
  intents?: AssistantV2.RuntimeIntent[];
  /** Entities to use when evaluating the message. Include entities from the previous response to continue using
   *  those entities rather than detecting entities in the new input.
   */
  @ApiPropertyOptional()
  entities?: AssistantV2.RuntimeEntity[];
  /** For internal use only. */
  @ApiPropertyOptional()
  suggestion_id?: string;
  /** Optional properties that control how the assistant responds. */
  @ApiPropertyOptional()
  options?: AssistantV2.MessageInputOptions;

  @ApiPropertyOptional()
  isFirstCall: boolean;

  @ApiPropertyOptional()
  session_id: string;
}
