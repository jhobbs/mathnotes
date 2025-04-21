#!/usr/bin/env python3

import sys
import numpy as np
import random
import re
import pickle
import argparse

def normalize(word):
    word = word.lower()
    return word

def tokenize(text):
    # Split text into words (including contractions) and punctuation, ignoring whitespace
    return re.findall(r"\w+(?:'\w+)?|[^\w\s]", text)

def save_model(transitions, index2word, filename):
    with open(filename, 'wb') as f:
        pickle.dump({'transitions': transitions, 'index2word': index2word}, f)

def load_model(filename):
    with open(filename, 'rb') as f:
        data = pickle.load(f)
    return data['transitions'], data['index2word']

def main():
    parser = argparse.ArgumentParser(description="Markov chain text generator.")
    parser.add_argument("--load", metavar="MODEL", help="Load the model from a file instead of building it.")
    parser.add_argument("--save", metavar="OUTPUT", help="Save the model to a file.")
    parser.add_argument("--start", metavar="WORD", help="Specify the first word of the generated sentence.")
    parser.add_argument("--num", "-n", type=int, default=1, help="Number of samples to generate (default: 1).")
    parser.add_argument("input", nargs="?", help="Input text file (ignored if --load is used).")
    args = parser.parse_args()

    if args.load:
        transitions, index2word = load_model(args.load)
    else:
        if not args.input:
            parser.error("the following arguments are required: input (unless --load is used)")
        word2index = dict()
        words = tokenize(open(args.input).read())
        for word in words:
            word = normalize(word)
            if word not in word2index:
                word2index[word] = len(word2index)
        index2word = dict()
        for word, index in word2index.items():
            index2word[index] = word
        incidences = np.zeros((len(word2index), len(word2index)), dtype=np.uint16)
        for i in range(len(words) - 1):
            word1 = word2index[normalize(words[i])]
            word2 = word2index[normalize(words[i + 1])]
            incidences[word1][word2] += 1
        row_sums = incidences.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1
        transitions = np.zeros_like(incidences, dtype=np.float16)
        np.divide(incidences, row_sums, out=transitions)
        if args.save:
            save_model(transitions, index2word, args.save)

    for _ in range(args.num):
        # Determine starting index
        if args.start:
            # Normalize the start word to match the model's normalization
            start_word = normalize(args.start)
            # Find the index for the start word, fallback to random if not found
            word2index = {v: k for k, v in index2word.items()}
            current = word2index.get(start_word, random.randint(0, len(index2word) - 1))
        else:
            current = random.randint(0, len(index2word) - 1)

        sentence = []
        for i in range(100):
            token = index2word[current]
            sentence.append(token)
            if i >= 10 and re.match(r"[.!?]", token):
                break
            current = np.random.choice(len(index2word), p=transitions[current])

        # Adjust spacing between words and punctuation
        output = ""
        for token in sentence:
            if output and re.match(r"[^\w]", token):  # No space before punctuation
                output += token
            else:
                output += " " + token

        print(output.strip())  # Strip leading space

if __name__ == "__main__":
    main()