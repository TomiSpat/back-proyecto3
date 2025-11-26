import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const adminKeyHeader = req.header('x-admin-key');
    const validApiKey = this.configService.get<string>('API_KEY');

    if (!adminKeyHeader || adminKeyHeader !== validApiKey) {
      throw new ForbiddenException('Invalid or missing admin API key');
    }

    next();
  }
}
