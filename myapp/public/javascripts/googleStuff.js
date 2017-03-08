var GoogleAuth;
var existingFolders = [];
  var SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.apps.readonly https://www.googleapis.com/auth/drive.file';
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
      $('#sign-in-or-out-button').click(function() {
        handleAuthClick();
      }); 
      $('#revoke-access-button').click(function() {
        revokeAccess();
      }); 
    });
  }

  function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
      // User is authorized and has clicked 'Sign out' button.
      GoogleAuth.signOut();
    } else {
      // User is not signed in. Start Google auth flow.
      GoogleAuth.signIn();
      console.log("HYE NOW I AM SIGNING IN");
    }
  }

  function revokeAccess() {
    GoogleAuth.disconnect();
  }

  function setSigninStatus(isSignedIn) {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
      $('#sign-in-or-out-button').html('Sign out');
      $('#revoke-access-button').css('display', 'inline-block');
      $('#auth-status').html('You are currently signed in and have granted ' +
          'access to this app.');
      console.log("YOu are currently signed in well done");
      /*test(function(listOfIds) {
       // console.log(listOfIds);
       // console.log(listOfIds.length);
        for(var i = 0; i<10; i++) {
          console.log(listOfIds[i]);
            var request1 = gapi.client.request({
                'path': '/drive/v2/files/0BzCEu_ybGHUNR05TZDdyeVpBSFE',
                'method': 'GET'
              });
            request1.execute(function(res) {
              console.log(res.title);
              /*if(res.title == "ENGR 1200") {
                alert("that folder already exists");
              } else if (res.title != undefined){
                existingFolders.push(res.title);
              } else {
                console.log(resp.items[i]);
              }
            });
        }
      });*/
    } else {
      $('#sign-in-or-out-button').html('Sign In/Authorize');
      $('#revoke-access-button').css('display', 'none');
      $('#auth-status').html('You have not authorized this app or you are ' +
          'signed out.');
    }
  }

  function updateSigninStatus(isSignedIn) {
    setSigninStatus();
  }


  function folderCreate() {
    console.log("creating folder");
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var fileMetadata = {
    'title' : 'ENGR 1200',
    'mimeType' : 'application/vnd.google-apps.folder'
    };



    var request = gapi.client.request({
        'path' : '/drive/v2/files',
        'method' : 'POST',
        'body' : {'title' : 'ENGR 1200', 'mimeType' : 'application/vnd.google-apps.folder'}
        
    });
      request.execute();
  }





  function test() {
    var fileExist = false;
    var request = gapi.client.request({
            'path': '/drive/v3/files',
            'method': 'GET',
            'params': {q: "name = 'ENGR 1200'"}
            });
          request.execute(function(resp) { 
            if(resp.files.length > 0) {
              for(var i =0; i < resp.files.length; i++) {
                  if(resp.files[i].mimeType == "application/vnd.google-apps.folder") {
                    fileExist = true;
                    break;
                  }
              }
            }
            if(!fileExist) {
              alert("Creating the folder ENGR 1200 in your Google Drive");
              folderCreate();
            } else {
              console.log("That folder already exists");
            }
       /* for (i=0; i<resp.items.length; i++) {
            for(var j =0; j<resp.items[i].parents.length; j++) {  
              ids.push(resp.items[i].parents[j].id);
             /* var request1 = gapi.client.request({
                'path': '/drive/v2/files/'+resp.items[i].parents[j].id,
                'method': 'GET'
              });
            request1.execute(function(res) {
              //console.log(res.title);
              if(res.title == "ENGR 1200") {
                alert("that folder already exists");
              } else if (res.title != undefined){
                existingFolders.push(res.title);
              } else {
                console.log(resp.items[i]);
              }
            });
          }

        }*/
        //  callback(ids);
    });
  }