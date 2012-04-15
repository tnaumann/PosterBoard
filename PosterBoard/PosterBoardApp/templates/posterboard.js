/*Skeleton scripts*/
var height;
var width;
var drawing;
var startX;
var startY;

$(function() {
	height = $(window).height();
	width = $(window).width();

	setupAddDialog();
	setupPosterClick();
	setupAddButton();
	setupViewSwitcherButtons();
	setupSimilarView();
	setupCalendarView();

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

	$("#posterDatePicker").datepicker();

	$("#rightCalendarPanel img").click(function() {
		$("#panelTable").hide("slide", {
			direction : 'left'
		});
		$("#panelTable").show("slide", {
			direction : 'right'
		});
	});

	$("#leftCalendarPanel img").click(function() {
		$("#panelTable").hide("slide", {
			direction : 'right'
		});
		$("#panelTable").show("slide", {
			direction : 'left'
		});
	});
});
function setupAddDialog() {
	var addContainerWidth = width * 0.4;
	var addContainerHeight = height - 100;
	var addContainerLPosition = (0.6 * width) - 20;

	$("#addContainer").dialog({
		autoOpen : false,
		modal : false,
		position : [addContainerLPosition, 10],
		minHeight : addContainerHeight,
		minWidth : addContainerWidth
	});
}

function setupAddButton() {
	$("#addButton").click(function() {
		$("#addContainer").dialog("open");
	});
}

function setupViewSwitcherButtons() {

	$("#calendarViewButton").click(function() {
		if(!$("#calendarViewButton").hasClass('activeView')) {
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

function setupPosterClick() {
	//Setting up click events
	$(".thumbnail").click(function() {
		console.log("Thumbnail clicked: " + $(this).attr('src'));
		fullPoster = $(this).clone();
		fullPoster.css('maxWidth', width * 0.8);
		fullPoster.css('maxHeight', height * 0.8);
		fullPoster.css('top', 0);
		fullPoster.css('left', 0);
		fullPoster.css('margin', 0);
		fullPoster.removeClass('thumbnail');
		fullPoster.css('position', '');
		$("#focusedPosterImage").empty();
		fullPoster.appendTo("#focusedPosterImage");

		$.colorbox({
			inline : true,
			maxWidth : '50%',
			href : '#focusedPoster',
			onClosed : function() {
				$("#focusedPosterImage").empty();
				$('#canvasContainer').empty();
				drawing = false;
			},
			onComplete : function() {
				var offset = $('#focusedPosterImage img').offset();
				console.log('Offset x: ' + offset.left + ' Offset y: ' + offset.top);
				console.log('Width: ' + $('#focusedPosterImage img').width() + ' Height: ' + $('#focusedPosterImage img').height());

				$('#canvasContainer').css('min-width', $('#focusedPosterImage img').width());
				$('#canvasContainer').css('max-width', $('#focusedPosterImage img').width());
				$('#canvasContainer').css('min-height', $('#focusedPosterImage img').height());
				$('#canvasContainer').css('max-height', $('#focusedPosterImage img').height());

				var paper = Raphael('canvasContainer');
				$('#canvasContainer').mousedown(function(event) {
					startX = event.offsetX;
					startY = event.offsetY;
					drawing = true;
				});
				$('#canvasContainer').mousemove(function(event) {
					if(drawing) {
						var scribble = paper.path('M' + startX + ',' + startY +'L' + event.offsetX + ',' + event.offsetY);
						startX = event.offsetX;
						startY = event.offsetY;
						scribble.attr("stroke", "#fff");
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
	});
	for( i = 0; i < tags.length; i++) {
		var cluster = clusters[tags[i]];
		clusterLabel = $("<div class='clusterLabel'>" + tags[i] + "</div>");
		clusterLabel.css('top', cluster.minTop);
		clusterLabel.css('left', cluster.xCenter - maxImageWidth / 2);
		clusterLabel.appendTo("#clusteredImages");
	}
}

function getRandOffset(range) {
	offset = Math.random() * range - range / 2;
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
			elementTag = elementTag.trim();

			if(tags.indexOf(elementTag) == -1) {
				tags.push(elementTag);
			}
		}
	});
	return tags;
}

/*Add poster scripts*/