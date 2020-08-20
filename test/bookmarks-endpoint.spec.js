const knex = require('knex');
const fixtures = require('./bookmark-fixtures');
const app = require('../src/app');
const store = require('../src/store');
const supertest = require('supertest');

describe('Bookmarks API', () =>{
  let bookmarksCpy, db;

  before('Make a knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('Disconnect from db', () => db.destroy());
  before('Cleanup', () => db('bookmarks').truncate());
  afterEach('Cleanup', () => db('bookmarks').truncate());

  beforeEach('Copy the bookmarks', () ={
    bookmarksCpy = store.bookmarks.slice();
  });

  describe('Unauthorized requests', () => {
    it('Responds with a 401 Unauthorized for a GET /bookmarks', () => {
      return supertest(app)
        .get('/bookmakrs')
        .expect(401, {error: 'Unauthorized request'});
    });
    it('Responds with a 401 Unauthorized for a POST /bookarks', () => {
      return supertest(app)
        .post('/bookmarks')
        .send({title: 'example-title', url: 'http://www.example.com', rating: 2})
        .expect(401, {error: 'Unauthorized request'});
    });
    it('Responds with a 401 Unauthorized for a GET /bookmarks/:id', () => {
      const scndBookmark = store.bookmarks[1];
      return supertest(app)
        .get(`/bookmarks/${scndBookmark.id}`)
        .expect(401, {error: 'Unauthorized request'});
    });
  });

  describe('GET /bookmarks', () => {
    context('Given no bookmarks in database', () => {
      it('Responds with a 200 and a empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.emitWarning.API_TOKEN}`)
          .expect(200, []);
      });
    });
    context('Given bookmarks in the database', () => {
      const testBookmarks = fixtures.makeBookmarksArray();
      beforeEach('Insert the bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);
      });
      it('Gets the bookmarks from the store', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expext(200, testBookmarks);
      });
    });
  });

  describe('GET /bookmarks/:id', () => {
    context('Given no bookmarks in database', () => {
      it('Responds with a 404 the bookmark does not exist', () => {
        return supertest(app)
          .get('/boomakrs/42')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {error: {message: 'Bookmark not found'}});
      });
    })
    context('Given bookmarks in the database', () => {
      const testBookmarks = fixtures.makeBookmarksArray();
      beforeEach('Insert the bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);
      });
      it('Responds with a 200 and the specific bookmark', () => {
        const bookmarkID = 2;
        const expectBookmark = testBookmarks[bookmarkID - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkID}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectBookmark);
      });
    });
  });

  describe('DELETE /bookmarks/:id', () => {
    it('Removes the bookmark with given ID from the store', () => {
      const secondBookmark = store.bookmarks[1]
      const expectBookmarks = store.bookmarks.filter(s => s.id !== secondBookmark.id)
      return supertest(app)
        .delete(`/bookmarks/${secondBookmark.id}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(204)
        .then(() => {
          expect(store.bookmarks).to.eql(expectBookmarks)
        })
    })
    it('Returns 404 the bookmark does not exist', () => {
      return supertest(app)
        .delete('/bookmarks/doesnt-exist')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(404, 'Bookmark Not Found')
    })
  })

  describe('POST /bookmarks', () => {
    it(`Responds with a 400 missing 'title' if not given`, () => {
      const newBookmarkMissingTitle = {
        url: 'https://test.com',
        rating: 1
      }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmarkMissingTitle)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, `'title' is required`)
    })
    it(`Responds with a 400 missing 'url' if not given`, () => {
      const newBookmarkMissingUrl = {
        title: 'test-title',
        rating: 1
      }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmarkMissingUrl)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, `'url' is required`)
    })
    it(`Responds with a 400 missing 'rating' if not given`, () => {
      const newBookmarkMissingRating = {
        title: 'test-title',
        url: 'https://test.com'
      }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmarkMissingRating)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, `'rating' is required`)
    })
    it(`Responds with a 400 invalid 'rating' if not between 0 and 5`, () => {
      const newBookmarkInvalidRating = {
        title: 'test-title',
        url: 'https://test.com',
        rating: 'invalid'
      }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmarkInvalidRating)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, `'rating' must be a number between 0 and 5`)
    })
    it(`Responds with a 400 invalid 'url' if not a valid URL`, () => {
      const newBookmarkInvalidUrl = {
        title: 'test-title',
        url: 'htp://invalid-url',
        rating: 1
      }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmarkInvalidUrl)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, `'url' must be a valid URL`)
    })
    it('Adds new bookmark to the store', () => {
      const newBookmark = {
        title: 'test-title',
        url: 'https://test.com',
        description: 'test description',
        rating: 1
      }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body.rating).to.eql(newBookmark.rating)
          expect(res.body.id).to.be.a('string')
        })
        .then(res => {
          expect(store.bookmarks[store.bookmarks.length - 1]).to.eql(res.body)
        })
    })
  })
});