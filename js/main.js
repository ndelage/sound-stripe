function PhotoSong(instagramId, songUrl) {
  this.instagramId = instagramId;
  this.songUrl = songUrl;
}

PhotoSong.prototype.loadInstagramUrl = function(url) {
  this.instagramId = /p\/(\w+)/.exec(url)[1];
}

PhotoSong.prototype.imageUrl = function() {
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
  this.songResultTemplate = _.template("<li data-preview-url='<%=preview_url%>'><label><input type='radio' name='song'><%=artist_name%> - <%=title%><label></li>");

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
  this.$el.find("#image-preview").attr('src', this.model.imageUrl());
};

InstagramSongWizardView.prototype.searchSong = function(e) {
  var self = this;
  EchoNest.search(this.$el.find("#song-title").val())
           .done(function(resp) {
             self.updateSearchResults(resp.response.songs);
           });

};

InstagramSongWizardView.prototype.updateSearchResults = function(songs) {
  var self = this;
  this.$el.find("#song-search-results").html('');
  var withPreviews = _.select(songs, function(s) {
    return s.tracks.length > 0;
  });

  _.each(withPreviews, function(s) {
    var result = self.songResultTemplate({artist_name: s.artist_name,
                                          title: s.title,
                                          preview_url: s.tracks[0].preview_url});
    $("#song-search-results").append(result);
  });
};

InstagramSongWizardView.prototype.generateThing = function(e) {
  e.preventDefault();
  var selectedSong = this.$el.find("input[name=song]:checked");
  var songUrl = selectedSong.parents("li").data("preview-url");
  var url = "http://localhost:8000/?songUrl=" + songUrl + "&instagramId=" + this.model.instagramId;
  this.$el.find("#final-link").html("<a href='" + url + "'>" + url + "</a>");
}

$(document).ready(function() {
  var photoSong = new PhotoSong();
  var view = new InstagramSongWizardView("#wizard", photoSong);

  if(window.location.href.indexOf("instagramId") != -1 ) {
   var instagramId = getParameterByName("instagramId");
   var songUrl = getParameterByName("songUrl");
   var photoSong = new PhotoSong(instagramId, songUrl);

    var template = _.template("<img id='instagram-image' src='<%=imageUrl%>'><audio autoplay=true src='<%=songUrl%>'></audio>");
    $("#instagram-song").append(template({songUrl: photoSong.songUrl, imageUrl: photoSong.imageUrl()}));
    $("audio").on("playing", function() {
      $("#spinner").hide();
      $("#instagram-image").fadeIn();
    });

  } else {
    view.show();
  }
});

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
