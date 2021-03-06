/***********************************************************************
Feature detection for mobile touch
************************************************************************/
function is_touch_device() {
  return 'ontouchstart' in window // works on most browsers 
      || 'onmsgesturechange' in window; // works on ie10
}

/***********************************************************************
Map loading logic
************************************************************************/
//Give a default zoom for the map on load
window.onload = function() {
  if (!is_touch_device()){
    svgPanZoom.init({
      'zoomEnabled': true,
      'minZoom': 0.20,
      'maxZoom': 5
    });
  }
};

/***********************************************************************
Initialize objects, hashmaps
************************************************************************/
Shaft={};
Shaft.filterCriteria=[];
Shaft.MatchedDorms=[];
Shaft.DormObjectMap = {};
Shaft.activeLocation = null;

//Object for storing information about each dorm/building
Shaft.DormObject = function (prop) {
    this.name = prop.name;
    this.school = prop.school;
    this.description= prop.description;
    this.amenities = prop.amenities;
    this.suiteSize = prop.suiteSize;
    this.cutoffs = prop.cutoffs;
};

/***********************************************************************
Writes information to left side pane based on dorm selected
************************************************************************/
function appendInfo(dorm) {
  var dormObj=Shaft.DormObjectMap[dorm];
  $(".housing-info-body").empty();
  $(".instructions").css("display", "none");
  $(".housing-info-body").css("display","inherit");
  $(".icon-filters").css("display", "none");
  $(".building-details").css("display","inherit");
  $(".housing-info-body").append("<h2>" + dormObj.name + "</h2>");
  $(".housing-info-body").append(dormObj.description);
  $(".housing-info-body").append("<div class='cutoff-title'>");

  if (dormObj.cutoffs){
  $(".cutoff-title").append("2013 Cutoff:");
}
  //writing the cutoffs table
  for (var i in dormObj.cutoffs){
     $(".housing-info-body").append("<div class='cutoff-row'><div class='cutoff-type'>"+dormObj.cutoffs[i].type+"</div><div class='cutoff-cutoff'>"+dormObj.cutoffs[i].cutoff+"</div></div>");
  }

  //logic for appending the amenities icons
  $(".housing-info-body").append("<div class='icon-result-wrapper'>");
  $(".filter-results").css("display", "none");
  
  if(dormObj.amenities.kitchen) {
    $(".icon-result-wrapper").append(' <img src="http://spectrum.columbiaspectator.com/shaft_map/img/double icon-09.png" height="70px" width="69px"> ');
  }
  if(dormObj.amenities.musicRoom) {
    $(".icon-result-wrapper").append(' <img src="http://spectrum.columbiaspectator.com/shaft_map/img/Practice Room Icon-01.png" height="70px" width="69px"> ');
  }
  if(dormObj.amenities.ac) {
    $(".icon-result-wrapper").append(' <img src="http://spectrum.columbiaspectator.com/shaft_map/img/Climate Control Black and White-01.png" height="70px" width="69px"> ');
  }
  if(dormObj.amenities.fitness) {
    $(".icon-result-wrapper").append(' <img src="http://spectrum.columbiaspectator.com/shaft_map/img/Fitness Black and White-01.png" height="70px" width="69px"> ');
  }
  if(dormObj.amenities.computerLab) {
    $(".icon-result-wrapper").append(' <img src="http://spectrum.columbiaspectator.com/shaft_map/img/Computer Black and White-01.png" height="70px" width="69px"> ');
  }
  if(dormObj.amenities.stallBR) {
    $(".icon-result-wrapper").append(' <img src="http://spectrum.columbiaspectator.com/shaft_map/img/bathroom stall icon copy.png" height="70px" width="69px"> ');
  }

  //back to menu button
  $(".housing-info-body").append("<div class='goBack'> Back to menu</div>");
  $(".goBack").click(function(){
    if (Shaft.activeLocation!==null){
      if (Shaft.DormObjectMap[Shaft.activeLocation].school=="Columbia"){
        $("#" + Shaft.activeLocation).css("fill","#007fb2");
      }
      else{
        $("#" + Shaft.activeLocation).css("fill","#803E98");
      }
      Shaft.activeLocation=null;
    }
    //telling which divs to display after going back to menu
    $(".housing-info-body").css("display","none");
    $(".filter-results").css("display", "inherit");
    $(".icon-filters").css("display", "inherit");
    $(".building-details").css("display","none");
    $(".instructions").css("display", "inherit");

  });

}

