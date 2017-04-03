$("#ziphold").hide();
$("#btnhold").width($("#btnhold").width());


$("#zipbtn").click(function () {
    $("#ziphold").fadeIn(300);
    $("#zipinput").focus();
});




function onLoc(loc) {
    $("#mebtn").text("Please Wait!");
    console.log(loc);
    $("#hiddenform").append("<input type='hidden' name='lat' value='"+loc.coords.latitude + "'>");
    $("#hiddenform").append("<input type='hidden' name='lon' value='"+loc.coords.longitude + "'>");
    $("#hiddenform").submit()
}

function onFail() {
    $("#mebtn").text("Uh-Oh!");
    alert("I was unable to get your location :(");

}

$("#mebtn").click(function () {
    $("#mebtn").text("Please allow!");
    navigator.geolocation.getCurrentPosition(onLoc, onFail,{timeout:10000});
});


$("#gobtn").click(function () {
    $("#hiddenform").append("<input type='hidden' name='zip' value='"+$("#zipinput").val() + "'>");
    $("#hiddenform").submit();
});

$("#zipinput").keyup(function(event){
    if(event.keyCode == 13){
        $("#gobtn").click();
    }
});