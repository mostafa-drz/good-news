import fetch from 'node-fetch'; // for fetching the feed
const FeedParser = require('feedparser');

const getFeed = (url, cb) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const feedparser = new FeedParser();
    feedparser.on('end', function () {
      if (cb) {
        cb(results);
      } else {
        return resolve(results);
      }
    });
    feedparser.on('error', function (error) {
      reject(error);
    });
    feedparser.on('readable', function () {
      // This is where the action is!
      var stream = this; // `this` is `feedparser`, which is a stream
      var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
      var item;

      while ((item = stream.read())) {
        const { title, description, summary, date, link, guid, meta } = item;
        results.push({
          title,
          description,
          summary,
          date,
          link,
          guid,
          meta,
          source_title: meta.title,
          source_description: meta.description,
          source_link: meta.link
        });
      }
    });
    fetch(url).then(
      function (res) {
        if (res.status !== 200) {
          throw new Error('Bad status code');
        } else {
          // The response `body` -- res.body -- is a stream
          res.body.pipe(feedparser);
        }
      },
      function (err) {
        reject(err);
      }
    );
  });
};

export default getFeed;