//Display results of filters
function appendFilterResults(){
  var matchedArray=Shaft.MatchedDorms;
  $(".filter-results").empty();
  for (var i in matchedArray){
    var resultObj=Shaft.DormObjectMap[matchedArray[i]];
    $(".filter-results").append("<div class='result "+matchedArray[i]+"'>"+resultObj.name+"</div>");
    makeClickableResults(matchedArray[i]);
  }
}

/***********************************************************************
Click/hover interactions for map and filter buttons
************************************************************************/

//Make filter results clickable for more information
//List of dorms on left sidebar
function makeClickableResults(dorm){
  //Change color of clicked dorm to orange, change back to original color for any active buildings
 $("."+dorm).on("click", function(){     
      if (Shaft.activeLocation!==null){
      if (Shaft.DormObjectMap[Shaft.activeLocation].school=="Columbia"){
        $("#" + Shaft.activeLocation).css("fill","#007fb2");
      }
      else{
        $("#" + Shaft.activeLocation).css("fill","#803E98");
      }
    }
    $("#" + dorm).css("fill","rgb(255, 200, 98)");
    Shaft.activeLocation=dorm;
    appendInfo(dorm); 
  });
}

//Make buildings on the map clickable
function makeClickable(id, dorm) {
  //logic for mouseover highlighting for svg map
  var isBlue=false;
  $("#" + id).on("mouseenter", function (e){
     if ($("#"+id).prop('style').fill=="rgb(0, 127, 178)"){
      isBlue=true;
    }
   $("#" + id).css("fill","rgb(255, 200, 98)");
   $("#" + id).css("cursor","pointer");
  });
  //return to original dorm color (blue=Columbia #007fb2, purple=Barnard #803E98)
  $("#" + id).on("mouseout", function (e){
    if (id!=Shaft.activeLocation){
    if (isBlue){
       $("#" + id).css("fill","#007fb2");
    }
    else{
       $("#" + id).css("fill","#803E98");
    }
  }
  isBlue=false;
  });

  //change active building color to orange
  $("#" + id).on("click", function(){ 
    if (Shaft.activeLocation!==null){
      //If user clicks on another building while a building is still active, change color back to its original
      if (Shaft.DormObjectMap[Shaft.activeLocation].school=="Columbia"){
        $("#" + Shaft.activeLocation).css("fill","#007fb2");
      }
      else{
        $("#" + Shaft.activeLocation).css("fill","#803E98");
      }
    }
    //Change the current clicked building to active, orange color
    $("#" + id).css("fill","rgb(255, 200, 98)");
    //update active building to activeLocation
    Shaft.activeLocation=id;
    appendInfo(dorm); 
  });
}

//Make filter icons clickable
function makeClickableFilter(id, filter) {
  $("."+id).click( function(){
    if ($("."+id).hasClass("active")){
      matchDorm(filter, false);
    }
    else{
      matchDorm(filter, true);
    }
    if($(".blueText").hasClass("active") != $(".purpleText").hasClass("active")){
      if (id=="purpleText" && !$("."+id).hasClass("active")){
        $(".blueText").toggleClass("active");
        matchDorm('columbia', false);
      }
      else if (id=="blueText" && !$("."+id).hasClass("active")){
        $(".purpleText").toggleClass("active");
        matchDorm('barnard', false);
      }
    }
    $("."+id).toggleClass("active");
  });
}

/***********************************************************************
Results filtering logic
************************************************************************/
//add a filter to criteria
function addFilter(filter){
  var addedFilter=false;
  for (var i in Shaft.filterCriteria){
    if (filter===Shaft.filterCriteria[i]){
      addedFilter=true;
    }
  }
  if (!addedFilter){
  Shaft.filterCriteria.push(filter);
  }
}

