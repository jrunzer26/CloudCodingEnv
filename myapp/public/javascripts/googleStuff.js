var GoogleAuth;
var ENGRFolderId;
var existingFolders = [];
var editor;
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
     	 checkForFolder();
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

  function saveFile(fileName) {
      var tempFileName;
      if(fileName == "") {
        tempFileName='test.c';
      } else {
        tempFileName = fileName;
      }
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";
      console.log(ENGRFolderId);
      var fileMetadata = {
      'title' : tempFileName,
      'mimeType' : 'text/plain',
      'parents': [{"id": ENGRFolderId}]
      };

      var base64Data = btoa(getEditorText());
      var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: ' + "text/plain" + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

        var request = gapi.client.request({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            'params' : {'uploadType': 'multipart'},
            'headers': {
              'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        request.execute();

  }

  function readFiles(id) {
    var titleValue;
    console.log("reading files");
    var request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {q:  "'"+id+"' in parents"}
    });
      request.execute(function(resp) {
        console.log(resp);
        for(var i = 0; i < resp.items.length; i++) {
          console.log(resp.items[i].title);
          if(i == 0) {
            titleValue = resp.items[i].title;
            $.ajax({
              type: 'GET',
              url: '/getFile',
              data: {token: GoogleAuth.currentUser.get().Zi.access_token, url: resp.items[i].downloadUrl},
              success: function(output) {
                
                var htmlCode = '<div id="'+titleValue+'" onclick="switchProgram(\''+titleValue+'\')" class="program tableCol"><p class="tableCol">'+titleValue+'</p><i onclick="closeProgram(\''+titleValue+'\')" class="fa fa-times tabelCol"></i></div>';
                 $('#programsList').append(htmlCode);
                 switchProgram(titleValue);
                 setEditorText(output);
              }
            });
          }
        }
      })
  }


  function folderCreate() {
    console.log("creating folder");

    var request = gapi.client.request({
        'path' : '/drive/v2/files',
        'method' : 'POST',
        'body' : {'title' : 'ENGR 1200', 'mimeType' : 'application/vnd.google-apps.folder'}
        
    });
      request.execute(function(resp) {
        ENGRFolderId = resp.id;
      });
  }


  function checkForFolder() {
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
                    ENGRFolderId = resp.files[0].id;
                    break;
                  }
              }
            }
            if(!fileExist) {
              alert("Creating the folder ENGR 1200 in your Google Drive");
              folderCreate();
            } else {
              console.log("That folder already exists");
              readFiles(ENGRFolderId);
            }
    });
  }