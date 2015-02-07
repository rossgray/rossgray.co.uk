// @codekit-prepend "../../bower_components/jquery/dist/jquery.min.js", "../../bower_components/bootstrap/dist/js/bootstrap.min.js";

// Main image
$(document).ready(function() {

	// Background cover images
	var backgroundImages = [
		'images/london-1.jpg',
		'images/london-2.jpg',
		'images/london-3.jpg'
	];
	var imgNum = 1;
	setInterval(function() {
		$('#intro-carousel').css('background-image', 'url(' + backgroundImages[imgNum] + ')');
		imgNum = (imgNum + 1) % 3;
	}, 3000);

	// add email address
	$("#email").each( function() {
		var email1 = "ross@";
		var email2 = "rgray";
		var email3 = ".co.uk";
		var fullAddress = email1 + email2 + email3;
		$(this).attr("href", 'mailto:' + fullAddress);
		$(this).attr("title", fullAddress);
	});

	////////////////////////////////
	// Event handlers
	$('.read-more').click(function(e) {
		e.preventDefault();
		$(this).siblings('.more-info').slideToggle('slow');
		$(this).toggleClass('active');
	});

	$('.show-modules').click(function(e) {
		e.preventDefault();
		$(this).next('.modules').slideToggle('slow');
		$(this).toggleClass('active');
	});

	$('.scroll').click(function(e) {
		e.preventDefault();
		$('html, body').animate({
		    scrollTop: $($(this).attr('href')).offset().top
		}, 1000);
	});



	////////////////////////////////
	// Timeline animation

	// Taken from http://codyhouse.co/gem/vertical-timeline/
	var $timeline_block = $('.cd-timeline-block');

	//hide timeline blocks which are outside the viewport
	$timeline_block.each(function(){
		if($(this).offset().top > $(window).scrollTop()+$(window).height()*0.75) {
			$(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
		}
	});

	//on scolling, show/animate timeline blocks when enter the viewport
	$(window).on('scroll', function(){
		$timeline_block.each(function(){
			if( $(this).offset().top <= $(window).scrollTop()+$(window).height()*0.75 && $(this).find('.cd-timeline-img').hasClass('is-hidden') ) {
				$(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('animated bounceInLeft');
			}
		});
	});


});


