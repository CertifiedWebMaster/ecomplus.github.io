
/*
|--------------------------------------------------------------------------
| Custom Javascript code
|--------------------------------------------------------------------------
*/

$(function () {
  /* set globals */

  // sample store ID
  window.storeId = 100
  var Headers = function () {
    return {
      // by default, authenticate store only
      // no authorization tokens
      'X-Store-ID': storeId
    }
  }

  // E-Com Plus APIs
  $.getJSON('../../src/assets/json/apis.json', function (json) {
    // success
    window.Apis = json
  }).fail(function (jqxhr, textStatus, err) {
    alert('Cannot GET Apis object :/')
    console.error(err)
  })

  // general function to load HTML content
  window.loadContent = function () {
  }

  // general function to run an API request
  window.callApi = function (api, endpoint, method, callback, bodyObject) {
    var headers
    if (!api.no_headers) {
      // setup request headers
      headers = Headers()
      if (api.auth_session) {
        // set authorization headers
        headers['X-My-ID'] = api.auth_session.my_id
        headers['X-Access-Token'] = api.auth_session.access_token
      }
    } else {
      headers = {}
    }

    // AJAX options
    var options = {
      // API endpoint full URL
      url: api.host + api.base_path + api.version + endpoint,
      headers: headers,
      method: method
    }
    if (bodyObject) {
      options.data = JSON.stringify(bodyObject)
    }

    // console.log(options)
    // run API request
    // always JSON
    options.dataType = 'json'
    if (options.data) {
      options.contentType = 'application/json; charset=UTF-8'
    }
    // call AJAX request
    var ajax = $.ajax(options)

    ajax.done(function (json) {
      // successful response
      if (typeof callback === 'function') {
        callback(null, json)
      } else {
        console.log(json)
      }
    })

    ajax.fail(function (jqXHR, textStatus, err) {
      var json = jqXHR.responseJSON
      // error response
      if (typeof callback === 'function') {
        callback(err, json)
      }
      if (jqXHR.status >= 500) {
        console.log('API request with internal error response:')
        console.log(jqXHR)
      }
    })
  }

  var handleAnchor = function () {
    // treat anchor links
    var link = $(this).attr('href')
    if (link.charAt(0) === '#') {
      // changing hash only
      // update browser history
      if (typeof (history.pushState) !== 'undefined') {
        // current page title
        var title = document.title.replace(/(.*~\s)?(.*)/, '$2')
        // try to find element with ID equals to link hash
        var $head = $(link)
        if ($head.length) {
          title = $head.text() + ' ~ ' + title
        }
        // current URL with hash
        var url = location.origin + location.pathname + $(this).attr('href')

        // update page title
        document.title = title
        // push to history
        var obj = {
          Title: title,
          Url: url
        }
        history.pushState(obj, title, url)
      }
    }
  }

  // handle sidebar scroll
  var sidebar = $('#sidebar')
  if (sidebar.length) {
    var ps
    try {
      ps = new window.PerfectScrollbar(sidebar[0], {
        wheelPropagation: true,
        wheelSpeed: 0.5
      })
    } catch (e) {
      console.error(e, ps)
    }

    // handle summary links
    sidebar.find('a').click(handleAnchor)
  }

  // create anchor links within article content
  var article = $('#article')
  if (article.length) {
    article.find('h1,h2,h3,h4,h5').each(function () {
      var text = $(this).text()
      // render ID from header text
      var anchor = text.toLowerCase().replace(/\s/g, '-')
      // fix anchor ID and add link
      $(this).attr('id', anchor).html($('<a />', {
        'class': 'anchor-link',
        href: '#' + anchor,
        click: handleAnchor,
        text: text
      }))
    })
  }
})
