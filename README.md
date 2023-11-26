<p>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<img alt="GitHub Contributors" src="https://img.shields.io/github/contributors/openchatai/opencopilot" />
<img alt="GitHub Last Commit" src="https://img.shields.io/github/last-commit/openchatai/opencopilot" />
<img alt="" src="https://img.shields.io/github/repo-size/openchatai/opencopilot" />
<img alt="GitHub Issues" src="https://img.shields.io/github/issues/openchatai/opencopilot" />
<img alt="GitHub Pull Requests" src="https://img.shields.io/github/issues-pr/openchatai/opencopilot" />
<img alt="Github License" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
<a href="https://discord.gg/yjEgCgvefr"><img alt="Discord" src="https://img.shields.io/discord/1111357170504699954"></a>


</p>

![image](https://github.com/openchatai/OpenCopilot/assets/32633162/a0cdc888-d2de-46b7-8c0b-96e876050b6e)

**Documentation [available here](https://docs.opencopilot.so)**

------
# 🔥 OpenCopilot [early beta]

---- 
OpenCopilot allows you to have your own product's AI copilot. It integrates with your underlying APIs and can execute API calls whenever needed. It uses LLMs to determine if the user's request requires calling an API endpoint. Then, it decides which endpoint to call and passes the appropriate payload based on the given API definition.

## How does it work?
- Provide your API/backend definition, including your public endpoints and how to call them. Currently, OpenCopilot supports Swagger OpenAPI 3.0. We're also working on a UI to allow you to dynamically add endpoints.
- OpenCopilot validates your schema to achieve the best results.
- We feed the API definition to an LLM.
- Finally, you can integrate our user-friendly chat bubble into your SaaS app.



https://github.com/openchatai/OpenCopilot/assets/32633162/0d9cfe4d-87f3-437e-b038-cf53c122d1d2

(In this example, the user was able to add a new fish to the store just by text commands)



## 🚀 Getting Started

- Make sure you have docker installed. 

- To begin, clone this Git repository:

```
git clone git@github.com:openchatai/OpenCopilot.git
```

- Update the `.env` file located in the `llm-server` directory with your `OPENAI_API_KEY`. You can use the `.env.example` file as a reference:

```
OPENAI_API_KEY=YOUR_TOKEN_HERE
MYSQL_URI=mysql+pymysql://dbuser:dbpass@mysql:3306/opencopilot
```

---
```
make install
```

This will install the necessary dependencies and set up the environment for the OpenCopilot project.

Once the installation is complete, you can access the OpenCopilot console at http://localhost:8888

---

If needed, you can also restart the local setup using:
```
make restart
```

Also, you can see the complete list of commands using 
```
make help
```


## Try it out:
**You can try it out on [opencopilot.so](http://opencopilot.so/)**


https://github.com/openchatai/OpenCopilot/assets/32633162/3bf5c24d-572c-4a42-9e45-40f05e5a16b2




[Watch this video from Shopify:](http://www.youtube.com/watch?v=HVvbY7A7lIQ)

[![IMAGE ALT TEXT](https://github.com/openchatai/OpenCopilot/assets/32633162/edebbaa6-eba5-4f72-b88d-cf0d690fffa8)](http://www.youtube.com/watch?v=HVvbY7A7lIQ "Video Title")
(OpenCopilot is not affiliated with Shopify, and they do not use OpenCopilot, it's just a demo of what copilots are capable of)


## AI Copilot: a growing trend

- [Shopify is developing "Shopify Sidekick."](https://www.youtube.com/watch?v=HVvbY7A7lIQ&ab_channel=Shopify)
- [Microsoft is working on "Windows Copilot."](https://www.youtube.com/watch?v=FCfwc-NNo30&ab_channel=MicrosoftDeveloper)
- [GitHub is in the process of creating "GitHub Copilot."](https://github.com/features/copilot)
- [Microsoft is also developing "Bing Copilot."](https://www.microsoft.com/en-us/bing?form=MA13FV)


Our goal is to empower every SaaS product with the ability to have their own AI copilots tailored for their unique products.

## 🏁 What OpenCopilot can and can't do now?

- It is capable of calling your underlying APIs.
- It can transform the response into meaningful text.
- It can automatically populate certain request payload fields based on the context.
  - For instance, you can request actions like: "Initiate a new case about X problem," and the title field will be automatically filled with the appropriate name.
- It is not suitable for handling large APIs (you will need to write JSON transofrmers to make it work, refer to the docs for more)



## 🛣️ Roadmap:

- [x] Create unlimited copilots.
- [x] Embed the copilot on your SaaS product using standard JS calls.
- [x] TypeScript chat bubble.
- [x] Provide Swagger definitions for your APIs.
- [x] Swagger definition validator + recommender.
- [x] UI endpoints editor.
- [x] Chat memory.
- [x] Vector DB support for large Swagger files.
- [ ] Plugins system to support different types of authentications.
- [x] Offline LLMs.
- [ ] Ability to ingest text data, PDF files, websites, and extra data sources.

We love hearing from you! Got any cool ideas or requests? We're all ears! So, if you have something in mind, give us a shout! 


### Important links
- [OpenCopilot Flows Editor](https://editor.opencopilot.so)
- The backend server (API) is reachable via http://localhost:8888/backend
- The dashboard server is reachable via http://localhost:8888/ or http://localhost:8888/dashboard
 

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!



## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!
