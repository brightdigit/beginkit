/*
	Landed by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/


var jQuery = require("jquery");
require("jquery-placeholder");
require("./jquery.scrolly");
require("jquery.dropotron");
require("jquery.scrollex");
require("typed.js");
var skel = require("skel");
require("./util");

(function($) {

	function xlarge (src) {
		var pathComponents = src.split("/");
		pathComponents.splice(-1,0,"xlarge");
		return pathComponents.join("/");
	}
	skel.breakpoints({
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)'
	});

	$(function() {

		var	$window = $(window),
			$body = $('body');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.load(function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 0);
			/** this is come when complete page is fully loaded, including all frames, objects and images **/
			});
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 5000);

		// Touch mode.
			if (skel.vars.mobile)
				$body.addClass('is-touch');

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});


		// Scrolly links.
			$('.scrolly').scrolly({
				speed: 2000
			});

		// Dropdowns.
			$('#nav > ul').dropotron({
				alignment: 'right',
				hideDelay: 350
			});

		// Off-Canvas Navigation.

			// Title Bar.
				$(
					'<div id="titleBar">' +
						'<a href="#navPanel" class="toggle"></a>' +
						'<span class="title">' + $('#logo').html() + '</span>' +
					'</div>'
				)
					.appendTo($body);

			// Navigation Panel.
				$(
					'<div id="navPanel">' +
						'<nav>' +
							$('#nav').navList() +
						'</nav>' +
					'</div>'
				)
					.appendTo($body)
					.panel({
						delay: 500,
						hideOnClick: true,
						hideOnSwipe: true,
						resetScroll: true,
						resetForms: true,
						side: 'left',
						target: $body,
						visibleClass: 'navPanel-visible'
					});

			// Fix: Remove navPanel transitions on WP<10 (poor/buggy performance).
				if (skel.vars.os == 'wp' && skel.vars.osVersion < 10)
					$('#titleBar, #navPanel, #page-wrapper')
						.css('transition', 'none');

		// Parallax.
		// Disabled on IE (choppy scrolling) and mobile platforms (poor performance).
			if (skel.vars.browser == 'ie'
			||	skel.vars.mobile) {

				$.fn._parallax = function() {

					return $(this);

				};

			}
			else {

				$.fn._parallax = function() {

					$(this).each(function() {

						var $this = $(this),
							on, off;

						on = function() {

							$this
								.css('background-position', 'center 0px');

							$window
								.on('scroll._parallax', function() {

									var pos = parseInt($window.scrollTop()) - parseInt($this.position().top);

									$this.css('background-position', 'center ' + (pos * -0.15) + 'px');

								});

						};

						off = function() {

							$this
								.css('background-position', '');

							$window
								.off('scroll._parallax');

						};

						skel.on('change', function() {

							if (skel.breakpoint('medium').active)
								(off)();
							else
								(on)();

						});

					});

					return $(this);

				};

				$window
					.on('load resize', function() {
						$window.trigger('scroll');
					});

			}

		// Spotlights.
			var $spotlights = $('.spotlight');

			$spotlights
				._parallax()
				.each(function() {

					var $this = $(this),
						on, off;

					on = function() {

							var img = $this.find('.image.main > img');
							var orgSrc = img.attr('src');
							var src = img.hasClass("has-large") ? xlarge(orgSrc) : orgSrc;
							
						// Use main <img>'s src as this spotlight's background.
							$this.css('background-image', 'url("' + src + '")');

						// Enable transitions (if supported).
							if (skel.canUse('transition')) {

								var top, bottom, mode;

								// Side-specific scrollex tweaks.
									if ($this.hasClass('top')) {

										mode = 'top';
										top = '-20%';
										bottom = 0;

									}
									else if ($this.hasClass('bottom')) {

										mode = 'bottom-only';
										top = 0;
										bottom = '20%';

									}
									else {

										mode = 'middle';
										top = 0;
										bottom = 0;

									}

								// Add scrollex.
									$this.scrollex({
										mode:		mode,
										top:		top,
										bottom:		bottom,
										initialize:	function(t) { $this.addClass('inactive'); },
										terminate:	function(t) { $this.removeClass('inactive'); },
										enter:		function(t) { $this.removeClass('inactive'); },

										// Uncomment the line below to "rewind" when this spotlight scrolls out of view.

										//leave:	function(t) { $this.addClass('inactive'); },

									});

							}

					};

					off = function() {

						// Clear spotlight's background.
							$this.css('background-image', '');

						// Disable transitions (if supported).
							if (skel.canUse('transition')) {

								// Remove scrollex.
									$this.unscrollex();

							}

					};

					skel.on('change', function() {

						if (skel.breakpoint('medium').active)
							(off)();
						else
							(on)();

					});

				});

		// Wrappers.
			var $wrappers = $('.wrapper');

			$wrappers
				.each(function() {

					var $this = $(this),
						on, off;

					on = function() {

						if (skel.canUse('transition')) {

							$this.scrollex({
								top:		250,
								bottom:		0,
								initialize:	function(t) { $this.addClass('inactive'); },
								terminate:	function(t) { $this.removeClass('inactive'); },
								enter:		function(t) { $this.removeClass('inactive'); },

								// Uncomment the line below to "rewind" when this wrapper scrolls out of view.

								//leave:	function(t) { $this.addClass('inactive'); },

							});

						}

					};

					off = function() {

						if (skel.canUse('transition'))
							$this.unscrollex();

					};

					skel.on('change', function() {

						if (skel.breakpoint('medium').active)
							(off)();
						else
							(on)();

					});

				});

		// Banner.
			var $banner = $('#banner');

			$banner
				._parallax();

	});

	$("#activity").before("<br>").typed({
		strings: [" on email?", " on working out?", " on family time?", " on sales?", " on learning a new skill?"],
    loop: true,
    startDelay: 1000,
    typeSpeed: 50,
    backSpeed: 50,
	}).addClass("active");

	// Signup Form.
		(function() {

			// Vars.
			var $form = document.querySelectorAll('.signup-form'),
			$submit = document.querySelectorAll('.signup-form input[type="submit"]');


			// Bail if addEventListener isn't supported.
			if (!('addEventListener' in $form[0]))
			return;

			var icon = {
				failure: "fa-exclamation-circle",
				success: "fa-thumbs-o-up"
			};

			// Message.
			[].forEach.call($form, function(div) {
				var $message, $parent;
				$parent = document.createElement('div');
				$parent.classList.add('row');
				$parent.classList.add('50%');
				$message = document.createElement('span');
				$message.classList.add('message');
				$message.classList.add('12u');
				$parent.appendChild($message);
			  // do whatever
			  //div.style.color = "red";
				div.appendChild($parent);
				var currentType;

				$message._show = function(type, text) {

					var prefix = "";
					var iconClass = icon[type];
					if (iconClass) {
						prefix = '<i class="fa ' + iconClass + '"></i>'
					}
					currentType = type;
					$message.innerHTML = prefix + text;
					$message.classList.add(type);
					$message.classList.add('visible');

					window.setTimeout(function() {
						$message._hide();
					}, 3000);

				};

				$message._hide = function() {
					$message.classList.remove('visible');
					if (currentType) {
						$message.classList.remove(currentType);
					}
				};

				// Events.
				// Note: If you're *not* using AJAX, get rid of this event listener.
				div.addEventListener('submit', function(event) {

					var email = div.querySelector("input.email").value;
					event.stopPropagation();
					event.preventDefault();

					// Hide message.
					$message._hide();

					// Disable submit.
					$submit.disabled = true;


					var script = document.createElement('script');
					script.src = div.getAttribute('action') + "&c=signup_success&EMAIL=" + encodeURIComponent(email);

					window.signup_success = function(data)
					{
						if (data.result === "success") {
							$message._show('success', data.msg);
						} else {
							$message._show('failure', data.msg);
						}
						$submit.disabled = false;
						document.getElementsByTagName('head')[0].removeChild(script);
					}
					document.getElementsByTagName('head')[0].appendChild(script);
				});
			});





		})();
})(jQuery);
