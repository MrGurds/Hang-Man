(function () {
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
        temp = w.toUpperCase();
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

})(); // end module