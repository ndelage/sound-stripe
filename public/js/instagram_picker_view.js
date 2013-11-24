function InstagramPickerView(el, model, profile) {
  this.$el = el;
  this.model = model;
  this.profile = profile;
  this.template = _.template($("#instagram-picker-template").html());
  this.thumbnailTemplate = _.template($("#image-thumbnail-template").html());

  _.bindAll(this, 'render');

  $(window).on('profile:instagrams-loaded', this.render);

  var self = this;
  this.$el.on("click", "#thumbnail-strip li", function(e) {
    var newPhoto = self.profile.instagrams[$(this).index()];
    self.changePhoto(newPhoto);
  });
}

InstagramPickerView.prototype.render = function(e) {
  if(this.profile.instagrams && this.profile.instagrams.length > 0) {
    // TODO: This should be done by the SoundStripe model, triggered by a change
    // in the profile model
    if(!this.model.instagram.valid()) {
      this.model.instagram = this.profile.instagrams[0];
    }

    this.$el.html(this.template({preview_url: this.model.instagram.imageUrl()}))
    var thumbnailStrip = this.$el.find("#thumbnail-strip");

    var alternatives = _.first(this.profile.instagrams, 5);
    _.each(alternatives, function(instagram) {
      thumbnailStrip.append(this.thumbnailTemplate({preview_url: instagram.imageUrl('t')}));
    }.bind(this));
  }
}

InstagramPickerView.prototype.changePhoto = function(newPhoto) {
  this.model.instagram = newPhoto;
  this.render();
}
