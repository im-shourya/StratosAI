import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as string | any;
      if (typeof message === 'object' && message.message) {
        message = message.message;
      }
    } else if (exception.code === 'P2002') {
      // Prisma unique constraint violation
      status = HttpStatus.CONFLICT;
      message = 'Resource already exists.';
      this.logger.warn(`Prisma P2002 Error on ${request.url}`);
    } else if (exception.name === 'MongoNetworkError' || exception.name === 'MongooseServerSelectionError') {
      // Mongoose connectivity issues
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connectivity issue. Please try again later.';
      this.logger.error(`Mongoose connection error: ${exception.message}`);
    } else {
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
