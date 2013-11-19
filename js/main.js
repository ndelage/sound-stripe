function PhotoSong(instagramId, songUrl) {
  this.instagramId = instagramId;
  this.songUrl = songUrl;
}

PhotoSong.prototype.loadInstagramUrl = function(url) {
  this.instagramId = /p\/(\w+)/.exec(url)[1];
}

PhotoSong.prototype.imagePreviewUrl = function() {
  return "http://instagr.am/p/" + this.instagramId + "/media/?size=m";
}

var EchoNest = {
  baseUrl: "http://developer.echonest.com/api/v4/",
  baseParams: {api_key: "PTNDIW5CND1KNKMKY",
               format: "json",
               bucket: ["id:7digital-US", "audio_summary", "tracks"]},
  search: function(query) {
    var params = _.extend(EchoNest.baseParams, {combined: query});
    return $.ajax({
             url: EchoNest.baseUrl + "song/search",
             type: "GET",
             traditional: true,
             data: params
           });
  }
}

function InstagramSongWizardView(selector, model) {
  this.$el = $(selector);
  this.model = model;
  _.bindAll(this, 'updateInstagram', 'searchSong', 'generateThing')
  $("#instagram-url").on('change', this.updateInstagram);
  $("#song-title").on('change', this.searchSong);
  $("#wizard").submit(this.generateThing);
}


InstagramSongWizardView.prototype.show = function(e) {
  this.$el.show();
}

InstagramSongWizardView.prototype.updateInstagram = function(e) {
  var instagramUrl = this.$el.find("#instagram-url").val();
  this.model.loadInstagramUrl(instagramUrl);
  this.$el.find("#image-preview").attr('src', this.model.imagePreviewUrl());
};

InstagramSongWizardView.prototype.searchSong = function(e) {
  var self = this;
  EchoNest.search("radiohead - karma police")
           .done(function(resp) {
             self.updateSearchResults(resp.response.songs);
           });

};

InstagramSongWizardView.prototype.updateSearchResults = function(songs) {
   this.$el.find("#song-search-results").html('');
   _.each(songs, function(s) {
     $("#song-search-results").append("<li>" + s.artist_name + " - " + s.title + "</li>");
   });
};

InstagramSongWizardView.prototype.generateThing = function(e) {
  e.preventDefault();
  var songTitle = this.$el.find("#song-title").val();
};

$(document).ready(function() {
  var photoSong = new PhotoSong();
  var view = new InstagramSongWizardView("#wizard", photoSong);

  if(window.location.pathname.indexOf("instagram-bug") != -1 ) {

  } else {
    view.show();
  }
});

