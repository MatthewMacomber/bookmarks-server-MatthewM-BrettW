const uuid = require('uuid/v4');

const bookmarks = [
  {
    id: uuid(),
    title: 'Google',
    url: 'https://www.google.com',
    rating: '5',
    description: 'The best search engine.'
  },
  {
    id: uuid(),
    title: 'Lycos',
    url: 'http://www.lycos.com',
    rating: '5',
    description: 'The bestest searcher ever.'
  }
  {
    id: uuid(),
    title: 'Thinkful',
    url: 'http://www.thinkful.com',
    rating: '5',
    description: 'The greatest place to learn software engineering.'
  },
	{
    id: uuid(),
    title: 'Bing',
    url: 'http://www.bing.com',
    rating: '1',
    description: 'The Microsoft owned search engine.'
  }
];

module.exports = {bookmarks};