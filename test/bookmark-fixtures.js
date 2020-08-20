function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'Google',
      url: 'https://www.google.com',
      rating: 5,
      description: 'The best search engine.'
    },
    {
      id: 2,
      title: 'Lycos',
      url: 'http://www.lycos.com',
      rating: '5',
      description: 'The bestest searcher ever.'
    },
    {
      id: 3,
      title: 'Thinkful',
      url: 'http://www.thinkful.com',
      rating: '5',
      description: 'The greatest place to learn software engineering.'
    },
    {
      id: 4,
      title: 'Bing',
      url: 'http://www.bing.com',
      rating: '1',
      description: 'The Microsoft owned search engine.'
    }
  ];
}

module.exports = {
  makeBookmarksArray
};