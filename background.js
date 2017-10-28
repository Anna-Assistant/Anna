chrome.browserAction.onClicked.addListener(function (tab) {
    alert();
  });
  /////////////////////events///////////////////////////
  $(document).ready(function () {
  
    var accessToken = "e57db16af93c4cfbbd7ae67a93aa7e6f";
    var baseUrl = "https://api.api.ai/v1/";
  
  
    var timevocal = 0;
    var talking = true;
    var recognition;
    var txt;
    var voicetrigger;
    startRecognition();
    checkOnline();
  
    //first time when application will be loaded
    chrome.storage.local.get(/* String or Array */["firsttime"], function (items2) {
      if (items2.firsttime === undefined || items2.firsttime === 2) {
        chrome.storage.local.set({ "firsttime": 3 }, function () {
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
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { oldTabID = tabs[0].id });
      chrome.tabs.create({
        active: true,
        url: 'permission.html'
      }, null);
      var permissionsTabID;
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { permissionsTabID = tabs[0].id });
      chrome.tabs.onRemoved.addListener(function switchTab(tabId) {
        if (tabId == permissionsTabID) {
          chrome.tabs.update(oldTabID, { selected: true }, function () {
            listen();
          });
          chrome.extension.onRequest.removeListener(switchTab);
        }
      });
    };
  
    // check if browser if online or offline
    var offline = false;
    checkOnline();
    function checkOnline() {
      if (!navigator.onLine && !offline) {
        offline = true;
        chrome.storage.local.set({ "onoffswitch": "false" }, function () {
  
        });
      }
      if (navigator.onLine) {
        offline = false;
      }
      setTimeout(checkOnline, 1000);
    }
    //function for recognition
    function startRecognition() {
      chrome.storage.local.get(/* String or Array */["onoffswitch"], function (items) {
        if (items.onoffswitch === "true") {
          recognition = new webkitSpeechRecognition();
          recognition.onstart = function (event) {
            updateRec();
          };
          var text = "";
          recognition.onresult = function (event) {
            for (var i = event.resultIndex; i < event.results.length; ++i) {
              text += event.results[i][0].transcript;
            }
  
            //setInput(text);
  
            //stopRecognition();
          };
          recognition.onend = function () {
  
            var our_trigger = "hey ";
  
            if (text.toLowerCase() === our_trigger.toLowerCase()) {
              // alert(text);
              Speech("Yes");
              sleep(1500);
              /*chrome.storage.local.clear(function() {
              var error = chrome.runtime.lastError;
              if (error) {
              console.error(error);
              }
            });*/
              recognition.stop();
              startRecognitionaftertrigger();
            }
            else
              if (text.toLowerCase().startsWith(our_trigger.toLowerCase())) {
                var str = text.toLowerCase().replace(our_trigger.toLowerCase() + " ", "");
                setInput(str);
                recognition.stop();
                startRecognition();
              }
              else {
                recognition.stop();
                startRecognition();
              }
  
            // stopRecognition();
          };
          recognition.lang = "en-US";
          recognition.start();
        }
        else {
          startRecognition();
        }
      });
    }
    //start recognition after trigger
    function startRecognitionaftertrigger() {
      recognition = new webkitSpeechRecognition();
      recognition.onstart = function (event) {
        //updateRec();
      };
      var text = "";
      recognition.onresult = function (event) {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        //setInput(text);
  
        //stopRecognition();
      };
      recognition.onend = function () {
        if (text === "") {
          recognition.stop();
          startRecognition();
        }
        else {
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
      // updateRec();
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
      alert('you said ' + txt);
      setResponse('you said ' + txt);
      console.log('you said ' + txt);
      tasks();
    }
    
  
    function setResponse(val) {
      Speech(val);
    }
    //to speech 
    function Speech(say) {
      if ('speechSynthesis' in window && talking) {
        var language = window.navigator.userLanguage || window.navigator.language;
        var utterance = new SpeechSynthesisUtterance(say);
  
        if (timevocal == 1) {
          utterance.volume = 1; // 0 to 1
          utterance.pitch = 0.5; //0 to 2
          utterance.voiceURI = 'native';
          utterance.lang = "en-IN";
          speechSynthesis.speak(utterance);
          timevocal = 0
        }
        else {
          utterance.volume = 1; // 0 to 1
          //utterance.rate = 0.1; // 0.1 to 10
          utterance.pitch = 0; //0 to 2
          //utterance.text = 'Hello World';
          utterance.voiceURI = 'native';
          utterance.lang = "hi-IN";
          speechSynthesis.speak(utterance);
        }
      }
    }
  });