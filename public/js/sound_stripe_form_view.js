function SoundStripeFormView(el, model, profile) {
  this.$el = el;
  this.model = model;
  this.profile = profile;
  this.template = _.template($("#sound-stripe-new-template").html());

  _.bindAll(this, 'render',
                  'generateLink');

  this.$el.on('submit', "form", this.generateLink);

  this.render();
}

SoundStripeFormView.prototype.render = function(e) {
  var $html = $(this.template());
  var instagramPickerView = new InstagramPickerView($html.find("#instagram-picker"), this.model, this.profile);
  instagramPickerView.render();

  var songPickerView = new SongPickerView($html.find("#song-picker"), this.model, this.profile);
  songPickerView.render();

  var linkView = new SoundStripeLinkView($html.find("#final-link"), this.model);

  this.$el.html($html);
}

SoundStripeFormView.prototype.generateLink = function(e) {
  e.preventDefault();

  if(this.model.valid()) {
    this.model.generateUrl();
  } else {
    alert("Not so fast! Pick a song and Instagram photo first!");
  }
}
