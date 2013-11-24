function SoundStripe(instagram, songUrl) {
  this.instagram = instagram;
  this.songUrl = songUrl;
  this.url = null;
}

SoundStripe.prototype.attributes = function() {
  return {songUrl: this.songUrl, imageUrl: this.instagram.imageUrl()};
}

SoundStripe.prototype.valid = function() {
  return this.songUrl && this.instagram.valid();
}

SoundStripe.prototype.generateUrl = function(e) {
  if(this.valid()) {
    var url = window.location.origin +
              "/?songUrl=" +
              this.songUrl +
              "&instagramId=" +
              this.instagram.instagramId;

    if(window.location.origin.indexOf("localhost") != -1) {
      this.url = url;
      $(window).trigger("soundStripe:urlChanged");
    } else {
      shortenUrl(url, function(sUrl) {
        this.url = sUrl;
        $(window).trigger("soundStripe:urlChanged");
      });
    }
  }
};
