let i = 0;  //columns
let j = 0;  //rows
let guess = "";
let colors = [];
let win = ['green', 'green', 'green', 'green', 'green'];
let waiting = false;

// https://stackoverflow.com/questions/40120915/javascript-function-that-returns-true-if-a-letter
// checks if a character is a letter
var isAlpha = function (ch) {
    return /^[A-Z]$/i.test(ch);
}

function checkWin(input) {
    for (var i = 0; i < 5; i++) {
        if (input[i] != "green") {
            return false;
        }
    }
    return true;
}

function setGuessed(guess, colors) {
    var id;
    const guessArray = guess.split('');
    for (var i = 0; i < 5; i++) {
        id = guessArray[i];
        if (document.getElementById(id).style.background != 'green') {
            document.getElementById(id).style.background = colors[i];
        }
    }
    return;
}

// https://stackoverflow.com/questions/6268508/restart-animation-in-css3-any-better-way-than-removing-the-element
function reset_animation(el) {
    el.style.animation = 'none';
    void (el.offsetHeight); /* trigger reflow */
    el.style.animation = null;
}

// https://pythonise.com/series/learning-flask/flask-and-fetch-api
// Submit guess to the server
function submit_message() {

    fetch(`${window.origin}/`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(guess),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    })
        .then(function (response) {
            if (response.status !== 200) {
                console.log(`Looks like there was a problem. Status code: ${response.status}`);
                return;
            }
            response.json().then(function (data) {
                // If we have an invalid word
                if (data["message"] == "invalid") {
                    console.log("Invalid");
                    el = document.getElementById("r".concat(j.toString()));
                    reset_animation(el);
                    el.style.animation = "shake 0.82s cubic-bezier(.36,.07,.19,.97) both";
                    waiting = false;
                }
                else
                    // if we lost and need to display the solution
                    if (data["solution"]) {
                        alert(data["solution"]);
                    }
                    else {
                        colors = data["message"];
                        for (var k = 0; k < 5; k++) {
                            // Set letter colors based on the response by the server
                            letter_id = j.toString().concat("/", k.toString());
                            document.getElementById(letter_id).style.background = colors[k];

                            // Set letter tiles to the correct colors
                            setGuessed(guess, colors);

                            waiting = false;
                        }
                        // Reset column and move down 1 row
                        i = 0;
                        j++;
                        guess = "";

                        // If we win, stop taking guesses
                        if (checkWin(colors)) {
                            j = -1;
                            document.getElementById("top_10").innerHTML = "";
                            document.getElementById("again").value = "Press Enter";
                            return;
                        }

                        // Tell the server if we lost
                        if (j == 6) {
                            guess = "loss";
                            document.getElementById("top_10").innerHTML = "";
                            document.getElementById("again").value = "Press Enter";
                            submit_message();
                        }

                        if (data["top_10"]) {
                            document.getElementById("top_10").innerHTML = "";
                            for (var q = 0; q < data["top_10"].length; q++) {
                                if (q > 9)
                                {
                                    break;
                                }
                                document.getElementById("top_10").innerHTML += data["top_10"][q];
                                if (q != data["top_10"].length - 1) {
                                    document.getElementById("top_10").appendChild(document.createElement("br"));
                                    document.getElementById("top_10").appendChild(document.createElement("br"));
                                }

                                
                            }
                        }
                    }
            });
        })
        .catch(function (error) {
            console.log("Fetch error: " + error);
        });

}


// referenced from https://stackoverflow.com/questions/1846599/how-to-find-out-what-character-key-is-pressed
// get input key
document.onkeydown = function (evt) {
    let id = j.toString().concat(",", i.toString());
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);

    // if backspace or delete are pressed, delete previous character
    // and move back a position
    if (charCode == 8 || charCode == 46) {
        // ensure we don't go out of range for i
        if (i == 4) {
            // Fixed comparison
            if (document.getElementById(id).textContent.indexOf('_') != -1) {
                i--;
            }
            document.getElementById(id).textContent = "_";
        }
        else
            // ensure we don't go out of range for i
            if (i > 0) {
                i--;
            }
        id = j.toString().concat(",", i.toString());
        document.getElementById(id).textContent = "_";
        guess = guess.slice(0, -1);

    }
    else
        // if we press enter, submit message
        if (charCode == 13) {
            if (j == -1 || j == 6)
            {
                window.location.reload();
            }
            if (j < 6 && i == 4 && guess.length == 5) {
                waiting = true;
                submit_message();
            }
        }
        else
            if (isAlpha(charStr) && j != -1 && waiting == false) {
                // Display character in correct box
                document.getElementById(id).textContent = charStr;
                if (guess.length < 5) {
                    guess = guess.concat(charStr);
                }
                else {
                    guess = guess.slice(0, -1);
                    guess = guess.concat(charStr);
                }

                // ensure we don't go out of range for i
                if (i < 4) {
                    i++;
                }
            }
};