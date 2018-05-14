// Initialize Firebase

var config = {
    apiKey: "AIzaSyCwhOakfPVFjGYSWZ9KwaM8EH9lqw5cY1A",
    authDomain: "teamawesome-f39d7.firebaseapp.com",
    databaseURL: "https://teamawesome-f39d7.firebaseio.com",
    projectId: "teamawesome-f39d7",
    storageBucket: "",
    messagingSenderId: "539466789478"
};
firebase.initializeApp(config);

var txtEmail = document.getElementById('txtEmail');
var txtPassword = document.getElementById('txtPassword');
var btnLogin = document.getElementById('btnLogin');
var btnSignUp = document.getElementById('btnSignUp');
var btnLogOut = document.getElementById('btnLogOut');
//add button get password

var uid; //get uid to create new node off root (1st level)
var name; //get user's name

var notesAll = "";

//Add login event
btnLogin.addEventListener('click', e => {
    e.preventDefault();
    //Get email and password
    var email = txtEmail.value;
    var pass = txtPassword.value;
    var auth = firebase.auth();

    //Sign in
    var promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message)); //need to fix this so below code won't run if the promise.catch returns error message

    //promise.then waits for sign in to happen before getting the uid
    promise.then(function () {
        uid = auth.currentUser.uid;
        name = auth.currentUser.displayName;
        $("#hiUser").text("Hi " + name);

        //func below gets passed the uid and creates tabs
        console.log("populating tabs from login");
        populateTabs(uid);
    });
});

//makes the tabs; is called when user registers, logsin, or a tab is added
function populateTabs(uid) {
    $(".tabs").empty();
    console.log("here");
    database.ref(uid).on("value", function (snapShot) {
        var tabInfo = database.ref(uid).key;//uid
        var chillins = snapShot.val();//children of current uid

        if (uid !== undefined) {
            var t1 = chillins.tab1;//values of tab1
            var t2 = chillins.tab2;
            var t3 = chillins.tab3;
            notesAll = chillins.notes;
            $("#displayNotes").html(notesAll);
            var tabInfo = database.ref(uid).key;
            if (typeof t1 !== "boolean" && typeof t1 !== "undefined") {
                var newTab = $("<li>").addClass("tab col");
                var newA = $("<a id=tab1>").text(t1.tabName);
                newTab.append(newA);
                $(".tabs").append(newTab);
                    console.log(tabCount);
            }
            if (typeof t2 !== "boolean" && typeof t2 !== "undefined") {
                var newTab = $("<li>").addClass("tab col");
                var newA = $("<a id=tab2>").text(t2.tabName);
                newTab.append(newA);
                $(".tabs").append(newTab);
                }
            if (typeof t3 !== "boolean" && typeof t3 !== "undefined") {
                var newTab = $("<li>").addClass("tab col");
                var newA = $("<a id=tab3>").text(t3.tabName);
                newTab.append(newA);
                $(".tabs").append(newTab);
                }
        }
    })
    countTabs();
};

//Add SignUp event
btnSignUp.addEventListener('click', e => {
    //Get email and pass
    //ToDo: Check 4 REAL email
    e.preventDefault();
    var email = txtEmail.value;
    var pass = txtPassword.value;
    var name = capUpper(txtName.value);//get name from form
    //   console.log(name);
    var auth = firebase.auth();
    //Sign in
    var promise = auth.createUserWithEmailAndPassword(email, pass)
    promise.catch(e => console.log(e.message));
    //to do: if error message above, stop code below!!!!
    promise.then(function () {
        var user = firebase.auth().currentUser;
        if (user != null) {
            uid = user.uid;

            database.ref(uid).set({
                name: name, //only here for reference in console
                tab1: false,
                tab2: false,
                tab3: false,
                notes: ""
            });

            user.updateProfile({
                displayName: name
            }).then(function () {
                $("#hiUser").text("Hi " + name);
            }, function (error) {
                console.log("error");
            })
        };
    });
    $("#loginForm")[0].reset();
});

$("#btnSignOut").on("click", function (event) {
    firebase.auth().signOut().then(function () {
        console.log("Sign out successful");
        $("#hiUser").empty();
        uid = undefined;
        name = undefined;
        window.location.reload();
    }).catch(function (error) {
        console.log("Error in signing out");
    });
    $("#loginForm")[0].reset();
});

//A realtime listener for change in log in/out
firebase.auth().onAuthStateChanged(function (user) {
    if (user != null) {
        uid = user.uid;
        name = user.displayName;
        $("#hiUser").text("Hi " + name);
    }
    else { console.log('not logged in'); }
});

var database = firebase.database();

$("#addTab").on("click", function (event) {
    uid = firebase.auth().currentUser.uid;
    var tabName = $("#tabName").val().trim();
    var tabStreet = $("#tabStreet").val().trim();
    var tabCity = $("#tabCity").val().trim();
    var tabZip = $("#tabZip").val().trim();

    //make sure all info is included
    if (tabStreet != "" && tabStreet != "" && tabCity != "" && tabZip != "") {

        // if all info is included, cycle through all tabs
        label: for (var i = 1; i < 4; i++) {
            var tabInfo = database.ref(uid).child("tab" + i).key;
            var tabValue;
            var popTab = false;
            console.log(tabInfo,tabValue);
            database.ref(uid).child("tab" + i).once("value", function (snap) {
                tabValue = snap.val();
                console.log(tabValue);
            });

            //if there's an empty (false) tab, push the data and break the label loop above
            if (tabValue === false) {
                database.ref(uid).child(tabInfo).update({
                    tabName: capUpper(tabName),
                    tabStreet: capUpper(tabStreet),
                    tabCity: capUpper(tabCity),
                    tabZip: tabZip,
                });

                popTab = true; //set flag to true so no error msg
                break label;
            }
        }

        //if no tabs populated, max is reached, alert user
        // if (popTab === false) {
        //     console.log("You've reached the max number of tabs. Delete one first before adding another.");
        // }
    }

    //if missing tabName, address, city, or zip ->give error message
    else {
        console.log("error message - need more info");
    };

    //reset the form
    $("#mapTabs")[0].reset();
    countTabs();
});

