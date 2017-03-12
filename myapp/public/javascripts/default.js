var currentProgram = "";
var editor

/**
 * Opens the navigation drawer.
 */
function openNav() {
	console.log('open');
   	document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("backgroundContainer").style.marginLeft = "250px";
	console.log('open');
}

/**
 * Closes the navigation drawer.
 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("backgroundContainer").style.marginLeft = "0";
}