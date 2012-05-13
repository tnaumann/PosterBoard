/*Skeleton scripts*/
var height;
var width;
var drawing;
var startX;
var startY;
var paper;
var days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
var months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
var rev_months = {
	January : 0,
	February : 1,
	March : 2,
	April : 3,
	May : 4,
	June : 5,
	July : 6,
	August : 7,
	September : 8,
	October : 9,
	November : 10,
	December : 11
}
var scribbleStrokes = [];
var annoId = '';
var drawingId;
var focusedImageUid;
var focusedImageSrc;
var strokeWidth = 3;
var liked = false;
var disliked = false;
var dismissMessageTimeout = 3000;

$(function() {
	height = $(window).height();
	width = $(window).width();

	setupWebSocket();
	setupAddDialog();
	setupPosterClick();
	setupAddButton();
	setupViewSwitcherButtons();
	setupSimilarView();
	setupCalendarView();
	setupSaveAnnoButton();
	setupResetAnnoButton();
	setupLikesButton();
	setupEmailToCalendar();
	setupSimulateRfid();
	setupDeletePoster();

	$("#viewSwitcherContainer a").mousedown(function() {
		$(this).addClass('buttonDown');
	}).mouseup(function() {
		$(this).removeClass('buttonDown');
	});

	$("#rightCalendarPanel img, #leftCalendarPanel img").mousedown(function() {
		$(this).addClass('arrowClick');
	}).mouseup(function() {
		$(this).removeClass('arrowClick');
	});

	$("#posterDatePicker").datepicker({
		onSelect : function() {
			setupCalendar(0, false);
		}
	});
	setupCalendar(0, false);

	$("#rightCalendarPanel img").click(function() {
		setupCalendar(7, true);
	});

	$("#leftCalendarPanel img").click(function() {
		setupCalendar(-7, true);
	});

	$("#focusedPosterInteraction img").mousedown(function() {
		$(this).css('opacity', 0.3);
	}).mouseup(function() {
		$(this).css('opacity', 1);
	});

	$(".clusterLabel").mousedown(function() {
		$(this).css('opacity', 0.3);
	}).mouseup(function() {
		$(this).css('opacity', '');
	});

	$('#colorPickerContainer').click(function() {
		console.log('Triggering change event on colorpicker');
		$('#colorPicker').focus();
		console.log('After triggering change event on colorpicker');
	});

	$('#exitSingleClusterView').click(function() {
		$('#singleClusterImages').empty();
		$('#singleClusterView').hide('slide');
		$('#clusteredImages').show('slide');
	});
	// $("#addPosterButton").click(function(){
	// $("#addButton").click();
	// alert("Poster added successfully");
	// })

	$("#addPosterButton").click(function(e) {

		$("#id_event_date").val($("#addDateStart").val() + " 00:00:00");
		if($("#addTimeStart").val().split(" ")[1] == "am") {
			$("#id_start_time").val($("#addTimeStart").val().split(" ")[0] + ":00");
		} else {
			$("#id_start_time").val(parseInt($("#addTimeStart").val().split(" ")[0].split(":")[0]) + 12 + ":" + $("#addTimeStart").val().split(" ")[0].split(":")[1] + ":00");
		}
		if($("#addTimeEnd").val().split(" ")[1] == "am") {
			$("#id_end_time").val($("#addTimeEnd").val().split(" ")[0] + ":00");
		} else {
			$("#id_end_time").val(parseInt($("#addTimeEnd").val().split(" ")[0].split(":")[0]) + 12 + ":" + $("#addTimeEnd").val().split(" ")[0].split(":")[1] + ":00");
		}
		$("#id_email").val($("#posterEmail").val());
		var str = "" + $("#select_mult").val();
		for(var k = 0; k < str.split(",").length; k++) {
			$("#id_tag" + (k + 1)).val(str.split(",")[k]);
		}
		var pform = $("#upload_form");
		$("#posterdummy").load("/PosterBoardApp/upload/", pform.serializeArray(), function(e) {
			for(var k = 1; k < 8; k++) {
				$(e).appendTo($("#posterCol" + k));
				var poster_id = $('div[id*="temp "]').attr("id");
				poster_id = poster_id.split(" ")[1];
				$('div[id*="temp "]').attr("id", "poster" + k + "-" + poster_id);
			}
			$(e).appendTo($("#originalImages"));
			setupCalendar(0, false);
			setupCalendarView();
			setupSimilarView();
			setupPosterClick();
		});
	});
});
function setupSimulateRfid() {
	$('body').keypress(function(event) {
		console.log('keypressed: ' + event.which);
		if(event.which == 114) {
			$('#rfidinput').val('cezeozue@mit.edu').change();
		}
	})
}

