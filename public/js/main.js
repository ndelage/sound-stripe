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

var Instagram = {
  baseUrl: "https://api.instagram.com/v1/",
  baseParams: {
    access_token: "695401350.664c97e.4d8244faee794e15bc6e3e0c6b98d694"
  },

  searchUsers: function(username) {
    var params = _.extend(Instagram.baseParams, {q: username});
    return $.ajax({
             url: Instagram.baseUrl + "users/search",
             type: "GET",
             dataType: "JSONP",
             data: params
           });
  },

  recentPhotos: function(userId) {
    var params = _.extend(Instagram.baseParams, {});
    return $.ajax({
             url: Instagram.baseUrl + "users/" + userId + "/media/recent",
             type: "GET",
             dataType: "JSONP",
             data: params
           });
  }
}

function SoundStripeFormView(selector, model, profile) {
  this.$el = $(selector);
  this.model = model;
  this.profile = profile;
  this.template = _.template($("#sound-stripe-new-template").html());
  this.songResultTemplate = _.template($("#song-search-result-template").html());
  this.linkTemplate = _.template($("#sound-stripe-link-template").html());
  this.thumbnailTemplate = _.template($("#image-thumbnail-template").html());
  this.oldQuery = null;


  _.bindAll(this, 'render',
                  'searchSong',
                  'generateLink',
                  'selectSong');

  $(window).on('profile:instagrams-loaded', this.render);
  this.$el.on("input", "#song-title", _.debounce(this.searchSong, 500));
  this.$el.on("input change", "#song-search-results input", this.selectSong);

  this.$el.on('submit', "form", this.generateLink);
}


SoundStripeFormView.prototype.render = function(e) {
  var html = $(this.template({preview_url: this.profile.instagrams[0].imageUrl()}));

  for(var i=1; i < 6; i++ ) {
    var instagram = this.profile.instagrams[i];

    html.find("#thumbnail-strip").append(this.thumbnailTemplate({preview_url: instagram.imageUrl('t')}));
  }
  this.$el.html(html);
}

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
  var selectedSong = this.$el.find("input[name=song]:checked");
  this.model.songUrl = selectedSong.parents("li").data("preview-url");
};

SoundStripeFormView.prototype.generateLink = function(e) {
  e.preventDefault();
  if(this.model.valid()) {
    var url = window.location.origin +
              "/?songUrl=" +
              this.model.songUrl +
              "&instagramId=" +
              this.model.instagram.instagramId;

    this.$el.find("#final-link").html(this.linkTemplate({url: url}));
  } else {
    alert("Not so fast! Pick a song and Instagram photo first!");
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
  var self = this;
  Instagram.recentPhotos(this.userId).done(function(resp) {
    self.instagrams = _.map(resp.data, function(media) {
      return new InstagramPost(media.link);
    });

    $(window).trigger("profile:instagrams-loaded");
  });
}

function NewSoundStripeProfileView(selector, model) {
  _.bindAll(this, 'saveInstagramUsername');

  this.model = model;
  this.$el = $(selector);
  this.template = _.template($("#new-profile-template").html());
  this.resultsTemplate = _.template($("#instagram-user-search-results-template").html());
  this.$el.on('typeahead:selected', "#username", this.saveInstagramUsername);
  this.render();

}

NewSoundStripeProfileView.prototype.render = function() {
  this.$el.html(this.template());
  var set = {
    name: "instagram-users",
    template: this.resultsTemplate,
    computed: function (q, displayResults) {
      Instagram.searchUsers(q).done(function(resp) {
        var users = _.map(resp.data, function(r) {
          var value = r.full_name || r.username;

          return { value: value,
                   avatar: r.profile_picture,
                   id: r.id };
        });

        displayResults(users);
      });
    }
  };

  this.$el.find("#username").typeahead([set]);
}

NewSoundStripeProfileView.prototype.saveInstagramUsername = function(e, datum, name) {
  this.model.userId = datum.id;
  $.cookie('instagram_userId', this.model.userId);
  $(window).trigger("profile-complete");
}

function SoundStripeApp() {
  this.profile = new SoundStripeProfile();
  this.soundStripe = new SoundStripe();

  this.soundStripe.instagram = new InstagramPost(getParameterByName("instagramId"));
  this.soundStripe.songUrl = getParameterByName("songUrl");

  if(this.soundStripe.valid()) {
    var view = new SoundStripeView("#sound-stripe-presentation", this.soundStripe);
  } else if(!this.profile.complete()) {
    var view = new NewSoundStripeProfileView("#new-profile", this.profile);
  } else {
    var view = new SoundStripeFormView("#sound-stripe-builder", this.soundStripe, this.profile);
  }

  var self;
  $(window).on("profile-complete", function() {
    $("#new-profile").hide();
    var view = new SoundStripeFormView("#sound-stripe-builder", self.soundStripe);
  });
}

var app;
$(document).ready(function() {
  app = new SoundStripeApp();
});
