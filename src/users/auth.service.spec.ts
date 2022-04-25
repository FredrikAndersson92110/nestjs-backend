import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of AuthService', async () => {
    expect(service).toBeDefined();
  });

  it('can create a user with a salted and hashed password', async () => {
    const user = await service.signup('test@test.com', 'test');
    expect(user.email).toBe('test@test.com');
    expect(user.password).not.toEqual('test');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('thows error if user already exists', async (done) => {
    await service.signup('test@test.com', 'test');
    try {
      await service.signup('test@test.com', 'test');
    } catch (err) {
      expect(err.message).toBe('email in use');
      done();
    }
  });

  it('throws error with signin and no email found', async (done) => {
    try {
      await service.signin('test@test.com', 'test');
    } catch (err) {
      expect(err.message).toBe('user not found');
      done();
    }
  });

  it('throws error with signin and bad password', async (done) => {
    await service.signup('test@test.com', 'good');
    try {
      await service.signin('test@test.com', 'bad');
    } catch (err) {
      done();
    }
  });

  it('return a user if correct password is provided', async () => {
    await service.signup('test@test.com', 'hashedpassword');
    const user = await service.signin('test@test.com', 'hashedpassword');
    expect(user).toBeDefined();
  });
});