//delete a filter from search criteria
function deleteFilter(filter){
  var addedFilter=false;
  for (var i in Shaft.filterCriteria){
    if (filter===Shaft.filterCriteria[i]){
      addedFilter=true;
      Shaft.filterCriteria.splice(i, 1);
    }
  }
}

function matchDorm(filter, isActive){
  if (isActive){
    addFilter(filter);
  }
  else{
    deleteFilter(filter);
  }

  //empty matchedDorms
  Shaft.MatchedDorms=[];
  //has to satisfy all conditions for it to be true
  for (var dorm in Shaft.DormObjectMap){
    var isMatch=true;
    var dormObj=Shaft.DormObjectMap[dorm];
    for (var criteria in Shaft.filterCriteria){
      var criteriaStr=Shaft.filterCriteria[criteria];
      if (dormObj.amenities[criteriaStr]===false){
       isMatch=false;
       continue;
      }
    }
    if (isMatch){
      Shaft.MatchedDorms.push(dorm);
    }
  }
  appendFilterResults();
}

/***********************************************************************
Dorm Data, should be moved to separate json file
************************************************************************/

var schapiro= {
  'name': "Schapiro",
  'school': "Columbia",
  'description': "After undergoing renovations the past two summers, Schapiro is in tip-top shape to be a hugely popular pick among seniors and juniors (for the singles) and sophomores (for the doubles). Great views, two big lounges, music practice rooms, and workout equipment are just some of the ways Schapiro residents are spoiled. Sophomores looking at Schapiro’s doubles should beware, though, that the walkthrough doubles labeled on floor plans do not have a dividing door, and the setup can be tricky and claustrophobic for some.",
  'cutoffs':[{
    type:"Single",
    cutoff:"20/2283"
  },
  {
    type:"Double",
    cutoff:"10/2492"
  }
  ],
  'amenities': {
      'kitchen': true,
      'musicRoom': true,
      'ac': true,
      'computerLab': true,
      'fitness': true,
      'stallBR': true,
      'single': true,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var woodbridge= {
  'name': "Woodbridge",
  'school': "Columbia",
  'description': "The only Columbia dorm on Riverside Drive, Woodbridge provides some of the best apartment housing available to students. The two-person apartments can be turned into a kind of walkthrough double with one person in the bedroom and another in the living area. The windy walk down 115th might deter some, but for those who can make the trek, Woodbridge offers that “off-campus” feel many are looking for with junior and senior housing.",
  'cutoffs':[
  {
    type:"1-Bedroom Apartment",
    cutoff: "20/1446"
  },
  {
    type:"2-Bedroom Apartment",
    cutoff: "30/1234"
  }
  ],
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': false,
      'fitness': true,
      'stallBR': false,
      'single': false,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': false,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var plimpton = {
  'name': "Plimpton",
  'school': "Barnard",
  'description': "If you’re OK with a longer walk, Plimpton has some good amenities. Each suite now has four singles and a small corner double with a shared bathroom and a small kitchen. If two people are willing to take the small double, juniors should feel confident picking into Plimpton.",  
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': true,
      'computerLab': true,
      'fitness': false,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': false,
      'barnard': true
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': true,
      '7-person': false,
      '8-person': false

    }

};

var elliot = {
  'name': "Elliot",
  'school': "Barnard",
  'description': "Housing many transfers, Elliott is sometimes seen as a lesser dorm for sophomores and juniors, but students who live there speak highly of the atmosphere. Beware of some pretty tiny rooms—especially doubles—but there are also nice views of Claremont Avenue and the beautiful luxury that is air conditioning. Certain Elliott lounges offer DVD players, in addition to the standard television set; plus, you can find a kitchen on each floor.",
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': true,
      'computerLab': true,
      'fitness': false,
      'stallBR': true,
      'single': true,
      'double': true,
      'columbia': false,
      'barnard': true
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }

};