function setupEmailToCalendar() {
	$('#swipeCardMessage').dialog({
		modal : true,
		autoOpen : false,
		zIndex : 99999,
		resizable : false,
		buttons : {
			Cancel : function() {
				$(this).dialog("close");
			}
		},
	});
	$('#emailSentMessage').dialog({
		modal : true,
		autoOpen : false,
		zIndex : 99999,
		resizable : false,
		hide : 'fade',
		buttons : {
			Close : function() {
				$(this).dialog("close");
			}
		},
	});
	$('#saveToMyCalendar').click(function() {
		$('#rfidinput').val('');
		$('#swipeCardMessage').dialog('open');

		$('#rfidinput').bind('change.sendEmail', function() {
			$('#rfidinput').unbind('change.sendEmail');
			console.log('received rfid input');
			$('#swipeCardMessage').dialog('close');
			$('#emailSentMessage').dialog('open');
			setInterval("$('#emailSentMessage').dialog('close');", dismissMessageTimeout);
		});
	});
}

function setupDeletePoster() {
	$('#deleteConfirmation').dialog({
		modal : true,
		autoOpen : false,
		zIndex : 99999,
		resizable : false,
		buttons : {
			Cancel : function() {
				$(this).dialog("close");
			}
		},
	});
	$('#deleteResult').dialog({
		modal : true,
		autoOpen : false,
		zIndex : 99999,
		resizable : false,
		hide : 'fade',
		buttons : {
			Close : function() {
				$(this).dialog("close");
			}
		},
	});
	$('#deleteButton').click(function() {
		$('#rfidinput').val('');
		$('#deleteConfirmation').dialog('open');

		$('#rfidinput').bind('change.delete', function() {
			$('#rfidinput').unbind('change.delete');
			console.log('received rfid input');
			$('#deleteConfirmation').dialog('close');
			$('#deleteResult img').show();
			$('#deleteResult span').html('Deleting poster');
			$('#deleteResult').dialog('open');
			var rfidinput = $('#rfidinput').val();
			$.get('deletePoster', {
				poster : focusedImageUid,
				email : rfidinput,
			}, function(data) {
				$('#deleteResult img').hide();
				$('#deleteResult span').html(data);
				setInterval("$('#deleteResult').dialog('close');", dismissMessageTimeout);
				$('[data-uid="' + focusedImageUid + '"]').remove();
				$.colorbox.close()
			})
		});
	});
}

function setupWebSocket() {
	var ws = new WebSocket("ws://localhost:9876/");
	ws.onopen = function(e) {
		console.log("opened");
	};
	ws.onclose = function(e) {
		console.log("closed");
	};
	ws.onmessage = function(e) {
		console.log("got: " + e.data);
		$("input.addAuth").val(e.data);
	};
}

function setupLikesButton() {
	$('#likes, #dislikes').click(function() {
		var clicked = $(this);
		var other = clicked.attr('id') == 'likes' ? $('#dislikes') : $('#likes');
		var clickedBool = clicked.attr('id') == 'likes' ? 'liked' : 'disliked';
		var otherBool = clicked.attr('id') == 'likes' ? 'disliked' : 'liked';

		if(!eval(clickedBool)) {
			if(eval(otherBool)) {
				var otherCount = parseInt(other.html());
				other.html(otherCount - 1);
				eval(otherBool + '=false');
			}

			var clickedCount = parseInt(clicked.html());
			clicked.html(clickedCount + 1);
		} else {
			var clickedCount = parseInt(clicked.html());
			console.log('clickedCount: ' + clickedCount);
			clicked.html(clickedCount - 1);
		}
		eval(clickedBool + '=!' + clickedBool);

		updateLikesView();
		updateLikesModel();
	});
}

