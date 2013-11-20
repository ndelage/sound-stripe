function SoundStripe(instagramId, songUrl) {
  this.instagramId = instagramId;
  this.songUrl = songUrl;
}

SoundStripe.prototype.loadInstagramUrl = function(url) {
  var matches = /p\/(\w+)/.exec(url);
  if(matches && matches.length > 1) {
    this.instagramId = matches[1];
  }
}

SoundStripe.prototype.imageUrl = function() {
  if(this.instagramId) {
    return "http://instagr.am/p/" + this.instagramId + "/media/?size=m";
  } else {
    return null;
  }
}

SoundStripe.prototype.attributes = function() {
  return {songUrl: this.songUrl, imageUrl: this.imageUrl()};
}

SoundStripe.prototype.valid = function() {
  return this.songUrl && this.instagramId;
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
  this.linkTemplate = _.template($("#sound-stripe-link-template").html());
  this.oldQuery = null;

  this.render();

  _.bindAll(this, 'updateInstagram',
                  'searchSong',
                  'generateLink',
                  'selectSong');

  this.$el.on("input", "#instagram-url", this.updateInstagram);
  this.$el.on("input", "#song-title", _.debounce(this.searchSong, 500));
  this.$el.find("#song-search-results").on('change','input', this.selectSong);

  this.$el.find("form").submit(this.generateLink);
}


SoundStripeFormView.prototype.render = function(e) {
  this.$el.html(this.template({}));
}

SoundStripeFormView.prototype.updateInstagram = function(e) {
  var instagramUrl = this.$el.find("#instagram-url").val();
  if(instagramUrl.length > 0) {
    this.model.loadInstagramUrl(instagramUrl);
    if(this.model.imageUrl()) {
      this.$el.find("#image-preview").attr('src', this.model.imageUrl());
    }
  }
};

SoundStripeFormView.prototype.searchSong = function(e) {
  var self = this;
  var query = this.$el.find("#song-title").val();
  if(this.oldQuery != query && query.length > 4) {
    console.log("searching");
    EchoNest.search(query)
             .done(function(resp) {
               self.updateSearchResults(resp.response.songs);
             });
  } else if(query.length == 0) {
    this.$el.find("#song-search-results").html('');
  }

  this.oldQuery = query;
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


SoundStripeFormView.prototype.selectSong = function(e) {
  console.log("here");
  var selectedSong = this.$el.find("input[name=song]:checked");
  this.model.songUrl = selectedSong.parents("li").data("preview-url");
};

SoundStripeFormView.prototype.generateLink = function(e) {
  e.preventDefault();
  this.updateInstagram();
  if(this.model.valid()) {
    var url = window.location.origin +
              "/?songUrl=" +
              this.model.songUrl +
              "&instagramId=" +
              this.model.instagramId;

    this.$el.find("#final-link").html(this.linkTemplate({url: url}));
  } else {
    alert("Not so fast! Enter a instagram url and pick a song first!");
  }
}


function SoundStripeView(selector, model) {
  this.$el = $(selector);
  this.model = model;
  this.template = _.template($("#sound-stripe-template").html());
  this.render();
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
  } else {
    var view = new SoundStripeFormView("#sound-stripe-builder", photoSong);
  }
});

