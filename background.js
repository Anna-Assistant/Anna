chrome.browserAction.onClicked.addListener(function(tab) {
  alert();
});
/////////////////////events///////////////////////////
$(document).ready(function() {

  var accessToken = "d3da1b6e0a024151a5efe7f09a099aab";
  var timevocal = 0;
  var baseUrl = "https://api.api.ai/v1/";
  var talking = true;
  var recognition;
  var txt;
  var screenshotId = 1;
  var status = "active"; //for storing listening status
  var debug = false;
  var our_trigger = "hey ";
  var wordnikAPIKey = "";
  var voices;
  var currentVoice;
  startRecognition();
  checkOnline();
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  //first time when application will be loaded
  chrome.storage.local.get( /* String or Array */ ["firsttime"], function(items2) {
      if (items2.firsttime === undefined || items2.firsttime === 2) {
          chrome.storage.local.set({
              "firsttime": 3
          }, function() {
              chrome.tabs.create({
                  "url": "elate/index.html"
              });
              getPermission();
          });
      }
  });

  //function for giving sleep 
  function sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
          if ((new Date().getTime() - start) > milliseconds) {
              break;
          }
      }
  }

  function getPermission() {
      var oldTabID;
      chrome.tabs.query({
          active: true,
          currentWindow: true
      }, function(tabs) {
          oldTabID = tabs[0].id;
      });
      chrome.tabs.create({
          active: true,
          url: 'permission.html'
      }, null);
      var permissionsTabID;
      chrome.tabs.query({
          active: true,
          currentWindow: true
      }, function(tabs) {
          permissionsTabID = tabs[0].id;
      });
      chrome.tabs.onRemoved.addListener(function switchTab(tabId) {
          if (tabId == permissionsTabID) {
              chrome.tabs.update(oldTabID, {
                  selected: true
              }, function() {
                  // listen();
                  startRecognition();
              });
              chrome.extension.onRequest.removeListener(switchTab);
          }
      });
  };

  // check if browser is online or offline
  var offline = false;
  checkOnline();

  function checkOnline() {
      if (!navigator.onLine && !offline) {
          offline = true;
        //   voices = [];
          chrome.storage.local.set({
              "onoffswitch": "false"
          }, function() {

          });
      }
      if (navigator.onLine) {
          offline = false;
      }
      setTimeout(checkOnline, 1000);
  }

  /* method to change the anna status icon on page*/
  function changeStatus(newStatus) {

        chrome.storage.local.get( /* String or Array */ ["statusicon"], function(items) {

            if ((items.statusicon === undefined) || (items.statusicon === "false")) {
                newStatus = "noIcon";
            }


            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {

                try {
                    if (tabs[0] === undefined || tabs[0].url.startsWith("chrome://") || tabs[0].url.startsWith("chrome-extension://")){
                        throw "Internal Browser Page Active";
                    }
                    var tabId = tabs[0].id;

                    chrome.tabs.executeScript(tabId, {
                        code: "var status =\"" + newStatus + "\";"
                    }, function() {
                        chrome.tabs.executeScript(tabId, {
                            file: "js/set_status_icon.js"
                        }, function() {
                            if (debug){
                              console.log("Status set to " + newStatus);
                            }
                        });
                    });
                } catch (e) {
                    if (debug){
                      console.log("Error Message: " + e);
                    }
                }
            });
        });
    }

  //function for recognition
  function startRecognition() {
      chrome.storage.local.get( /* String or Array */ ["onoffswitch"], function(items) {
          if (items.onoffswitch === "true") {
              changeStatus("listening");
              chrome.browserAction.setIcon({path:"img/icon.png"});
              recognition = new webkitSpeechRecognition();
              recognition.onstart = function(event) {
                  updateRec();
              };
              var text = "";
              recognition.onresult = function(event) {
                  for (var i = event.resultIndex; i < event.results.length; ++i) {
                      text += event.results[i][0].transcript;
                  }
                  if(debug){
                    setInput("hey open facebook");
                    stopRecognition();
                  }
              };
              recognition.onend = function() {
                  

                  if (text.toLowerCase() === our_trigger.toLowerCase()) {
                      changeStatus("active");
                      if(debug){
                        alert(text);
                      }
                      Speech("Yes Sir");
                      sleep(1500);
                      if (debug){
                        chrome.storage.local.clear(function() {
                        var error = chrome.runtime.lastError;
                        if (error) {
                          console.error(error);
                        }
                        });
                      }
                      recognition.stop();
                      startRecognitionaftertrigger();
                  } else
                  if (text.toLowerCase().startsWith(our_trigger.toLowerCase())) {
                      changeStatus("active");
                      chrome.browserAction.setIcon({path:"img/icon-active.png"});
                      var str = text.toLowerCase().replace(our_trigger.toLowerCase() + " ", "");
                      setInput(str);
                      recognition.stop();
                      setTimeout(startRecognition, 1000);
                  } else {
                      recognition.stop();
                      startRecognition();
                  }
              };
              recognition.lang = "en-US";
              recognition.start();
          } else {
              changeStatus("inactive");
              chrome.browserAction.setIcon({path:"img/icon-inactive.png"});
              startRecognition();
          }
      });
  }

  function setInput(text) {
      txt = text;
      send();
  }
  //start recognition after trigger
  function startRecognitionaftertrigger() {
      recognition = new webkitSpeechRecognition();
      recognition.onstart = function(event) {
          if(debug){
            updateRec();
          }
      };
      var text = "";
      recognition.onresult = function(event) {
          for (var i = event.resultIndex; i < event.results.length; ++i) {
              text += event.results[i][0].transcript;
          }
          if(debug){
            setInput(text);
            stopRecognition();
          }
      };
      recognition.onend = function() {
          if (text === "") {
              recognition.stop();
              startRecognition();
          } else {
              recognition.stop();
              setInput(text);
              startRecognition();
          }
      };
      recognition.lang = "en-US";
      recognition.start();
  }
  //to stop recognition
  function stopRecognition() {
      if (recognition) {
          recognition.stop();
          recognition = null;
      }
  }
  //to switch 
  function switchRecognition() {
      if (recognition) {
          stopRecognition();

      } else {
          startRecognition();
      }
  }
  //to set input 
  function setInput(text) {
      txt = text;
      send();
  }

  function updateRec() {

  }
  //sending the data to server
  function send() {
      if (debug){
        alert('you said ' + txt);
        setResponse('you said ' + txt);
        console.log('user said ' + txt);
        txt = txt.replace(our_trigger, '');
        alert(txt);
        tasks();
      }
      else{
        txt = txt.replace(our_trigger, '');
        tasks();
      }
  }



  //sending the data to server
  function tasks() {
      $.ajax({
          type: "POST",
          url: baseUrl + "query?v=20150910",
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          headers: {
              "Authorization": "Bearer " + accessToken
          },
          data: JSON.stringify({
              query: txt,
              lang: "en",
              sessionId: "somerandomthing"
          }),
          success: function(data) {
              // setResponse(data.fulfillment.speech);
              setResponse(data.result.fulfillment.speech);
              // alert("intent " + data.result.metadata.intentName);
              if (data.result.metadata.intentName === "youtube") {
                  searchYoutube(data.result.parameters.any);
                  // chrome.tabs.create({ 'url': 'https://www.youtube.com/results?search_query=' + data.result.parameters.any });
              } else if (data.result.metadata.intentName === "open") {
                  chrome.tabs.create({
                      "url": "http://www." + data.result.parameters.website
                  });
              } else if (data.result.metadata.intentName === "incognito") {
                  chrome.windows.create({
                      url: "http://www.google.com",
                      incognito: true
                  });
                  chrome.extension.isAllowedIncognitoAccess(function(isAllowedAccess) {
                      if (isAllowedAccess){
                        return;   
                      }
                      alert("Please allow incognito mode");
                      chrome.tabs.create({
                          url: 'chrome://extensions/?id=' + chrome.runtime.id
                      });
                      Speech("Now please click on the option Allow in incognito");
                  });
              } else if (data.result.metadata.intentName === "calendar") {
                  //Speech("please tell details about the event"); 
                  chrome.identity.getProfileUserInfo(function(userInfo) {
                    //   console.log(userInfo.id);
                      chrome.tabs.create({
                          'url': 'https://www.google.com/calendar/render?action=TEMPLATE&text=data.result.parameters.any&dates=data.result.parameters.dateTdata.result.parameters.timeZ&output=xml'
                      });
                  });
              } else if (data.result.metadata.intentName === "history") {
                  chrome.tabs.create({
                      'url': 'chrome://history'
                  });
              } else if (data.result.metadata.intentName === "downloads") {
                  chrome.tabs.create({
                      'url': 'chrome://downloads'
                  });
              } else if (data.result.metadata.intentName === "translate") {
                  chrome.tabs.create({
                      'url': 'https://translate.google.com/#auto/en/data.result.parameters.any'
                  });
              } else if (data.result.metadata.intentName === "mail") {
                  chrome.tabs.create({
                      'url': "https://mail.google.com/mail/?view=cm&fs=1&body=" + data.result.parameters.any
                  });
              } else if (data.result.metadata.intentName == "joke") {
                  tellJoke();
              }else if (data.result.metadata.intentName == "nextTab") {
                  swapTab();
              } else if (data.result.metadata.intentName == "reload") {
                  chrome.tabs.reload();
              } else if (data.result.metadata.intentName == "bookmark") {
                  chrome.tabs.getSelected(function(tab) {
                      chrome.bookmarks.create({
                          'title': tab.title,
                          'url': tab.url
                      });
                  });
              } else if (data.result.metadata.intentName === "tweet") {
                  tweet(data.result.parameters.any);
                  if(debug){
                    chrome.tabs.create({ 'url': "http://www." + data.result.parameters.website });
                  }
              } else if (data.result.metadata.intentName === "maps") {
                  chrome.tabs.create({
                      'url': "https://www.google.com/maps/dir/" + data.result.parameters["geo-city"][0] + "/" + data.result.parameters["geo-city"][1]
                  });
              } else if (data.result.metadata.intentName === "restaurants") {
                  chrome.tabs.create({
                      'url': "https://www.google.com/maps/search/" + data.result.parameters.any + "+" + "restaurants"
                  });
              } else if (data.result.metadata.intentName === "mapPlace") {
                  chrome.tabs.create({
                      'url': "https://www.google.com/maps/?q=" + data.result.parameters.any
                  });
              } else if (data.result.metadata.intentName === "lyrics") {
                  chrome.tabs.create({
                      'url': "https://www.google.com/search?q=lyrics+for+" + data.result.parameters.any + "&btnI"
                  });
              } else if (data.result.metadata.intentName == "weather") {
                  weather(data.result.parameters.any);
              } else if (data.result.metadata.intentName == "screenshot") {
                  takeScreenshot();
              } else if (data.result.metadata.intentName == "reversesearch") {
                  reverseSearch();
              } else if (data.result.source == "domains") {
                  setResponse(data.result.fulfillment.speech);
                  if(debug){
                        alert(data.result.fulfillment.speech);
                      }
              } else if (data.result.metadata.intentName == "motivate") {
                  speakAQuote();
              } else if (data.result.metadata.intentName == "close") {
                  chrome.tabs.getSelected(null, function(tab) {
                      tab = tab.id;
                      chrome.tabs.remove(tab, function() {});
                      tabUrl = tab.url;
                      if(debug){
                        alert(tab.url);
                      }
                  });
                  Speech("closing");
              } else if (data.result.metadata.intentName === "cache") {
                  chrome.tabs.create({
                      'url': 'chrome://settings/clearBrowserData'
                  });
              } else if (data.result.metadata.intentName == "horoscope") {
                  getHoroscope(data.result.parameters.any);
              }
              else if (data.result.metadata.intentName == "wotd") {
                  getWOTD();
              } else {
                chrome.tabs.create({
                    'url': 'http://google.com/search?q=' + txt
                });
                if (debug)
                {
                chrome.tabs.executeScript({
                        code: "document.getElementsByClassName('_XWk')[0].innerHTML;"
                }, function(selection) {  _XWk
                alert(selection[0]);
                if (selection[0] === null) {
                        chrome.tabs.executeScript({
                                code: "var rex = /(<([^>]+)>)/ig; document.getElementsByClassName('_Tgc')[0].innerHTML.replace(rex,'').split('.')[0];"
                        }, function(sl) {
                        if (sl[0] === null) {
                          chrome.tabs.executeScript({
                              code: "var rex = /(<([^>]+)>)/ig; document.getElementsByClassName('st')[0].innerHTML.replace(rex,'').split('.')[0];"
                          }, function(sl2) {
                              Speech("According to Google " + sl2[0]);
                          });
                        } else
                          Speech("According to Google " + sl[0]);
                        });
                } else
                        Speech(selection[0]);
                });
                }
              }
          },
          error: function() {
              alert("Sorry ! we are having some internal problem. Please Try again.");
              setResponse("Sorry ! we are having some internal problem. Please Try again.");
          }
      });
  }

  /*utility method to convert dataURL to a blob object*/
  function dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
      else
          byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], {
          type: mimeString
      });
  }
  /*get cropped image from user*/
  function getCroppedImage(image, callbackMethod) {

    //   console.log("cropping image : callbackMethod : " + callbackMethod);
      chrome.tabs.query({
          active: true,
          currentWindow: true
      }, function(tabs) {

          var tabid = tabs[0].id;

          chrome.tabs.executeScript(tabid, {
              code: 'var imageurl ="' + image + '", callbackMethod = "' + callbackMethod + '";'
          }, function() {
              /*injecting cropperjs into current tab*/
              chrome.tabs.executeScript(tabid, {
                  file: "js/cropperjs/cropper.js"
              }, function(response) {
                  /*injecting our content script into current tab*/
                  chrome.tabs.executeScript(tabid, {
                      file: "js/content_script.js"
                  }, function(response) {
                    //   console.log("Indside background script!! id:" + tabid + ", response: " + JSON.stringify(response, null, 4));
                  });
              });
          });
      });
  }

  function reverseSearch() {
      chrome.tabs.captureVisibleTab(function(screenshotUrl) {
          /*uploading the screenshot to a sever & generating url*/

          //asking for image crop from user
          if (confirm('Do you want to crop the image?')) {
              // get cropped image & proceed
              getCroppedImage(screenshotUrl, "reversesearch");
              chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
                  if (message.callbackMethod === "reversesearch") {
                      var blob = dataURItoBlob(message.croppedImage);
                      var fd = new FormData();
                      fd.append("file", blob);

                      var xhr = new XMLHttpRequest();
                      xhr.responseType = 'json';
                      xhr.open('POST', 'https://file.io', true);
                      xhr.onload = function() {
                          // Request finished, now opening new tab with google image search url.
                          if (this.response.success && this.response.success === true) {
                              /*opening new tab with the search results*/
                              var searchURL = "https://www.google.com/searchbyimage?&image_url=" + this.response.link;
                              chrome.tabs.create({
                                  url: searchURL
                              }, function(tab) {
                                if(debug){
                                  console.log("reverse search successful");
                                }
                              });
                          } else {
                              if(debug){
                                console.log("Sorry, Unable to perform reverse search!");
                              }
                          }
                      };
                      xhr.send(fd);
                  }
                  //removing message listener
                  chrome.runtime.onMessage.removeListener(arguments.callee);
              });
          } else {
              // proceed as before
              var blob = dataURItoBlob(screenshotUrl);
              var fd = new FormData();
              fd.append("file", blob);

              var xhr = new XMLHttpRequest();
              xhr.responseType = 'json';
              xhr.open('POST', 'https://file.io', true);
              xhr.onload = function() {
                  // Request finished, now opening new tab with google image search url.
                  if (this.response.success && this.response.success === true) {
                      /*opening new tab with the search results*/
                      var searchURL = "https://www.google.com/searchbyimage?&image_url=" + this.response.link;
                      chrome.tabs.create({
                          url: searchURL
                      }, function(tab) {
                        if(debug){
                          console.log("reverse search successful");
                        }
                      });
                  } else {
                      if(debug){
                        console.log("Sorry, Unable to perform reverse search!");
                      }
                  }
              };
              xhr.send(fd);
          }

      });
  }
