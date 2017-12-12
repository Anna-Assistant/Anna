/*This method sets the image source on screenshot page for display*/
function setScreenshotUrl(url) {
  document.getElementById("target").src = url;
  document.getElementById("download").href = url;
}