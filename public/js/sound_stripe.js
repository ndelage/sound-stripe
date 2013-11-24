function SoundStripe(instagram, songUrl) {
  this.instagram = instagram;
  this.songUrl = songUrl;
}

SoundStripe.prototype.attributes = function() {
  return {songUrl: this.songUrl, imageUrl: this.instagram.imageUrl()};
}

SoundStripe.prototype.valid = function() {
  return this.songUrl && this.instagram.valid();
}
