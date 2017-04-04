var GoogleAuth;
var ENGRFolderId;
var existingFolders = [];
var editor;

$(document).ready(function() {
	$('#sign-in-or-out-button').hide();
});

  var SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.apps.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.readonly';
  function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
  }


  function initClient() {
    // Retrieve the discovery document for version 3 of Google Drive API.
    // In practice, your app can retrieve one or more discovery documents.
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init({
        'apiKey': 'AIzaSyCeyJkOUyztGTV7622acY10KHzgrtjfwI8',
        'discoveryDocs': [discoveryUrl],
        'clientId': '814887631651-vogmn7e4d0bo9klocjucc8cui17fjhka.apps.googleusercontent.com',
        'scope': SCOPE
    }).then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes.
      GoogleAuth.isSignedIn.listen(updateSigninStatus);

      // Handle initial sign-in state. (Determine if user is already signed in.)
      var user = GoogleAuth.currentUser.get();
      setSigninStatus();

      // Call handleAuthClick function when user clicks on
      //      "Sign In/Authorize" button.
      $('#customBtn').click(function() {
        handleAuthClick();
      }); 
      $('#signOut').click(function() {
        console.log("HEY there");
        revokeAccess();
      }); 
    });
  }

  /**
   * Checks the state of the sign in status.
   */
  function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
      GoogleAuth.signOut();
    } else {
      GoogleAuth.signIn();
    }
  }

  /**
   * Disconnects the user from google sign in.
   */
  function revokeAccess() {
    GoogleAuth.disconnect();

  }

  //Checks the sign in status.
  function setSigninStatus(isSignedIn) {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    //If the user status is signed in.
    if (isAuthorized) {

      var emailAdd = GoogleAuth.currentUser.get().getBasicProfile().getEmail();
      var emailType = emailAdd.split("@");
      //Check to make sure only uoit.net email address are allowed in the system.
      if(emailType[1] == "uoit.net") {
        sessionStorage.setItem("email", GoogleAuth.currentUser.get().getBasicProfile().getEmail());
        var id_token = user.getAuthResponse().id_token;
        sessionStorage.setItem("token", id_token);
        //Redirect the user to the main menu page.
        window.location.href = '/main?param1='+id_token;
      } else {
        alert("Sorry only UOIT email address can access this website");
        revokeAccess();
      }
    } 
  }

  /**
   * Update the status of the user on wheather or not they are signed in.
   */
  function updateSigninStatus(isSignedIn) {
    setSigninStatus();
  }

  