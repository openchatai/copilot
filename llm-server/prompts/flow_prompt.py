1. you will be given a json file, which contains multiple different flows in which a group of apis can be executed. Given the user text you should be able to find the correct target group. From there I want you to call one api at a time


#  we can store the response of the different apis in redis as json or use mongodb or whatever maybe required, we can store it as json string, it will be easier for the llm to parse. maybe even use a different namespace and store the result in vector database for fast query. delete namespace once we finish computation. we may want to allow the llm ability to call these vector databases to get the response. Check if you have an agent already [This is doable using the following https://js.langchain.com/docs/modules/agents/tools/how_to/agents_with_vectorstores or https://python.langchain.com/docs/modules/agents/how_to/agent_vectorstore]
2. keep the response of apis in different flows stored, so that you can use the response when calling a different api if required. There will be an agent doing this



Once complete store the logs somewhere