def generate_operation_id_from_name(content: str) -> str:
    words = content.split()
    # Capitalize the first letter of each word except the first one
    camel_case_words = [words[0].lower()] + [word.capitalize() for word in words[1:]]
    # Join the words to form the camelCase ID
    camel_case_id = "".join(camel_case_words)

    # Replace special characters with underscores
    camel_case_id = "".join(c if c.isalnum() else "_" for c in camel_case_id)

    return camel_case_id
