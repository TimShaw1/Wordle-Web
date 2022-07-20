let i = 0;  //columns
let j = 0;  //rows
let i_bot = 0;  //columns for bot
let j_bot = 0;  //rows for bot

let guess = "";
let colors = [];
let win = ['green', 'green', 'green', 'green', 'green'];
let waiting = false;

let trash_talk = true;

document.cookie = "promo_shown=1; Max-Age=2600000; SameSite=None; Secure";

// Preload leaving sound
let leave_sound = new Audio('https://docs.google.com/uc?export=download&id=1BPYPf8qlrOMA1CyFttQ_P023hwDNB0aq');

var guess_links = [
    new Audio('https://docs.google.com/uc?export=download&id=1JGMbg_i34g5djFsN3Dp40C7BOqX-8FtA'), // Dogwater
    new Audio('https://docs.google.com/uc?export=download&id=1JMx8ACTcnFv2VYfu2_83I2Cxru3bObBk'), // Imagine guessing that
    new Audio('https://docs.google.com/uc?export=download&id=1JRFY_CloQGIGfznveTsnTwaPyPepJHSb'), // yikes
    new Audio('https://docs.google.com/uc?export=download&id=1JWajS7lwPM2OCXXbMNZnD3tJ3L9sFw5-'), // throwing
    new Audio('https://docs.google.com/uc?export=download&id=1Jf-9dg-KkM0LaK76RTqHFb4DREpZoyxF'), // so f ing stupid
    new Audio('https://docs.google.com/uc?export=download&id=1JrHFoXm6MN8cv1DKscJcGrNF-GOjSEv5'), // that ain't it cheif
    new Audio('https://docs.google.com/uc?export=download&id=17X_q1qYydn2qdDCwsNJbkjck8zadMKds'), // ray charles
    new Audio('https://docs.google.com/uc?export=download&id=17WweN8tbtmapgu2WjCvBkYyyGuu8gYJJ'), // sheesh
    new Audio('https://docs.google.com/uc?export=download&id=17_Cns5CS21vEzkwOf3OtwUbWRzmO9BtQ'), // goofy ahh
    new Audio('https://docs.google.com/uc?export=download&id=1BOR8mRpbUSuDkKUowoqm2UtdXsR_-gQI')  // yee yee
]

var lose_links = [
    new Audio('https://docs.google.com/uc?export=download&id=1JYquCzA-nbVm-H2VHkb8dK5tcCz7MJQ3'), // default dance
    new Audio('https://docs.google.com/uc?export=download&id=1Ja4S7eT_0Mw4_NAOxAMNfjYWst0RydjI'), // unlucky
    new Audio('https://docs.google.com/uc?export=download&id=1JzKczM9x80vHYpoNFGewod_RUJtLzrdH'), // ez clap
    new Audio('https://docs.google.com/uc?export=download&id=1K8Xq5clmvFM5YtooJ1fg476DgbwhK3V9'), // L
    new Audio('https://docs.google.com/uc?export=download&id=17SBY4zOBf5DVIQ8Eml9rkq18tFLtG2Lt'), // get dunked on
    new Audio('https://docs.google.com/uc?export=download&id=17QR0pViFhq0uF8SJNBimb0qkIriGw1OZ'), // gonna cry?
    new Audio('https://docs.google.com/uc?export=download&id=17KJGfpfFbVnjQN650sqQJGeekI1grOZy'), // dumpster trashed
    new Audio('https://docs.google.com/uc?export=download&id=1KJMKaa5Fvj6c1R9prXF-jpJ8uzuJjym3'), // eat sh1t
    new Audio('https://docs.google.com/uc?export=download&id=1B5RWIvGo54n8tr5jRlHA05JWaMk_C9G5'), // terrible job super_sh1t
    new Audio('https://docs.google.com/uc?export=download&id=1BCY8hhkUOF3OceKvGU94puiRe-Oc1IVf'), // sh1ttle
    new Audio('https://docs.google.com/uc?export=download&id=1BPN6whoXLfELZOHk_Wpt0Uw5rt4N3ye-')  // XD
]

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
            if (colors[i] == 'green') {
                document.getElementById(id).style.background = colors[i];
            }
            else
            if (document.getElementById(id).style.background != 'gold') {
                if (colors[i] == 'gold')
                {
                    document.getElementById(id).style.background = colors[i];
                }
                else
                {
                document.getElementById(id).style.background = colors[i];
                }
            }
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
                        // Show bot words
                        if (data["bot_words"])
                        {
                            bot_words = data["bot_words"];
                            console.log(bot_words);
                            bot_colors = data["bot_all_colors"];
                            console.log(bot_colors);
                            for (var q = 0; q < 6; q++) {
                                for (var k = 0; k < 5; k++) {
                                    // Set letters
                                    letter_id = q.toString().concat(",,", k.toString());
                                    if (q < bot_words.length)
                                    {
                                        document.getElementById(letter_id).textContent = bot_words[q][k].toUpperCase();
                                    }

                                    // Set colors
                                    letter_id = q.toString().concat("//", k.toString());
                                    if (q < bot_words.length)
                                    {
                                        document.getElementById(letter_id).style.background = bot_colors[q][k];
                                    }
                                }
                            }
                        }
                        if (trash_talk)
                        {
                            lose_links[Math.floor(Math.random() * lose_links.length)].play();
                        }
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

                        if (data["bot_colors"]) {
                            bot_colors = data["bot_colors"];
                            for (var k = 0; k < 5; k++) {
                                // Set letter colors based on the response by the server
                                letter_id = j_bot.toString().concat("//", k.toString());
                                if (bot_colors.length > j_bot) {
                                    document.getElementById(letter_id).style.background = bot_colors[j_bot][k];
                                }

                                // Set letter tiles to the correct colors
                                setGuessed(guess, colors);

                                waiting = false;
                            }
                            if (j < 5 && trash_talk) {
                                guess_links[Math.floor(Math.random() * guess_links.length)].play();
                            }
                        }

                        // Reset column and move down 1 row
                        i = 0;
                        i_bot = 0;
                        j++;
                        j_bot++;
                        guess = "";

                        if (data["bot_words"]) {
                            bot_words = data["bot_words"];
                            bot_colors = data["bot_all_colors"];
                            for (var q = 0; q < 6; q++) {
                                for (var k = 0; k < 5; k++) {
                                    // Set letters
                                    letter_id = q.toString().concat(",,", k.toString());
                                    if (q < bot_words.length)
                                    {
                                        document.getElementById(letter_id).textContent = bot_words[q][k].toUpperCase();
                                    }

                                    // Set colors
                                    letter_id = q.toString().concat("//", k.toString());
                                    if (q < bot_words.length)
                                    {
                                        document.getElementById(letter_id).style.background = bot_colors[q][k];
                                    }
                                }
                            }
                        }

                        // If we win, stop taking guesses
                        if (checkWin(colors)) {
                            if (j >= bot_colors.length && trash_talk)
                            {
                                lose_links[Math.floor(Math.random() * lose_links.length)].play();
                            }
                            else
                            {
                                document.getElementById("bot_list").hidden = true;
                                leave_sound.play()
                            }
                            j = -1;
                            document.getElementById("again").value = "Press Enter";
                            return;
                        }

                        // Tell the server if we lost
                        if (j == 6) {
                            guess = "loss";
                            document.getElementById("again").value = "Press Enter";
                            submit_message();
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
            if (j == -1 || j == 6) {
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