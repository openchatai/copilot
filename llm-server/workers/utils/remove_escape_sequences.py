import re


def remove_escape_sequences(text):
    # Define a regular expression pattern to match escape sequences
    escape_pattern = re.compile(r"\\[0-7]{1,3}|\\[\\nrtbf]|\\[(){}]")

    # Replace escape sequences with their corresponding characters
    cleaned_text = escape_pattern.sub("", text)

    return cleaned_text
