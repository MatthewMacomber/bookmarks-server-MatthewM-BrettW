const knex = require('knex');
const fixtures = require('./bookmark-fixtures');
const app = require('../src/app');
const store = require('../src/store');

describe('Bookmarks API', () =>{
  let bookmarksCpy, db;

  before()
});