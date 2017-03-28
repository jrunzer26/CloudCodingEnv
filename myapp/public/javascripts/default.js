
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


function tester() {
	if(document.getElementById("programs").style.display == "none") {
		document.getElementById("programs").style.display = "inline";
	} else {
		document.getElementById("programs").style.display = "none";
	}	
}

function homePage() {
	window.location.href = '/main?param1='+sessionStorage.getItem("token");
}

function quizPage() {
	window.location.href = '/quiz?param1='+sessionStorage.getItem("token");
}

function adminPage() {
	window.location.href = '/admin?param1='+sessionStorage.getItem("token");
}