function updateLikesView() {
	if(liked) {
		console.log('About to set likes image to clicked: ' + $('#likes').parent().css('background-image'));
		$('#likes').parent().css('background-image', 'url(/static/images/thumbsup-clicked.jpg)');
		console.log('Set likes image to clicked');
	} else {
		$('#likes').parent().css('background-image', 'url(/static/images/thumbsup.jpg)');
	}

	if(disliked) {
		$('#dislikes').parent().css('background-image', 'url(/static/images/thumbsdown-clicked.jpg)');
	} else {
		$('#dislikes').parent().css('background-image', 'url(/static/images/thumbsdown.jpg)');
	}
}

function updateLikesModel() {
	var likes = $('#likes').html();
	var dislikes = $('#dislikes').html();

	$.get('updateLikes', {
		likes : likes,
		dislikes : dislikes,
		poster : focusedImageUid,
	});
}

function displayAnnoScroller() {
	$("#tS3").thumbnailScroller({
		scrollerType : "clickButtons",
		scrollerOrientation : "vertical",
		scrollSpeed : 2,
		scrollEasing : "easeOutCirc",
		scrollEasingAmount : 800,
		acceleration : 4,
		scrollSpeed : 800,
		noScrollCenterSpace : 10,
		autoScrolling : 0,
		autoScrollingSpeed : 2000,
		autoScrollingEasing : "easeInOutQuad",
		autoScrollingDelay : 500
	});

	$('#ts3 a.oldSketch').click(function() {
		console.log('Old sketch clicked');
		$('#saveAnnoButton').click();
		$('#resetAnnoButton').click();

		$('#saveAnnoButton').show();
		$('#resetAnnoButton').show();

		var path = $(this).data('path');
		console.log('path: ' + path);

		var focusedPosterWidth = $('#focusedPosterImage img').width();
		var focusedPosterHeight = $('#focusedPosterImage img').height();

		for( j = 0; j < path.length; j++) {
			var pathElement = path[j].split(',');
			var startX = parseFloat(pathElement[0]) * focusedPosterWidth;
			var startY = parseFloat(pathElement[1]) * focusedPosterHeight;
			var endX = parseFloat(pathElement[2]) * focusedPosterWidth;
			var endY = parseFloat(pathElement[3]) * focusedPosterHeight;

			var stroke = paper.path('M' + startX + ',' + startY + 'L' + endX + ',' + endY);
			stroke.attr('stroke', pathElement[4]);
			stroke.attr('stroke-width', strokeWidth);

			var scribbleStroke = new ScribbleStroke(startX / focusedPosterWidth, startY / focusedPosterHeight, endX / focusedPosterWidth, endY / focusedPosterHeight, pathElement[4]);
			scribbleStrokes.push(scribbleStroke);
		}
	});
}

function setupSaveAnnoButton() {
	$('#saveAnnoButton').click(function() {
		if(scribbleStrokes.length == 0) {
			return;
		}

		$('#saveAnnoButton').attr('src', '/static/images/saveAnno-saved.jpg');

		$.post('/PosterBoardApp/saveAnno', {
			path : JSON.stringify(scribbleStrokes),
			annoId : annoId,
			drawingId : drawingId,
			poster : focusedImageUid,
		}, function(data, textStatus, jqXHR) {
			var response = $.parseJSON(data);
			if(drawingId == response.drawingId) {
				annoId = response.annoId;
			}
		});
		scribbleStrokes = [];
	});
}

function setupResetAnnoButton() {
	$('#resetAnnoButton').click(function() {
		paper.remove();
		paper = Raphael('canvasContainer');
		scribbleStrokes = [];
		annoId = '';
		drawingId = Math.random();
	});
}

