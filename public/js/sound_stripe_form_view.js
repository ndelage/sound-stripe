function SoundStripeFormView(el, model, profile) {
  this.$el = el;
  this.model = model;
  this.profile = profile;
  this.template = _.template($("#sound-stripe-new-template").html());
  this.linkTemplate = _.template($("#sound-stripe-link-template").html());

  _.bindAll(this, 'render',
                  'generateLink');

  this.$el.on('submit', "form", this.generateLink);

  this.render();
}

SoundStripeFormView.prototype.render = function(e) {
  var $html = $(this.template());
  var instagramPickerView = new InstagramPickerView($html.find("#instagram-picker"), this.model, this.profile);

  var songPickerView = new SongPickerView($html.find("#song-picker"), this.model, this.profile);
  songPickerView.render();

  this.$el.html($html);
}

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
