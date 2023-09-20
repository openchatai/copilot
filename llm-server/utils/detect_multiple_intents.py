import re


# use spaCy or BERT for more accurate results
def hasMultipleIntents(user_input: str) -> bool:
    # Keywords for multiple questions
    question_keywords = [
        "and",
        "also",
        "in addition",
        "moreover",
        "furthermore",
        "besides",
        "additionally",
        "another question",
        "second question",
        "next, ask",
        "thirdly",
        "finally",
        "lastly",
    ]

    # Check for question keywords
    question_pattern = "|".join(re.escape(keyword) for keyword in question_keywords)
    question_matches = [
        match.group()
        for match in re.finditer(question_pattern, user_input, re.IGNORECASE)
    ]

    print(f"Found {question_matches} in the following input: {user_input}")
    return bool(question_matches)


# user_input = (
#     "I want to fetch data from API A and also, can you answer another question?"
# )
# result = hasMultipleIntents(user_input)
# print(json.dumps(result, indent=2))
