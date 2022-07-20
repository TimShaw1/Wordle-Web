from cProfile import run
import os

from flask import Flask, flash, jsonify, make_response, redirect, render_template, request, session
from flask_bootstrap import Bootstrap
from flask_session import Session

import numpy as np
import random

app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app) 

bot_dict = np.load('bot_full_dict.npy', allow_pickle='TRUE').item()
solutions = np.load('solutions.npy', allow_pickle='TRUE')

guesses = np.load('guesses.npy', allow_pickle='TRUE')
print(solutions)

bot_dict = np.load('bot_full_dict.npy', allow_pickle=True).item()

# Function to split word into list of letters
def split(word):
    return [char for char in word]

challenge = True

# Function to generate the word to guess
def generate_solution():
    # Choose random solution and store in array
    global solution, solution_list, solution_dict, bot_words, bot_colors, temp_solution_dict
    solution = random.choice(solutions)
    solution = solution.upper()
    solution_list = split(solution)

    print(solution)

    # Generate a dictionary for each letter of the alphabet
    solution_dict = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0, 'G': 0, 'H': 0, 'I': 0, 'J': 0, 'K': 0, 'L': 0, 'M': 0, 'N': 0, 'O': 0, 'P': 0, 'Q': 0, 'R': 0, 'S': 0, 'T': 0, 'U': 0, 'V': 0, 'W': 0, 'X': 0, 'Y': 0, 'Z': 0}
    # Count how many times each letter is in the word
    for letter in solution:
        solution_dict[letter] += 1
    # Store copy of original dictionary
    temp_solution_dict = solution_dict.copy()

    bot_words = bot_dict[solution.upper()][0]
    print(bot_words)
    bot_colors = bot_dict[solution.upper()][1:]
    print(bot_colors)



generate_solution()

# List to store green/yellow/gray letters
colors = ['gray', 'gray', 'gray', 'gray', 'gray']
temp_colors = ['gray', 'gray', 'gray', 'gray', 'gray']
win = ['green','green','green','green','green']

def game(word):
    word = word.upper()
    word_list = split(word)

    # Check for green letters
    for i in range(5):
        if word_list[i] == solution_list[i]:
            colors[i] = 'green'

    # Check for yellow letters
    for i in range(5):
        for j in range(5):
            # if we haven't checked the letter already, and if it is in the word, make it yellow
            if solution_dict[word_list[i]] > 0 and word_list[i] == solution_list[j] and colors[i] == 'gray':
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

last_request = ["GET", "GET"]

# Server stuff
@app.route("/", methods=['POST', 'GET'])
def home():

    if request.method == 'GET':
        if last_request[1] == "GET":
            generate_solution()
        if last_request[0] == "POST":
            last_request[0] = "GET"
        elif last_request[0] == "GET" and last_request[1] == "POST":
            last_request[1] = "GET"

    # Get guess from page
    if request.method == "POST":
        last_request[0] = "POST"
        last_request[1] = "POST"
        guess = request.get_json()
        # If we lose
        if guess == "loss":
            if challenge:
                res = make_response({"bot_words": bot_words, "bot_all_colors": bot_colors[0], "solution": solution}, 200)
            else:
                res = make_response({"solution": solution}, 200)
            # Generate a new solution after sending the old answer to the web page
            generate_solution()
            return res
        # Check the word
        game_colors = game(guess)
        send_colors = []
        for i in range(len(game_colors)):
            send_colors.append(game_colors[i])

        # Check for valid response
        if guess.lower() not in guesses and guess.lower() not in solutions:
            res = make_response({"message": "invalid"}, 200)
        # Check for win
        elif game_colors == win:
            res = make_response({"message": send_colors, "bot_words": bot_words, "bot_all_colors": bot_colors[0]}, 200)
            generate_solution()
        # Send back colors
        else:
            res = make_response({"message": send_colors, "bot_colors":bot_colors[0]}, 200)
                
        return res

    return render_template("challenge.html")