function swapTab() {
   var currentTabId;
            chrome.tabs.getSelected(null, function(tab) {
              currentTabId = tab.id;
              chrome.tabs.query({}, function (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                  if(tabs[i].id == currentTabId){
                    chrome.tabs.update(tabs[data.result.parameters.number].id, { active: true});
                  }

                }
                  });
                  });
 }
  function takeScreenshot() {

      chrome.tabs.captureVisibleTab(function(screenshotUrl) {
          var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + screenshotId++)
          var targetId = null;

          //asking for image crop from user
          if (confirm('Do you want to crop the image?')) {
              // get cropped image & proceed
              //if user wants to crop image
              getCroppedImage(screenshotUrl, "screenshot");
              chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
                  if (message.callbackMethod === "screenshot") {
                     if(debug){
                        console.log("CroppedImage Recieved!!");
                      }
                      chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
                          // we are waiting for the tab to be open
                          if (tabId != targetId || changedProps.status != "complete")
                              return;

                          chrome.tabs.onUpdated.removeListener(listener);

                          // Look through all views to find the window which will display
                          // the screenshot, query paramater assures that it is unique
                          var views = chrome.extension.getViews();
                          for (var i = 0; i < views.length; i++) {
                              var view = views[i];
                              if (view.location.href == viewTabUrl) {
                                  view.setScreenshotUrl(message.croppedImage);
                                  break;
                              }
                          }
                      });

                      chrome.tabs.create({
                          url: viewTabUrl
                      }, function(tab) {
                          targetId = tab.id;
                      });
                  }

                  //removing message listener
                  chrome.runtime.onMessage.removeListener(arguments.callee);
              });
          } else {
              // proceed as before
              chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
                  // we are waiting for the tab to be open
                  if (tabId != targetId || changedProps.status != "complete")
                      return;

                  chrome.tabs.onUpdated.removeListener(listener);

                  // Look through all views to find the window which will display
                  // the screenshot, query paramater assures that it is unique
                  var views = chrome.extension.getViews();
                  for (var i = 0; i < views.length; i++) {
                      var view = views[i];
                      if (view.location.href == viewTabUrl) {
                          view.setScreenshotUrl(screenshotUrl);
                          break;
                      }
                  }
              });

              chrome.tabs.create({
                  url: viewTabUrl
              }, function(tab) {
                  targetId = tab.id;
              });
          }
      });

  }

  function processIt(data) {
      var temperature = parseInt(data.main.temp - 273.15);
      var humidity = parseInt(data.main.humidity);
      var windSpeed = parseInt(data.wind.speed);
      var cloudsDescription = data.weather[0].description;
      var temperatureString = "temperature is  " + temperature;
      var humidityString = "humidity is " + humidity;
      var windSpeedString = "wind speed is " + windSpeed;
      var cloudsDescriptionString = "sky description " + cloudsDescription;

      var weather_response = temperatureString + ', ' +
          humidityString + ', ' +
          windSpeedString + ', ' +
          cloudsDescriptionString;

      setResponse(weather_response);
      alert(weather_response);

      if(debug){
        alert("temperature is  "+temperature);
        alert("humidity is "+humidity);
        alert("wind speed is "+windSpeed);
        alert("sky description "+cloudsDescription);   
      }
  }

  function weather(city) {
      var baseUrl = "http://api.openweathermap.org/data/2.5/weather?q=";
      var key = "ec58b4518e2a455913f8e64a7ac16248";
      var Url = baseUrl + city + "&APPID=" + key;

      $.getJSON(Url, function(dataJson) {
          var data = JSON.stringify(dataJson);
          var parsedData = JSON.parse(data);
          processIt(parsedData);
      });
  }

  function tellJoke() {
      var jokeURL = 'https://icanhazdadjoke.com/';
      $.getJSON(jokeURL, function(data) {
          setResponse(data.joke.toLowerCase());
          chrome.tabs.create({
              'url': jokeURL+'j/'+data.id
          });
      }).fail(function() {
          var failJoke = "Sorry! I can't read the joke! You can have a look at it!";
          setResponse(failJoke);
          chrome.tabs.create({
              'url': 'https://icanhazdadjoke.com/'
          });
      });
  }

  function speakAQuote() {
      var quoteUrl = 'http://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json';
      $.getJSON(quoteUrl, function(data) {
          setResponse(data.quoteText);
          chrome.tabs.create({
              'url': data.quoteLink
          });
      }).fail(function() {
          chrome.tabs.create({
              'url': 'https://forismatic.com/en/homepage'
          });
      });
  }

  function getHoroscope(sign) {
      var url = "http://horoscope-api.herokuapp.com/horoscope/today/"+sign;
      var linkUrl = "https://www.ganeshaspeaks.com/horoscopes/daily-horoscope/"+sign;
      var responseText = "Today's horoscope for "+sign+", ";
     $.getJSON(url, function(data) {
          setResponse(responseText+data.horoscope);
          chrome.tabs.create({
              'url': linkUrl
          });
      }).fail(function() {
          chrome.tabs.create({
              'url': linkUrl
          });
      });
  }

  function getWOTD() {
      var wotdURL = 'http://api.wordnik.com/v4/words.json/wordOfTheDay?api_key='+wordnikAPIKey;
      $.getJSON(wotdURL, function(data) {
          var wotdResponse = data.word + " means " + data.definitions.text;
          setResponse(wotdResponse);
          chrome.tabs.create({
              'url': 'https://www.wordnik.com/word-of-the-day'
          });
      }).fail(function() {
          chrome.tabs.create({
              'url': 'https://www.wordnik.com/word-of-the-day'
          });
      });
  }

  function duckduckgoOrGoogle(query) {
      if(debug){
        alert('duckduckgoOrGoogle ' + query);
      }
      var duckduckgoApiUrl = 'https://api.duckduckgo.com/';
      var remote = duckduckgoApiUrl + '?q=' + encodeURIComponent(query) + '&format=json';
      if(debug){
        alert(remote);
      }   
      $.getJSON(remote, function(data) {
          if (data.AbstractText != '') {
              setResponse(data.AbstractText);
              // alert(data.AbstractText);
              chrome.tabs.create({
                  'url': 'https://duckduckgo.com/?q=' + encodeURIComponent(query)
              });
          } else {
              chrome.tabs.create({
                  'url': 'http://google.com/search?q=' + encodeURIComponent(query)
              });
          }
      }).fail(function() {
          chrome.tabs.create({
              'url': 'http://google.com/search?q=' + encodeURIComponent(query)
          });
      });

  }

  function tweet(tweets) {
      if(debug){
        var tweets=document.getElementById('tweetText').value;
      }
      var url = 'http://twitter.com/home?status=' + encodeURIComponent(tweets);
      chrome.tabs.create({
          'url': url
      });
      if(debug){
        openInNewTab(url);
      }
  }

  function searchYoutube(temp) {
      var gapikey = 'AIzaSyBxg6zIGlqie7QxvFlGFTIIk4yWtgIlAak';
      q = temp;
      $.get(
          "https://www.googleapis.com/youtube/v3/search", {
              part: 'snippet, id',
              q: q,
              type: 'video',
              key: gapikey
          },
          function(data) {
              $.each(data.items, function(i, item) {
                  var videoID = item.id.videoId;
                  var nurl = "https://www.youtube.com/watch?v=" + videoID;
                  if(debug){
                    alert(temp + videoID);
                    openInNewTab(nurl);
                  }
                  chrome.tabs.create({
                      'url': nurl
                  });
                  return false;
              });
          });
  }

  function populateVoiceList() {
    if(typeof speechSynthesis === 'undefined') {
      return;
    }
  
    voices = speechSynthesis.getVoices();
  
    for(i = 0; i < voices.length ; i++) {
      var option = document.createElement('option');
      option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
      
      if(voices[i].default) {
        option.textContent += ' -- DEFAULT';
      }
  
      option.setAttribute('data-lang', voices[i].lang);
      option.setAttribute('data-name', voices[i].name);
      document.getElementById("voiceSelect").appendChild(option);
    }


    currentVoice = JSON.parse(localStorage.getItem('currentVoice_Anna'));
    if(currentVoice){
        document.getElementById("voiceSelect").selectedIndex = currentVoice.index;
    }
      

    $(function () {
        $("#voiceSelect").on('change', function() {
            currentVoice = jQuery.extend({}, voices[this.selectedIndex]);
            currentVoice.index = this.selectedIndex;
            localStorage.setItem('currentVoice_Anna', JSON.stringify(currentVoice));
          });
    });

  }


  function setResponse(val) {
      Speech(val);
  }
  //to speech 
  function Speech(say) {
      if ('speechSynthesis' in window && talking) {
          var language = window.navigator.userLanguage || window.navigator.language;
          var utterance = new SpeechSynthesisUtterance(say);
          currentVoice = JSON.parse(localStorage.getItem('currentVoice_Anna'));
          if(currentVoice){
              utterance.volume = 1; // 0 to 1
              utterance.pitch = 0; //0 to 2
              utterance.voice = voices[currentVoice.index];
              speechSynthesis.speak(utterance);
          }else if (timevocal == 1) {
              utterance.volume = 1; // 0 to 1
              utterance.pitch = 0; //0 to 2
              utterance.voiceURI = 'native';
              utterance.lang = "en-IN";
              speechSynthesis.speak(utterance);
              timevocal = 0
          } else {
              utterance.volume = 1; // 0 to 1
              utterance.pitch = 0; //0 to 2
              utterance.voiceURI = 'native';
              utterance.lang = "hi-IN";
              speechSynthesis.speak(utterance);
          }
      }
  }


});
