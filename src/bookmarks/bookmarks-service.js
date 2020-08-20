const BookmarkService = {
  getAllBookmarks(db) {
    return db('bookmarks').select();
  },
  getById(db, id) {
    return db('bookmarks').select().where('id', id).first();
  },
  insertBookmark(db, bookmark) {
    return db.insert(bookmark).into('bookmarks').returning('*').then(rows => rows[0]);
  },
  deleteBookmark(db, id) {
    return db('bookmarks').where({id}).delete();
  },
  updateBookmark(db, id, bookarkFields) {
    return db('bookmarks').where({id}).update(bookarkFields);
  }
};

module.exports = BookmarkService;