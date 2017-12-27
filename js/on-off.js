$(document).ready(function(){
   var check;
   var check2;
	function getVal(callback) {
    /* ---------------- For On Off Switch ----------------------- */
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
                //also setting status icon to false
                /*chrome.storage.local.set({ "statusicon": "false"}, function(){
                  check2 = false;
                  $("#status-icon").prop("checked",false);
                });*/  
							});	
	     			}
	     		});					   	
				}
			});
    });

    /* ---------------- For Status Icon Checkbox ----------------------- */
    chrome.storage.local.get(/* String or Array */["statusicon"], function(items){
      if(items.statusicon === undefined ){
        //setting default value of status icon as true
        chrome.storage.local.set({ "statusicon": "true"}, function(){
        	check2 = true;
        });             
      }else{
        check2 = items.statusicon;
      }
      
      if(check2 === "false"){
       $("#status-icon").prop("checked",false);
      }
      else{
        $("#status-icon").prop("checked",true);
      }

      new DG.OnOffSwitch({
        el: '#status-icon',
        
        listener:function(name, checked){
          
          chrome.storage.local.get(/* String or Array */["statusicon"], function(items){
		      	if(checked == true){
              chrome.storage.local.set({ "statusicon": "true"}, function(){
                //do nothing
              }); 
			     	}
		     		else if (checked == false){
	     				chrome.storage.local.set({ "statusicon": "false"}, function(){
                 //do nothing
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
