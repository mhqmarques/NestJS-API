import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Bookmark, User } from '@prisma/client';
import * as pactum from 'pactum';
import { AppModule } from 'src/app.module';
import { AuthDto } from 'src/auth/dto';
import { CreateBookmarkDto } from 'src/bookmark/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from 'src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'email@email.com',
      password: '123',
    };
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    const defaultUser: Partial<User> = {
      email: 'email@email.com',
    };
    const editUserDto: EditUserDto = {
      firstName: 'Marlon',
      email: 'email2@email.co',
    };
    describe('user/me', () => {
      it('should get a user object and status code 200', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectBodyContains(defaultUser.email);
      });
      it('should throw unauthorized error if access_toker was not prived', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });
    });

    describe('edit user', () => {
      it('should get edited user and status code 200', () => {
        return pactum
          .spec()
          .patch('/users')
          .withBody(editUserDto)
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectBodyContains(editUserDto.firstName)
          .expectBodyContains(editUserDto.email);
      });
      it('should throw unauthorized error if access_toker was not prived', () => {
        return pactum.spec().patch('/users').expectStatus(401);
      });
    });
  });

  describe('Bookmarks', () => {
    const defaultCreateBookmarkDto: CreateBookmarkDto = {
      title: 'Some title',
      link: 'https://www.somelink.com',
    };
    const defaultEditBookmarkDto: CreateBookmarkDto = {
      title: 'Some other title',
      link: 'https://www.someotherlink.com',
    };
    describe('createBookmark', () => {
      it('should create a bookmark for a given user and get status code 201', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBearerToken('$S{userAt}')
          .withBody(defaultCreateBookmarkDto)
          .stores('bookmarkId', 'id')
          .expectStatus(201)
          .expectBodyContains(defaultCreateBookmarkDto.title)
          .expectBodyContains(defaultCreateBookmarkDto.link);
      });
      it('should throw if access token was not provided', () => {
        return pactum.spec().post('/bookmarks').expectStatus(401);
      });
    });
    describe('getBookmarks', () => {
      it('should get a bookmark list for a given user and status code 200', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectJsonLength(1);
      });
      it('should throw if access token was not provided', () => {
        return pactum.spec().get('/bookmarks').expectStatus(401);
      });
    });
    describe('getBookmarkById', () => {
      it('should get a bookmark for a given bookmarkId and userId and get status code 200', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withBearerToken('$S{userAt}')
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(200)
          .expectBodyContains(defaultCreateBookmarkDto.title)
          .expectBodyContains(defaultCreateBookmarkDto.link);
      });
      it('should throw if access token was not provided', () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .expectStatus(401);
      });
    });
    describe('editBookmarkById', () => {
      it('should edit bookmark for a given bookmarkId and userId and get status code 200', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withBearerToken('$S{userAt}')
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(200)
          .withBody(defaultEditBookmarkDto)
          .expectBodyContains(defaultEditBookmarkDto.title)
          .expectBodyContains(defaultEditBookmarkDto.link);
      });
      it('should throw if access token was not provided', () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .expectStatus(401);
      });
    });

    describe('deleteBookmarkById', () => {
      it('should delete a bookmark for a given bookmarkId and userId and get status code 200', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withBearerToken('$S{userAt}')
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(204);
      });
    });
  });
});
