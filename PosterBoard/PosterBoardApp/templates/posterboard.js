/*Skeleton scripts*/
$(function() {
	setupAddDialog();
	setupAddButton();
	setupViewSwitcherButtons();
});

function setupAddDialog(){
	var height = $(window).height();
	var width = $(window).width();

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

function setupAddButton(){
	$("#addButton").click(function() {
		$("#addContainer").dialog("open");
	});
}

function setupViewSwitcherButtons(){
	$("#calendarViewButton").click(function(){
		$("#similarViewContainer").hide("slide");
		$("#calendarViewContainer").show("slide");
	});
	$("#similarViewButton").click(function(){
		$("#calendarViewContainer").hide("slide");
		$("#similarViewContainer").show("slide");
	});
}

/*Calendar view scripts*/

/*Similar events scripts */

/*Add poster scripts*/