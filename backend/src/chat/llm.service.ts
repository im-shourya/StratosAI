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
    const systemMsg = messages.find(m => m.role === 'system')?.content;
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError: any;
    const maxRetries = 3;
    let baseDelay = 1000;

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const model = this.genAI.getGenerativeModel({ 
            model: modelName,
            ...(systemMsg && { systemInstruction: systemMsg })
          });

          if (isReportGeneration) {
            const prompt = messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');
            const result = await model.generateContent(prompt);
            return result.response.text();
          }

          // Filter out system message for history
          const chatMsgs = messages.filter(m => m.role !== 'system');
          if (chatMsgs.length === 0) return "";

          const lastMessage = chatMsgs[chatMsgs.length - 1];
          const historyMsgs = chatMsgs.slice(0, -1);

          let history = historyMsgs.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          }));

          // Gemini strictly requires the history to start with a 'user' role
          if (history.length > 0 && history[0].role === 'model') {
            history.unshift({ role: 'user', parts: [{ text: 'Start conversation' }] });
          }

          // Ensure strict alternation between 'user' and 'model'
          const validHistory: any[] = [];
          for (const msg of history) {
            if (validHistory.length === 0 || validHistory[validHistory.length - 1].role !== msg.role) {
              validHistory.push(msg);
            } else {
              // Append text to the previous message if roles are identical
              validHistory[validHistory.length - 1].parts[0].text += '\n\n' + msg.parts[0].text;
            }
          }
          history = validHistory;

          const chat = model.startChat({ history });
          const result = await chat.sendMessage(lastMessage.content);
          return result.response.text();

        } catch (err: any) {
          const errorMessage = err.message || '';
          const isTransientError = 
            errorMessage.includes('503') || 
            errorMessage.includes('504') || 
            errorMessage.includes('429');

          if (!isTransientError) {
            this.logger.warn(`Gemini model ${modelName} failed permanently: ${errorMessage}. Trying next model if available.`);
            lastError = err;
            break; // Break the retry loop and try the next model
          }

          if (attempt === maxRetries - 1) {
            this.logger.warn(`Gemini model ${modelName} ran out of retries on transient errors. Trying next model if available.`);
            lastError = err;
            break; // Try next model
          }

          const delay = (Math.pow(2, attempt) * baseDelay) + Math.floor(Math.random() * 1000);
          this.logger.warn(`Gemini 503/429 caught on ${modelName}. Retrying attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError || new Error('All Gemini models failed');
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
