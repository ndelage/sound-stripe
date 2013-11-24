function SoundStripeLinkView(el, model) {
  this.$el = el;
  this.model = model;

  this.template = _.template($("#sound-stripe-link-template").html());

  $(window).on("soundStripe:urlChanged", function() {
    this.render();
  }.bind(this));
}

SoundStripeLinkView.prototype.render = function() {
  this.$el.html(this.template({url: this.model.url}));
}
