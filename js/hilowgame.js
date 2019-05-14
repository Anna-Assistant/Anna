$(document).ready(function(){

  var compNum = Math.floor((Math.random() * 100) +1);
  var maxguess = 7;
  var userTries = 0;
  var chanceLeft = 6;

  $("button#submit").click(function(){

    var numUserEnter = parseInt($("#usernum").val());
    //checkNum();
    checkGuess();
    userTries++;
    --chanceLeft;

    if (userTries === maxguess) {
      $("#userguess").append("Game Over. The correct answer was " + compNum);
      $("#restartbtn").show();
      $("button#submit").prop('disabled', true);
    }
    
    function checkGuess(){

      if (Number.isNaN(numUserEnter)) {
        alert("You are not following the rules. Please enter a valid number.");
        location.reload();
      }

      if (numUserEnter >= 1 && numUserEnter <= 100){
        if (numUserEnter === compNum) {
          $("#userguess").append("You entered: " + numUserEnter + "<br/>");
          $("#userguess").append(("You Win! <br/>"));
          $("#restartbtn").show();
        }
        else if(numUserEnter > compNum) {
          $("#userguess").append("You entered: " + numUserEnter + "<br/>");
          $("#userguess").append("Too High!<br/>");
          $("#userguess").append("Chances Left: " + chanceLeft + "<br/><br/>");
          //$("#userguess").replaceWith("#userguess");
        }
        else if(numUserEnter < compNum) {
          $("#userguess").append("You entered: " + numUserEnter + "<br/>");
          $("#userguess").append("Too Low!<br/>");
          $("#userguess").append("Chances Left: " + chanceLeft + "<br/><br/>");
          //$("#userguess").replaceWith("#userguess");
        }
      }

      else {
        $("#userguess").append("Please enter a number within the range. <br/>");
        $("#userguess").append("Chances Left: " + chanceLeft + "<br/><br/>");
      }
    };


  $("#restartbtn").click(function(){
    location.reload();
  })
  });

});
