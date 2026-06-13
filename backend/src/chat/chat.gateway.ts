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

      // 2. Fetch updated history
      const assessment = await this.assessmentsService.getAssessment(data.assessmentId);
      
      // 3. Generate LLM response (Fallback logic: Ollama -> Gemini)
      // Note: Full streaming requires more complex SSE or chunked WS events. 
      // For this implementation, we await full response.
      const llmResponse = await this.llmService.generateResponse(assessment.chat_history);

      // 4. Save assistant message
      const savedMessage = await this.assessmentsService.addMessage(data.assessmentId, {
        role: 'assistant',
        content: llmResponse,
        timestamp: new Date()
      });

      // 5. Send back to client
      client.emit('receiveMessage', savedMessage);

    } catch (error: any) {
      this.logger.error(`Error in handleMessage: ${error.message}`);
      client.emit('error', { message: 'Failed to process message' });
    }
  }
}
