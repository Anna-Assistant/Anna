chrome.browserAction.onClicked.addListener(function (tab) {
  alert();
});
/////////////////////events///////////////////////////
$(document).ready(function () {

  var accessToken = "499c4ada72d74d349bb1d8d7b8a7eb42";
  var timevocal = 0;
  var baseUrl = "https://api.api.ai/v1/";
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
      	chrome.tabs.create({ 'url': 'elate/index.html' });
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
            Speech("Yes Sir");
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
    // alert('you said ' + txt);
    setResponse('you said ' + txt);
    console.log('you said ' + txt);
    txt = txt.replace('hey ', '');
    // alert(txt);
    tasks();
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
      data: JSON.stringify({ query: txt, lang: "en", sessionId: "somerandomthing" }),
      success: function (data) {
        // alert("intent " + data.result.metadata.intentName);
        if (data.result.metadata.intentName === "youtube") {
          searchYoutube(data.result.parameters.any);
          // chrome.tabs.create({ 'url': 'https://www.youtube.com/results?search_query=' + data.result.parameters.any });
        } else
          if (data.result.metadata.intentName === "open") {
            chrome.tabs.create({ 'url': "http://www." + data.result.parameters.website });
          } else
            if (data.result.metadata.intentName === "mail") {
              chrome.tabs.create({ 'url': "https://mail.google.com/mail/?view=cm&fs=1&body=" + data.result.parameters.any });
            } else
              if (data.result.metadata.intentName === "tweet") {
                tweet(data.result.parameters.any);
                // chrome.tabs.create({ 'url': "http://www." + data.result.parameters.website });
              } else
                if (data.result.metadata.intentName === "maps") {

                  chrome.tabs.create({ 'url': "https://www.google.com/maps/dir/" + data.result.parameters["geo-city"][0] + "/" + data.result.parameters["geo-city"][1] });
                } else
                  if (data.result.metadata.intentName === "mapPlace") {
                    chrome.tabs.create({ 'url': "https://www.google.com/maps/?q=" + data.result.parameters.any });
                  }
                  else if(data.result.metadata.intentName == "weather") {
                  	weather(data.result.parameters.any);
                  }
                  else if (data.result.metadata.intentName == "ducky") {
                    duckduckgoOrGoogle(data.result.parameters.any);
                  }
                  else if (data.result.source == "domains") {
                    setResponse(data.result.fulfillment.speech);
                    // alert(data.result.fulfillment.speech);
                  }
                  else if (data.result.metadata.intentName == "motivate") {
                    speakAQuote();
                  }else
                  if(data.result.metadata.intentName == "close"){
                    chrome.tabs.getSelected(null, function(tab) {
                    tab = tab.id;
                    chrome.tabs.remove(tab,function(){});
                    tabUrl = tab.url;
                    //alert(tab.url);
                  });
                  Speech("closing");
                }
                  else {
                    // setResponse(data.result.fulfillment.speech);
                    chrome.tabs.create({ 'url': 'http://google.com/search?q=' + txt });
                    // chrome.tabs.create({ 'url': 'http://google.com/search?q=' + txt });
                  }
      },
      error: function () {
        alert("Sorry ! we are having some internal problem. Please Try again.");
        setResponse("Sorry ! we are having some internal problem. Please Try again.");
      }
    });
  }

	function processIt(data)
	{
		var temperature=parseInt(data.main.temp-273.15);
		var humidity=parseInt(data.main.humidity);
		var windSpeed=parseInt(data.wind.speed);
		var cloudsDescription=data.weather[0].description;
		var temperatureString="temperature is  "+temperature;
		var humidityString="humidity is "+humidity;
		var windSpeedString="wind speed is "+windSpeed;
		var cloudsDescriptionString="sky description "+cloudsDescription;

		var weather_response = temperatureString + ', ' +
								humidityString + ', ' +
								windSpeedString + ', ' +
								cloudsDescriptionString;

		setResponse(weather_response);
		alert(weather_response);

		//alert("temperature is  "+temperature);
		//alert("humidity is "+humidity);
		//alert("wind speed is "+windSpeed);
		//alert("sky description "+cloudsDescription);
	}

	function weather(city)
	{
		var baseUrl="http://api.openweathermap.org/data/2.5/weather?q=";
		var key="ec58b4518e2a455913f8e64a7ac16248";
		var Url=baseUrl+city+"&APPID="+key;
		
		$.getJSON(Url,function(dataJson)
		{
			var data=JSON.stringify(dataJson); 
			var parsedData=JSON.parse(data);
			processIt(parsedData);
		});
	}


  // TO DO - Fix this
  function speakAQuote() {
    var quoteUrl = 'http://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json';
    $.getJSON(quoteUrl, function (data) {
      // alert("inside");
      // alert(data.length);

      setResponse(data.quoteText);
      chrome.tabs.create({ 'url': data.quoteLink });
    }).fail(function () {
      chrome.tabs.create({ 'url': 'https://forismatic.com/en/homepage' });
    });
    // alert('m here');
  }

  function duckduckgoOrGoogle(query) {
    // alert('duckduckgoOrGoogle ' + query);
    var duckduckgoApiUrl = 'https://api.duckduckgo.com/';
    var remote = duckduckgoApiUrl + '?q=' + encodeURIComponent(query) + '&format=json';
    // alert(remote);

    $.getJSON(remote, function (data) {
      if (data.AbstractText != '') {
        setResponse(data.AbstractText);
        // alert(data.AbstractText);
        chrome.tabs.create({ 'url': 'https://duckduckgo.com/?q=' + encodeURIComponent(query) });
      }
      else {
        chrome.tabs.create({ 'url': 'http://google.com/search?q=' + encodeURIComponent(query) });
      }
    }).fail(function () {
      chrome.tabs.create({ 'url': 'http://google.com/search?q=' + encodeURIComponent(query) });
    });

  }

  function tweet(tweets) {
    // var tweets=document.getElementById('tweetText').value;
    var url = 'http://twitter.com/home?status=' + encodeURIComponent(tweets);
    chrome.tabs.create({ 'url': url });
    // openInNewTab(url);
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
      }, function (data) {
        $.each(data.items, function (i, item) {
          var videoID = item.id.videoId;
          var nurl = "https://www.youtube.com/watch?v=" + videoID;
          // alert(temp + videoID);
          // openInNewTab(nurl);
          chrome.tabs.create({ 'url': nurl });
          return false;
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
      //msg.voice = voices[10]; // Note: some voices don't support altering params
      //msg.voiceURI = 'native';
      if (timevocal == 1) {
        utterance.volume = 1; // 0 to 1
        utterance.pitch = 0; //0 to 2
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