// Method to set the Anna Status Icon based on given status
/**
 * 
 * @param {*current status of Anna} status 
 * status may contain following values
 * noIcon - User doesn't not want to make status icon visible
 * active - Anna recognised some sound, performing some task
 * listening - Anna is on standby and listening to user
 * inactive - Anna is not active currently
 */
function setIcon(status) {
    console.log("status : "+status);
    
    var icon = document.querySelector("#anna-status-icon");
    var icon_url = "";

    if(status == "noIcon"){
        if(icon != null){
            icon.parentNode.removeChild(icon);
        }
        return;
    }

    // fetching correct icon URL from extension resources
    if(status == "active"){
        icon_url = chrome.extension.getURL("img/svg-icons/green.svg"); 
    }else if(status == "listening"){
        icon_url = chrome.extension.getURL("img/svg-icons/yellow.svg");
    }else if(status == "inactive"){
        icon_url = chrome.extension.getURL("img/svg-icons/red.svg");
    }

    // modifying icon on page
    if(icon == null || icon == undefined){
        console.log("Creating a new div element for icon");
        icon = document.createElement("div");
        icon.id="anna-status-icon";
        icon.style.position = "fixed";
        icon.style.bottom = "5px";
        icon.style.right = "5px";
        icon.style.padding = 0;
        icon.style.margin = 0;
        icon.style.width = "45px";
        icon.style.height = "45px";
        icon.style["z-index"]=1000;
        //creating an object element for svg
        var embed = document.createElement("img");
        embed.src = icon_url;
        //object.type = "image/svg+xml";
        //embed.width = "45px";
        //embed.height = "45px";

        //appending svg object to div
        icon.appendChild(embed);
        document.body.appendChild(icon);
    }

    icon.querySelector("img").src = icon_url;
    console.log("Icon URL changed to: "+icon_url)
}

setIcon(status);