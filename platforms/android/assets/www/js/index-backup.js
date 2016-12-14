"use strict"; // needed for the mobile browser
var teamImages = {
    'raptors': './images/raptors.svg'
    , 'bulls': './images/bulls.svg'
    , 'cavaliers': './images/cavaliers.svg'
    , 'celtics': './images/celtics.svg'
    , 'clippers': './images/clippers.svg'
    , 'grizzlies': './images/grizzlies.svg'
    , 'rockets': './images/rockets.svg'
    , 'spurs': './images/spurs.svg'
    , 'thunder': './images/thunder.svg'
    , 'warriors': './images/warriors.svg'
};
if (document.deviceready) {
    document.addEventListener('deviceready', onDeviceReady);
}
else {
    document.addEventListener('DOMContentLoaded', onDeviceReady);
}

function onDeviceReady() {
        document.querySelector("#standButton").addEventListener("click", function () {
            document.querySelector("#scoreDiv").style.display = "none";
            document.querySelector("#standingDiv").style.display = "block";
        });
        document.getElementById("scoreButton").addEventListener("click", function () {
            document.querySelector("#scoreDiv").style.display = "block";
            document.querySelector("#standingDiv").style.display = "none";
        });
        document.getElementById("refreshButton").addEventListener("click", function () {
            document.querySelector("#scoreDiv").innerHTML = "";
            document.querySelector("#standingDiv").innerHTML = "";
            serverData.getJSON();
            localStorage.setItem(("scores"), JSON.stringify(data));
            displayData(JSON.parse(localStorage.getItem("score")));
            document.querySelector("#scoreDiv").style.display = "block";
            document.querySelector("standingDiv").style.display = "none";
        });
    //    console.log("Ready!");    
    //  displayData(serverData.getJSON()); // Damian this is an invalid call serverData.getJSON() does not return data
    serverData.getJSON(); // this is the correct call
}
let serverData = {
    url: "https://griffis.edumedia.ca/mad9014/sports/basketball.php"
    , httpRequest: "GET"
    , getJSON: function () {
        // Create an empty Request Headers instance
        let headers = new Headers();
        // Add a header(s)
        // key value pairs sent to the server
        headers.append("Content-Type", "text/plain");
        headers.append("Accept", "application/json; charset=utf-8");
        // simply show them in the console
        console.dir("headers: " + headers.get("Content-Type"));
        console.dir("headers: " + headers.get("Accept"));
        // Create an options object
        let options = {
            method: serverData.httpRequest
            , mode: "cors"
            , headers: headers
        };
        // Create an request object so everything we need is in one package
        let request = new Request(serverData.url, options);
        console.log(request);
        fetch(request).then(function (response) {
            console.log(response);
            // vars look closer at what we recieved
            console.log("Got a response");
            console.log("HTTPStatus", response.status);
            console.log("StatusText", response.statusText);
            console.log("url", response.url);
            console.log("type", response.type);
            return response.json();
        }).then(function (data) {
            console.log(data); // now we have JS data, var's sort and display it
            displayData(data);
        }).catch(function (err) {
            console.log(err);
            alert("Error: " + err.message);
        });
    }
};

function displayData(data) {
    // console.log(data);
    // console.log(localStorage.getItem("scores"));
    let dayScores = data.scores;
    console.log(dayScores);
    let teams = data.teams;
    // console.log(teams);
    let teamnames = {};
    // turn the team id / name into map (key/value) 
    teams.forEach(function (element) {
        // Option to inject image path.
        let temp = element.name.split(' ');
        // console.log(teamImages[temp[temp.length - 1].toLowerCase()]);
                teamnames[element.id] = "<img src='" + teamImages[temp[temp.length - 1].toLowerCase()] + "'>" + element.name;
        teamnames[element.id] = element.name;
        // uncomment this for option to not inject image here
        // teamnames[element.id] = element.name
    });
    let scoreTable = "<table class='table table-striped'>";
    dayScores.forEach(function (element) {
        var d = new Date(element.date);
        scoreTable += "<tr><th class='date'>" + d.toLocaleDateString() + "</th></tr>";
        // console.log(element.date);
        element.games.forEach(function (element) {
            // console.log(element);
            scoreTable += "<tr><td class='home'>" + teamnames[element.home] + "</td><td class='score'>" + element.home_score + "</td><td class='away'>" + teamnames[element.away] + "</td><td class='score'>" + element.away_score + "</td></tr>";
        });
    });
    scoreTable += "</table></div>";
    document.getElementById("scoreDiv").innerHTML += scoreTable;
    Standings(data, teamnames);
}

function Standings(data, teamnames) {
    let dayScores = data.scores;
    //    console.log(dayScores);
    let standingsList = [];
    //    console.log(data);
    data.teams.forEach(function (element) {
        standingsList.push({
            "id": element.id
            , "wins": 0
            , "loses": 0
            , "ties": 0
            , "pts": 0
        });
    });
    dayScores.forEach(function (element) {
        //        console.log(element.games); 
        element.games.forEach(function (element) {
            if (element.away_score > element.home_score) {
                //away team wins
                // console.log(element.away_score + " " + element.home_score);
                for (i = 0; i < standingsList.length; i++) {
                    if (standingsList[i].id == element.away) {
                        standingsList[i].wins++;
                        standingsList[i].pts += 2;
                    }
                    if (standingsList[i].id == element.home) {
                        standingsList[i].loses++;
                        standingsList[i].pts--;
                    }
                }
            }
            else if (element.away_score < element.home_score) {
                //away team loses
                for (var i = 0; i++; i < standingsList.length) {
                    if (standingsList[i].id == element.away) {
                        standingsList[i].loses++;
                        standingsList[i].pts--;
                    }
                    if (standingsList[i].id == element.home) {
                        standingsList[i].wins++;
                        standingsList[i].pts += 2;
                    }
                }
            }
            else {
                //team ties
                for (var i = 0; i++; i < standingsList.length) {
                    if (standingsList[i].id == element.away) {
                        standingsList[i].ties++;
                        standingsList[i].pts++;
                    }
                    if (standingsList[i].id == element.home) {
                        standingsList[i].ties++;
                        standingsList[i].pts++;
                    }
                }
            }
        });
    });

    function compare(a, b) {
        if (a.pts < b.pts) return 1;
        if (a.pts > b.pts) return -1;
        return 0;
    }
    standingsList.sort(compare);
    console.log(standingsList);
    let standingTable = "<div class='container-fluid'><table class='table table-striped'><tr><th>Team</th><th>Wins</th><th>Losses</th><th>Ties</th><th>Points</th></tr>";
    standingsList.forEach(function (element) {
        console.log(element);
        standingTable += "<tr><td>" + teamnames[element.id] + "</td><td>" + element.wins + "</td><td>" + element.loses + "</td><td>" + element.ties + "</td><td>" + element.pts + "</td></tr>";
    });
    standingTable += "</table></div>";
    document.querySelector("#standingDiv").innerHTML += standingTable;
}

function displayStanding() {
    $('.standings').css("display", "block");
    $('.score').css("display", "none");
}