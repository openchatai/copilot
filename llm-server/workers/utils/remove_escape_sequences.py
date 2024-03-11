import re


def remove_escape_sequences(text):
    # Define a regular expression pattern to match escape sequences
    escape_pattern = re.compile(r"\\[0-7]{1,3}|\\[\\nrtbf]|\\[(){}]")

    # Replace escape sequences with their corresponding characters
    cleaned_text = escape_pattern.sub("", text)

    # Remove HTML tags like <pad>
    cleaned_text = re.sub(r"<[^>]*>", "", cleaned_text)

    # Replace new line characters with spaces
    cleaned_text = cleaned_text.replace("\n", " ")

    return cleaned_text
