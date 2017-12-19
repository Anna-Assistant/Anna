//alert("Inside Content Script");
console.log("callbackMethod : "+callbackMethod);
var link = document.createElement("link");
link.rel="stylesheet";
link.href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.2.1/cropper.css";
document.querySelector("head").appendChild(link);

var body = document.querySelector("body");
//hiding the page
body.style.display="none";
//creating a img inside div
if(!document.querySelector("#cropping-tool")){
	console.log("creating a new cropping tool div on page");
	var div = document.createElement("div");
	div.id="cropping-tool"
	div.style.height="100%";
	div.style.width="100%";
	div.position="absolute";
	div.top="0";
	div.bottom="0";
	div.style.background="yellow";
	var div2 = document.createElement("div");
	div2.style.height="100%";
	div2.style.width="100%";
	var img = document.createElement("img");
	img.src=imageurl;
	img.id="image";
	img.style["max-width"]="100%";
	var button = document.createElement("input");
	button.setAttribute("value","Crop");
	button.setAttribute("type","button");
	//button.setAttribute("onclick","doneCropping(cropper)");
	div2.appendChild(img);
	div.appendChild(div2);
	//div.appendChild(button);
	document.querySelector("html").appendChild(div);
	
	/*creating a cropper tool*/
	var image = document.getElementById('image');
	var cropper = new Cropper(image, {
	  autoCrop: true,
	  zoomable: false,
	  movable: false,
	  rotatable: false,
	  cropend: function(e) {
	  	//crop end event listener
	    /*console.log(e.detail.x);
	    console.log(e.detail.y);
	    console.log(e.detail.width);
	    console.log(e.detail.height);
	    console.log(e.detail.rotate);
	    console.log(e.detail.scaleX);
	    console.log(e.detail.scaleY);
	  	
	  	/*passing 'e' back to background page for further processing*/
	  	//e
	  }
	});

	document.onkeypress = function(e){
		// use e.keyCode
		console.log("------------------- Image Cropped!! ---------------------");
		var i = cropper.getCroppedCanvas().toDataURL('image/jpeg');

		/*make the webpage visible again*/
	    document.querySelector("body").removeAttribute("style");
		/*remove div#cropping-tool element*/
	    document.querySelector("#cropping-tool").remove();
	    
		chrome.runtime.sendMessage({callbackMethod: callbackMethod, croppedImage: i}, function(response) {
		  //do nothing 
		});
		console.log("cropped image sent to background script");
	};

	//this button listener can be used if required lateron
	/*button.addEventListener('click', function doneCropping(e){
		console.log("------------------- Image Cropped!! ---------------------");
		var i = cropper.getCroppedCanvas().toDataURL('image/jpeg');
		document.getElementById("cropping-tool").remove();
		var ig = document.createElement('img');
		ig.src=i;
		document.querySelector("html").appendChild(ig);
		console.log(i);
	}, true);*/
	
	alert("Use cursor for selecting region from image, then press any key to Crop!");
}