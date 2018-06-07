var base64 = require('node-base64-image');

base64.encode('http://k.yimg.jp/images/video-topics/rec/1605/31_03.jpg', {string: true}, function(err, result) {
  console.log(result);
})