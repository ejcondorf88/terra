import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('should validate a token and return the payload', async () => {
    const payload = { sub: 'user-1', email: 'user@example.com', role: 'user' };
    const jwtService = {
      verify: jest.fn().mockReturnValue(payload),
    } as unknown as JwtService;

    const strategy = new JwtStrategy(jwtService);

    await expect(strategy.validate('token')).resolves.toEqual(payload);
    expect(jwtService.verify).toHaveBeenCalledWith('token');
  });
});
