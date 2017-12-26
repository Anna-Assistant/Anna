# Anna
---
### Arrangement of files

* **css : This folder contains the plain text files format used for enhancing HTML files.**   
  * Files named **_2.css_**,**_material.min.css_** ,**_on-off-switch.css_** and **_popup.css_** contains the layout for   popup.html.  
  * **_cropper.css_** shows it's significance in **_background.js_** and is used to feature crop fuction.

* **elate : This folder contains the files that are used to build the main Web-page of Anna(_index.html_).**
  * **_index.html_** file is present under this folder which opens the main Web-page of Anna-Chrome Extension.
  
* **img : This folder contains _icon.png_ which potrays the icon of Anna.**

* **js : This folder contains some of the main javascript files in order to support popup display,reversesearch,screenshot and crop feature.**
  * Folder **_vendor_** along with files **_on-off-switch-onload.js_**,**_on-off-switch.js_**,**_on-off.js_**,**_popup.js_**,**_jquery-1.11.2.min.js_** designs the complete popup along with the on-off button effect.
  * Folder **_cropperjs_** along with file **_content_script.js_** lays it's impression in adding Cropping feature to screenshot and reverse-serach.
  * **_screenshot.js_** adds screenshot feature and is implemented in **_background.js_.**
  
* **README.md** guides a new user about _What exactly the extension is all about?_It also highlight the main features of the extension and gives brief idea on _How to install Anna for the first time?_ 
* **background.html** acts as a container for background scripts.This is vital as because Chrome generate a simple html page to contain the js.
* **background.js** acts as a background script where the main code of the extension lies.It has access to every Chrome API.
* **manifest.json** tells Chrome important information about Anna-Chrome extension, like its name(_"name": "Anna Assistant"_)
,version(_"version": "1.1"_) and which permissions it needs as well as links to other files like icons(_"default_icon": "img/icon.png"_ and background pages.
* **permission.html and permission.js** looks for the user's permission to access Microphone.If users fails to allow permission a popup will be displayed stating _Error : Microphone Access Required._
* **popup.html** contains the HTML and CSS codes to build the main display of POPUP for Anna.
* **screenshot.html** a web page that opens as soon as user says that they are interested to take the screenshot of the screen.It also lets the user to save / download the saved screenshot.
  
  
