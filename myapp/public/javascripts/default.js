
/**
 * Opens the navigation drawer.
 */
function openNav() {
	console.log('open');
   	document.getElementById("mySidenav").style.width = "250px";
	if (isFullscreen)
		$('#menu').hide();
    document.getElementById("backgroundContainer").style.marginLeft = "250px";
	console.log('open');
}

/**
 * Closes the navigation drawer.
 */
function closeNav() {
	$('#menu').show();
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("backgroundContainer").style.marginLeft = "0";
}

/**
 * Shows the list of programs when Program linked is clicked.
 */
function tester() {
	if(document.getElementById("programs").style.display == "none") {
		document.getElementById("programs").style.display = "inline";
	} else {
		document.getElementById("programs").style.display = "none";
	}	
}

/**
 * Directs the user to the main page.
 */
function homePage() {
	window.location.href = '/main?param1='+sessionStorage.getItem("token");
}

/**
 * Directs the user to the quiz page.
 */
function quizPage() {
	window.location.href = '/quiz?param1='+sessionStorage.getItem("token");
}

/**
 * Directs the user to the admin page.
 */
function adminPage() {
	window.location.href = '/admin?param1='+sessionStorage.getItem("token");
}

/**
 * Shows the list of instructor programs when the Intrsutor programs link is clicked.
 */
function showInstrPrograms() {
	if(document.getElementById("instrPrograms").style.display == "none") {
		document.getElementById("instrPrograms").style.display = "inline";
	} else {
		document.getElementById("instrPrograms").style.display = "none";
	}
}
