function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function shortenUrl(long_url, func) {
    $.getJSON(
        "http://api.bitly.com/v3/shorten?callback=?",
        { 
            "format": "json",
            "apiKey": "R_24c6ad54cdfd8a925a255d461005ee75",
            "login": "ndelage",
            "longUrl": long_url
        },
        function(response)
        {
            func(response.data.url);
        }
    );
}
