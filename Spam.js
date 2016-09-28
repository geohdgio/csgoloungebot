// Paste the command below to inject this script into CSGOLounge
// $.getScript('https://swap-skins.com/Spam.js');

// We need to modify these sooner or later
var settings = {
	interval: 25000, // how fast should it spam? (milliseconds)
	tslt: false, // your tslt string, check it in devtools (XHR - postMessage.php [form Data]) when making a comment
	message: "შეიყვანეთ წერილი აქ",
	startingOfferID: false,
	startPause: false,

	url: "https://csgolounge.com/ajax/postMessage.php",

    setInterval: function(seconds) {
    	this.interval = seconds * 1000;
    	return "ინტერვალი დაყენდა წარმატებით.";
    },
    setMessage: function(message) {
    	this.message = message;
    	return "ახალი წერილი დაყენდა წარმატებით.";
    }
};
// Starting from here don't touch anything
var spammer = {
	start: function() {
		if( ! settings.tslt || ! settings.startingOfferID) {
			console.info('%c Either TSLT or StartID was not set. Please see "spammer.info()" to see info on how to set these.', 'background: #eaeaea; color: red;');
			$(document).find('[data-cmd]').val('Either TSLT or StartID was not set. Please see "spammer.info()" to see info on how to set these.\n' + $(document).find('[data-cmd]').val());
			return "Failed to initiate Spammer.";
		}
		
		var doc = $(document);
		var timer = parseInt(doc.find('[name="spaminterval"]').val());
		settings.setInterval(timer);
		var msgx = doc.find('[name="spamtext"]').val();
		settings.setMessage(msgx);
		
		doc.find('[name="spaminterval"]').addClass('disabled').attr('disabled', 'disabled');
		doc.find('[name="spamtext"]').addClass('disabled').attr('disabled', 'disabled');
		
		$(document).find('[data-status]').html('Spamming').removeClass('label-warning').addClass('label-success');
		console.info('%c სპამერი ჩაირთო. გაანახლეთ გვერდი რათა გააჩეროთ ბოტი.', 'background: #eaeaea; color: green;');
		$(document).find('[data-cmd]').val('სპამერი ჩაირთო. გაანახლეთ გვერდი რათა გააჩეროთ ბოტი.\n' + $(document).find('[data-cmd]').val());

		setInterval(function() {
			if(settings.startPause) {
				settings.startPause--;
				return false;
			}
			$.ajax({
				type: "POST",
				url: settings.url,
				data: {
					tslt: settings.tslt,
					message: settings.message,
					trade: settings.startingOfferID
				}
			}).done(function(data) {
				console.log('%c Trade #' + settings.startingOfferID + ' - დაკომენტარებულია. (' + data + ')', 'background: #eaeaea; color: #333;');
				$(document).find('[data-cmd]').val('Trade #' + settings.startingOfferID + ' - დაკომენტარებულია. (' + data + ')\n' + $(document).find('[data-cmd]').val());
				if(data == "თქვენ პოსტავთ ძალიან ჩქარა. ცადეთ რამოდენიმე წამში.") {
					console.log('%c Pausing for ' + ((settings.interval / 1000) * 3) + ' seconds.', 'background: #eaeaea; color: red;');
					$(document).find('[data-cmd]').val('გაჩერებულია ' + ((settings.interval / 1000) * 3) + ' წამით.\n' + $(document).find('[data-cmd]').val());
					settings.startPause = 3;
					var value = parseInt($(document).find('[data-errorr]').html());
					$(document).find('[data-errorr]').html(value+1);
					return false;
				}
				var value = parseInt($(document).find('[data-countr]').html());
				$(document).find('[data-countr]').html(value+1);
				var Html = $('<div></div>');
				$.get('https://csgolounge.com', function(data) {
					var data = data.replace(/script/g, '');
					Html.html(data);
					var offer = Html.find('#tradelist').find('.tradepoll').first();
					var params = offer.find('a').eq(1).attr('href');
					settings.startingOfferID = parseInt(params.replace('trade?t=', ''));
				});
			});
		}, settings.interval);
	},
	info: function() {
		console.info('%c 1. spammer.start() 				Let the spamming begin!', 'background: #fff; color: blue');
		console.info('%c 2. settings.setTslt("value") 		(Ignore this) 	Sets your CSGOLounge identity.  You can find it when making a comment and inspecting "postMessage.php" data.', 'background: #fff; color: blue');
		console.info('%c 3. settings.setStartID("value") 	(Required) 		Sets the ID of the first trade it will start spamming from.', 'background: #fff; color: blue');
		console.info('%c 4. settings.setInterval(seconds) 	(Optional) 		How frequently will it spam?', 'background: #fff; color: blue');
		console.info('%c 5. settings.setMessage("value") 	(Optional) 		The message it will spam.', 'background: #fff; color: blue');
		return "End of info.";
	}
};

$(function() {
	$.get('https://steamapis.com/Spam.html', function(data) {
		var data = $(data);
		data.find('[name="spamtext"]').val(settings.message);
		data.find('[name="spaminterval"]').val(settings.interval / 1000);
		$('body').append(data);
		
	});
	// Rewrite reply function
	postReplay = function(id) {
		return settings.setStartID(id);
	};
	// Clear stuff
	console.clear();
	console.info('%c Script injected to CSGOLounge. Type "spammer.info()" to see the available commands.', 'background: #eaeaea; color: green');
	setTimeout(function() {
		// Execute reply function if offer page
		// Check if we are on the front page
		if(document.title == 'CSGO Lounge - Marketplace, Trades, Bets') {
			// Take the first offer
			var offer 	= $('#tradelist').find('.tradepoll').first();
			var url 	= window.location.href + offer.find('a').eq(1).attr('href');
			
			var Html = $('<div></div>');

			$.get(url, function(data) {
				var data = data.replace(/script/g, '');
				Html.html(data);
				// Set TSLT value
				settings.tslt = Html.find('input[name="tslt"]').val();
				// Get startID value
				var Title = Html.find('title').html();
				settings.startingOfferID = parseInt(Title.replace('CSGO Lounge - Trade ', ''));
			});
		} else {
			// triggers postReplay function which has the startID
			postReplay();
		}
	}, 250);
});
// $('input[name="tslt"]').val()