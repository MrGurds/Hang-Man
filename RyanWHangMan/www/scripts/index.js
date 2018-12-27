// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.

(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );
    var gameOrRankings = "";
    var currentcategory = "";
    // constants
    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const MAX_GUESSES = 6;
    const MIN_WORD_LENGTH = 5;
    const GAME_STATES = {
        GAME_NOT_STARTED: "GAME_NOT_STARTED",
        GAME_IN_PROGRESS: "GAME_IN_PROGRESS",
        GAME_OVER_WIN: "GAME_OVER_WIN",
        GAME_OVER_LOSE: "GAME_OVER_LOSE"
    };

    // variables
    var gameState = GAME_STATES.GAME_NOT_STARTED;
    var word = null;
    var guess = null;
    var guessesRemaining = null;
    var message = "No word found.";
    var mySound;
    var wilhelm;
    var victorySound;
    var leaderBoardMusic;
    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        mySound = new sound("music/click.mp3");
        wilhelm = new sound("music/wilhelm.mp3");
        victorySound = new sound("music/victory.mp3");
        leaderBoardMusic = new sound("music/leaderboard.mp3");
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        document.getElementById("btncreateAccount").addEventListener("click", createAccount);
        document.getElementById("btnViewPlay").addEventListener("click", getGame);
        document.getElementById("homeWin").addEventListener("click", goToMainMenuFromWin);
        document.getElementById("homeLose").addEventListener("click", goToMainMenuFromLose);
        document.getElementById("btnViewRanks").addEventListener("click", getRankCategories);
        document.getElementById("leaderHome").addEventListener("click", goToMainMenuFromLeader);

     
        if (window.localStorage.getItem("hangUser") !== "null" && window.localStorage.getItem("hangUser") !== null) {
            goToMainMenu();
        }
        else {
            goToAccountCreation();
        }


        
    };



    function getRankCategories() {
        //gets the categories to view rankings for 
        //we want the categories for a ranks
        gameOrRankings = "r";
        //now we get the categories
        getCategories();
    }



    function refreshGame() {
        var dashes = "";
        var stickman = document.getElementById("stickman");
        for (var i = 0; i < guess.length; i++) {
            dashes += guess[i] + " "
        }
        document.getElementById("guessesRemaining").innerHTML = "Guesses Remaining: " + guessesRemaining;
        document.getElementById("dashes").innerHTML = dashes;


        if (guessesRemaining === 5) {
            stickman.src = "images/head.png";
        }
        else if (guessesRemaining === 4) {
            stickman.src = "images/torso.png";
        }

        else if (guessesRemaining === 3) {
            stickman.src = "images/realLeftArm.png";
        }

        else if (guessesRemaining === 2) {
            stickman.src = "images/realRightArm.png";
        }

        else if (guessesRemaining === 1) {
            stickman.src = "images/leftLeg.png";
        }

        else if (guessesRemaining === 0) {
            stickman.src = "images/death.png";
      
            
        }

        if (gameState === "GAME_OVER_WIN") {
            //game is won
            gameWon();
            stickman.src = "images/gallow.png";
        }
        else if (gameState === "GAME_OVER_LOSE") {
            //game is lost
            window.setTimeout( gameLost,1000);
         
        }
 
       

    }

    var newGame = function (w) {
        if (gameState !== GAME_STATES.GAME_IN_PROGRESS) {
            if (checkWord(w)) {
                word = w.toUpperCase();
                guess = [];
                for (var i = 0; i < word.length; i++) {
                    guess.push("-");
                }
                guessesRemaining = MAX_GUESSES;
                gameState = GAME_STATES.GAME_IN_PROGRESS;
                message = "New game started with word '" + word + "'.";
            } else {
                gameState = GAME_STATES.GAME_NOT_STARTED;

            }

        } else {
            message = "Cannot start new game until current game is complete.";
        }
    };

    var processLetter = function (letter) {
        if (letter === undefined) {
            message = "Letter is undefined, not processed.";
            return;
        }

        if (letter === null) {
            message = "Letter is NULL, not processed.";
            return;
        }

        if (letter.length !== 1) {
            message = "Single letter required, not processed.";
            return;
        }

        if (gameState !== GAME_STATES.GAME_IN_PROGRESS) {
            message = "No game in progress, not processed.";
            return;
        }

        message = "Processed letter '" + letter + "'.";
        if (word.indexOf(letter) >= 0) {
            for (var i = 0; i < word.length; i++) {
                if (word.charAt(i) === letter) {
                    guess[i] = letter;
                }
            }
        } else {
            guessesRemaining--;
        }
        updateGameState();

    };

    var report = function () {
        var guessCopy = guess !== null ? guess.slice() : guess;
        return {
            gameState: gameState,
            word: word,
            guess: guessCopy,
            guessesRemaining: guessesRemaining,
            message: message
        };
    };

    var checkWord = function (w) {
        if (w === undefined) {
            message = "No word found.";
            return false;
        }
        if (w === null) {
            message = "No word found.";
            return false;
        }
     var   temp = w.toUpperCase();
        if (temp.length < MIN_WORD_LENGTH) {
            message = "The word '" + temp + "' is too short.";
            return false;
        }
        for (var i = 0; i < temp.length; i++) {
            if (ALPHABET.indexOf(temp[i]) < 0) {
                message = "The word '" + temp + "' contains invalid characters.";
                return false;
            }
        }
        return true;
    };

    var updateGameState = function () {
        if (guessesRemaining === 0) {
            gameState = GAME_STATES.GAME_OVER_LOSE;
        } else {
            var match = true;
            for (var i = 0; i < word.length; i++) {
                if (word.charAt(i) !== guess[i]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                gameState = GAME_STATES.GAME_OVER_WIN;
            } else {
                gameState = GAME_STATES.GAME_IN_PROGRESS;
            }
        }
    };

    // public methods
    window.GameController = {
        newGame: newGame,
        processLetter: processLetter,
        report: report
    };


    function gameWon() {
        //game is won, update the players ranking and show the win screen
        var wonText = document.getElementById("won");
        getRanking();
        wonText.innerHTML = "Your ranking in " + currentcategory + " has Increased!";
        goToWin();
    }

    function gameLost() {
        //game is lost, update the players ranking and show the win screen
        var stickman = document.getElementById("stickman");
        var lostText = document.getElementById("lost");
        stickman.src = "images/gallow.png";
        getRanking();
        lostText.innerHTML = "Your ranking in " + currentcategory + " has Decreased!";
        goToLose();
    }

    function getRanking() {
        //gets the ranking for a player for a paticular category
        var player = window.localStorage.getItem("hangUser");
        var category = currentcategory;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                var resp = xmlhttp.responseText;
                console.log(resp);
                if (resp === 0) {
                    console.log(resp);
                } else {
                    //we now have a vocabulary so now we need to decide what word we are using
                    console.log(resp);
                    updateRanking(JSON.parse(resp));
                }
            }
        };
        xmlhttp.open("GET", "http://assignment0.com/hangman/webservice/rankings/player=" + player + "&category=" + currentcategory, true);
        xmlhttp.send();
    }
    function updateRanking(playersRanking) {

        //updates the ranking for a player for a paticular category
        var player = window.localStorage.getItem("hangUser");
        var num = 0;
        if (gameState === "GAME_OVER_WIN") {
            num = 1;
        }
        else if (gameState === "GAME_OVER_LOSE") {
            num = -1;
        }

        var obj = Object.values(playersRanking);
        if (obj[0].length < 1) {
            var send = {
                'score': '0',
                'password': window.localStorage.getItem("hangPass")
            }
        }
        else {
            var brokenArray = obj[0];
            var newscore = brokenArray[0].score + num;
            
          var send = {
              'score': newscore,
              'password': window.localStorage.getItem("hangPass")
          }

        }

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                var resp = xmlhttp.responseText;
                console.log(resp);
                if (resp === 0) {
                    console.log(resp);
                } else {

                    console.log(resp);
                  //  updateRanking();
                }
            }
        };
        xmlhttp.open("POST", "http://assignment0.com/hangman/webservice/rankings/player=" + player + "&category=" + currentcategory, true);
        xmlhttp.send(JSON.stringify(send));
    }


    function getGame() {
        //we want the categories for a game
        gameOrRankings = "g";
        //now we get the categories
        getCategories();
    }

    function buildGameCategories(categories) {
        var html = "";
        console.log(Object.values(categories));
        var obj = Object.values(categories);
        html += "<h1>Select Category to Play</h1>";
        //builds the games categories with JSON and buttons
        for (var i = 0; i < obj[0].length; i++) {
            var cat = obj[0][i];
            var coolcat = capitalizeFirstLetter(cat.categoryName);
       
            html += '<button id="' + coolcat + '" class="purpleButton gameButton" value="' + cat.categoryName + '">' + coolcat + '</button>';
        }

        document.getElementById("gameList").innerHTML = html;
        var allButtons = document.querySelectorAll(".gameButton");
        for (var i = 0; i < allButtons.length; i++) {
            allButtons[i].addEventListener("click", playCategory);
        }
        goToGamesList();

    }



    function buildRanksCategories(categories) {
        var html = "";
        console.log(Object.values(categories));
        var obj = Object.values(categories);
        html += "<h1>Select Category to View Rankings</h1>";
        //builds the games categories with JSON and buttons
        for (var i = 0; i < obj[0].length; i++) {
            var cat = obj[0][i];
            var coolcat = capitalizeFirstLetter(cat.categoryName);

            html += '<button id="' + coolcat + '" class="purpleButton rankButton" value="' + cat.categoryName + '">' + coolcat + '</button>';
        }

        document.getElementById("rankingsList").innerHTML = html;
        var allButtons = document.querySelectorAll(".rankButton");
        for (var i = 0; i < allButtons.length; i++) {
            allButtons[i].addEventListener("click", viewRank);
        }
        goToRankList();

    }


    function viewRank(e) {
        var selectedCategory = e.target.value;
        currentcategory = selectedCategory;
        ///gets the global rankings for that category
        getRankingsForCategory();
    }

    function getRankingsForCategory() {
        var selectedCategory = currentcategory;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                var resp = xmlhttp.responseText;
                console.log(resp);
                if (resp === 0) {
                    console.log(resp);
                } else {
                    //we now have all of the rankings for that category. now we must build the data
                    console.log(resp);
                    buildLeaderboard(JSON.parse(resp));
                }
            }
        };
        xmlhttp.open("GET", "http://assignment0.com/hangman/webservice/rankings/category=" + selectedCategory, true);
        xmlhttp.send();
    }


    function buildLeaderboard(leaderboard) {
        //builds the leaderboard for a category, with the players rank highlighted
        //get the table
        var player = window.localStorage.getItem("hangUser");
        var table = document.getElementById("leaderboard");
        var headers = "<thead><th>Player</th><th>Score</th></thead><tbody>";
        var title = document.getElementById("leaderBoardTitle");
        var data = "";
        var obj = Object.values(leaderboard);
        var rankings = obj[0]
        //sort the rankings by score
        rankings.sort(compare);
        //interate through all the rankings to display them
        for (var i = 0; i < rankings.length; i++) {
            if (rankings[i].playerName === player) {
                //this is the player, hightlight him!
                data += "<tr class='playerRank'><td>" + rankings[i].playerName + "</td>" + "<td>" + rankings[i].score + "</td></tr>";
            }
            else {
                // not the player
                data += "<tr><td>" + rankings[i].playerName + "</td>" + "<td>" + rankings[i].score + "</td></tr>";
            }
        }
        data += "</tbody>";
        table.innerHTML = headers + data;
        var cat = capitalizeFirstLetter(currentcategory);
        title.innerHTML = "Leaderboard for " + cat;
        goToLeaderBoard();

    }


    function compare(a, b) {
        if (a.score < b.score)
            return 1;
        if (a.score > b.score)
            return -1;
        return 0;
    }








    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }







    function playCategory(e) {
        //user has selected their category and is ready to play
        var selectedCategory = e.target.value;
        currentcategory = selectedCategory;
        getVocabulary(selectedCategory);
        //now we have their category, lets get the vocabulary!
    }



    function randomWord(vocab) {
        //gets a random word from a vocab and returns it
        var obj = Object.values(vocab);
        var wordCount = obj[0].words.length;

      var random =  Math.floor((Math.random() * wordCount) + 0);
      var word = obj[0].words[random];
      return word;

    }

    function createLetterGems() {
        var html = "";
        for (var i = 0; i < ALPHABET.length; i++) {
            var letter = ALPHABET.charAt(i);
            html += '<button id="' + letter + '" value="' + letter + '" class="btnLetter letterGem">' + letter + '</button>';

        }
        document.getElementById("letters").innerHTML = html;
        var allButtons = document.querySelectorAll(".btnLetter");
        for (var i = 0; i < allButtons.length; i++) {
            allButtons[i].addEventListener("click", makeGuess);
        }
    }


    function makeGuess(e) {
        //makes the users guess and refreshes. also disables the button
        var letter = e.target.value;
        document.getElementById(letter).disabled = true;
        processLetter(letter);
        mySound.play();
        refreshGame();
        //alert(letter);
    }





    function startnewGame(vocab) {

        //starts the game
                //first we need a random word from the assigned vocab
        var word = randomWord(vocab);
        console.log(word);
        newGame(word);
        refreshGame();
        createLetterGems();
        //display the game

        goToGame();
    }


    function getVocabulary(selectedCategory) {
        //gets the vocabulary for a category
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                var resp = xmlhttp.responseText;
                console.log(resp);
                if (resp === 0) {
                    console.log(resp);
                } else {
                    //we now have a vocabulary so now we need to decide what word we are using
                    console.log(resp);
                    startnewGame(JSON.parse(resp));
                }
            }
        };
        xmlhttp.open("GET", "http://assignment0.com/hangman/webservice/vocabularies/category=" + selectedCategory, true);
        xmlhttp.send();

    }


    function getCategories() {
        //gets all the categories whether for rankings or game
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                var resp = xmlhttp.responseText;
                console.log(resp);
                if (resp === 0) {
                    console.log(resp);
                } else {
                    if (gameOrRankings === "g") {
                        //user needs the categories for a game 
                        buildGameCategories(JSON.parse(resp));
                        console.log(resp);
                    }
                    else if (gameOrRankings === "r") {
                        //user needs the categories for ranks 
                        buildRanksCategories(JSON.parse(resp));
                        console.log(resp);
                    }
                  
                }
            }
        };
        xmlhttp.open("GET", "http://assignment0.com/hangman/webservice/categories", true);
        xmlhttp.send();
    }





    function validateRegister() {
        //makes sure there is stuff in the username and password boxes
        var go = true;
        if (document.getElementById("txtUser").value === "" || document.getElementById("txtPass").value === "") {
            go = false;
        }
        return go;
    }

    function createAccount() {
        //creates a new account for a user, only if theres stuff in the boxes
        var user = document.getElementById("txtUser").value;
        var pass = document.getElementById("txtPass").value;
      
        if (validateRegister) {
            var user = document.getElementById("txtUser").value;
            var pass = document.getElementById("txtPass").value;
            var obj = {
                'password': pass
            }
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    var resp = xmlhttp.responseText;
                    console.log(resp);
                    if (resp === 0) {
                        console.log(resp);
                    } else {
                        window.localStorage.setItem("hangUser", user);
                        window.localStorage.setItem("hangPass", pass);
                        goToMainMenu();
                    }
                }
            };
            xmlhttp.open("POST", "http://assignment0.com/hangman/webservice/players/player=" + user, true);
            xmlhttp.send(JSON.stringify(obj));
        }
        else {
            alert("One or More of your inputs are empty! Fix it.");
        }
    }

    function goToMainMenu() {
        //brings the user to the main menu

        document.getElementById("accountCreation").classList.add("hidden");
        document.getElementById("mainMenu").classList.remove("hidden");
    }

    function goToAccountCreation() {
        //brings the user to the main menu
        document.getElementById("accountCreation").classList.remove("hidden");
   
    }
    function goToGamesList() {
        //brings the user to the main menu
        mySound.play();
        document.getElementById("mainMenu").classList.add("hidden");
        document.getElementById("gameList").classList.remove("hidden");
    }

    function goToMainMenuFromWin() {
        //brings the user to the main menu
        mySound.play();
        playAudio();
        document.getElementById("winScreen").classList.add("hidden");
        document.getElementById("mainMenu").classList.remove("hidden");
    }


    function goToMainMenuFromLose() {
        //brings the user to the main menu
        mySound.play();
        playAudio();
        document.getElementById("loseScreen").classList.add("hidden");
        document.getElementById("mainMenu").classList.remove("hidden");
    }



    function goToWin() {
        //brings the user to the main menu
        pauseAudio()
        victorySound.play();
        document.getElementById("game").classList.add("hidden");
        document.getElementById("winScreen").classList.remove("hidden");
    }

    function goToLose() {
        //brings the user to the main menu
        pauseAudio();
        wilhelm.play();
        document.getElementById("game").classList.add("hidden");
        document.getElementById("loseScreen").classList.remove("hidden");
    }


    function goToGame() {
        //brings the user to the main menu
        mySound.play();
        document.getElementById("gameList").classList.add("hidden");
        //document.getElementById("gradiant").classList.add("hidden");
        document.getElementById("game").classList.remove("hidden");
    }

    function goToRankList() {
        //brings the user to the main menu
        mySound.play();
        document.getElementById("mainMenu").classList.add("hidden");
     
        document.getElementById("rankingsList").classList.remove("hidden");
    }


    function goToLeaderBoard() {
        //brings the user to the main menu
        mySound.play();
        pauseAudio();
        leaderBoardMusic.play();
        document.getElementById("rankingsList").classList.add("hidden");

        document.getElementById("leaderBoardDiv").classList.remove("hidden");
    }


    function goToMainMenuFromLeader() {
        leaderBoardMusic.stop();

        mySound.play();
        playAudio();
        document.getElementById("leaderBoardDiv").classList.add("hidden");
        document.getElementById("mainMenu").classList.remove("hidden");


    }



    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };


    function sound(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function () {
            this.sound.play();
        }
        this.stop = function () {
            this.sound.pause();
        }
    }





    function playAudio() {
        var music = document.getElementById("gamemusic"); 
        music.play();
    }

    function pauseAudio() {
        var music = document.getElementById("gamemusic"); 
        music.pause();
    }















} )();