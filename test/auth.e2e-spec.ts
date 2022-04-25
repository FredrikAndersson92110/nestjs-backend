import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication service', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/signup (POST) handles a signup request', () => {
    const email = 'gloalpipe@mail.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '123456' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toBe(email);
      });
  });

  it('create a new user and send back the currently connected user', async () => {
    const email = 'whoami@mail.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '123456' })
      .expect(201);
    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toBe(email);
    expect(body.id).toBeDefined();
  });

  it('/auth/signin (POST) handles a signin request', async () => {
    const email = 'signin@mail.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '123456' })
      .expect(201);
    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password: '123456' })
      .set('Cookie', cookie)
      .expect(201);

    expect(body.email).toBe(email);
    expect(body.id).toBeDefined();
  });
});
