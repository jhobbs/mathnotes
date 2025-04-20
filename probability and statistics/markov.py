#!/usr/bin/env python3

import sys
import numpy as np
import random
import re

def normalize(word):
    word = word.lower()
    return word

def tokenize(text):
    # Split text into words (including contractions) and punctuation, ignoring whitespace
    return re.findall(r"\w+(?:'\w+)?|[^\w\s]", text)

def main():
    word2index = dict()
    words = tokenize(open(sys.argv[1]).read())  # Use the new tokenize function
    
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
    row_sums[row_sums == 0] = 1  # Avoid division by zero by setting zero sums to 1
    transitions = np.zeros_like(incidences, dtype=np.float16)
    np.divide(incidences, row_sums, out=transitions)

    sentence = []
    current = random.randint(0, len(word2index))
    for i in range(100):  # Set a maximum limit to avoid infinite loops
        token = index2word[current]
        sentence.append(token)
        if i >= 10 and re.match(r"[.!?]", token):  # End if at least 10 words and sentence-ending punctuation
            break
        current = np.random.choice(len(word2index), p=transitions[current])

    # Adjust spacing between words and punctuation
    output = ""
    for token in sentence:
        if output and re.match(r"[^\w]", token):  # No space before punctuation
            output += token
        else:
            output += " " + token

    print(output.strip())  # Strip leading space

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python markov.py <textfile>")
        sys.exit(1)
    main()