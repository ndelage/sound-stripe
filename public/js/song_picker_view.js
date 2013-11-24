function SongPickerView(el, model, profile) {
  this.$el = el;
  this.model = model;
  this.profile = profile;
  this.template = _.template($("#song-picker-template").html());
  this.songResultTemplate = _.template($("#song-search-result-template").html());
  this.oldQuery = null;


  _.bindAll(this, 'render',
                  'searchSong',
                  'selectSong');

  this.$el.on("input", "#song-title", _.debounce(this.searchSong, 500));
  this.$el.on("input change", "#song-search-results input", this.selectSong);
}


SongPickerView.prototype.render = function(e) {
  this.$el.html(this.template());
}

SongPickerView.prototype.searchSong = function(e) {
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

SongPickerView.prototype.updateSearchResults = function(songs) {
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


SongPickerView.prototype.selectSong = function(e) {
  var selectedSong = this.$el.find("input[name=song]:checked");
  this.model.songUrl = selectedSong.parents("li").data("preview-url");
};
