import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../users/auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>; //Partial let us use only some methods of UsersService
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'test@test.com',
          password: 'test',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'test' } as User]);
      },
      remove: (id: number) => {
        return Promise.resolve({
          id,
          email: 'test@test.com',
          password: 'test',
        } as User);
      },
      update: (id: number, attrs: Partial<User>) => {
        return Promise.resolve({
          id,
          email: '',
        } as User);
      },
    };
    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: 1,
          email,
          password,
        } as User);
      },
      // signup: () => {},
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a list of users by email', async () => {
    const users = await controller.findAllUsers('test@test.com');
    expect(users.length).toBe(1);
    expect(users[0].email).toBe('test@test.com');
  });

  it('should find a user by id', async () => {
    const user = await controller.findUser('1');
    expect(user.id).toBe(1);
    expect(user.email).toBe('test@test.com');
  });

  it('should thorw an error if user not found by id', async (done) => {
    fakeUsersService.findOne = () => null;
    try {
      await controller.findUser('2');
    } catch (err) {
      done();
      expect(err.status).toBe(404);
      expect(err.message).toBe('user not found');
    }
  });

  it('should return a user and set the session whith the id', async () => {
    const session = { userId: null };
    const user = await controller.signin(
      { email: 'test@test.com', password: 'test' },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
