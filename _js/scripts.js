$(document).ready(function() {
	$('body').removeClass('no-js');
	ShowHideNav();
	formCheck();
});

// Show Header on resize
$(window).resize(function() {
	$('.header').removeClass('hide-nav');
});

// SHOW/HIDE NAV
function ShowHideNav() {
  var previousScroll = 0,
			$header = $('.header'),
			navHeight = $('.header').outerHeight(),
			detachPoint = 650,
			hideShowOffset = 6;

  $(window).scroll(function(){
		var wW = 1024;
		if ($(window).width() >= wW) {
	    if (!$header.hasClass('fixed')) {
				var currentScroll = $(this).scrollTop(),
						scrollDifference = Math.abs(currentScroll - previousScroll);
				if (currentScroll > navHeight) {
					if (currentScroll > detachPoint) {
						if (!$header.hasClass('fix-nav'))
							$header.addClass('fix-nav');
					}
					if (scrollDifference >= hideShowOffset) {
						if (currentScroll > previousScroll) {
							if (!$header.hasClass('hide-nav'))
								$header.addClass('hide-nav');
						} else {
							if ($header.hasClass('hide-nav'))
								$($header).removeClass('hide-nav');
						}
					}
				}
				else {
					if (currentScroll <= 0) {
						$header.removeClass('hide-nav show-nav');
						$header.addClass('top');
					}
				}
			}
			if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
				$header.removeClass('hide-nav');
			}
			previousScroll = currentScroll;
		}
		else {
		 $header.addClass('fix-nav');
	 }
 });
}

// Contact Form Validation
function formCheck() {
  $('#contactBtn').click(function(e) {

    e.preventDefault();

    var inputs = $('.form__input input');
		var textarea = $('.form__input textarea');
    var isError = false;

    $('.form__input').removeClass('error');
    $('.error-data').remove();

    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      if ($(input).attr('required', true) && !validateRequired($(input).val())) {
        addErrorData($(input), "This field is required");
        isError = true;
      }
			if ($(input).attr('required', true) && $(input).attr('type') ==="email" && !validateEmail($(input).val())) {
				addErrorData($(input), "Email address is invalid");
				isError = true;
			}
      if ($(textarea).attr('required', true) && !validateRequired($(textarea).val())) {
				addErrorData($(textarea), "This field is required");
				isError = true;
			}
    }
    if (isError === false) {
      $('#contactForm').submit();
    }
  });
}

// Validate if the input is not empty
function validateRequired(value) {
  if (value == "") return false;
  return true;
}

// Validate if the email is using correct format
function validateEmail(value) {
	if (value != "") {
		return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(value);
	}
	return true;
}

// Add error message to the input
function addErrorData(element, error) {
  element.parent().addClass("error");
  element.after("<span class='error-data'>" + error + "</span>");
}

// AJAX Form submit
$('#contactForm').submit(function(e) {

	e.preventDefault();

	var btn = $('#contactBtn'),
			inputs = $('.form__input input'),
			textarea = $('.form__input textarea');
			name = $('input#name').val();

  $.ajax({

		// Change the email address here:
    url: 'https://formspree.io/jan.czizikow@gmail.com',
    method: 'POST',
    data: $(this).serialize(),
    dataType: 'json',

    beforeSend: function() {
			btn.prop('disabled', true);
			btn.text('Sending...');
    },
		complete: function() {
			btn.prop('disabled', false);
			btn.text('Send');
		},
    success: function(data) {
			inputs.val('');
			textarea.val('');
			alert('Thanks for contacting me, ' + name + ' ! Will get back to you soon!');
			dataLayer.push({'event' : 'formSubmitted', 'formName' : 'Contact'});
    },
    error: function(err) {
			alert('Ups, something went wrong, please try again. You can check console log for more information.');
      console.log(err);
    }
  });
});