function setupCalendar(diff, set) {
	$(".poster-div").css('display', 'block');
	var today = $("#posterDatePicker").datepicker("getDate");
	today = new Date(today.getTime() + (24 * 60 * 60 * 1000) * diff);
	if(set) {
		$("#posterDatePicker").datepicker("setDate", today);
	}
	for(var j = 0; j < 7; j = j + 1) {
		if(today.getDay() == 0) {
			break;
		} else {
			today = new Date(today.getTime() - (24 * 60 * 60 * 1000));
		}
	}

	var i = 0;
	for( i = 1; i < 8; i = i + 1) {
		var curr_date = today.getDate();
		var curr_day = today.getDay();
		var curr_month = today.getMonth();
		$("#day" + i).html("&nbsp;" + curr_date);
		$("#wday" + i).html(days[curr_day]);
		$("#month" + i).html(months[curr_month]);
		var today_date = new Date(today.getFullYear(), curr_month, curr_date);
		var col = "poster" + i
		$('div[id*="' + col + '-"]').each(function() {
			var temp = $(this).attr('event_date');
			var month = temp.split(" ")[1]
			var date = temp.split(" ")[2]
			var year = temp.split(" ")[0]
			if((today.getFullYear() != parseInt(year)) || (parseInt(date) != curr_date) || (month - 1 != curr_month)) {
				$(this).css('display', 'none');
			}
		});
		today = new Date(today.getTime() + (24 * 60 * 60 * 1000));
	}
}

function setupAddDialog() {
	$(".chosen-select").chosen();
	//$("#addDateStart, #addTimeStart, #addDateEnd, #addTimeEnd").calendricalDateTimeRange();
	$("#addDateStart").calendricalDate({
		usa : true
	});
	$("#addTimeStart, #addTimeEnd").calendricalTimeRange();
}

function setupAddButton() {
	$("#addButton").click(function() {
		$(this).toggleClass("adding");
		if($(this).hasClass("adding")) {
			$(this).text("x");
			$("#board").animate({
				width : "70%"
			}, "slow");
			$("#addContainer").animate({
				width : "30%"
			}, "slow");
		} else {
			$(this).text("+");
			$("#board").animate({
				width : "100%"
			}, "slow");
			$("#addContainer").animate({
				width : "0%"
			}, "slow");

		}
	});
}

function setupViewSwitcherButtons() {

	$("#calendarViewButton").click(function() {
		if(!$("#calendarViewButton").hasClass('activeView')) {
			$('#exitSingleClusterView').click();
			$("#viewSwitcherContainer a").removeClass('activeView');
			$("#calendarViewButton").addClass('activeView');
			$("#similarViewContainer").hide("slide");
			$("#calendarViewContainer").show("slide");
		}
	});

	$("#similarViewButton").click(function() {
		if(!$("#similarViewButton").hasClass('activeView')) {
			$("#viewSwitcherContainer a").removeClass('activeView');
			$("#similarViewButton").addClass('activeView');
			$("#calendarViewContainer").hide("slide");
			$("#similarViewContainer").show("slide");
		}
	});
}

function getLikes() {
	$.getJSON('/PosterBoardApp/getLikes', {
		poster : focusedImageUid,
	}, function(data) {
		console.log('Likes: ' + data.likes + ', ' + data.dislikes);
		$('#likes').html(data.likes);
		$('#dislikes').html(data.dislikes);

	});
	liked = false;
	disliked = false;
	updateLikesView();
}

