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
    history.pushState({}, '/main?param1='+sessionStorage.getItem("token"), '/main');
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


  /**
   * Checks if the user is signed in or not and performs actions accordinly.
   */
  function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
      // User is authorized and has clicked 'Sign out' button.
      GoogleAuth.signOut();
       $.ajax({
        type: 'GET',
        url: '/',
        success: function(output) {
          sessionStorage.setItem("token", "");
          sessionStorage.setItem("email", "");
          window.location.href='/';
        }
      })
    } else {
      // User is not signed in. Start Google auth flow.
      GoogleAuth.signIn();
    }
  }

  /**
   * Removes the premission the user oiginally gave us.
   */
  function revokeAccess() {
    GoogleAuth.disconnect();
  }

 /**
  * Changes the buttons and what they displayed.
  * @param {*} isSignedIn
  */
 function setSigninStatus(isSignedIn) {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    //If the user is logged in two buttons will appear Signout and Revoke Access.
    if (isAuthorized) {
      $('#sign-in-or-out-button').html('Sign out');
      $('#revoke-access-button').css('display', 'inline-block');
      $('#auth-status').html('You are currently signed in and have granted ' +
          'access to this app.');
      checkForFolder();
      //If the user is not logged in one button will appear Sign In/Authroize.
    } else {
      $('#sign-in-or-out-button').html('Sign In/Authorize');
      $('#revoke-access-button').css('display', 'none');
      $('#auth-status').html('You have not authorized this app or you are ' +
          'signed out.');
    }
  }

  //Checks the users signin status and updates accordingly.
  function updateSigninStatus(isSignedIn) {
    setSigninStatus();
  }

/**
 * Delete the selected file from the google drive.
 */
function deleteFile() {
    var value = confirm("Do you want to delete file: "+ currentProgram);
    if(value == true) {
    //Sends a request to the google drive api to retrieve the id of the file they want to delete.
    var requester = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {q:  "title = '"+currentProgram+"'"}
    });
    //Sends another request to the google drive api to delete the file corresponding to the id.
    requester.execute(function(res) {
      var request = gapi.client.request({
        'path': '/drive/v2/files/'+res.items[0].id,
        'method': 'DELETE'
      });
      request.execute();

      //Removes any information about this file from the website.
      var elem = document.getElementById("list"+currentProgram);
      elem.remove();
      closeDeletedProgram(currentProgram);

    })
  }
} 

/**
 * Delete the selected file based off the id from the auto save folder.
 * @param {*} id 
 */
function deleteAutoSaveFile(id) {
  var request = gapi.client.request({
    'path': '/drive/v2/files/'+id,
    'method': 'DELETE'
  });
  request.execute();
}

/**
 * Rename the select file and updates the name where ever it is used.
 */ 
