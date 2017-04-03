//var json contains all data
var current;
var app;
var phrases = ["Nice Pick!", "Looks Delicious", "Yummy!", "Absolutely Mouthwatering!", "Exquisite!!"];


// convert meters to km (round to 1 dec)
function getMiles(i) {
    return Math.round(parseFloat(i) * 0.000621371192 * 10) / 10;
}

function shuffle(a) { //via http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

// given a compare function, remove all matching elements from list
function narrowList(compare) {
    for (var i = 0; i < json.businesses.length; i++) {
        if (compare(i)) { //compare should return true if element is to be removed
            json.businesses.splice(i, 1);
            i--;
        }
    }
}


// Unbind and rebind jquery events for choice buttons.
// Necessary because we don't know how many are present at any given time or which ones have disappeared
function rebindBtns() {

    $(".back .list-group-item").unbind();


    $(".back .list-group-item[rule='dist']").click(function () {
        var curdist = parseFloat($(this).attr("data"));

        function compareDist(i) {
            return json.businesses[i].distance >= curdist;
        }


        narrowList(compareDist);
        jQuery("#cardhold").flip(false);
        displayNext()
    });


    $(".back .list-group-item[rule='price']").click(function () {
        var curprice = $(this).attr("data").length;

        function comparePrice(i) {
            // apparently it is possible for this to just not be in the JSON, so we're gonna get rid of them
            if (typeof json.businesses[i].price === "undefined") {
                return true;
            }
            return json.businesses[i].price.length >= curprice;
        }


        narrowList(comparePrice);
        jQuery("#cardhold").flip(false);
        displayNext()
    });

    $(".back .list-group-item[rule='cat']").click(function () {
        var curcat = $(this).attr("data");

        function compareCat(i) {
            for (var j = 0; j < json.businesses[i].categories.length; j++) {
                if (json.businesses[i].categories[j].alias == curcat) {
                    return true;
                }
            }

            return false;
        }

        narrowList(compareCat);
        jQuery("#cardhold").flip(false);
        displayNext()
    });

    $(".back .list-group-item[rule='none']").click(function () {
        json.businesses.splice(0, 1); //remove the first entry
        jQuery("#cardhold").flip(false);
        displayNext()
    });
}


// Initialize Vue app and flip.js
function init() {
    current = json.businesses[0];

    Vue.component('review-item', {
        props: ['review'],
        template: '#review-template',
        computed: {
            TimeAgo: function () {
                var d = new Date(this.review.time_created);
                return jQuery.timeago(d);
            }

        }
    });


    $.ajax({
        url: "/getreviews/" + current.id, success: function (reviews) {

            app = new Vue({
                el: "#content",
                data: {
                    title: current.name,
                    cost: current.price,
                    dist: current.distance,
                    categories: current.categories,
                    image: current.image_url,
                    url: current.url,
                    loc: current.location,
                    rating: current.rating,
                    reviews: reviews.reviews,
                    phrase: phrases[0],
                    liked: []
                },
                computed: {
                    DisplayCategories: function () {
                        return this.categories.map(function (e) {
                            return e.title
                        }).join(", ")
                    },

                    DistMiles: function () {
                        return getMiles(this.dist)
                    }
                }
            });

            resize();
            $('#yesModal').on('hidden.bs.modal', function () {
                app.liked.unshift(current);
                json.businesses.splice(0, 1); //remove the first entry
                displayNext();
            });
            jQuery("#cardhold").flip({autoSize: true, trigger: "manual"});
        }
    });


}

// substitute current app values with new ones
function displayNext() {
    if (json.businesses.length == 0) {
        swal({title: "Uh-Oh!", text: "You're out of restaurants!!", type: "warning"}, function () {
            // User has exhausted the list - show them their choices and then redirect them to home page

            $('#yesModal').unbind('hidden.bs.modal');
            $('#yesModal').on('hidden.bs.modal', function () {
                document.location = "/";
            });

            $("#btn-yes").click();
        });

        return;
    }

    shuffle(json.businesses);
    jQuery("#cardhold").flip(false); //ensure flipped
    current = json.businesses[0];
    app.title = current.name;
    app.cost = current.price;
    app.dist = current.distance;
    app.categories = current.categories;
    app.image = current.image_url;
    app.url = current.url;
    app.loc = current.location;
    app.rating = current.rating;

    app.reviews = null;
    $.ajax({
        url: "/getreviews/" + current.id, success: function (reviews) {
            app.reviews = reviews.reviews;
            setTimeout(resize, 50);
        }
    });
}

// update minor page functions on a consistent basis
function resize() {
    $(".row.review").each(function () {
        $(".col-xs-2", this).height($(this).height());
    });

    jQuery("time").timeago();
    $("#numremaining").text(json.businesses.length + " remaining");

    shuffle(phrases);
    app.phrase = phrases[0];

    rebindBtns();
}



$("#btn-no").click(function () {
    $(".front").height($("#reviews").height());
    $(".back").height($("#reviews").height());
    jQuery("#cardhold").flip("toggle");
});

$("#btn-yes").click(function () {
    var q = current.name + " "+current.location.display_address.join(" ");
    var url = "https://www.google.com/maps/embed/v1/place?key="+maps_key+"&q="+encodeURIComponent(q);
    $("#map").attr("src", url);
    $("#navbtn").attr("href", "https://maps.google.com/?q="+q);
    $("#yesModal").modal();

});


$(window).on('resize', resize);
$(document).ready(init);
$(document).keyup(function(event){
    if(event.keyCode == 37){ //arrow left
        $("#btn-no").click();
    } else if(event.keyCode == 39){ //arrow right
        $("#btn-yes").click();
    } else if(49 <= event.keyCode <= 54){ //nums 1-6
        $(".back .list-group-item").eq(event.keyCode - 49).click(); //select the n-th menu item
    }
});


//todo: refactor the hell out of this file