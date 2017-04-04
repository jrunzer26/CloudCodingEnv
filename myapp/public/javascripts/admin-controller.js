/**
 * When going to the admin page change the url to hide the parameters and only display the path name.
 */
$(document).ready(function() {
    history.pushState({}, '/admin?param1='+sessionStorage.getItem("token"), '/admin');
});