var hewitt = {
  'name': "Hewitt",
  'school': "Barnard",
  'description': "Location can be a blessing and a curse: Hewitt residents are on the Quad, so they get easy access to class buildings, Hewitt Dining Hall, and the Diana. On the other hand, Hewitt residents are required—as all Quad residents are—to be on a meal plan. Not having a kitchen makes having Hewitt (the dining hall) close by and available more appealing, but some might prefer cooking or buying food off-campus.",
  'amenities': {
      'kitchen': false,
      'musicRoom': true,
      'ac': false,
      'computerLab': true,
      'fitness': false,
      'stallBR': true,
      'single': true,
      'double': true,
      'columbia': false,
      'barnard': true
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': true,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var sulz = {
  'name': "Sulzberger Tower",
  'school': "Barnard",
  'description': "Some of the most coveted housing at Barnard is the roomy, air-conditioned singles and doubles in Sulz Tower. These rooms boast great views and are a popular choice for seniors who want to live on the Quad. Each floor has two lounges with kitchenettes, and the basement has a computer lab and music practice rooms.",
  'amenities': {
      'kitchen': true,
      'musicRoom': true,
      'ac': true,
      'computerLab': true,
      'fitness': false,
      'stallBR': true,
      'single': true,
      'double': true,
      'columbia': false,
      'barnard': true

  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var claremont = {
  'name': "47 Claremont",
  'school': "Columbia",
  'description': "Arguably the most isolated dorm at Columbia, Claremont rewards its residents for braving the wind tunnel of Claremont Avenue by offering suites with full kitchens. Suite bathrooms were renovated last year and have been described as “hotel bathrooms.” Claremont is also a pretty good place to host parties—nothing like EC, but if you can get people to come this far north, it’s a decent setup.",
  'cutoffs':[{
    type: "3-person",
    cutoff: "20/342"
  },
  {
    type: "4-person",
    cutoff: "30/2224"
  },
  {
    type: "5-person",
    cutoff: "24/1307"
  },
  {
    type: "6-person",
    cutoff: "20/849"
  },
  {
    type: "7-person",
    cutoff:"10/1705"
  }

  ],
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': true,
      'fitness': false,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': true,
      '4-person': true,
      '5-person': true,
      '6-person': true,
      '7-person': true,
      '8-person': false

    }
};

var ec = {
  'name': "East Campus",
  'school': "Columbia",
  'description': "Ah, the kingpin of Columbia housing and dorm social life. EC has a few doubles on the sixth floor, which get taken by juniors with bad numbers and sophomores with good numbers. Other than these, EC is comprised of 2-person flats, 4-person townhouses, 5-person suites, 6-person townhouses, and 6-person suites. The high rise suites—most of them housing five people in three singles and a double—have amazing views of Morningside Park, and the townhouses have a great setup for throwing parties.",
  'cutoffs':[
    {
      'type': "2-person flat", 
      'cutoff':'30/1477'
    },
    {
      'type': "4-person townhouse", 
      'cutoff':"30/1309"
    },
    {
      'type': "5-person all-singles", 
      'cutoff':"30/709"
    },
   {
      'type': "5-person with double", 
      'cutoff':"24/814"
    },
    {
      'type': "6-person highrise", 
      'cutoff':"30/668"
    },

   {
      'type': "6-person townhouse all-singles", 
      'cutoff':"30/1309"
    },
    {
      'type': "6-person townhouse with double", 
      'cutoff':"30/2752"
    },

    {
      'type': "6th floor double", 
      'cutoff':"15/401"
    }


   ],
  'amenities': {
      'kitchen': true,
      'musicRoom': true,
      'ac': true,
      'computerLab': true,
      'fitness': true,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': true,
      '5-person': true,
      '6-person': true,
      '7-person': false,
      '8-person': false

    }
};

var n600w116 = {
  'name': "600 W. 116",
  'school': "Barnard",
  'description': "Considered the least desirable of the popular 600 block, 600 houses mainly sophomores and juniors in suites ranging from 2-7 people. Arguably the best-located dorm—right above Ollie’s!—600 is made up mostly of doubles. Barnard students share the building with regular residents, which can be fun (cute kids!) or not great (cute kids screaming!). Each suite has a kitchen and bathroom. Not to be overlooked is the dining area in suites with a real dining table—a nice communal space for study groups or dinners.",
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': false,
      'fitness': false,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': false,
      'barnard': true
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': true,
      '4-person': true,
      '5-person': true,
      '6-person': true,
      '7-person': true,
      '8-person': false

    }
};

var n616w116 = {
  'name': "616 W. 116",
  'school': "Barnard",
  'description': "Several amenities shared by the entire 600 block—specifically, a piano/TV lounge and a computer lab—are right here in 616. Most rooms face a shaft, but the square footage is generous enough to make up for it. 616 provides the least flexibility in group size among the 600 block suites, with suites only for 4, 5, or 6.",
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': true,
      'fitness': false,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': false,
      'barnard': true
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': true,
      '5-person': true,
      '6-person': true,
      '7-person': false,
      '8-person': false

    }
};

