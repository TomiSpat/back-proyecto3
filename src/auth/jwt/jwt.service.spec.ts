// import { Test, TestingModule } from '@nestjs/testing';
// import { JwtService } from './jwt.service';
// import { UnauthorizedException } from '@nestjs/common';
// import * as jwt from 'jsonwebtoken';

// jest.mock('src/config', () => ({
//   __esModule: true,
//   default: () => ({
//     jwt: {
//       algorithm: 'HS256',
//       secretAuth: 'test-auth-secret',
//       secretRefresh: 'test-refresh-secret',
//       accessTokenExpiration: '15m',
//       refreshTokenExpiration: '12h',
//     },
//   }),
// }));

// describe('JwtService', () => {
//   let service: JwtService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [JwtService],
//     }).compile();

//     service = module.get<JwtService>(JwtService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('generateToken', () => {
//     it('should generate an access token', () => {
//       const payload = { email: 'test@test.com' };
//       const token = service.generateToken(payload, 'auth');

//       expect(token).toBeDefined();
//       expect(typeof token).toBe('string');

//       const decoded: any = jwt.verify(token, 'test-auth-secret');
//       expect(decoded.email).toBe(payload.email);
//     });

//     it('should generate a refresh token', () => {
//       const payload = { email: 'test@test.com' };
//       const token = service.generateToken(payload, 'refresh');

//       expect(token).toBeDefined();
//       expect(typeof token).toBe('string');

//       const decoded: any = jwt.verify(token, 'test-refresh-secret');
//       expect(decoded.email).toBe(payload.email);
//     });

//     it('should throw error if secret is not defined', () => {
//       jest.spyOn(require('src/config'), 'default').mockReturnValueOnce({
//         jwt: {
//           algorithm: 'HS256',
//           secretAuth: null,
//           secretRefresh: 'test-refresh-secret',
//         },
//       });

//       const newService = new JwtService();
//       const payload = { email: 'test@test.com' };

//       expect(() => newService.generateToken(payload, 'auth')).toThrow(
//         'JWT secret for auth token is not defined',
//       );
//     });
//   });

//   describe('generateInvitedToken', () => {
//     it('should generate an invited access token', () => {
//       const payload = { eventId: 123 };
//       const token = service.generateInvitedToken(payload, 'auth');

//       expect(token).toBeDefined();
//       expect(typeof token).toBe('string');

//       const decoded: any = jwt.verify(token, 'test-auth-secret');
//       expect(decoded.eventId).toBe(payload.eventId);
//     });

//     it('should generate an invited refresh token', () => {
//       const payload = { eventId: 123 };
//       const token = service.generateInvitedToken(payload, 'refresh');

//       expect(token).toBeDefined();
//       expect(typeof token).toBe('string');

//       const decoded: any = jwt.verify(token, 'test-refresh-secret');
//       expect(decoded.eventId).toBe(payload.eventId);
//     });
//   });

//   describe('getPayload', () => {
//     it('should return payload from valid access token', () => {
//       const payload = { email: 'test@test.com' };
//       const token = service.generateToken(payload, 'auth');

//       const decoded: any = service.getPayload(token, 'auth');

//       expect(decoded.email).toBe(payload.email);
//     });

//     it('should return payload from valid refresh token', () => {
//       const payload = { email: 'test@test.com' };
//       const token = service.generateToken(payload, 'refresh');

//       const decoded: any = service.getPayload(token, 'refresh');

//       expect(decoded.email).toBe(payload.email);
//     });

//     it('should throw UnauthorizedException for invalid token', () => {
//       const invalidToken = 'invalid.token.here';

//       expect(() => service.getPayload(invalidToken, 'auth')).toThrow(UnauthorizedException);
//     });

//     it('should throw UnauthorizedException for expired token', () => {
//       const expiredToken = jwt.sign({ email: 'test@test.com' }, 'test-auth-secret', {
//         expiresIn: '0s',
//       });

//       // Wait a bit to ensure token is expired
//       setTimeout(() => {
//         expect(() => service.getPayload(expiredToken, 'auth')).toThrow(UnauthorizedException);
//       }, 100);
//     });
//   });

//   describe('refreshToken', () => {
//     it('should refresh token and return new access token', () => {
//       const payload = { email: 'test@test.com' };
//       const refreshToken = service.generateToken(payload, 'refresh');

//       const result = service.refreshToken(refreshToken);

//       expect(result).toHaveProperty('accessToken');
//       expect(result.accessToken).toBeDefined();
//     });

//     it('should return new refresh token if current one is about to expire', () => {
//       // Create a token that expires soon (less than 20 minutes remaining)
//       const payload = { email: 'test@test.com' };
//       const refreshToken = jwt.sign(payload, 'test-refresh-secret', {
//         expiresIn: '15m',
//         algorithm: 'HS256',
//       });

//       const result = service.refreshToken(refreshToken);

//       expect(result).toHaveProperty('accessToken');
//       expect(result).toHaveProperty('refreshToken');
//       expect(result).toHaveProperty('expirationTime');
//     });

//     it('should handle invited user tokens', () => {
//       const payload = { eventId: 123 };
//       const refreshToken = service.generateInvitedToken(payload, 'refresh');

//       const result = service.refreshToken(refreshToken);

//       expect(result).toHaveProperty('accessToken');
//       expect(result.accessToken).toBeDefined();
//     });

//     it('should throw UnauthorizedException for invalid refresh token', () => {
//       const invalidToken = 'invalid.refresh.token';

//       expect(() => service.refreshToken(invalidToken)).toThrow(UnauthorizedException);
//     });

//     it('should throw UnauthorizedException for expired refresh token', () => {
//       const expiredToken = jwt.sign({ email: 'test@test.com' }, 'test-refresh-secret', {
//         expiresIn: '0s',
//         algorithm: 'HS256',
//       });

//       expect(() => service.refreshToken(expiredToken)).toThrow(UnauthorizedException);
//     });
//   });
// });
