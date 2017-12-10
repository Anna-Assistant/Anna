$(document).ready(function() {
    $("#onoff-switch").on("change", function(e) {
        a("onoff-switch", e.target.checked)
    }),
    $("#speech").on("change", function(e) {
        a("speech", e.target.checked)
    })
});
