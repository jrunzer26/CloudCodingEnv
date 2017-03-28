$(document).ready(function() {
    history.pushState({}, '/admin?param1='+sessionStorage.getItem("token"), '/admin');
});