function renameFile() {
  var fileName = window.prompt("Enter file name: ", "testFile");
  if(fileName !== null) {
    //Sends an API request obtain the selected file id.
    var requester = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {q:  "title = '"+currentProgram+"'"}
    });
    //Sends an API request that updates the file name.
    requester.execute(function(res){
        var id = res.items[0].id;
        var request = gapi.client.request({
            'path': '/drive/v2/files/'+id,
            'method': 'PATCH',
            'body': {"title": fileName}
        });

        //Changes all the elements that have reference to the filename, and changes them to what the user inputted.
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

//After 2 minutes call the enableAuto.
setTimeout(enableAuto, 120000);

/**
 * Calls the autosave function once.
 */
function enableAuto() {
  if(!autoSaveGo) {
      autoSaveGo = true;
      console.log("in the go");
      setTimeout(autoSaveFeature, 1000);
  }
}

/**
 * Every two minutes all the files that are currently open will be saved to the auto save folder.
 */
function autoSaveFeature() {

  //Variables used for the multibody request.
	const boundary = '-------314159265358979323846';
	const delimiter = "\r\n--" + boundary + "\r\n";
	const close_delim = "\r\n--" + boundary + "--";
  for(var i = 0; i < Object.keys(listOfPrograms).length; i++) {
      //Checks to see if the file already exists in the auto save folder
      if(Object.keys(autoSaveFiles).includes(Object.keys(listOfPrograms)[i])) {
        var base64;
        //Stores the correct contents that relates to the file being saved.
        if(Object.keys(listOfPrograms)[i] == currentProgram) {
            base64 = btoa(editor.getValue());;
        } else {
            base64 = btoa(Object.values(listOfPrograms)[i]);
        }
         var title = Object.keys(listOfPrograms)[i];
         var titleID = autoSaveFiles[Object.keys(listOfPrograms)[i]];
         var fileMetadata = {
          'title' : title,
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

            //Sends an API request to update the file to the autosave folder.
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
          //Sends an API request to save the file to the autosave folder.
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
  //Calls itself in 2 minutues.
  setTimeout(autoSaveFeature, 120000);
}


  /**
   * Saves the file to the ENGR 1200 folder.
   * @param {*} fileName
   * @param {*} value 
   */
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
        //Checks to see if the file already exists in the folder
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

            //Updates the current file.
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

          //Saves the file to ENGR 1200.
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
            //Adds some html that will display the file name in the program list.
            var listhtmlCode = '<a href="#" class="googleDriveProgram" id="list'+resp.title+'" onclick="loadFile(\''+resp.id+'\' , \''+resp.title+'\')" style="padding-left: 50px">'+resp.title+'</a>';
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

  /**
   * Grabs a list of all the files stored in the ENGR 1200 folder.
   * @param {*} id
   * @param {*} subFolder
   */
  function readFiles(id , subFolder) {
    var titleValue;
    //Looks at all the files in the ENGR 1200 folder, and ingores any trash documents.
    var request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'GET',
        'params': {q:  "'"+id+"' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false"}
    });
      request.execute(function(resp) {
        //Loops for as many files as there are in the folder.
        for(var i = 0; i < resp.items.length; i++) {
          existingFiles.push(resp.items[i].title);
          //Creates some html code that allows you to see the file in the program list.
          var listhtmlCode = '<a href="#" class="googleDriveProgram" id="list'+resp.items[i].title+'" onclick="loadFile(\''+resp.items[i].id+ '\' , \''+resp.items[i].title+'\')" style="padding-left: 50px">'+resp.items[i].title+'</a>'
          $('#programs').append(listhtmlCode)
          if(i == 0) {
            titleValue = resp.items[i].title;
            $.ajax({
              type: 'GET',
              url: '/main/getFile',
              data: {token: GoogleAuth.currentUser.get().Zi.access_token, url: resp.items[i].downloadUrl},
              success: function(output) {
                //Creates some html code that displays the file as a tab.
                var htmlCode = '<div id="'+titleValue+'" onclick="switchProgram(\''+titleValue+'\')" class="program tableCol"><p id="'+titleValue+'Text" class="tableCol">'+titleValue+'</p><i id="'+titleValue+'Close" onclick="closeProgram(\''+titleValue+'\')" class="fa fa-times tabelCol"></i></div>';
                 $('#programsList').append(htmlCode);
                 //Stores the file and the code value in the list.
                 listOfPrograms[titleValue] = "";
                 switchProgram(titleValue);
                 setEditorText(output);
              }
            });
          }
        }
        //Reads all the files from the auto save folder.
        readFileNames(subFolder);
      })
  }

  /**
   * Grabs a list of all the files stored in the Auto Save folder.
   * @param {*} id 
   */ 
  function readFileNames(id) {
    console.log(existingFiles);
    //Looks at all the files in the auto save folder, ingnoring all the trashed files.
    var request = gapi.client.request({
      'path': '/drive/v2/files',
      'method': 'GET',
      'params': {q:  "'"+id+"' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false"}
    });
    request.execute(function(resp) {
      for(var i = 0; i < resp.items.length; i++) {
        if(existingFiles.indexOf(resp.items[i].title) >= 0) {
          autoSaveFiles[resp.items[i].title] = resp.items[i].id;
        } else {
          //If the file is in the autosave folder but not the ENGR 1200 folder delete the file in the auto save folder.
          deleteAutoSaveFile(resp.items[i].id);
        }
      }
    })
  }


  /**
   * Loads the file contents and displays them in the coding enviornment.
   * @param {*} id 
   * @param {*} title
   */ 
  function loadFile(id, title) {
    //Loads both files from the autosave folder, and the ENGR 1200 folder.
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
        //Checks to see if file exists in both folders.
      	if(Object.keys(listOfPrograms).indexOf(resp.title) < 0) {
      	requester.execute(function(res) {
      		if(res.items.length > 0) {
            //Checks to see which file as been saved most recently.
      			if(res.items[0].modifiedDate > resp.modifiedDate) {
	      			console.log("The autoSave file is newer then the saved file");
	      				$(function() {
							$("#dialog").dialog({
								modal: true,
								resizable: false,
								buttons: {
									"Yes": function() {
                    //Loads the autosave file.
										$.ajax({
					      					type: 'GET',
				          					url: '/main/getFile',
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
                  //Loads the ENGR 1200 file.
									"No": function() {
										$.ajax({
								          type: 'GET',
								          url: '/main/getFile',
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
            //If the ENGR 1200 file is newer.
	      		} else {
	      			    $.ajax({
				          type: 'GET',
				          url: '/main/getFile',
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
            //If the file only exists in the ENGR 1200 folder.
      		} else {
            $.ajax({
                type: 'GET',
                url: 'main/getFile',
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
        //If the file already has been loaded then, switch to that file.
        switchProgram(resp.title);
      }
    })
  }


  /**
   * Creates a folder name ENGR 1200.
   */
  function folderCreate() {
    console.log("creating folder");

    //Sends a request to the google drive API to create a folder named ENGR 1200.
    var request = gapi.client.request({
        'path' : '/drive/v2/files',
        'method' : 'POST',
        'body' : {'title' : 'ENGR 1200', 'mimeType' : 'application/vnd.google-apps.folder'}
        
    });
      request.execute(function(resp) {
        ENGRFolderId = resp.id;
        //Sends another request to the google drive API to create another folder named Auto Save.
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

  /**
   * In the case that an ENGR 1200 folder is already created, this function allows you to create the autosave folder.
   */
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

  /**
   * Checks the files in your google drive to see if the ENGR 1200 folder exists
   * If it does, it will read the files in the folder.
   * If it does not, it will create the folders.
   */
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
                //Checks to see if the auto save folder exists.
                if(!subFolder) {
                  subFolderCreate();
                } else {
                  readFiles(ENGRFolderId, autoSaveFolderId);
                }
            });
            

          }
    });
  } 