function InstagramPost(urlOrId) {
  if(urlOrId && urlOrId.indexOf("http://") != -1) {
    this.instagramId = this.extractInstagramId(urlOrId);
  } else {
    this.instagramId = urlOrId;
  }
}

InstagramPost.prototype.loadUrl = function(url) {
  this.instagramId = this.extractInstagramId(url);
}

InstagramPost.prototype.extractInstagramId = function(url) {
  var matches = /p\/(\w+)/.exec(url);
  if(matches && matches.length > 1) {
    return matches[1];
  } else {
    return null;
  }
}

InstagramPost.prototype.imageUrl = function(size) {
  size = size || "m";

  if(this.instagramId) {
    return "http://instagr.am/p/" + this.instagramId + "/media/?size=" + size;
  } else {
    return null;
  }
}

InstagramPost.prototype.valid = function(size) {
  return this.instagramId;
}
