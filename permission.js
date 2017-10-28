function getMicPermission() {
	navigator.mediaDevices.getUserMedia({audio: true})
	.then(function(stream) {
		stream.getTracks().forEach(function (track) {track.stop()});
		close();
	})
	.catch(function(error) {
		alert('Error : Microphone Access Required');
	});
};
window.addEventListener('load', getMicPermission);