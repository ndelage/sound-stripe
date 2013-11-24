function InstagramPickerView(el, model, profile) {
  this.$el = el;
  this.model = model;
  this.profile = profile;
  this.template = _.template($("#instagram-picker-template").html());
  this.thumbnailTemplate = _.template($("#image-thumbnail-template").html());

  _.bindAll(this, 'render');

  var self = this;
  this.$el.on("click", "#thumbnail-strip li", function(e) {
    var newPhoto = self.profile.instagrams[$(this).index()];
    self.changePhoto(newPhoto);
  });
}

InstagramPickerView.prototype.render = function(e) {
  $(window).on('profile:instagrams-loaded', function() {
    if(!this.model.instagram.valid()) {
      this.model.instagram = this.profile.instagrams[0];
    }

    this.$el.html(this.template({preview_url: this.model.instagram.imageUrl()}))
    var thumbnailStrip = this.$el.find("#thumbnail-strip");

    for(var i=0; i < 5; i++ ) {
      var instagram = this.profile.instagrams[i];

      thumbnailStrip.append(this.thumbnailTemplate({preview_url: instagram.imageUrl('t')}));
    }
  }.bind(this));
}

InstagramPickerView.prototype.changePhoto = function(newPhoto) {
  this.model.instagram = newPhoto;
  this.render();
}
