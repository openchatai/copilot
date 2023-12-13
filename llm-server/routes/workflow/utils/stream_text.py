from flask import Response, stream_with_context


def stream_word(word: str):
    def generate():
        for char in word:
            yield char

    return Response(
        stream_with_context(generate()), content_type="text/plain;charset=utf-8"
    )
