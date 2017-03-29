var GoogleAuth;
var ENGRFolderId;
var autoSaveGo = false;
var autoSaveFolderId;
var existingFolders = [];
var existingFiles = [];
var autoSaveFiles = {};
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
       $.ajax({
        type: 'GET',
        url: '/login/',
        success: function(output) {
          window.location.href='/login';
        }
      })
    } else {
      // User is not signed in. Start Google auth flow.
      GoogleAuth.signIn();
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

function deleteFile() {
    var value = confirm("Do you want to delete file: "+ currentProgram);
    if(value == true) {
    var requester = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {q:  "title = '"+currentProgram+"'"}
    });
    requester.execute(function(res) {
      var request = gapi.client.request({
        'path': '/drive/v2/files/'+res.items[0].id,
        'method': 'DELETE'
      });
      request.execute();
      var elem = document.getElementById("list"+currentProgram);
      elem.remove();
      closeDeletedProgram(currentProgram);

    })
  }
} 

function deleteAutoSaveFile(id) {
  var request = gapi.client.request({
    'path': '/drive/v2/files/'+id,
    'method': 'DELETE'
  });
  request.execute();
}

function renameFile() {
  var fileName = window.prompt("Enter file name: ", "testFile");
  if(fileName !== null) {
    var requester = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {q:  "title = '"+currentProgram+"'"}
    });
    requester.execute(function(res){
        var id = res.items[0].id;
        var request = gapi.client.request({
            'path': '/drive/v2/files/'+id,
            'method': 'PATCH',
            'body': {"title": fileName}
        });
        document.getElementById(currentProgram).setAttribute( "onclick", "switchProgram('"+fileName+"');" );
        document.getElementById(currentProgram+"Close").setAttribute( "onclick", "closeProgram('"+fileName+"');" );
        document.getElementById(currentProgram+"Text").innerHTML = fileName;
        document.getElementById(currentProgram).id = fileName;
        document.getElementById("list"+currentProgram).setAttribute("onclick", "loadFile('"+id+"');")
        document.getElementById("list"+currentProgram).innerHTML = fileName;
        document.getElementById("list"+currentProgram).id = "list"+fileName;
        document.getElementById(currentProgram+"Close").id = fileName+"Close";
        document.getElementById(currentProgram+"Text").id = fileName+"Text";
        renamePassoff(fileName);
        request.execute();
    })
  }
}

//setInterval(function () {autoSaveFeature();}, 120000);
//setInterval(function() {console.log("HEY MAN");}, 1000);
setTimeout(enableAuto, 120000);

function enableAuto() {
  if(!autoSaveGo) {
      autoSaveGo = true;
      console.log("in the go");
      setTimeout(autoSaveFeature, 1000);
  }
}

