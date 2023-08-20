from langchain.chains.openai_functions.openapi import get_openapi_chain


def try_to_match_and_call_api_endpoint(swagger_spec, text, headers):
    openapi_call_chain = get_openapi_chain(swagger_spec, verbose=True, headers=headers)

    return openapi_call_chain.run(text)
