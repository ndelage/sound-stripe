function NewSoundStripeProfileView(el, model) {
  _.bindAll(this, 'saveInstagramUsername');

  this.model = model;
  this.$el = el;
  this.template = _.template($("#new-profile-template").html());
  this.resultsTemplate = _.template($("#instagram-user-search-results-template").html());
  this.$el.on('typeahead:selected', "#username", this.saveInstagramUsername);
  this.render();

}

NewSoundStripeProfileView.prototype.render = function() {
  this.$el.html(this.template());
  this.$el.show();
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
  this.model.loadRecentInstagrams();
  $(window).trigger("profile-complete");
}
