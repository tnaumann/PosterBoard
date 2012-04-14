/*Skeleton scripts*/
var height;
var width;

$(function() {
	$("#randomViewButton").colorbox({inline:true, width:"50%"});

	height = $(window).height();
	width = $(window).width();

	setupAddDialog();
	// setupFocusedPosterDialog();
	setupPosterClick();
	setupAddButton();
	setupViewSwitcherButtons();
	setupSimilarView();

});
function setupFocusedPosterDialog() {
	var focusedPosterWidth = width * 0.4;
	var focusedPosterHeight = height - 100;
	var focusedPosterLPosition = (width - focusedPosterWidth) / 2;

	$("#focusedPoster").dialog({
		autoOpen : false,
		modal : false,
		position : [focusedPosterLPosition, 10],
		maxWidth : width,
		maxHeight : height,
		modal : true
	});
}

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
		$("#similarViewContainer").hide("slide");
		$("#calendarViewContainer").show("slide");
	});
	$("#similarViewButton").click(function() {
		$("#calendarViewContainer").hide("slide");
		$("#similarViewContainer").show("slide");
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
		$("#focusedPoster").empty();
		fullPoster.appendTo("#focusedPoster");
		// console.log('fullPoster.width(): ' + fullPoster.width());
		// colorboxLeft = (width - fullPoster.width()) / 2;
		// colorboxTop = (height - fullPoster.height()) / 2;

		$.colorbox({
			inline : true,
			maxWidth: '50%',
			href : '#focusedPoster',
			onClosed : function() {
				$("#focusedPoster").empty();
			}
		});
		$.colorbox.resize();
		// $("#focusedPoster").dialog("open");
		// // $("#focusedPoster").css('minWidth', fullPoster.width());
		// // $("#focusedPoster").css('maxWidth', fullPoster.width());
		// // $("#focusedPoster").css('minHeight', fullPoster.height());
		// // $("#focusedPoster").css('maxHeight', fullPoster.height());
		// $("#focusedPoster").dialog("option", {minWidth: fullPoster.width(), maxWidth: fullPoster.width()});
		// console.log('fullPoster.width(): ' + fullPoster.width());
	});
}

/*Calendar view scripts*/

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
	console.log('Offset: ' + offset);
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