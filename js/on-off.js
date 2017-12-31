$(document).ready(function(){
   var check;
   var statuscheck;
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
        $("#onoff-switch").prop("checked",false);
      }
  		else{
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
              }); 
			     	}
		     		else if (checked == false){
	     				chrome.storage.local.set({ "onoffswitch": "false"}, function(){
                //also setting status icon to false
                /*chrome.storage.local.set({ "statusicon": "false"}, function(){
                  statuscheck = false;
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
          statuscheck = true;
        });             
      }else{
        statuscheck = items.statusicon;
      }
      
      if(statuscheck === "false"){
       $("#status-icon").prop("checked",false);
      }
      else{
        $("#status-icon").prop("checked",true);
      }

      new DG.OnOffSwitch({
        el: "#status-icon",
        
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
