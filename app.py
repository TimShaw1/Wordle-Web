from cProfile import run
import os
from urllib import response

from flask import Flask, flash, jsonify, make_response, redirect, render_template, request, session
from flask_bootstrap import Bootstrap
from flask_session import Session

import numpy as np
import random
import datetime

app = Flask(__name__)
app.secret_key = 'BAD_SECRET_KEY'

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app) 

bot_dict = np.load('bot_full_dict.npy', allow_pickle='TRUE').item()
solutions = np.load('solutions.npy', allow_pickle='TRUE')

guesses = np.load('guesses.npy', allow_pickle='TRUE')

bot_dict = np.load('bot_full_dict.npy', allow_pickle=True).item()

# Function to split word into list of letters
def split(word):
    return [char for char in word]

challenge = True

dict1 = np.load('solution_dict.npy', allow_pickle='TRUE').item()

offset = random.randint(0,2297)
myday = datetime.datetime.now()

print(offset)


# List to store green/yellow/gray letters
colors = ['gray', 'gray', 'gray', 'gray', 'gray']
temp_colors = ['gray', 'gray', 'gray', 'gray', 'gray']
win = ['green','green','green','green','green']

def game(word, sol_num):
    global dict1
    word = word.upper()
    word_list = split(word)

    # Check for green letters
    for i in range(5):
        if word_list[i] == dict1[(sol_num+offset)%2298][1][i]:
            colors[i] = 'green'

    # Check for yellow letters
    for i in range(5):
        for j in range(5):
            # if we haven't checked the letter already, and if it is in the word, make it yellow
            if word_list[i] == dict1[(sol_num+offset)%2298][1][j] and colors[i] == 'gray':
                colors[i] = 'gold'
                

    # Reset colors to gray
    for i in range(5):
        temp_colors[i] = colors[i]
        colors[i] = 'gray'

    return temp_colors

# Server stuff
@app.route("/", methods=['POST', 'GET'])
def home():
    global dict1, offset, myday

    # Get guess from page
    if request.method == "POST":
        # If the day rolls over, change the offset to maintain security
        if datetime.datetime.now().day > myday.day or datetime.datetime.now().month > myday.month or datetime.datetime.now().year > myday.year:
            offset = random.randint(0,2297)
            print(offset)
            myday = datetime.datetime.now()

        guess = request.get_json()
        # If we lose
        if guess[0] == "loss":
            if challenge:
                res = make_response({"bot_words": bot_dict[dict1[(guess[1]+offset)%2298][0].upper()][0], "bot_all_colors": bot_dict[dict1[(guess[1]+offset)%2298][0].upper()][1:][0], "solution": dict1[(guess[1]+offset)%2298][0]}, 200)
            else:
                res = make_response({"solution": dict1[(guess[1]+offset)%2298][0]}, 200)
            return res
        # Check the word
        game_colors = game(guess[0], (guess[1]+offset)%2298)
        send_colors = []
        for i in range(len(game_colors)):
            send_colors.append(game_colors[i])

        # Check for valid response
        if guess[0].lower() not in guesses and guess[0].lower() not in solutions:
            res = make_response({"message": "invalid"}, 200)
        # Check for win
        elif game_colors == win:
            res = make_response({"message": send_colors, "bot_words": bot_dict[dict1[(guess[1]+offset)%2298][0].upper()][0], "bot_all_colors": bot_dict[dict1[(guess[1]+offset)%2298][0].upper()][1:][0]}, 200)
        # Send back colors
        else:
            res = make_response({"message": send_colors, "bot_colors":bot_dict[dict1[(guess[1]+offset)%2298][0].upper()][1:][0]}, 200)
                
        return res

    return render_template("challenge.html")



