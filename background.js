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
  var our_trigger = "ok ";
  var wordnikAPIKey = "";
  var voices;
  var currentVoice;
  startRecognition();
  checkOnline();
  if (
    typeof speechSynthesis !== "undefined" &&
    speechSynthesis.onvoiceschanged !== undefined
  ) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  //first time when application will be loaded
  chrome.storage.local.get(/* String or Array */ ["firsttime"], function(
    items2
  ) {
    if (items2.firsttime === undefined || items2.firsttime === 2) {
      chrome.storage.local.set(
        {
          firsttime: 3
        },
        function() {
          chrome.tabs.create({
            url: "elate/index.html"
          });
          getPermission();
        }
      );
    }
  });

  //function for giving sleep
  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if (new Date().getTime() - start > milliseconds) {
        break;
      }
    }
  }

  function getPermission() {
    var oldTabID;
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true
      },
      function(tabs) {
        oldTabID = tabs[0].id;
      }
    );
    chrome.tabs.create(
      {
        active: true,
        url: "permission.html"
      },
      null
    );
    var permissionsTabID;
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true
      },
      function(tabs) {
        permissionsTabID = tabs[0].id;
      }
    );
    chrome.tabs.onRemoved.addListener(function switchTab(tabId) {
      if (tabId == permissionsTabID) {
        chrome.tabs.update(
          oldTabID,
          {
            selected: true
          },
          function() {
            // listen();
            startRecognition();
          }
        );
        chrome.extension.onRequest.removeListener(switchTab);
      }
    });
  }

  // check if browser is online or offline
  var offline = false;
  checkOnline();

  function checkOnline() {
    if (!navigator.onLine && !offline) {
      offline = true;
      //   voices = [];
      chrome.storage.local.set(
        {
          onoffswitch: "false"
        },
        function() {}
      );
    }
    if (navigator.onLine) {
      offline = false;
    }
    setTimeout(checkOnline, 1000);
  }

  /* method to change the anna status icon on page*/
  function changeStatus(newStatus) {
    chrome.storage.local.get(/* String or Array */ ["statusicon"], function(
      items
    ) {
      if (items.statusicon === undefined || items.statusicon === "false") {
        newStatus = "noIcon";
      }

      chrome.tabs.query(
        {
          active: true,
          currentWindow: true
        },
        function(tabs) {
          try {
            if (
              tabs[0] === undefined ||
              tabs[0].url.startsWith("chrome://") ||
              tabs[0].url.startsWith("chrome-extension://")
            ) {
              throw "Internal Browser Page Active";
            }
            var tabId = tabs[0].id;

            chrome.tabs.executeScript(
              tabId,
              {
                code: 'var status ="' + newStatus + '";'
              },
              function() {
                chrome.tabs.executeScript(
                  tabId,
                  {
                    file: "js/set_status_icon.js"
                  },
                  function() {
                    if (debug) {
                      console.log("Status set to " + newStatus);
                    }
                  }
                );
              }
            );
          } catch (e) {
            if (debug) {
              console.log("Error Message: " + e);
            }
          }
        }
      );
    });
  }

  //function for recognition
  function startRecognition() {
    chrome.storage.local.get(/* String or Array */ ["onoffswitch"], function(
      items
    ) {
      if (items.onoffswitch === "true") {
        changeStatus("listening");
        chrome.browserAction.setIcon({ path: "img/icon.png" });
        recognition = new webkitSpeechRecognition();
        recognition.onstart = function(event) {
          updateRec();
        };
        var text = "";
        recognition.onresult = function(event) {
          for (var i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          if (debug) {
            setInput("hey open facebook");
            stopRecognition();
          }
        };
        recognition.onend = function() {
          if (text.toLowerCase() === our_trigger.toLowerCase()) {
            changeStatus("active");
            if (debug) {
              alert(text);
            }
            Speech("Yes Sir");
            sleep(1500);
            if (debug) {
              chrome.storage.local.clear(function() {
                var error = chrome.runtime.lastError;
                if (error) {
                  console.error(error);
                }
              });
            }
            recognition.stop();
            startRecognitionaftertrigger();
          } else if (text.toLowerCase().startsWith(our_trigger.toLowerCase())) {
            changeStatus("active");
            chrome.browserAction.setIcon({ path: "img/icon-active.png" });
            var str = text
              .toLowerCase()
              .replace(our_trigger.toLowerCase() + " ", "");
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
        chrome.browserAction.setIcon({ path: "img/icon-inactive.png" });
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
      if (debug) {
        updateRec();
      }
    };
    var text = "";
    recognition.onresult = function(event) {
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        text += event.results[i][0].transcript;
      }
      if (debug) {
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

  function updateRec() {}
  //sending the data to server
  function send() {
    if (debug) {
      alert("you said " + txt);
      setResponse("you said " + txt);
      console.log("user said " + txt);
      txt = txt.replace(our_trigger, "");
      alert(txt);
      tasks();
    } else {
      txt = txt.replace(our_trigger, "");
      tasks();
    }
  }
  async function get_lyrics(command) {
    var obj = await fetch(
      "http://api.genius.com/search?q=" + command,

      {
        headers: {
          Authorization:
            "Bearer dp7sB4-Li2skNwHMdBuXz2yQYKm2moTTW7aVLI1yLBxVnB479rf3HFDJbB9hoDe0"
        }
      }
    );
    var data = await obj.json();
    chrome.tabs.create({
      url: data.response.hits[0].result.url
    });
  }
  function translate_(command) {
    // language codes
    const language_code = [
      { code: "ab", name: "abkhaz" },
      { code: "aa", name: "afar" },
      { code: "af", name: "afrikaans" },
      { code: "ak", name: "akan" },
      { code: "sq", name: "albanian" },
      { code: "am", name: "amharic" },
      { code: "ar", name: "arabic" },
      { code: "an", name: "aragonese" },
      { code: "hy", name: "armenian" },
      { code: "as", name: "assamese" },
      { code: "av", name: "avaric" },
      { code: "ae", name: "avestan" },
      { code: "ay", name: "aymara" },
      { code: "az", name: "azerbaijani" },
      { code: "bm", name: "bambara" },
      { code: "ba", name: "bashkir" },
      { code: "eu", name: "basque" },
      { code: "be", name: "belarusian" },
      { code: "bn", name: "bengali" },
      { code: "bh", name: "bihari" },
      { code: "bi", name: "bislama" },
      { code: "bs", name: "bosnian" },
      { code: "br", name: "breton" },
      { code: "bg", name: "bulgarian" },
      { code: "my", name: "burmese" },
      { code: "ca", name: "catalan; valencian" },
      { code: "ch", name: "chamorro" },
      { code: "ce", name: "chechen" },
      { code: "ny", name: "chichewa; chewa; nyanja" },
      { code: "zh-CN", name: "chinese" },
      { code: "cv", name: "chuvash" },
      { code: "kw", name: "cornish" },
      { code: "co", name: "corsican" },
      { code: "cr", name: "cree" },
      { code: "hr", name: "croatian" },
      { code: "cs", name: "czech" },
      { code: "da", name: "danish" },
      { code: "dv", name: "divehi" },
      { code: "nl", name: "dutch" },
      { code: "en", name: "english" },
      { code: "eo", name: "esperanto" },
      { code: "et", name: "estonian" },
      { code: "ee", name: "ewe" },
      { code: "fo", name: "faroese" },
      { code: "fj", name: "fijian" },
      { code: "fi", name: "finnish" },
      { code: "fr", name: "french" },
      { code: "ff", name: "fula" },
      { code: "gl", name: "galician" },
      { code: "ka", name: "georgian" },
      { code: "de", name: "german" },
      { code: "el", name: "greek" },
      { code: "gn", name: "guaran\u00ed" },
      { code: "gu", name: "gujarati" },
      { code: "ht", name: "haitian" },
      { code: "ha", name: "hausa" },
      { code: "he", name: "hebrew" },
      { code: "hz", name: "herero" },
      { code: "hi", name: "hindi" },
      { code: "ho", name: "hiri motu" },
      { code: "hu", name: "hungarian" },
      { code: "ia", name: "interlingua" },
      { code: "id", name: "indonesian" },
      { code: "ie", name: "interlingue" },
      { code: "ga", name: "irish" },
      { code: "ig", name: "igbo" },
      { code: "ik", name: "inupiaq" },
      { code: "io", name: "ido" },
      { code: "is", name: "icelandic" },
      { code: "it", name: "italian" },
      { code: "iu", name: "inuktitut" },
      { code: "ja", name: "japanese" },
      { code: "jv", name: "javanese" },
      { code: "kl", name: "kalaallisut, greenlandic" },
      { code: "kn", name: "kannada" },
      { code: "kr", name: "kanuri" },
      { code: "ks", name: "kashmiri" },
      { code: "kk", name: "kazakh" },
      { code: "km", name: "khmer" },
      { code: "ki", name: "kikuyu, gikuyu" },
      { code: "rw", name: "kinyarwanda" },
      { code: "ky", name: "kirghiz, kyrgyz" },
      { code: "kv", name: "komi" },
      { code: "kg", name: "kongo" },
      { code: "ko", name: "korean" },
      { code: "ku", name: "kurdish" },
      { code: "kj", name: "kwanyama, kuanyama" },
      { code: "la", name: "latin" },
      { code: "lb", name: "luxembourgish, letzeburgesch" },
      { code: "lg", name: "luganda" },
      { code: "li", name: "limburgish, limburgan, limburger" },
      { code: "ln", name: "lingala" },
      { code: "lo", name: "lao" },
      { code: "lt", name: "lithuanian" },
      { code: "lu", name: "luba-katanga" },
      { code: "lv", name: "latvian" },
      { code: "gv", name: "manx" },
      { code: "mk", name: "macedonian" },
      { code: "mg", name: "malagasy" },
      { code: "ms", name: "malay" },
      { code: "ml", name: "malayalam" },
      { code: "mt", name: "maltese" },
      { code: "mi", name: "m\u0101ori" },
      { code: "mr", name: "marathi (mar\u0101\u1e6dh\u012b)" },
      { code: "mh", name: "marshallese" },
      { code: "mn", name: "mongolian" },
      { code: "na", name: "nauru" },
      { code: "nv", name: "navajo, navaho" },
      { code: "nb", name: "norwegian bokm\u00e5l" },
      { code: "nd", name: "north ndebele" },
      { code: "ne", name: "nepali" },
      { code: "ng", name: "ndonga" },
      { code: "nn", name: "norwegian nynorsk" },
      { code: "no", name: "norwegian" },
      { code: "ii", name: "nuosu" },
      { code: "nr", name: "south ndebele" },
      { code: "oc", name: "occitan" },
      { code: "oj", name: "ojibwe, ojibwa" },

      { code: "om", name: "oromo" },
      { code: "or", name: "oriya" },
      { code: "os", name: "ossetian, ossetic" },
      { code: "pa", name: "panjabi, punjabi" },

      { code: "fa", name: "persian" },
      { code: "pl", name: "polish" },
      { code: "ps", name: "pashto, pushto" },
      { code: "pt", name: "portuguese" },
      { code: "qu", name: "quechua" },
      { code: "rm", name: "romansh" },
      { code: "rn", name: "kirundi" },
      { code: "ro", name: "romanian" },
      { code: "ru", name: "russian" },
      { code: "sa", name: "sanskrit" },
      { code: "sc", name: "sardinian" },
      { code: "sd", name: "sindhi" },
      { code: "se", name: "northern sami" },
      { code: "sm", name: "samoan" },
      { code: "sg", name: "sango" },
      { code: "sr", name: "serbian" },
      { code: "gd", name: "scottish" },
      { code: "sn", name: "shona" },
      { code: "si", name: "sinhala" },
      { code: "sk", name: "slovak" },
      { code: "sl", name: "slovene" },
      { code: "so", name: "somali" },
      { code: "st", name: "southern sotho" },
      { code: "es", name: "spanish" },
      { code: "su", name: "sundanese" },
      { code: "sw", name: "swahili" },
      { code: "ss", name: "swati" },
      { code: "sv", name: "swedish" },
      { code: "ta", name: "tamil" },
      { code: "te", name: "telugu" },
      { code: "tg", name: "tajik" },
      { code: "th", name: "thai" },
      { code: "ti", name: "tigrinya" },
      { code: "bo", name: "tibetan" },
      { code: "tk", name: "turkmen" },
      { code: "tl", name: "tagalog" },
      { code: "tn", name: "tswana" },
      { code: "to", name: "tonga (tonga islands)" },
      { code: "tr", name: "turkish" },
      { code: "ts", name: "tsonga" },
      { code: "tt", name: "tatar" },
      { code: "tw", name: "twi" },
      { code: "ty", name: "tahitian" },
      { code: "ug", name: "uighur, uyghur" },
      { code: "uk", name: "ukrainian" },
      { code: "ur", name: "urdu" },
      { code: "uz", name: "uzbek" },
      { code: "ve", name: "venda" },
      { code: "vi", name: "vietnamese" },
      { code: "wa", name: "walloon" },
      { code: "cy", name: "welsh" },
      { code: "wo", name: "wolof" },
      { code: "fy", name: "western frisian" },
      { code: "xh", name: "xhosa" },
      { code: "yi", name: "yiddish" },
      { code: "yo", name: "yoruba" },
      { code: "za", name: "zhuang, chuang" }
    ];

    var lang;
    var index = command.search("into"); //get index for 'into' keyword

    //if into is not used, 'to' might be used
    if (index < 0) {
      index = command.search("to");

      var sentense = command.substring(0, index); //grab text to translate
      index += 3;
    } else {
      sentense = command.substring(0, index); //grab text to translate

      index = index + 5;
    }
    //get langauge to translate to
    lang = command.substring(index);

    for (var i of language_code) {
      if (i.name == lang) {
        chrome.tabs.create({
          url: "https://translate.google.com/#auto/" + i.code + "/" + sentense
        });

        break;
      }
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
        Authorization: "Bearer " + accessToken
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
            url: "http://www." + data.result.parameters.website
          });
        } else if (data.result.metadata.intentName === "incognito") {
          chrome.windows.create({
            url: "http://www.google.com",
            incognito: true
          });
          chrome.extension.isAllowedIncognitoAccess(function(isAllowedAccess) {
            if (isAllowedAccess) {
              return;
            }
            alert("Please allow incognito mode");
            chrome.tabs.create({
              url: "chrome://extensions/?id=" + chrome.runtime.id
            });
            Speech("Now please click on the option Allow in incognito");
          });
        } else if (data.result.metadata.intentName === "calendar") {
          //Speech("please tell details about the event");
          chrome.identity.getProfileUserInfo(function(userInfo) {
            //   console.log(userInfo.id);
            chrome.tabs.create({
              url:
                "https://www.google.com/calendar/render?action=TEMPLATE&text=data.result.parameters.any&dates=data.result.parameters.dateTdata.result.parameters.timeZ&output=xml"
            });
          });
        } else if (data.result.metadata.intentName === "history") {
          chrome.tabs.create({
            url: "chrome://history"
          });
        } else if (data.result.metadata.intentName === "downloads") {
          chrome.tabs.create({
            url: "chrome://downloads"
          });
        } else if (data.result.metadata.intentName === "translate") {
          chrome.extension
            .getBackgroundPage()
            .console.log(data.result.parameters);
          translate_(data.result.parameters.any);
        } else if (data.result.metadata.intentName === "lyrics") {
          get_lyrics(
            data.result.resolvedQuery.replace("lyrics", "").replace(/\s/g, "")
          );
        } else if (data.result.metadata.intentName === "mail") {
          chrome.tabs.create({
            url:
              "https://mail.google.com/mail/?view=cm&fs=1&body=" +
              data.result.parameters.any
          });
        } else if (data.result.metadata.intentName == "joke") {
          tellJoke();
        } else if (data.result.metadata.intentName == "nextTab") {
          swapTab();
        } else if (data.result.metadata.intentName == "reload") {
          chrome.tabs.reload();
        } else if (data.result.metadata.intentName == "bookmark") {
          chrome.tabs.getSelected(function(tab) {
            chrome.bookmarks.create({
              title: tab.title,
              url: tab.url
            });
          });
        } else if (data.result.metadata.intentName === "tweet") {
          tweet(data.result.parameters.any);
          if (debug) {
            chrome.tabs.create({
              url: "http://www." + data.result.parameters.website
            });
          }
        } else if (data.result.metadata.intentName === "maps") {
          chrome.tabs.create({
            url:
              "https://www.google.com/maps/dir/" +
              data.result.parameters["geo-city"][0] +
              "/" +
              data.result.parameters["geo-city"][1]
          });
        } else if (data.result.metadata.intentName === "restaurants") {
          chrome.tabs.create({
            url:
              "https://www.google.com/maps/search/" +
              data.result.parameters.any +
              "+" +
              "restaurants"
          });
        } else if (data.result.metadata.intentName === "mapPlace") {
          chrome.tabs.create({
            url: "https://www.google.com/maps/?q=" + data.result.parameters.any
          });
        } else if (data.result.metadata.intentName === "lyrics") {
          chrome.tabs.create({
            url:
              "https://www.google.com/search?q=lyrics+for+" +
              data.result.parameters.any +
              "&btnI"
          });
        } else if (data.result.metadata.intentName == "weather") {
          weather(data.result.parameters.any);
        } else if (data.result.metadata.intentName == "screenshot") {
          takeScreenshot();
        } else if (data.result.metadata.intentName == "reversesearch") {
          reverseSearch();
        } else if (data.result.source == "domains") {
          setResponse(data.result.fulfillment.speech);
          if (debug) {
            alert(data.result.fulfillment.speech);
          }
        } else if (data.result.metadata.intentName == "motivate") {
          speakAQuote();
        } else if (data.result.metadata.intentName == "close") {
          chrome.tabs.getSelected(null, function(tab) {
            tab = tab.id;
            chrome.tabs.remove(tab, function() {});
            tabUrl = tab.url;
            if (debug) {
              alert(tab.url);
            }
          });
          Speech("closing");
        } else if (data.result.metadata.intentName === "cache") {
          chrome.tabs.create({
            url: "chrome://settings/clearBrowserData"
          });
        } else if (data.result.metadata.intentName == "horoscope") {
          getHoroscope(data.result.parameters.any);
        } else if (data.result.metadata.intentName == "wotd") {
          getWOTD();
        } else {
          chrome.tabs.create({
            url: "http://google.com/search?q=" + txt
          });
          if (debug) {
            chrome.tabs.executeScript(
              {
                code: "document.getElementsByClassName('_XWk')[0].innerHTML;"
              },
              function(selection) {
                _XWk;
                alert(selection[0]);
                if (selection[0] === null) {
                  chrome.tabs.executeScript(
                    {
                      code:
                        "var rex = /(<([^>]+)>)/ig; document.getElementsByClassName('_Tgc')[0].innerHTML.replace(rex,'').split('.')[0];"
                    },
                    function(sl) {
                      if (sl[0] === null) {
                        chrome.tabs.executeScript(
                          {
                            code:
                              "var rex = /(<([^>]+)>)/ig; document.getElementsByClassName('st')[0].innerHTML.replace(rex,'').split('.')[0];"
                          },
                          function(sl2) {
                            Speech("According to Google " + sl2[0]);
                          }
                        );
                      } else Speech("According to Google " + sl[0]);
                    }
                  );
                } else Speech(selection[0]);
              }
            );
          }
        }
      },
      error: function() {
        alert("Sorry ! we are having some internal problem. Please Try again.");
        setResponse(
          "Sorry ! we are having some internal problem. Please Try again."
        );
      }
    });
  }

  /*utility method to convert dataURL to a blob object*/
  function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(",")[0].indexOf("base64") >= 0)
      byteString = atob(dataURI.split(",")[1]);
    else byteString = unescape(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI
      .split(",")[0]
      .split(":")[1]
      .split(";")[0];

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
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true
      },
      function(tabs) {
        var tabid = tabs[0].id;

        chrome.tabs.executeScript(
          tabid,
          {
            code:
              'var imageurl ="' +
              image +
              '", callbackMethod = "' +
              callbackMethod +
              '";'
          },
          function() {
            /*injecting cropperjs into current tab*/
            chrome.tabs.executeScript(
              tabid,
              {
                file: "js/cropperjs/cropper.js"
              },
              function(response) {
                /*injecting our content script into current tab*/
                chrome.tabs.executeScript(
                  tabid,
                  {
                    file: "js/content_script.js"
                  },
                  function(response) {
                    //   console.log("Indside background script!! id:" + tabid + ", response: " + JSON.stringify(response, null, 4));
                  }
                );
              }
            );
          }
        );
      }
    );
  }

  function reverseSearch() {
    chrome.tabs.captureVisibleTab(function(screenshotUrl) {
      /*uploading the screenshot to a sever & generating url*/

      //asking for image crop from user
      if (confirm("Do you want to crop the image?")) {
        // get cropped image & proceed
        getCroppedImage(screenshotUrl, "reversesearch");
        chrome.runtime.onMessage.addListener(function(
          message,
          sender,
          sendResponse
        ) {
          if (message.callbackMethod === "reversesearch") {
            var blob = dataURItoBlob(message.croppedImage);
            var fd = new FormData();
            fd.append("file", blob);

            var xhr = new XMLHttpRequest();
            xhr.responseType = "json";
            xhr.open("POST", "https://file.io", true);
            xhr.onload = function() {
              // Request finished, now opening new tab with google image search url.
              if (this.response.success && this.response.success === true) {
                /*opening new tab with the search results*/
                var searchURL =
                  "https://www.google.com/searchbyimage?&image_url=" +
                  this.response.link;
                chrome.tabs.create(
                  {
                    url: searchURL
                  },
                  function(tab) {
                    if (debug) {
                      console.log("reverse search successful");
                    }
                  }
                );
              } else {
                if (debug) {
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
        xhr.responseType = "json";
        xhr.open("POST", "https://file.io", true);
        xhr.onload = function() {
          // Request finished, now opening new tab with google image search url.
          if (this.response.success && this.response.success === true) {
            /*opening new tab with the search results*/
            var searchURL =
              "https://www.google.com/searchbyimage?&image_url=" +
              this.response.link;
            chrome.tabs.create(
              {
                url: searchURL
              },
              function(tab) {
                if (debug) {
                  console.log("reverse search successful");
                }
              }
            );
          } else {
            if (debug) {
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
      chrome.tabs.query({}, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].id == currentTabId) {
            chrome.tabs.update(tabs[data.result.parameters.number].id, {
              active: true
            });
          }
        }
      });
    });
  }
  function takeScreenshot() {
    chrome.tabs.captureVisibleTab(function(screenshotUrl) {
      var viewTabUrl = chrome.extension.getURL(
        "screenshot.html?id=" + screenshotId++
      );
      var targetId = null;

      //asking for image crop from user
      if (confirm("Do you want to crop the image?")) {
        // get cropped image & proceed
        //if user wants to crop image
        getCroppedImage(screenshotUrl, "screenshot");
        chrome.runtime.onMessage.addListener(function(
          message,
          sender,
          sendResponse
        ) {
          if (message.callbackMethod === "screenshot") {
            if (debug) {
              console.log("CroppedImage Recieved!!");
            }
            chrome.tabs.onUpdated.addListener(function listener(
              tabId,
              changedProps
            ) {
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

            chrome.tabs.create(
              {
                url: viewTabUrl
              },
              function(tab) {
                targetId = tab.id;
              }
            );
          }

          //removing message listener
          chrome.runtime.onMessage.removeListener(arguments.callee);
        });
      } else {
        // proceed as before
        chrome.tabs.onUpdated.addListener(function listener(
          tabId,
          changedProps
        ) {
          // we are waiting for the tab to be open
          if (tabId != targetId || changedProps.status != "complete") return;

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

        chrome.tabs.create(
          {
            url: viewTabUrl
          },
          function(tab) {
            targetId = tab.id;
          }
        );
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

    var weather_response =
      temperatureString +
      ", " +
      humidityString +
      ", " +
      windSpeedString +
      ", " +
      cloudsDescriptionString;

    setResponse(weather_response);
    alert(weather_response);

    if (debug) {
      alert("temperature is  " + temperature);
      alert("humidity is " + humidity);
      alert("wind speed is " + windSpeed);
      alert("sky description " + cloudsDescription);
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
    var jokeURL = "https://icanhazdadjoke.com/";
    $.getJSON(jokeURL, function(data) {
      setResponse(data.joke.toLowerCase());
      chrome.tabs.create({
        url: jokeURL + "j/" + data.id
      });
    }).fail(function() {
      var failJoke = "Sorry! I can't read the joke! You can have a look at it!";
      setResponse(failJoke);
      chrome.tabs.create({
        url: "https://icanhazdadjoke.com/"
      });
    });
  }

  function speakAQuote() {
    var quoteUrl =
      "http://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json";
    $.getJSON(quoteUrl, function(data) {
      setResponse(data.quoteText);
      chrome.tabs.create({
        url: data.quoteLink
      });
    }).fail(function() {
      chrome.tabs.create({
        url: "https://forismatic.com/en/homepage"
      });
    });
  }

  function getHoroscope(sign) {
    var url = "http://horoscope-api.herokuapp.com/horoscope/today/" + sign;
    var linkUrl =
      "https://www.ganeshaspeaks.com/horoscopes/daily-horoscope/" + sign;
    var responseText = "Today's horoscope for " + sign + ", ";
    $.getJSON(url, function(data) {
      setResponse(responseText + data.horoscope);
      chrome.tabs.create({
        url: linkUrl
      });
    }).fail(function() {
      chrome.tabs.create({
        url: linkUrl
      });
    });
  }

  function getWOTD() {
    var wotdURL =
      "http://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=" +
      wordnikAPIKey;
    $.getJSON(wotdURL, function(data) {
      var wotdResponse = data.word + " means " + data.definitions.text;
      setResponse(wotdResponse);
      chrome.tabs.create({
        url: "https://www.wordnik.com/word-of-the-day"
      });
    }).fail(function() {
      chrome.tabs.create({
        url: "https://www.wordnik.com/word-of-the-day"
      });
    });
  }

  function duckduckgoOrGoogle(query) {
    if (debug) {
      alert("duckduckgoOrGoogle " + query);
    }
    var duckduckgoApiUrl = "https://api.duckduckgo.com/";
    var remote =
      duckduckgoApiUrl + "?q=" + encodeURIComponent(query) + "&format=json";
    if (debug) {
      alert(remote);
    }
    $.getJSON(remote, function(data) {
      if (data.AbstractText != "") {
        setResponse(data.AbstractText);
        // alert(data.AbstractText);
        chrome.tabs.create({
          url: "https://duckduckgo.com/?q=" + encodeURIComponent(query)
        });
      } else {
        chrome.tabs.create({
          url: "http://google.com/search?q=" + encodeURIComponent(query)
        });
      }
    }).fail(function() {
      chrome.tabs.create({
        url: "http://google.com/search?q=" + encodeURIComponent(query)
      });
    });
  }

  function tweet(tweets) {
    if (debug) {
      var tweets = document.getElementById("tweetText").value;
    }
    var url = "http://twitter.com/home?status=" + encodeURIComponent(tweets);
    chrome.tabs.create({
      url: url
    });
    if (debug) {
      openInNewTab(url);
    }
  }

  function searchYoutube(temp) {
    var gapikey = "AIzaSyBxg6zIGlqie7QxvFlGFTIIk4yWtgIlAak";
    q = temp;
    $.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        part: "snippet, id",
        q: q,
        type: "video",
        key: gapikey
      },
      function(data) {
        $.each(data.items, function(i, item) {
          var videoID = item.id.videoId;
          var nurl = "https://www.youtube.com/watch?v=" + videoID;
          if (debug) {
            alert(temp + videoID);
            openInNewTab(nurl);
          }
          chrome.tabs.create({
            url: nurl
          });
          return false;
        });
      }
    );
  }

  function populateVoiceList() {
    if (typeof speechSynthesis === "undefined") {
      return;
    }

    voices = speechSynthesis.getVoices();

    for (i = 0; i < voices.length; i++) {
      var option = document.createElement("option");
      option.textContent = voices[i].name + " (" + voices[i].lang + ")";

      if (voices[i].default) {
        option.textContent += " -- DEFAULT";
      }

      option.setAttribute("data-lang", voices[i].lang);
      option.setAttribute("data-name", voices[i].name);
      document.getElementById("voiceSelect").appendChild(option);
    }

    currentVoice = JSON.parse(localStorage.getItem("currentVoice_Anna"));
    if (currentVoice) {
      document.getElementById("voiceSelect").selectedIndex = currentVoice.index;
    }

    $(function() {
      $("#voiceSelect").on("change", function() {
        currentVoice = jQuery.extend({}, voices[this.selectedIndex]);
        currentVoice.index = this.selectedIndex;
        localStorage.setItem("currentVoice_Anna", JSON.stringify(currentVoice));
      });
    });
  }

  function setResponse(val) {
    Speech(val);
  }
  //to speech
  function Speech(say) {
    if ("speechSynthesis" in window && talking) {
      var language = window.navigator.userLanguage || window.navigator.language;
      var utterance = new SpeechSynthesisUtterance(say);
      currentVoice = JSON.parse(localStorage.getItem("currentVoice_Anna"));
      if (currentVoice) {
        utterance.volume = 1; // 0 to 1
        utterance.pitch = 0; //0 to 2
        utterance.voice = voices[currentVoice.index];
        speechSynthesis.speak(utterance);
      } else if (timevocal == 1) {
        utterance.volume = 1; // 0 to 1
        utterance.pitch = 0; //0 to 2
        utterance.voiceURI = "native";
        utterance.lang = "en-IN";
        speechSynthesis.speak(utterance);
        timevocal = 0;
      } else {
        utterance.volume = 1; // 0 to 1
        utterance.pitch = 0; //0 to 2
        utterance.voiceURI = "native";
        utterance.lang = "hi-IN";
        speechSynthesis.speak(utterance);
      }
    }
  }
});
