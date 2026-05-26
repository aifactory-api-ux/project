import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as request from 'supertest';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('../shared/config/env', () => ({
  validateEnv: jest.fn(),
}));

import { AppModule } from './app.module';
import { validateEnv } from '../shared/config/env';
import { bootstrap } from './main';

describe('Main Bootstrap', () => {
  let mockApp: any;
  let mockListen: jest.Mock;
  let mockUse: jest.Mock;
  let mockEnable: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockListen = jest.fn().mockResolvedValue(undefined);
    mockUse = jest.fn().mockReturnThis();
    mockEnable = jest.fn().mockReturnThis();

    mockApp = {
      listen: mockListen,
      use: mockUse,
      enableCors: mockEnable,
      get: jest.fn().mockReturnValue({ status: jest.fn().mockReturnValue({ json: jest.fn() }) }),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
  });

  describe('bootstrap', () => {
    it('should create app and listen on configured port', async () => {
      process.env.PORT = '3000';

      await bootstrap();

      expect(NestFactory.create).toHaveBeenCalledWith(
        AppModule,
        expect.objectContaining({
          logger: ['error', 'warn', 'log', 'debug'],
        }),
      );
      expect(mockApp.enableCors).toHaveBeenCalled();
      expect(mockListen).toHaveBeenCalledWith('3000');
    });

    it('should use default port when PORT env is not set', async () => {
      delete process.env.PORT;

      await bootstrap();

      expect(mockListen).toHaveBeenCalledWith(23002);
    });

    it('should apply global ValidationPipe with correct options', async () => {
      await bootstrap();

      expect(mockApp.use).toHaveBeenCalledWith(
        'global piping',
        expect.objectContaining({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
    });

    it('should call validateEnv before creating app', async () => {
      await bootstrap();

      expect(validateEnv).toHaveBeenCalled();
    });

    it('should exit process when validateEnv throws', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      (validateEnv as jest.Mock).mockImplementation(() => {
        throw new Error('Environment validation failed');
      });

      await bootstrap();

      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Environment validation failed'),
      );

      consoleSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should enable CORS', async () => {
      await bootstrap();

      expect(mockApp.enableCors).toHaveBeenCalled();
    });
  });
});
