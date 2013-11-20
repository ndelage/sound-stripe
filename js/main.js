function SoundStripe(instagramId, songUrl) {
  this.instagramId = instagramId;
  this.songUrl = songUrl;
}

SoundStripe.prototype.loadInstagramUrl = function(url) {
  this.instagramId = /p\/(\w+)/.exec(url)[1];
}

SoundStripe.prototype.imageUrl = function() {
  return "http://instagr.am/p/" + this.instagramId + "/media/?size=m";
}
SoundStripe.prototype.attributes = function() {
  return {songUrl: this.songUrl, imageUrl: this.imageUrl()};
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

function SoundStripeFormView(selector, model) {
  this.$el = $(selector);
  this.model = model;
  this.template = _.template($("#sound-stripe-new-template").html());
  this.songResultTemplate = _.template($("#song-search-result-template").html());

  _.bindAll(this, 'updateInstagram', 'searchSong', 'generateThing')
  this.$el.find("#instagram-url").on('change', this.updateInstagram);
  this.$el.find("#song-title").on('change', this.searchSong);

  this.$el.find("form").submit(this.generateThing);
}


SoundStripeFormView.prototype.render = function(e) {
  this.$el.html(this.template({}));
}

SoundStripeFormView.prototype.updateInstagram = function(e) {
  var instagramUrl = this.$el.find("#instagram-url").val();
  this.model.loadInstagramUrl(instagramUrl);
  this.$el.find("#image-preview").attr('src', this.model.imageUrl());
};

SoundStripeFormView.prototype.searchSong = function(e) {
  var self = this;
  EchoNest.search(this.$el.find("#song-title").val())
           .done(function(resp) {
             self.updateSearchResults(resp.response.songs);
           });

};

SoundStripeFormView.prototype.updateSearchResults = function(songs) {
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

SoundStripeFormView.prototype.generateThing = function(e) {
  e.preventDefault();
  var selectedSong = this.$el.find("input[name=song]:checked");
  var songUrl = selectedSong.parents("li").data("preview-url");
  var url = window.location.origin + "/?songUrl=" + songUrl + "&instagramId=" + this.model.instagramId;
  this.$el.find("#final-link").html("<a href='" + url + "'>" + url + "</a>");
}


function SoundStripeView(selector, model) {
  this.$el = $(selector);
  this.model = model;
  this.template = _.template($("#sound-stripe-template").html());
}

SoundStripeView.prototype.render = function() {
  var $el = this.$el;
  $el.show();

  var spinnerDisplayID = setTimeout(function() {
    $el.find("#spinner").show();
  }, 500);

  $el.append(this.template(this.model.attributes()));
  $el.find("audio").on("playing", function() {
    clearTimeout(spinnerDisplayID);
    $el.find("#spinner").hide();
    $el.find("#instagram-image").fadeIn();
  });
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(document).ready(function() {
  var photoSong = new SoundStripe();

  if(getParameterByName("instagramId") &&
     getParameterByName("songUrl")) {

    var model = new SoundStripe(getParameterByName("instagramId"),
                                getParameterByName("songUrl"));
    var view = new SoundStripeView("#sound-stripe-presentation", model);
    view.render();

  } else {
    var view = new SoundStripeFormView("#sound-stripe-builder", photoSong);
    view.render();
  }
});

