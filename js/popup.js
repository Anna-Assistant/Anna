$(document).ready(function() {
    $("#onoff-switch").on("change", function(e) {
        a("onoff-switch", e.target.checked)
    }),
    $("#status-icon").on("change", function(e) {
        a("status-icon", e.target.checked)
    })
});