var n620w116 = {
  'name': "620 W. 116",
  'school': "Barnard",
  'description': "The top half of 620 always go to seniors, with Senior Experience RAs housed here. Rooms are generously sized, and floors 5-10 (seniors only) have only singles. Juniors and lucky sophomores can shoot for the suites on the lower floors. Each suite shares a kitchen and bathroom, and rooms facing 116th Street enjoy the best views.",
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': false,
      'fitness': false,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': false,
      'barnard': true
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': true,
      '5-person': true,
      '6-person': true,
      '7-person': true,
      '8-person': false

    }
};

var wien = {
  'name': "Wien",
  'school': "Columbia",
  'description': "Wien gets trash-talked more than it deserves. Decently sized singles, doubles, and walkthrough doubles make up each of these floors, which share a bathroom. Don’t forget, though, that each room has its own sink—a quirk only of Wien rooms that proves pretty useful, whether you love to brush your teeth or don’t like walking all the way to the hall bathroom (if you know what I mean). One thing to keep in mind is that not every floor has a kitchen, which can be a dealbreaker for some juniors.",
  'cutoffs': [{
    type:"Single",
    cutoff:"10/2932"
  },
  {
    type:"Double",
    cutoff: "10/2818"
  }],
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': true,
      'fitness': false,
      'stallBR': true,
      'single': true,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var furnald = {
  'name': "Furnald",
  'school': "Columbia",
  'description': "Only around 40 lucky sophomores will get to pick into Furnald’s roomy singles. Sacrificing the upperclassman living experience for the best facilities on campus is a fair deal for sophomore Furnaldians, who enjoy great views of Broadway and campus as well as the clean and quiet of Furnald’s bathrooms, kitchens, and lounges. Picking with a group can make the experience of living among first-years less disorienting for the veteran sophomore.",
  'cutoffs':[{
    type:"Single",
    cutoff:"10/930"
  }
  ],
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': true,
      'computerLab': true,
      'fitness': false,
      'stallBR': true,
      'single': true,
      'double': false,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': false,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var river = {
  'name': "River",
  'school': "Columbia",
  'description': "Large singles and small floors make River a popular choice for seniors and juniors looking to have a quiet and comfortable space to come home to. Next year, Jazz House will take over the first floor, and the remaining rooms—all singles—will be available to seniors and juniors with decent numbers. Though perhaps not the most social of dorms, River is well-located, and residents appreciate sharing a kitchen and bathroom with fewer people than their Schapiro or Broadway counterparts do.",
  'cutoffs':[{
    type:"Single",
    cutoff:"20/1962"
  }],
  'amenities': {
      'kitchen': true,
      'musicRoom': true,
      'ac': false,
      'computerLab': true,
      'fitness': true,
      'stallBR': false,
      'single': true,
      'double': false,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': false,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var hogan = {
  'name': "Hogan",
  'school': "Columbia",
  'description': "Hogan is always the first dorm to be completely picked during selection, and there’s no question why. With all singles in its 4- and 5-person suites, Hogan is a popular choice for seniors hoping to live with friends in a social environment but who aren’t so keen on EC. Hogan doesn’t have AC or the same ease in hosting parties, but residents get the benefits of an excellent location and all the facilities in the adjoining Broadway Residence Hall.",
  'cutoffs':[{
    type: "4-person",
    cutoff: "30/1014"

  },
  {
    type:"5-person",
    cutoff:"30/1257"
  },
  {
    type: "6-person",
    cutoff: "30/1496"
  }],
  'amenities': {
      'kitchen': true,
      'musicRoom': true,
      'ac': false,
      'computerLab': true,
      'fitness': false,
      'stallBR': false,
      'single': true,
      'double': false,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': false,
      'double': false,
      '3-person': false,
      '4-person': true,
      '5-person': true,
      '6-person': true,
      '7-person': false,
      '8-person': false

    }
};

var broadway = {
  'name': "Broadway",
  'school': "Columbia",
  'description': "One of Columbia’s newest-constructed dorms, Broadway is praised for its cleanliness, excellent facilities (with AC!), and beautiful views in all directions. Speedy elevators take junior and senior residents to their singles—some large, some not so large—and a few sophomores to their doubles, some of which are fairly big. Broadway also has the perfect location between academic life (close to Hamilton) and social life (bars and restaurants within just a few blocks).",
  'cutoffs': [{
    type:"Single",
    cutoff:"20/2040"
  },
  {
    type:"Double",
    cutoff:"10/2893"
  }],
  'amenities': {
      'kitchen': true,
      'musicRoom': true,
      'ac': true,
      'computerLab': true,
      'fitness': false,
      'stallBR': true,
      'single': true,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var ruggles = {
  'name': "Ruggles",
  'school': "Columbia",
  'description': "Juniors who want to live with friends in groups will find themselves in Ruggles, mostly in 8-person suites, with some in doubles and some in singles. Of junior dorms, Ruggles is tied with Watt for best place to host social gatherings, but the trade-off is that many rooms face a shaft. Sharing a kitchen and bathroom with just a few close friends can be a treat, but having eight people living in one suite brings its own set of challenges.",
  'cutoffs':[{
    type:"4-person",
    cutoff:"30/1222"   
  },
  {
    type:"6-person",
    cutoff:"20/761"
  },{
    type:"8-person, 2 singles",
    cutoff:"20/2918"
  },{
    type:"8-person, 4 singles",
    cutoff: "21.25/700"
  }],
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': false,
      'fitness': true,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': true,
      '5-person': false,
      '6-person': true,
      '7-person': false,
      '8-person': true

    }
};

var nussbaum = {
  'name': "Nussbaum (600 W. 113)",
  'school': "Columbia",
  'description': "Named for its location right above Nussbaum & Wu (the bakery), Nussbaum is a popular choice for sophomores hoping to avoid McBain. Large singles—some with private bathrooms—are taken by seniors and juniors, but the social scene of each suite tends to be dominated by sophomores. Newly renovated kitchens are a plus. Some suites have single-use bathrooms, while others have stalls shared by the suite. Keep in mind that you can’t pick your suitemates, but you can choose to live near people you know if you go in as a larger group.",
  'cutoffs':[{
    type:"Single",
    cutoff:"20/1158"
  },
  {
    type:"Double",
    cutoff:"10/2927"
  }],

  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': false,
      'fitness': false,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var mcbain = {
  'name': "McBain",
  'school': "Columbia",
  'description': "Infamous for its less-than-ideal bathrooms and dark, stuffy shaft rooms, McBain has an iffy reputation among rising sophomores, who fill the building’s large doubles. Sometimes called “Carman II,” McBain is pegged as the most social sophomore dorm, since floors are large, rooms are big enough for parties, and nearly all residents are in the same class. Renovations this summer will change the look of the 7th and 8th floors of McBain, with single-use bathrooms being installed, as well as some updates to floor lounges throughout the building, falling ceilings be damned.",
  'cutoffs':[{
    type:"Single",
    cutoff:"10/884"
  },
  {
    type:"Double",
    cutoff:"End of group selection"
  }],
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': true,
      'fitness': true,
      'stallBR': true,
      'single': true,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var watt = {
  'name': "Watt",
  'school': "Columbia",
  'description': "Made up mostly of studio doubles, Watt is a popular choice for juniors, as well as seniors, who take the 1- and 2-bedroom apartments—as well as the few studio singles—pretty early during selection. Each apartment has its own kitchen and bathroom—cleaned weekly by Facilities—and square footage is decent throughout. Floors don’t have shared lounges, which can make it hard to get to know floormates, but the size and setup of rooms makes them ideal for social gatherings.",
  'cutoffs':[
    {
      type:"Studio Single",
      cutoff:"30/238"
    },
    {
      type:"Studio Double",
      cutoff: "Junior Regroup"
    },
    {
    type:"1-bedroom Apartment",
    cutoff:"20/55"

  },
  {
    type:"2-bedroom Apartment",
    cutoff:"30/309"
  }],
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': false,
      'fitness': false,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': true,
      'barnard': false
      },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var symposium ={
  'name': "Symposium (548 W. 113)",
  'school': "Columbia",
  'description': "Hidden on 113th Street, right above Symposium (the Greek restaurant), is one of Columbia Housing’s best-kept secrets. Symposium (officially, 548 W. 113th St.) has several huge studio doubles, which get picked mainly by juniors with good numbers. The only brownstone available in Room Selection, Symposium might not be the most talked-about dorm, but it gives Watt and Woodbridge a run for their money in the contest for best apartment-style living.",
  'cutoffs':[{
    type:"Double",
    cutoff:"20/1104"
  }],
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': false,
      'fitness': false,
      'stallBR': false,
      'single': false,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': false,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': false,
      '7-person': false,
      '8-person': false

    }
};

var n601w110 = {
  'name': "110 (601 W. 110)",
  'school': "Barnard",
  'description': "This dorm—aptly labeled “College Residence” on its awning—is home to non-affiliates as well as Barnard students—a mix of sophomores and juniors. Its location is great for Chipotle addicts, but it’s a decently long walk to campus. The trade-off is that 110 residents enjoy beautiful and well-sized studio apartments with their own kitchens or kitchenettes. Groups of anywhere between two and nine can pick into 110, which makes it a great option for odd-sized groups who can’t find a suite in their number.",
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': false,
      'fitness': false,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': false,
      'barnard': true
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': true,
      '4-person': true,
      '5-person': true,
      '6-person': true,
      '7-person': true,
      '8-person': true

    }
};

var harmony = {
  'name': "Harmony",
  'school': "Columbia",
  'description': "The butt of many a Columbia housing joke, Harmony is seen as the dregs for juniors and sophomores picking into singles. Except for one 6-person suite, the building is made up of singles and doubles ranging from tiny to enormous. Unless you’re a Westside lover, you might find the walk to campus too long, but the off-campus feel is a big plus for students who don’t love the “dormy” vibe.",
  'cutoffs':[{
    type:"Single",
    cutoff:"10/2992"
  },
  {
    type:"Double",
    cutoff: "10/2484"
  }],
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': false,
      'computerLab': false,
      'fitness': true,
      'stallBR': true,
      'single': true,
      'double': true,
      'columbia': true,
      'barnard': false
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': false,
      '5-person': false,
      '6-person': true,
      '7-person': false,
      '8-person': false

    }
};

var cathedral = {
  'name': "Cathedral Gardens",
  'school': "Barnard",
  'description': "CG is the absolute farthest dorm from campus. In return for their commute (15 minutes, but public safety vans can take you), residents get fantastic rooms—mostly singles—in a real apartment building with dishwashers, great facilities, and air conditioning. If you’re willing to give up close proximity to campus, CG is a great choice for Barnardians looking for a taste of lux apartment NYC living.",
  'amenities': {
      'kitchen': true,
      'musicRoom': false,
      'ac': true,
      'computerLab': false,
      'fitness': false,
      'stallBR': false,
      'single': true,
      'double': true,
      'columbia': false,
      'barnard': true
  },
   'suiteSize':{
      'single': true,
      'double': true,
      '3-person': false,
      '4-person': true,
      '5-person': true,
      '6-person': true,
      '7-person': false,
      '8-person': false

    }
};

/***********************************************************************
Constructing objects on page
************************************************************************/

makeClickableFilter('single', 'single');
makeClickableFilter('double', 'double');
makeClickableFilter('ac', 'ac');
makeClickableFilter('fitness', 'fitness');
makeClickableFilter('musicRoom', 'musicRoom');
makeClickableFilter('computerLab', 'computerLab');
makeClickableFilter('food', 'kitchen');
makeClickableFilter('stall', 'stallBR');
makeClickableFilter('blueText', 'columbia');
makeClickableFilter('purpleText', 'barnard');


makeClickable('plimpton', 'plimpton');
makeClickable('elliot', 'elliot');
makeClickable('hewitt', 'hewitt');
makeClickable('sulz', 'sulz');
makeClickable('claremont', 'claremont');
makeClickable('ec', 'ec');
makeClickable('n600w116', 'n600w116');
makeClickable('n616w116', 'n616w116');
makeClickable('n620w116', 'n620w116');
makeClickable('woodbridge', 'woodbridge');
makeClickable('wien', 'wien');
makeClickable('furnald', 'furnald');
makeClickable('schapiro', 'schapiro');
makeClickable('river', 'river');
makeClickable('hogan', 'hogan');
makeClickable('broadway', 'broadway');
makeClickable('ruggles', 'ruggles');
makeClickable('nussbaum', 'nussbaum');
makeClickable('mcbain', 'mcbain');
makeClickable('watt', 'watt');
makeClickable('symposium', 'symposium');
makeClickable('n601w110', 'n601w110');
makeClickable('harmony', 'harmony');
makeClickable('cathedral', 'cathedral');

Shaft.DormObjectMap.broadway = new Shaft.DormObject(broadway);
Shaft.DormObjectMap.claremont = new Shaft.DormObject(claremont);
Shaft.DormObjectMap.furnald = new Shaft.DormObject(furnald);
Shaft.DormObjectMap.ec = new Shaft.DormObject(ec);
Shaft.DormObjectMap.harmony = new Shaft.DormObject(harmony);
Shaft.DormObjectMap.hogan = new Shaft.DormObject(hogan);
Shaft.DormObjectMap.mcbain = new Shaft.DormObject(mcbain);
Shaft.DormObjectMap.nussbaum = new Shaft.DormObject(nussbaum);
Shaft.DormObjectMap.driver = new Shaft.DormObject(river);
Shaft.DormObjectMap.ruggles = new Shaft.DormObject(ruggles);
Shaft.DormObjectMap.schapiro = new Shaft.DormObject(schapiro);
Shaft.DormObjectMap.symposium = new Shaft.DormObject(symposium);
Shaft.DormObjectMap.watt = new Shaft.DormObject(watt);
Shaft.DormObjectMap.wien = new Shaft.DormObject(wien);

Shaft.DormObjectMap.woodbridge= new Shaft.DormObject(woodbridge);
Shaft.DormObjectMap.n601w110 = new Shaft.DormObject(n601w110);
Shaft.DormObjectMap.n600w116 = new Shaft.DormObject(n600w116);
Shaft.DormObjectMap.n616w116 = new Shaft.DormObject(n616w116);
Shaft.DormObjectMap.n620w116 = new Shaft.DormObject(n620w116);
Shaft.DormObjectMap.cathedral = new Shaft.DormObject(cathedral);
Shaft.DormObjectMap.elliot = new Shaft.DormObject(elliot);
Shaft.DormObjectMap.hewitt = new Shaft.DormObject(hewitt);
Shaft.DormObjectMap.plimpton = new Shaft.DormObject(plimpton);
Shaft.DormObjectMap.sulz = new Shaft.DormObject(sulz);

matchDorm("",false);

