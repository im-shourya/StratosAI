import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LlmService } from './llm.service';
import { AssessmentsService } from '../assessments/assessments.service';
import { Logger, Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly llmService: LlmService,
    @Inject(forwardRef(() => AssessmentsService))
    private readonly assessmentsService: AssessmentsService
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { assessmentId: string; message: string }
  ) {
    try {
      // 1. Save user message to assessment history
      await this.assessmentsService.addMessage(data.assessmentId, {
        role: 'user',
        content: data.message,
        timestamp: new Date()
      });

      // 2. Extract and validate fields from the conversation so far
      //    This runs a lightweight LLM call targeting ONLY missing fields.
      const { completionStatus: preResponseStatus } = 
        await this.assessmentsService.extractAndValidateFields(data.assessmentId);

      // 3. Emit extraction update to the client immediately
      //    (so the tracker updates even before the AI responds)
      client.emit('fieldUpdate', preResponseStatus);

      // 4. Update the system prompt with current missing-field awareness
      //    so the LLM targets the right data points in its next response.
      await this.assessmentsService.updateSystemPromptForTurn(data.assessmentId);

      // 5. Fetch updated history and generate LLM response
      const assessment = await this.assessmentsService.getAssessment(data.assessmentId);
      const llmResponse = await this.llmService.generateResponse(assessment.chat_history);

      // 6. Save assistant message
      const savedMessage = await this.assessmentsService.addMessage(data.assessmentId, {
        role: 'assistant',
        content: llmResponse,
        timestamp: new Date()
      });

      // 7. Send the message back with the latest completion status
      client.emit('receiveMessage', {
        ...savedMessage,
        completion_status: preResponseStatus
      });

      // 8. If all fields are now collected, emit a special event
      if (preResponseStatus.isComplete) {
        client.emit('assessmentReady', {
          message: 'All required data has been collected. You can now generate the strategic report.',
          completion_status: preResponseStatus
        });
      }

    } catch (error: any) {
      this.logger.error(`Error in handleMessage: ${error.message}`);
      client.emit('error', { message: 'Failed to process message' });
    }
  }
}