function setupPosterClick() {
	//Setting up click events
	$(".thumbnail").click(function() {
		console.log("Thumbnail clicked: " + $(this).attr('src'));
		fullPoster = $(this).clone();
		focusedImageUid = fullPoster.attr('data-uid');

		getLikes();

		console.log('fullPoster max dimensions: ' + width + ', ' + height);
		fullPoster.css('maxWidth', width * 0.8);
		fullPoster.css('maxHeight', height * 0.8);		
		fullPoster.css('margin', 0);
		fullPoster.removeClass('thumbnail');
		fullPoster.css('position', '');
		$("#focusedPosterImage").empty();
		fullPoster.appendTo("#focusedPosterImage");
		console.log('Width: ' + $('#focusedPosterImage img').width() + ' From jQuery obj: ' + fullPoster.width());
		var clickedImageWidth = $(this).width();
		var clickedImageHeight = $(this).height();
		focusedImageSrc = $(this).attr('src');

		$.getJSON('/PosterBoardApp/getAnno', {
			poster : focusedImageUid,
		}, function(data) {
			console.log("Number of path objects: " + data.length);

			for( i = 0; i < data.length; i++) {
				var cloneAnchor = $("<a href='#' class='oldSketch'></a>");
				cloneAnchor.appendTo(".jTscroller");
				cloneAnchor.attr('id', 'oldSketch' + i);

				var thumbnailScale = getThumbnailScale(clickedImageWidth, clickedImageHeight, 100, 200);
				var thumbnailWidth = clickedImageWidth * thumbnailScale;
				var thumbnailHeight = clickedImageHeight * thumbnailScale;
				console.log('Thumbnail dimensions: ' + thumbnailWidth + ' x ' + thumbnailHeight);
				var thumbnailCanvas = Raphael('oldSketch' + i, thumbnailWidth, thumbnailHeight);
				thumbnailCanvas.image(focusedImageSrc, 0, 0, thumbnailWidth, thumbnailHeight);

				var path = data[i].path;
				cloneAnchor.data('path', path);
				for( j = 0; j < path.length; j++) {
					var pathElement = path[j].split(',');
					var startX = parseFloat(pathElement[0]) * thumbnailWidth;
					var startY = parseFloat(pathElement[1]) * thumbnailHeight;
					var endX = parseFloat(pathElement[2]) * thumbnailWidth;
					var endY = parseFloat(pathElement[3]) * thumbnailHeight;

					var stroke = thumbnailCanvas.path('M' + startX + ',' + startY + 'L' + endX + ',' + endY);
					stroke.attr('stroke', pathElement[4]);
					stroke.attr('stroke-width', strokeWidth);
				}
			}
			displayAnnoScroller();

		});
		drawingId = Math.random();
		console.log('Image object: ' + $('#focusedPosterImage img'));

		$.colorbox({
			inline : true,
			maxWidth : '100%',
			href : '#focusedPoster',
			onClosed : function() {
				$("#focusedPosterImage").empty();
				$('#saveAnnoButton').hide();
				$('#resetAnnoButton').hide();
				$('#canvasContainer').empty();

				$(".jTscroller").css('top', '0px');
				$(".jTscroller").empty();
				scribbleStrokes = [];
				drawing = false;
				drawingId = '';
				annoId = '';
				paper.remove();
			},
			onComplete : function() {
				displayAnnoScroller();

				var offset = $('#focusedPosterImage img').offset();
				console.log('Offset x: ' + offset.left + ' Offset y: ' + offset.top);
				console.log('Width: ' + $('#focusedPosterImage img').width() + ' From jQuery obj: ' + fullPoster.width());

				// var newWidth = $('#focusedPoster').width() + 10;
				// $.colorbox({
				// width: newWidth
				// });

				$('#canvasContainer').css('min-width', $('#focusedPosterImage img').width());
				$('#canvasContainer').css('max-width', $('#focusedPosterImage img').width());
				$('#canvasContainer').css('min-height', $('#focusedPosterImage img').height());
				$('#canvasContainer').css('max-height', $('#focusedPosterImage img').height());
				// fullPoster.css('position', 'absolute');
				paper = Raphael('canvasContainer');
				$('#canvasContainer').mousedown(function(event) {
					startX = event.offsetX;
					startY = event.offsetY;
					drawing = true;
					$('#saveAnnoButton').show();
					$('#resetAnnoButton').show();
					$('#saveAnnoButton').attr('src', '/static/images/saveAnno-unsaved.jpg');
				});
				$('#canvasContainer').mousemove(function(event) {
					if(drawing) {
						var strokeColor = rgb2hex($('#colorPicker').css('background-color'));

						var endX = Math.min(Math.max(0, event.offsetX), $('#canvasContainer').width());
						var endY = Math.min(Math.max(0, event.offsetY), $('#canvasContainer').height());

						var scribble = paper.path('M' + startX + ',' + startY + 'L' + endX + ',' + endY);
						scribble.attr("stroke", strokeColor);
						scribble.attr("stroke-width", strokeWidth);

						// Save scribble stroke
						var canvasWidth = $("#canvasContainer").width();
						var canvasHeight = $("#canvasContainer").height();
						var scribbleStroke = new ScribbleStroke(startX / canvasWidth, startY / canvasHeight, endX / canvasWidth, endY / canvasHeight, strokeColor);
						scribbleStrokes.push(scribbleStroke);
						startX = endX;
						startY = endY;
					}
				});
				$('#canvasContainer').mouseup(function(event) {
					drawing = false;
				});
			}
		});
		// $.colorbox.resize();

	});
}

