/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 * ======================================================================== */

var Roots = {
  // All pages
  common: {
    init: function() {
      // JavaScript to be fired on all pages
    }
  },
  // Home page
  home: {
    init: function() {
      // JavaScript to be fired on the home page
    }
  },
  // About page
  about: {
    init: function() {
      // JavaScript to be fired on the about page
    }
  }
};

var UTIL = {
  fire: function(func, funcname, args) {
    var namespace = Roots;
    funcname = (funcname === undefined) ? 'init' : funcname;
    if (func !== '' && namespace[func] && typeof namespace[func][funcname] === 'function') {
      namespace[func][funcname](args);
    }
  },
  loadEvents: function() {
    UTIL.fire('common');

    $.each(document.body.className.replace(/-/g, '_').split(/\s+/),function(i,classnm) {
      UTIL.fire(classnm);
    });
    $('img.scale').each(function () {
      $(this).css('background-image', 'url(' + $(this).attr('src') + ')');
      $(this).removeAttr('src');
    });
    
    if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )) {
      jQuery('body').on('click', 'a[href^="tel:"]', function() {
            jQuery(this).attr('href',jQuery(this).attr('href').replace(/^tel:/, 'callto:'));
      });
    }

    UTIL.fire('common', 'finalize');
  }
};

$(document).ready(UTIL.loadEvents);