//  Map Tabs : Add a Tab MODAL
$("#modalBtnAddTab").click(function () {
    // if ($("#modalBtnTab").attr("href")==="#modalTabsDelete")
    // {
        // $("#modalTabsDelete").modal();
    // }
    // else{
        $("#modalTabs").modal();
    // }
});
$("#modalBtnDeleteTab").click(function () {
    $("#modalTabsDelete").modal();
});

var tabCount;
var deleteTabBtn1;
var deleteTabBtn2;
var deleteTabBtn3;
var chillins;
function countTabs(){
    database.ref(uid).on("value", function (snapShot) {
        var tabInfo = database.ref(uid).key;//uid
        chillins = snapShot.val();//children of current uid
        // console.log(tabInfo, chillins);
        tabCount=0;
        deleteTabBtn1=undefined;
        deleteTabBtn2=undefined;
        deleteTabBtn3=undefined;
        if (uid !== undefined) {
            var t1 = chillins.tab1;//values of tab1
            var t2 = chillins.tab2;
            var t3 = chillins.tab3;
            var tabInfo = database.ref(uid).key;
            console.log(t1, t2,t3,tabInfo);
            // console.log(typeof t1);
            if (typeof t1 !== "boolean" && typeof t1 !== "undefined") {
                tabCount++;
                console.log(tabCount);
            }
            if (typeof t2 !== "boolean" && typeof t2 !== "undefined") {
                tabCount++;
                console.log(tabCount);
                }
            if (typeof t3 !== "boolean" && typeof t3 !== "undefined") {
                tabCount++;
                console.log(tabCount);
                }
            console.log(tabCount);
        }

    // if (tabCount===3){
        // $("#modalBtnTab").attr("href", "#modalTabsDelete");

        var chillinsArr=[t1, t2, t3];
        $(".modal-delete-content").empty();
        for (var i=0; i<3; i++){
            var tempName = chillinsArr[i];
            // console.log(tempName);
            // console.log(tempName.tabName);

            // if(tempName !== "undefined"){
                if (typeof tempName.tabName !== "undefined" && typeof tempName.tabName !== "boolean"){
                    var deleteBtn = $("<button>");
                    deleteBtn.addClass("waves-effect waves-light btn");

                    var tempCount=i+1;
                    var tempBtnId="deleteTabBtn"+tempCount;

                    deleteBtn.attr("id", tempBtnId);
                    deleteBtn.text(tempName.tabName);
                    $(".modal-delete-content").append(deleteBtn);

                }
            // }
        // }
    }
    // else{
    //     $("#modalBtnTab").attr("href", "#modalTabs");

    // }
})};

//have to listen to document for dynamically created buttons
$(document).on("click", "#deleteTabBtn1", function(e){
    database.ref(uid).child("tab1").set(false);
    tabCount();
});
$(document).on("click", "#deleteTabBtn2", function(e){
    database.ref(uid).child("tab2").set(false);
    tabCount();
});
$(document).on("click", "#deleteTabBtn3", function(e){
    database.ref(uid).child("tab3").set(false);
    tabCount();
});

$("#notesToBeAdded").on("click", function () {
    if (uid != undefined) {
        var noteNew = $("#thisIsNote").val().trim();
        notesAll += noteNew + "<br>";
        console.log(database.ref(uid));
        database.ref(uid).update({
            notes: notesAll
        });
        document.getElementById("notesForm").reset();
    }
    else {
        alert("please log in or register to use notes.")
    }

});

$("#notesToBeDeleted").on("click", function () {
    if (uid != undefined) {
        database.ref(uid).update({
            notes: ""
        });
    }
    else {
        alert("please log in or register to use notes.")
    }

});

//populates tabs from firebase info
database.ref(uid).on("value", function (snapShot) {
    $(".tabs").empty();
    var tabInfo = database.ref(uid).key;//uid
    var chillins = snapShot.child(uid).val();//children of uid
// console.log(uid);
// console.log(chillins);
console.log("here");
    if (uid !== undefined) {
        var t1 = chillins.tab1;//values of tab1
        var t2 = chillins.tab2;
        var t3 = chillins.tab3;

        // if (t1 !== undefined || t2 !== undefined || t3 !== undefined)

        var tabInfo = database.ref(uid).key;
        notesAll = chillins.notes;
        // console.log(t1, t2, t3, tabInfo);
        // console.log(typeof t1);
        $("#displayNotes").html(notesAll);
        if (typeof t1 !== "boolean" && typeof t1 !== "undefined") {
            // console.log("here");
            var newTab = $("<li>").addClass("tab col");
            var newA = $("<a id=tab1>").text(t1.tabName);
            newTab.append(newA);
            $(".tabs").append(newTab);
        }
        if (typeof t2 !== "boolean" && typeof t1 !== "undefined") {
            var newTab = $("<li>").addClass("tab col");
            var newA = $("<a id=tab2>").text(t2.tabName);
            newTab.append(newA);
            $(".tabs").append(newTab);
        }
        if (typeof t3 !== "boolean" && typeof t1 !== "undefined") {
            var newTab = $("<li>").addClass("tab col");
            var newA = $("<a id=tab3>").text(t3.tabName);
            newTab.append(newA);
            $(".tabs").append(newTab);
        }
    }
    countTabs();
});