var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

//Function to convert hex format to a rgb color
function rgb2hex(rgb) {
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
	return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

function getThumbnailScale(width, height, maxWidth, maxHeight) {
	xScale = maxWidth / width;
	yScale = maxHeight / height;

	return Math.min(xScale, yScale);
}

function ScribbleStroke(startX, startY, endX, endY, color) {
	this.startX = startX;
	this.startY = startY;
	this.endX = endX;
	this.endY = endY;
	this.color = color;
}

/*Calendar view scripts*/
function setupCalendarView() {
	//Clustering
	var containerHeight = height * 0.8;
	var containerWidth = width * 0.8;

	var maxImageHeight = containerHeight / 4;
	var maxImageWidth = containerWidth / 10;

	$("#calendarViewContainer img").css("maxHeight", maxImageHeight);
	$("#calendarViewContainer img").css("maxWidth", maxImageWidth);
	$("#calendarViewContainer .datePosterCol").css("width", maxImageWidth + 10);
}

/*Similar events scripts */

var clusters = new Array();

function setupSimilarView() {
	//Clustering
	Math.seedrandom('PosterBoard');

	var containerHeight = height * 0.8;
	var containerWidth = width * 0.8;

	var maxImageHeight = containerHeight / 4;
	var maxImageWidth = containerWidth / 10;

	$("#clusteredImages").empty();

	console.log("maxHeight: " + rowHeight);
	$("#similarViewContainer img").css("maxHeight", maxImageHeight);
	$("#similarViewContainer img").css("maxWidth", maxImageWidth);
	tags = getUniqueTags();
	console.log("There are " + tags.length + " unique tags");

	var numClusters = tags.length;
	var numRows = Math.floor(Math.sqrt(numClusters));
	var numCols = Math.ceil(numClusters / numRows);
	var rowHeight = containerHeight / numRows;
	var colWidth = containerWidth / numCols;
	var offsetRange = Math.min(rowHeight, colWidth) / 2;
	console.log('numCols: ' + numCols);
	console.log('numRows: ' + numRows);

	for( i = 0; i < tags.length; i++) {
		var cluster = new Cluster(tags[i]);
		cluster.yPosIndex = Math.floor(i / numCols);
		cluster.xPosIndex = i % numCols;
		cluster.xCenter = colWidth / 2 + cluster.xPosIndex * colWidth;
		cluster.yCenter = rowHeight / 2 + cluster.yPosIndex * rowHeight;
		clusters[tags[i]] = cluster;
	}

	$("#similarViewContainer img").each(function(index, element) {
		elementTags = $(element).attr('data-tags');
		elementTags = elementTags.split(',');

		for( i = 0; i < elementTags.length; i++) {
			elementTag = elementTags[i];
			if(elementTag && elementTag.trim() != "") {
				elementTag = elementTag.trim();
				cluster = clusters[elementTag];
				elementCopy = $(element).clone(true);
				elementCopy.appendTo('#clusteredImages');
				elementCopy.css('position', 'absolute');
				elementTop = cluster.yCenter + getRandOffset(offsetRange) - maxImageHeight / 2;
				elementLeft = cluster.xCenter + getRandOffset(offsetRange) - maxImageWidth / 2;
				elementCopy.css('top', elementTop);
				elementCopy.css('left', elementLeft);

				cluster.minTop = Math.min(cluster.minTop, elementTop);
			}
		}
	});
	for( i = 0; i < tags.length; i++) {
		var cluster = clusters[tags[i]];
		clusterLabel = $("<div class='clusterLabel'>" + tags[i] + "</div>");
		clusterLabel.appendTo("#clusteredImages");
		console.log('ClusterLabel height: ' + clusterLabel.height());
		clusterLabel.css('top', cluster.minTop - 30);
		clusterLabel.css('left', cluster.xCenter - maxImageWidth / 2);
	}

	$('.clusterLabel').click(function() {
		$('#clusteredImages').hide('slide');
		$('#singleClusterView').show('slide');
		var clickedCluster = $(this).html();
		$('#currentCluster').html(clickedCluster);
		$("#originalImages img").each(function(index, element) {
			elementTags = $(element).attr('data-tags');
			elementTags = elementTags.split(',');

			if(elementTags == clickedCluster || elementTags.contains(clickedCluster)) {
				elementCopy = $(element).clone(true);
				elementCopy.appendTo('#singleClusterImages');
			}
		});
	});
}

function getRandOffset(range) {
	var randomNumber = Math.random();
	console.log('Random number: ' + randomNumber);
	offset = randomNumber * range - range / 2;
	return offset;
}

function Cluster(tag) {
	this.tag = tag;
	this.minTop = 5000;
	// Some large number
}

function getUniqueTags() {
	tags = [];

	$("#similarViewContainer img").each(function(index, element) {
		elementTags = $(element).attr('data-tags');
		elementTags = elementTags.split(',');

		for( i = 0; i < elementTags.length; i++) {
			elementTag = elementTags[i];
			if(elementTag && elementTag.trim() != " ") {
				elementTag = elementTag.trim();

				if(tags.indexOf(elementTag) == -1) {
					tags.push(elementTag);
				}
			}
		}
	});
	return tags;
}

/*Add poster scripts*/
// common variables
var iBytesUploaded = 0;
var iBytesTotal = 0;
var iPreviousBytesLoaded = 0;
var iMaxFilesize = 1048576;
// 1MB
var oTimer = 0;
var sResultFileSize = '';

function secondsToTime(secs) {// we will use this function to convert seconds in normal time format
	var hr = Math.floor(secs / 3600);
	var min = Math.floor((secs - (hr * 3600)) / 60);
	var sec = Math.floor(secs - (hr * 3600) - (min * 60));

	if(hr < 10) {
		hr = "0" + hr;
	}
	if(min < 10) {
		min = "0" + min;
	}
	if(sec < 10) {
		sec = "0" + sec;
	}
	if(hr) {
		hr = "00";
	}
	return hr + ':' + min + ':' + sec;
};

function bytesToSize(bytes) {
	var sizes = ['Bytes', 'KB', 'MB'];
	if(bytes == 0)
		return 'n/a';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

function fileSelected() {

	// hide different warnings
	// document.getElementById('upload_response').style.display = 'none';
	// document.getElementById('error').style.display = 'none';
	// document.getElementById('error2').style.display = 'none';
	// document.getElementById('abort').style.display = 'none';
	// document.getElementById('warnsize').style.display = 'none';

	// get selected file element
	var oFile = document.getElementById('image_file').files[0];

	// filter for image files
	var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
	if(!rFilter.test(oFile.type)) {
		document.getElementById('error').style.display = 'block';
		return;
	}

	// little test for filesize
	if(oFile.size > iMaxFilesize) {
		document.getElementById('warnsize').style.display = 'block';
		return;
	}

	// get preview element
	var oImage = document.getElementById('preview');

	// prepare HTML5 FileReader
	var oReader = new FileReader();
	oReader.onload = function(e) {

		// e.target.result contains the DataURL which we will use as a source of the image
		oImage.src = e.target.result;

		oImage.onload = function() {// binding onload event

			// we are going to display some custom image information here
			sResultFileSize = bytesToSize(oFile.size);
			document.getElementById('fileinfo').style.display = 'block';
			document.getElementById('filename').innerHTML = 'Name: ' + oFile.name;
			document.getElementById('filesize').innerHTML = 'Size: ' + sResultFileSize;
			document.getElementById('filetype').innerHTML = 'Type: ' + oFile.type;
			document.getElementById('filedim').innerHTML = 'Dimension: ' + oImage.naturalWidth + ' x ' + oImage.naturalHeight;
		};
	};
	// read selected file as DataURL
	oReader.readAsDataURL(oFile);
}

function startUploading() {
	// cleanup all temp states
	iPreviousBytesLoaded = 0;
	document.getElementById('upload_response').style.display = 'none';
	document.getElementById('error').style.display = 'none';
	document.getElementById('error2').style.display = 'none';
	document.getElementById('abort').style.display = 'none';
	document.getElementById('warnsize').style.display = 'none';
	document.getElementById('progress_percent').innerHTML = '';
	var oProgress = document.getElementById('progress');
	oProgress.style.display = 'block';
	oProgress.style.width = '0px';

	// get form data for POSTing
	//var vFD = document.getElementById('upload_form').getFormData(); // for FF3
	var vFD = new FormData(document.getElementById('upload_form'));

	// create XMLHttpRequest object, adding few event listeners, and POSTing our data
	var oXHR = new XMLHttpRequest();
	oXHR.upload.addEventListener('progress', uploadProgress, false);
	oXHR.addEventListener('load', uploadFinish, false);
	oXHR.addEventListener('error', uploadError, false);
	oXHR.addEventListener('abort', uploadAbort, false);
	oXHR.open('POST', 'upload.php');
	oXHR.send(vFD);

	// set inner timer
	oTimer = setInterval(doInnerUpdates, 300);
}

function doInnerUpdates() {// we will use this function to display upload speed
	var iCB = iBytesUploaded;
	var iDiff = iCB - iPreviousBytesLoaded;

	// if nothing new loaded - exit
	if(iDiff == 0)
		return;
	iPreviousBytesLoaded = iCB;
	iDiff = iDiff * 2;
	var iBytesRem = iBytesTotal - iPreviousBytesLoaded;
	var secondsRemaining = iBytesRem / iDiff;

	// update speed info
	var iSpeed = iDiff.toString() + 'B/s';
	if(iDiff > 1024 * 1024) {
		iSpeed = (Math.round(iDiff * 100 / (1024 * 1024)) / 100).toString() + 'MB/s';
	} else if(iDiff > 1024) {
		iSpeed = (Math.round(iDiff * 100 / 1024) / 100).toString() + 'KB/s';
	}

	document.getElementById('speed').innerHTML = iSpeed;
	document.getElementById('remaining').innerHTML = '| ' + secondsToTime(secondsRemaining);
}

function uploadProgress(e) {// upload process in progress
	if(e.lengthComputable) {
		iBytesUploaded = e.loaded;
		iBytesTotal = e.total;
		var iPercentComplete = Math.round(e.loaded * 100 / e.total);
		var iBytesTransfered = bytesToSize(iBytesUploaded);

		document.getElementById('progress_percent').innerHTML = iPercentComplete.toString() + '%';
		document.getElementById('progress').style.width = (iPercentComplete * 4).toString() + 'px';
		document.getElementById('b_transfered').innerHTML = iBytesTransfered;
		if(iPercentComplete == 100) {
			var oUploadResponse = document.getElementById('upload_response');
			oUploadResponse.innerHTML = '<h1>Please wait...processing</h1>';
			oUploadResponse.style.display = 'block';
		}
	} else {
		document.getElementById('progress').innerHTML = 'unable to compute';
	}
}

function uploadFinish(e) {// upload successfully finished
	var oUploadResponse = document.getElementById('upload_response');
	oUploadResponse.innerHTML = e.target.responseText;
	oUploadResponse.style.display = 'block';

	document.getElementById('progress_percent').innerHTML = '100%';
	document.getElementById('progress').style.width = '400px';
	document.getElementById('filesize').innerHTML = sResultFileSize;
	document.getElementById('remaining').innerHTML = '| 00:00:00';

	clearInterval(oTimer);
}

function uploadError(e) {// upload error
	document.getElementById('error2').style.display = 'block';
	clearInterval(oTimer);
}

function uploadAbort(e) {// upload abort
	document.getElementById('abort').style.display = 'block';
	clearInterval(oTimer);
}