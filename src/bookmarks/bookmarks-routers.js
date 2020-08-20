const express = require('express');
const {isWebUrl} = require('valid-url');
const uuid = require('uuid/v4');
const logger = require('../logger');
const store = require('../store');
const BookmarkService = require('./bookmarks-service');

const bookmarksRouter = express.Router();
const parseBody = express.json();

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: bookmark.title,
  url: bookmark.url,
  rating: Number(bookmark.rating),
  description: bookmark.description
});

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    BookmarkService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })
  .post(parseBody, (req, res) => {
    for (const field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send(`'${field}' is required`);
      }
    }
    const {title, url, rating, description} = req.body;
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating '${rating}' given`);
      return res.status(400).send(`'rating' has to be a number between 1 and 5`);
    }
    if (!isWebUrl(url)) {
      logger.error(`Invalid url '${url}' given`);
      return res.status(400).send(`'url' has to be a valid url`);
    }
    const bookmark = {id: uuid(), title, url, rating, description};
    store.bookmarks.push(bookmark);
    logger.info(`Bookmark with the id ${bookmark.id} was created`);
    res.status(201).location(`http://localhost:8000/bookmarks/${bookmark.id}`);
  });

bookmarksRouter
  .route('/bookmarks/:bookmarkid')
  .get((req, res, next) => {
    const {bookmarkid} = req.params;
    BookmarkService.getById(req.app.get('db'), bookmarkid)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with the id ${bookmarkid} was not found`);
          return res.status(404).json({error: {message: 'Bookmark Not Found'}});
        }
      })
      .catch(next);
  })
  .delete((req, res) => {
    const {bookmarkid} = req.params;
    const bookmarkIndex = store.bookmarks.findIndex(bookmark => bookmark.id == bookmarkid);
    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with the id ${bookmarkid} was not found`);
      return res.status(404).send('Bookmark Not Found');
    }
    store.bookmarks.splice(bookmarkIndex, 1);
    logger.info(`Bookmark with the id ${bookmarkid} was deleted`);
    res.status(204).end();
  });

module.exports = bookmarksRouter;