function SoundStripeProfile() {
  this.userId = null;
  this.loadInstagramUsername();
  this.instagrams = [];
  this.loadRecentInstagrams();
}

SoundStripeProfile.prototype.loadInstagramUsername = function() {
  this.userId = $.cookie('instagram_userId');
}

SoundStripeProfile.prototype.complete = function() {
  return this.userId;
}

SoundStripeProfile.prototype.loadRecentInstagrams = function() {
  if(this.userId) {
    var self = this;
    Instagram.recentPhotos(this.userId).done(function(resp) {
      self.instagrams = _.map(resp.data, function(media) {
        return new InstagramPost(media.link);
      });

      $(window).trigger("profile:instagrams-loaded");
    });
  }
}
