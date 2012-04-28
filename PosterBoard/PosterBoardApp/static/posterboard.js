/*Skeleton scripts*/
var height;
var width;
var drawing;
var startX;
var startY;
var paper;

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
	
	$("#addPosterButton").click(function(){
		$("#addButton").click();
		alert("Poster added successfully");
	})
});
function setupAddDialog() {
	var addContainerWidth = width * 0.4;
	var addContainerHeight = height * 0.83;
	var addContainerLPosition = (0.6 * width) - 20;

	$("#addContainer").dialog({
		autoOpen : false,
		modal : false,
		position : [addContainerLPosition, 10],
		minHeight : addContainerHeight,
		maxHeight : addContainerHeight,
		minWidth : addContainerWidth
	});
	
	$(".chosen-select").chosen();
	//$("#addDateStart, #addTimeStart, #addDateEnd, #addTimeEnd").calendricalDateTimeRange();
	$("#addDateStart").calendricalDate();
	$("#addTimeStart, #addTimeEnd").calendricalTimeRange();
}

function setupAddButton() {
	$("#addButton").click(function() {
		$(this).toggleClass("active");
		if ($(this).hasClass("active")) {
			$(this).text("x");
			$("#addContainer").dialog("open");
		} else {
			$(this).text("+");
			$("#addContainer").dialog("close");
		}
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
				paper.remove();
			},
			onComplete : function() {
				var offset = $('#focusedPosterImage img').offset();
				console.log('Offset x: ' + offset.left + ' Offset y: ' + offset.top);
				console.log('Width: ' + $('#focusedPosterImage img').width() + ' Height: ' + $('#focusedPosterImage img').height());

				$('#canvasContainer').css('min-width', $('#focusedPosterImage img').width());
				$('#canvasContainer').css('max-width', $('#focusedPosterImage img').width());
				$('#canvasContainer').css('min-height', $('#focusedPosterImage img').height());
				$('#canvasContainer').css('max-height', $('#focusedPosterImage img').height());

				paper = Raphael('canvasContainer');
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
// common variables
var iBytesUploaded = 0;
var iBytesTotal = 0;
var iPreviousBytesLoaded = 0;
var iMaxFilesize = 1048576; // 1MB
var oTimer = 0;
var sResultFileSize = '';

function secondsToTime(secs) { // we will use this function to convert seconds in normal time format
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600))/60);
    var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (hr < 10) {hr = "0" + hr; }
    if (min < 10) {min = "0" + min;}
    if (sec < 10) {sec = "0" + sec;}
    if (hr) {hr = "00";}
    return hr + ':' + min + ':' + sec;
};

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

function fileSelected() {

    // hide different warnings
    document.getElementById('upload_response').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';

    // get selected file element
    var oFile = document.getElementById('image_file').files[0];

    // filter for image files
    var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
    if (! rFilter.test(oFile.type)) {
        document.getElementById('error').style.display = 'block';
        return;
    }

    // little test for filesize
    if (oFile.size > iMaxFilesize) {
        document.getElementById('warnsize').style.display = 'block';
        return;
    }

    // get preview element
    var oImage = document.getElementById('preview');

    // prepare HTML5 FileReader
    var oReader = new FileReader();
        oReader.onload = function(e){

        // e.target.result contains the DataURL which we will use as a source of the image
        oImage.src = e.target.result;

        oImage.onload = function () { // binding onload event

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

function doInnerUpdates() { // we will use this function to display upload speed
    var iCB = iBytesUploaded;
    var iDiff = iCB - iPreviousBytesLoaded;

    // if nothing new loaded - exit
    if (iDiff == 0)
        return;

    iPreviousBytesLoaded = iCB;
    iDiff = iDiff * 2;
    var iBytesRem = iBytesTotal - iPreviousBytesLoaded;
    var secondsRemaining = iBytesRem / iDiff;

    // update speed info
    var iSpeed = iDiff.toString() + 'B/s';
    if (iDiff > 1024 * 1024) {
        iSpeed = (Math.round(iDiff * 100/(1024*1024))/100).toString() + 'MB/s';
    } else if (iDiff > 1024) {
        iSpeed =  (Math.round(iDiff * 100/1024)/100).toString() + 'KB/s';
    }

    document.getElementById('speed').innerHTML = iSpeed;
    document.getElementById('remaining').innerHTML = '| ' + secondsToTime(secondsRemaining);
}

function uploadProgress(e) { // upload process in progress
    if (e.lengthComputable) {
        iBytesUploaded = e.loaded;
        iBytesTotal = e.total;
        var iPercentComplete = Math.round(e.loaded * 100 / e.total);
        var iBytesTransfered = bytesToSize(iBytesUploaded);

        document.getElementById('progress_percent').innerHTML = iPercentComplete.toString() + '%';
        document.getElementById('progress').style.width = (iPercentComplete * 4).toString() + 'px';
        document.getElementById('b_transfered').innerHTML = iBytesTransfered;
        if (iPercentComplete == 100) {
            var oUploadResponse = document.getElementById('upload_response');
            oUploadResponse.innerHTML = '<h1>Please wait...processing</h1>';
            oUploadResponse.style.display = 'block';
        }
    } else {
        document.getElementById('progress').innerHTML = 'unable to compute';
    }
}

function uploadFinish(e) { // upload successfully finished
    var oUploadResponse = document.getElementById('upload_response');
    oUploadResponse.innerHTML = e.target.responseText;
    oUploadResponse.style.display = 'block';

    document.getElementById('progress_percent').innerHTML = '100%';
    document.getElementById('progress').style.width = '400px';
    document.getElementById('filesize').innerHTML = sResultFileSize;
    document.getElementById('remaining').innerHTML = '| 00:00:00';

    clearInterval(oTimer);
}

function uploadError(e) { // upload error
    document.getElementById('error2').style.display = 'block';
    clearInterval(oTimer);
}  

function uploadAbort(e) { // upload abort
    document.getElementById('abort').style.display = 'block';
    clearInterval(oTimer);
}
