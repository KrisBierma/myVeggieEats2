//get location coordinates

//from form get:
    //city -->query to get city code
    //type of cuisine (provide dropdown) -->query to get cuisine code

//after showing restuarants on map, click on one (input code) to get daily menu, restaurant info, and reviews
//place to search a restaurant to also do this
var city; //from user
var cuisine; //from user
$("#submit").on("click", function (event){
    event.preventDefault();
    city=capUpper($("#city").val().trim());
    // cuisine=capUpper($("#cuisine").val().trim());
    // console.log(city, cuisine);
    getCityInfo(function(){
        getCuisineInfo(function(){
            getRestuarants();
        });
    });
});

var apiKey="134929701576f37675a021f1de544eed";

var queryUrlLocation;
var city_id;
var city_name;
var entity_type;
//gives location info for use in other queries; also gives suggestd city name from a search word (use this function for search??)
//gives location information for inputed city, Ex: name, city_id, city_type
function getCityInfo(callback){
    queryUrlLocation="https://developers.zomato.com/api/v2.1/locations?query="+city; 
    $.ajax({
        url:queryUrlLocation,
        method:"GET",
        headers: {"user-key": apiKey}
    }).then(function(response) {
        console.log(response);
        city_id=response.location_suggestions[0].city_id;
        city_name=response.location_suggestions[0].city_name;
        entity_type=response.location_suggestions[0].entity_type;
        console.log(city_id, city_name, entity_type);
        callback();
    });
};

var queryUrlCuisines;
var cuisine_id;
var cuisine_name;
var allCuisines=[]; //list of all cuisines and ids in obj
// var allCuisines=[]; //list all cuisines in array
//gives list of cuisine types for a city
function getCuisineInfo(callback){
    queryUrlCuisines="https://developers.zomato.com/api/v2.1/cuisines?city_id="+city_id; 
    $.ajax({
        url:queryUrlCuisines,
        method:"GET",
        headers: {"user-key": apiKey}
    }).then(function(response) {
        for (var i=0; i<response.cuisines.length; i++){
            var r=response.cuisines[i].cuisine;
            allCuisines[i] = {"name":r.cuisine_name,
            "id":r.cuisine_id};
            allCuisines.push(r.cuisine_name);
            if (r.cuisine_name === cuisine){
                cuisine_name= r.cuisine_name;
                cuisine_id = r.cuisine_id;
                console.log(r.cuisine_id); //cajun=491 //working
            };
            
            //create option, add class/attr/text, and append to dropdown menu
            var cuisineOption=$("<option>").addClass("cuisineOptionBox").attr("value",r.cuisine_id).text(r.cuisine_name);
            $("#cuisineSearch").append(cuisineOption);
            
        };
        // console.log(allCuisines); //object of names and ids
        // $("#cuisines-list").append("<strong>List of all cuisines for " + city_name + " : </strong><br>");
        // for (var j=0; j<allCuisines.length; j++){
        //     $("#cuisines-list").append(allCuisines[j].name + " - ");
        // }; //delete later
        callback();
    });
};

var allRestaurants=[];
// list of restaurants for inputed cuisine and city, ex: vegetarian in Houston
function getRestuarants(){
var queryUrlRestaurants="https://developers.zomato.com/api/v2.1/search?entity_id=" + city_id + "&entity_type=" + entity_type + "&cuisines=" + cuisine_id;
    $.ajax({
        url:queryUrlRestaurants,
        method:"GET",
        headers: {"user-key": apiKey} //api key
    }).then(function(response) {
        console.log(response.restaurants); //lists 20 restaurants
        $("#restaurants-list").append("<br><br><strong>List of all restaurants for " + cuisine_name + " in " + city_name + " : </strong><br>");
        for (var j=0; j<response.restaurants.length; j++){
            var r=response.restaurants[j].restaurant;
            // console.log(r);
            var rl=r.location;
            // console.log(rl);
            var ru=r.user_rating;
            // console.log(ru);
            //allRestaurants.location.latittude
            allRestaurants[j]={
                "name":r.name,
                "id":r.id,
                "image":r.featured_image,
                "location":{
                    "address":rl.address,
                    "city":rl.city,
                    "latitude":rl.latitude,
                    "longitude":rl.longitude,
                    "zipcode":rl.zipcode
                },
                "menu":r.menu_url,
                "price":r.price_range,
                "user_rating":{
                    "avg":ru.aggregate_rating,
                    "rating_word":ru.rating_text,
                    "votes":ru.votes
                }
            };
            // console.log(allRestaurants);

            $("#restaurants-list").append(r.name + " - "); //delete later
        }; 
        console.log(allRestaurants);
    });
};

    // $("#form")[0].reset();

function capUpper(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
};



function initMap() {
    var uluru = { lat: 29.760, lng: -95.369 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: uluru
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map,
        icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
    });

    var infoWindow = new google.maps.InfoWindow({
        content: "<h2> this is the content </h2>"
    });

    marker.addListener("click", function(){
        infoWindow.open(map, marker);
    })
}