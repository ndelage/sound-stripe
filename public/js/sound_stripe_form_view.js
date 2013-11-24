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

  var self = this;
  this.$el.on("click", "#thumbnail-strip li", function(e) {
    var newPhoto = self.profile.instagrams[$(this).index()];
    self.changePhoto(newPhoto);
  });

  this.$el.on('submit', "form", this.generateLink);
}


SoundStripeFormView.prototype.render = function(e) {
  if(!this.model.instagram.valid()) {
    this.model.instagram = this.profile.instagrams[0];
  }

  var html = $(this.template({preview_url: this.model.instagram.imageUrl()}));

  for(var i=0; i < 5; i++ ) {
    var instagram = this.profile.instagrams[i];

    html.find("#thumbnail-strip").append(this.thumbnailTemplate({preview_url: instagram.imageUrl('t')}));
  }
  this.$el.html(html);
}

SoundStripeFormView.prototype.changePhoto = function(newPhoto) {
  this.model.instagram = newPhoto;
  this.render();
}

SoundStripeFormView.prototype.searchSong = function(e) {
  var self = this;
  var query = this.$el.find("#song-title").val();
  if(this.oldQuery != query && query.length > 4) {
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

  _.each(withPreviews, function(s, index, list) {
    var checked = list.length == 1 ? "checked" : "";
    var result = self.songResultTemplate({artist_name: s.artist_name,
                                          title: s.title,
                                          preview_url: s.tracks[0].preview_url,
                                          checked: checked});
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

    if(window.location.origin.indexOf("localhost") != -1) {
      this.$el.find("#final-link").html(this.linkTemplate({url: url}));
    } else {
      var self = this;
      shortenUrl(url, function(sUrl) {
        self.$el.find("#final-link").html(self.linkTemplate({url: sUrl}));
      });
    }

  } else {
    alert("Not so fast! Pick a song and Instagram photo first!");
  }
}
