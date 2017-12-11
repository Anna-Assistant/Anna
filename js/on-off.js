$(document).ready(function(){
 	var check;
	function getVal(callback) {
    chrome.storage.local.get(/* String or Array */["onoffswitch"], function(items){
      if(items.onoffswitch === undefined ){
        chrome.storage.local.set({ "onoffswitch": "false"}, function(){
        	check = false;
        });             
      }
      else{
        check = items.onoffswitch;
      }
      if(check === "false"){
   	    chrome.browserAction.setIcon({path:"tap.png"});
        $("#onoff-switch").prop("checked",false);
      }
  		else{
        chrome.browserAction.setIcon({path:"icon.ico"});
        $("#onoff-switch").prop("checked",true);
		  }
      new DG.OnOffSwitch({
        el: '#onoff-switch',
        // textOn: 'Activated',
        // textOff: 'Deactived',
        listener:function(name, checked){
          chrome.storage.local.get(/* String or Array */["onoffswitch"], function(items){
		      	if(checked == true){
              chrome.storage.local.set({ "onoffswitch": "true"}, function(){
                chrome.browserAction.setIcon({path:"icon.ico"});
              }); 
			     	}
		     		else if (checked == false){
	     				chrome.browserAction.setIcon({path:"tap.png"});
	     				chrome.storage.local.set({ "onoffswitch": "false"}, function(){
							});	
	     			}
	     		});					   	
				}
			});
    });
  }
  getVal(workWithVal);
  function workWithVal(val) {
  	check = val;
  }
  setTimeout(function(){ }, 500);
});
