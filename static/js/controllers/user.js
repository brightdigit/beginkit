var Spinner = require('spin.js');
var modal = require("../libs/modal");
var templates = require('../templates');

var User = (function () {
  var constructor = function () {

  };

  function whichTransitionEvent() {
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }

  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  constructor.prototype = {
    changeActivation: function (activationKey) {
      activationKey = '';
      var transitionEvent = whichTransitionEvent();
      if (transitionEvent) {
        this.form.addEventListener(transitionEvent, function () {
          console.log('Transition complete!  This is the callback, no library needed!');
        });
      }
      this.form.classList.add('fade');
      var d = document.createElement('div');
      d.innerHTML = templates.activation({
        activationKey: activationKey
      });
      var activationForm = this.form.parentNode.appendChild(d.firstChild);
      activationForm.classList.add('fade');
      setTimeout(function () {
        activationForm.classList.add('in');

      }, 100);
      var inputs = activationForm.getElementsByTagName('input');
      for (var i = 0, len = inputs.length; i < len; i++) {
        inputs[i].readOnly = !! (inputs[i].value);
      }
    },
    hashChange: function (evt) {
      var activationKey = getParameterByName('activationKey');
      if (activationKey) {
        this.changeActivation(activationKey);
      }
    },
    initialize: function (app) {
      this.app = app;
      this.app.hashChange(this);
      console.log('user initialized');

      var form = document.getElementById("user-registration");
      var callout = document.getElementsByClassName("callout")[0];
      var videoBg = document.getElementsByClassName("video-bg")[0];
      var inputs = ["input", "select", "textarea", "button"].reduce(


      function (memo, tagName) {
        memo = memo.concat(Array.prototype.slice.call(form.getElementsByTagName(tagName)));
        return memo;
      }, []);
      this.form = form;
      var controller = this;
      form.addEventListener('submit', function (E) {
        var form = E.target;
        var data = inputs.reduce(function (memo, element) {
          var key = element.getAttribute('name') || element.getAttribute('id');
          var value = element.value || (element.selectedIndex && element.options && element.options[element.selectedIndex]);
          var ignore = element.hasAttribute('data-ignore');
          if (key && value && !ignore) {
            memo[key] = value;
          }
          return memo;
        }, {});
        var request = new XMLHttpRequest();
        request.open('POST', controller.app.configuration.server + '/api/v1/users', true);
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        request.onload = function () {
          var i = 0;
          if (this.status >= 200 && this.status < 400) {
            // Success!
            var resp = this.response;
            console.log(resp);
            videoBg.removeChild(spinner.el);
            callout.classList.remove('fade');

            for (i = 0, len = inputs.length; i < len; i++) {
              inputs[i].disabled = false;
            }
            controller.changeActivation();
          } else {
            // We reached our target server, but it returned an error
            //vex.dialog.alert('Thanks for checking out Vex!');
            videoBg.removeChild(spinner.el);
            callout.classList.remove('fade');

            for (i = 0, len = inputs.length; i < len; i++) {
              inputs[i].disabled = false;
            }
            modal(this.response);
          }
        };

        request.onerror = function () {
          // There was a connection error of some sort
          videoBg.removeChild(spinner.el);
          callout.classList.remove('fade');

          for (var i = 0, len = inputs.length; i < len; i++) {
            inputs[i].disabled = false;
          }
        };
        request.send(JSON.stringify(data));
        E.preventDefault();
        var spinner = new Spinner().spin();
        videoBg.appendChild(spinner.el);
        callout.classList.add('fade');

        for (var i = 0, len = inputs.length; i < len; i++) {
          inputs[i].disabled = true;
        }
      });
    }
  };

  return constructor;
})();