function autoSaveFeature() {
	const boundary = '-------314159265358979323846';
	const delimiter = "\r\n--" + boundary + "\r\n";
	const close_delim = "\r\n--" + boundary + "--";
	console.log("In the autoSave File");
  for(var i = 0; i < Object.keys(listOfPrograms).length; i++) {
      if(Object.keys(autoSaveFiles).includes(Object.keys(listOfPrograms)[i])) {
        var base64;
        if(Object.keys(listOfPrograms)[i] == currentProgram) {
            base64 = btoa(editor.getValue());;
        } else {
            base64 = btoa(Object.values(listOfPrograms)[i]);
        }
        var title = Object.keys(listOfPrograms)[i];
        var titleID = autoSaveFiles[Object.keys(listOfPrograms)[i]];
        console.log("the file name is: "+ Object.keys(listOfPrograms)[i]+ " the id is: "+autoSaveFiles[Object.keys(listOfPrograms)[i]]);
        console.log("the folder id is: "+ autoSaveFolderId);
         var fileMetadata = {
          'title' : title,
          'mimeType' : 'text/plain',
          'parents': [{"id": autoSaveFolderId}]
          };

          console.log(base64);
          var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: ' + "text/plain" + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64 +
            close_delim;

            var request = gapi.client.request({
                'path': '/upload/drive/v2/files/'+titleID,
                'method': 'PUT',
                'params' : {'uploadType': 'multipart'},
                'headers': {
                  'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            });
            request.execute();

      } else {
        var base64;
        if(Object.keys(listOfPrograms)[i] == currentProgram) {
            base64 = btoa(editor.getValue());
        } else {
            base64 = btoa(Object.values(listOfPrograms)[i]);
        }
        var fileMetadata = {
        'title' : Object.keys(listOfPrograms)[i],
        'mimeType' : 'text/plain',
        'parents': [{"id": autoSaveFolderId}]
        };

        var multipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(fileMetadata) +
          delimiter +
          'Content-Type: ' + "text/plain" + '\r\n' +
          'Content-Transfer-Encoding: base64\r\n' +
          '\r\n' +
          base64 +
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
          request.execute(function(ress) {
          	console.log(ress);
          	autoSaveFiles[ress.title] = ress.id;
          	console.log(autoSaveFiles)
          });
      }
  }
  console.log("setting timeout");
  setTimeout(autoSaveFeature, 120000);
}

  function saveFile(fileName, value) {
  	const boundary = '-------314159265358979323846';
	const delimiter = "\r\n--" + boundary + "\r\n";
	const close_delim = "\r\n--" + boundary + "--";
    var requester = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {q:  "title = '"+fileName+"' and '"+ENGRFolderId+"' in parents "}
    });
    requester.execute(function(res) {
    	console.log(res.items);
      if(res.items.length > 0 ){
        var val = true;
        if(val) {

          console.log(ENGRFolderId);
          var fileMetadata = {
          'title' : fileName,
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
                'path': '/upload/drive/v2/files/'+res.items[0].id,
                'method': 'PUT',
                'params' : {'uploadType': 'multipart'},
                'headers': {
                  'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            });
            request.execute(function(res){
            	if(!value) {
            		var elem = document.getElementById(fileName);
					elem.remove();
            		openNextProgram();
            	}
            });
        }
      } else {
        console.log(ENGRFolderId);
        var fileMetadata = {
        'title' : fileName,
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
          request.execute(function(resp) {
            console.log(resp);
            var listhtmlCode = '<a href="#" id="list'+resp.title+'" onclick=loadFile('+resp.id+' , '+resp.title+') style="padding-left: 50px">'+resp.title+'</a>';
            $('#programs').append(listhtmlCode);
            if(!value) {
        		var elem = document.getElementById(fileName);
				elem.remove();
        		openNextProgram();
            }
          });
      }
    });
  }

  function readFiles(id , subFolder) {
    var titleValue;
    console.log("reading files");
    var request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {q:  "'"+id+"' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false"}
    });
      request.execute(function(resp) {
        console.log(resp);
        for(var i = 0; i < resp.items.length; i++) {
          existingFiles.push(resp.items[i].title);
          var listhtmlCode = '<a href="#" id="list'+resp.items[i].title+'" onclick="loadFile(\''+resp.items[i].id+ '\' , \''+resp.items[i].title+'\')" style="padding-left: 50px">'+resp.items[i].title+'</a>'
          $('#programs').append(listhtmlCode)
          if(i == 0) {
            titleValue = resp.items[i].title;
            $.ajax({
              type: 'GET',
              url: '/getFile',
              data: {token: GoogleAuth.currentUser.get().Zi.access_token, url: resp.items[i].downloadUrl},
              success: function(output) {
                
                var htmlCode = '<div id="'+titleValue+'" onclick="switchProgram(\''+titleValue+'\')" class="program tableCol"><p id="'+titleValue+'Text" class="tableCol">'+titleValue+'</p><i id="'+titleValue+'Close" onclick="closeProgram(\''+titleValue+'\')" class="fa fa-times tabelCol"></i></div>';
                 $('#programsList').append(htmlCode);
                 listOfPrograms[titleValue] = "";
                 switchProgram(titleValue);
                 setEditorText(output);
              }
            });
          }
        }
        readFileNames(subFolder);
      })
  }

  function readFileNames(id) {
    console.log(existingFiles);
    var request = gapi.client.request({
      'path': '/drive/v2/files',
      'method': 'GET',
      'params': {q:  "'"+id+"' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false"}
    });
    request.execute(function(resp) {
      for(var i = 0; i < resp.items.length; i++) {
        if(existingFiles.indexOf(resp.items[i].title) >= 0) {
          autoSaveFiles[resp.items[i].title] = resp.items[i].id;
          console.log("The file name is: "+ resp.items[i].title + " the id to go along with it is: "+ resp.items[i].id);
        } else {
          deleteAutoSaveFile(resp.items[i].id);
        }
      }
    })
  }

  function loadFile(id, title) {
    console.log(title);
    var request = gapi.client.request({
        'path': '/drive/v2/files/'+id,
        'method': 'GET'
    });
    request.execute(function(resp) {
      	var requester = gapi.client.request({
      		'path': '/drive/v2/files',
      		'method': 'GET',
      		'params': {q: "'"+autoSaveFolderId+"' in parents and title = '"+title+"' and trashed = false"}
      	});
      	if(Object.keys(listOfPrograms).indexOf(resp.title) < 0) {
          console.log("We got a title boys");
      	requester.execute(function(res) {
          console.log(res.items.length);
      		if(res.items.length > 0) {
      			if(res.items[0].modifiedDate > resp.modifiedDate) {
	      			console.log("The autoSave file is newer then the saved file");
	      				$(function() {
							$("#dialog").dialog({
								modal: true,
								resizable: false,
								buttons: {
									"Yes": function() {
										$.ajax({
					      					type: 'GET',
				          					url: '/getFile',
				          					data: {token: GoogleAuth.currentUser.get().Zi.access_token, url: res.items[0].downloadUrl},
				          					success: function(output) {
				          						var htmlCode = '<div id="'+resp.title+'" onclick="switchProgram(\''+resp.title+'\')" class="program tableCol"><p id="'+resp.title+'Text" class="tableCol">'+resp.title+'</p><i id="'+resp.title+'Close" onclick="closeProgram(\''+resp.title+'\')" class="fa fa-times tabelCol"></i></div>';
									             $('#programsList').append(htmlCode);
									             listOfPrograms[resp.title] = "";
									             switchProgram(resp.title);
									             setEditorText(output);
				          					}
					      				});
					      				$(this).dialog("close");
									},
									"No": function() {
										$.ajax({
								          type: 'GET',
								          url: '/getFile',
								          data: {token: GoogleAuth.currentUser.get().Zi.access_token, url: resp.downloadUrl},
								          success: function(output) {
								            
								            var htmlCode = '<div id="'+resp.title+'" onclick="switchProgram(\''+resp.title+'\')" class="program tableCol"><p id="'+resp.title+'Text" class="tableCol">'+resp.title+'</p><i id="'+resp.title+'Close" onclick="closeProgram(\''+resp.title+'\')" class="fa fa-times tabelCol"></i></div>';
								             $('#programsList').append(htmlCode);
								             listOfPrograms[resp.title] = "";
								             switchProgram(resp.title);
								             setEditorText(output);
								          }
								        });
										$(this).dialog("close");
									}, 
									"Cancel": function() {
										$(this).dialog("close");
									}
								}
							});
						});
	      		} else {
	      			    $.ajax({
				          type: 'GET',
				          url: '/getFile',
				          data: {token: GoogleAuth.currentUser.get().Zi.access_token, url: resp.downloadUrl},
				          success: function(output) {
				            
				            var htmlCode = '<div id="'+resp.title+'" onclick="switchProgram(\''+resp.title+'\')" class="program tableCol"><p id="'+resp.title+'Text" class="tableCol">'+resp.title+'</p><i id="'+resp.title+'Close" onclick="closeProgram(\''+resp.title+'\')" class="fa fa-times tabelCol"></i></div>';
				             $('#programsList').append(htmlCode);
				             listOfPrograms[resp.title] = "";
				             switchProgram(resp.title);
				             setEditorText(output);
				          }
				        });
	      		}
      		} else {
            $.ajax({
                type: 'GET',
                url: '/getFile',
                data: {token: GoogleAuth.currentUser.get().Zi.access_token, url: resp.downloadUrl},
                success: function(output) {
                  
                  var htmlCode = '<div id="'+resp.title+'" onclick="switchProgram(\''+resp.title+'\')" class="program tableCol"><p id="'+resp.title+'Text" class="tableCol">'+resp.title+'</p><i id="'+resp.title+'Close" onclick="closeProgram(\''+resp.title+'\')" class="fa fa-times tabelCol"></i></div>';
                   $('#programsList').append(htmlCode);
                   listOfPrograms[resp.title] = "";
                   switchProgram(resp.title);
                   setEditorText(output);
                }
              });
          }
      	})
	} else {
        switchProgram(resp.title);
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
        var requester = gapi.client.request({
          'path': '/drive/v2/files',
          'method': 'POST',
          'body': {'title': 'Auto Save', 'mimeType' : 'application/vnd.google-apps.folder', 'parents': [{"id": ENGRFolderId}]}
        });
        requester.execute(function(res) {
          autoSaveFolderId = res.id;
        })
      });
  }

  function subFolderCreate() {
    var requester = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'POST',
        'body': {'title': 'Auto Save', 'mimeType' : 'application/vnd.google-apps.folder', 'parents': [{"id": ENGRFolderId}]}
      });
      requester.execute(function(res) {
        autoSaveFolderId = res.id;
        readFiles(ENGRFolderId, autoSaveFolderId);
      })
  }

  function checkForFolder() {
    var fileExist = false;
    var subFolder = false;
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
              var requester = gapi.client.request({
                'path': '/drive/v3/files',
                'method': 'GET',
                'params': {q: "name = 'Auto Save'"}
                });
              requester.execute(function(res) { 
                console.log(res);
                if(res.files.length > 0) {
                  for(var i =0; i < res.files.length; i++) {
                      if(res.files[i].mimeType == "application/vnd.google-apps.folder") {
                        subFolder = true;
                        autoSaveFolderId = res.files[0].id;
                        break;
                      }
                  }
                }
                if(!subFolder) {
                  subFolderCreate();
                } else {
                  readFiles(ENGRFolderId, autoSaveFolderId);
                }
            });
            

          }
    });
  } 