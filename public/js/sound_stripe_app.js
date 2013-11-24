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
    var view = new SoundStripeFormView($("#sound-stripe-builder"), this.soundStripe, this.profile);
  }

  var self = this;
  $(window).on("profile-complete", function() {
    $("#new-profile").hide();
    var view = new SoundStripeFormView("#sound-stripe-builder", self.soundStripe, self.profile);
  });
}
