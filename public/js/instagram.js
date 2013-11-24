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
