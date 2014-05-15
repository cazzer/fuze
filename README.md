fuze
====

**In one sentence:** Consolidated music API search, queue, and playback.

**Dont believe me?** Check out the live demo [here](http://fuze.dayoftheduck.com). *Currently, mobile support is limited.*

### What it does

Fuze supports two music APIs:
+ Youtube
+ Soundcloud

In its alpha state the only supported call is a basic search, however pagination is simulated through infinite scroll. So I got that going for me, which is nice.

### How it does it

After a search is submitted queries are generated from the client to all supported APIs. As the request are returned each piece of content is translated into a common structure:
```json
{
  "service": "soundcloud",
  "id": "123456",
  "title": "Cool Song",
  "image": "awesomeImage.png",
  "description": "Something really descriptive.",
  "likes": "0", // :(
  "dislikes": "100000", // :((
  "plays": "1234567",
  "comments": "1234",
  "ratio": "0"
}

```
Wait, ratio? What's that? Simple: it is the number quotient of the number of plays over likes. I calculate this number so that content with fewer likes and high ratio doesn't get starved by content with a lot of likes but low ratio, I also sort each query result by this number, though I may change this since it is confusing to new users.

### Technologies used
+ [Ractive](http://www.ractivejs.org/) - an awesome microframework Javascript by [Rich Harris](https://github.com/Rich-Harris)
+ [Bootstrap](http://getbootstrap.com/) - although not currently used very heavily...I should probably just remove it actually
+ [Soundcloud](http://developers.soundcloud.com/) - HTML5 widget and Javascript API, go Soundcloud!
+ [Youtube](https://developers.google.com/youtube/) - just the HTML5 widget, all the URLs are *kind of* hard-coded since their Javascript API sucks so hard
