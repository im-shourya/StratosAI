import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private genAI: GoogleGenerativeAI;
  
  private ollamaBaseUrl: string;
  private ollamaModel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.genAI = new GoogleGenerativeAI(this.configService.get<string>('GEMINI_API_KEY') || '');
    this.ollamaBaseUrl = this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434';
    this.ollamaModel = this.configService.get<string>('OLLAMA_MODEL') || 'llama3.2';
  }

  async generateResponse(messages: any[], isReportGeneration = false): Promise<string> {
    try {
      this.logger.log(`Attempting Ollama (${this.ollamaModel})`);
      return await this.callOllama(messages);
    } catch (error: any) {
      this.logger.warn(`Ollama failed: ${error.message}. Falling back to Gemini.`);
      try {
        return await this.callGemini(messages, isReportGeneration);
      } catch (geminiError: any) {
        this.logger.error(`Gemini also failed: ${geminiError.message}`);
        throw new Error('All LLM tiers failed');
      }
    }
  }

  private async callOllama(messages: any[]): Promise<string> {
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const response = await lastValueFrom(
      this.httpService.post(`${this.ollamaBaseUrl}/api/chat`, {
        model: this.ollamaModel,
        messages: formattedMessages,
        stream: false
      })
    );

    if (!response.data || !response.data.message || !response.data.message.content) {
      throw new Error('Invalid response from Ollama');
    }
    return response.data.message.content;
  }

  private async callGemini(messages: any[], isReportGeneration: boolean): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Gemini handles system instructions differently (often grouped or in a specific format)
    // We will concatenate the context for simplicity
    const prompt = messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
