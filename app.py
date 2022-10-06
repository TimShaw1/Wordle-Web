from cProfile import run
import os
from urllib import response

from flask import Flask, flash, jsonify, make_response, redirect, render_template, request, session
from flask_bootstrap import Bootstrap
from flask_session import Session

import numpy as np
import random

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

# Function to split word into list of letters
def split(word):
    return [char for char in word]

challenge = True

npy_solution_dict = np.load('solution_dict.npy', allow_pickle='TRUE').item()


# List to store green/yellow/gray letters
colors = ['gray', 'gray', 'gray', 'gray', 'gray']
temp_colors = ['gray', 'gray', 'gray', 'gray', 'gray']
win = ['green','green','green','green','green']

solution_dict = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0, 'G': 0, 'H': 0, 'I': 0, 'J': 0, 'K': 0, 'L': 0, 'M': 0, 'N': 0, 'O': 0, 'P': 0, 'Q': 0, 'R': 0, 'S': 0, 'T': 0, 'U': 0, 'V': 0, 'W': 0, 'X': 0, 'Y': 0, 'Z': 0}
temp_solution_dict = solution_dict.copy()


def game(word, sol_num):
    global npy_solution_dict
    word = word.upper()
    word_list = split(word)

    for letter in npy_solution_dict[sol_num][1]:
        solution_dict[letter] += 1

    # Check for green letters
    for i in range(5):
        if word_list[i] == npy_solution_dict[sol_num][1][i]:
            colors[i] = 'green'
            solution_dict[word_list[i]] -= 1

    # Check for yellow letters
    for i in range(5):
        for j in range(5):
            # if we haven't checked the letter already, and if it is in the word, make it yellow
            if solution_dict[word_list[i]] > 0 and word_list[i] == npy_solution_dict[sol_num][1][j] and colors[i] == 'gray':
                colors[i] = 'gold'
                solution_dict[word_list[i]] -= 1
                

    # Reset colors to gray
    for i in range(5):
        temp_colors[i] = colors[i]
        colors[i] = 'gray'

    # Reset dict to original dictionary
    solution_dict.clear()
    solution_dict.update(temp_solution_dict)

    return temp_colors

# Server stuff
@app.route("/", methods=['POST', 'GET'])
def home():
    global npy_solution_dict

    # Get guess from page
    if request.method == "POST":
        guess = request.get_json()
        # If we lose
        if guess[0] == "loss":
            if challenge:
                res = make_response({"bot_words": bot_dict[npy_solution_dict[guess[1]][0].upper()][0], "bot_all_colors": bot_dict[npy_solution_dict[guess[1]][0].upper()][1:][0], "solution": npy_solution_dict[guess[1]][0]}, 200)
            else:
                res = make_response({"solution": npy_solution_dict[guess[1]][0]}, 200)
            return res
        # Check the word
        game_colors = game(guess[0], guess[1])
        send_colors = []
        for i in range(len(game_colors)):
            send_colors.append(game_colors[i])

        # Check for valid response
        if guess[0].lower() not in guesses and guess[0].lower() not in solutions:
            res = make_response({"message": "invalid"}, 200)
        # Check for win
        elif game_colors == win:
            res = make_response({"message": send_colors, "bot_words": bot_dict[npy_solution_dict[guess[1]][0].upper()][0], "bot_all_colors": bot_dict[npy_solution_dict[guess[1]][0].upper()][1:][0]}, 200)
        # Send back colors
        else:
            res = make_response({"message": send_colors, "bot_colors":bot_dict[npy_solution_dict[guess[1]][0].upper()][1:][0]}, 200)
                
        return res

    return render_template("challenge.html")



