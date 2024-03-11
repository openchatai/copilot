
| Get 1:1 support, Join the community (NEW!!) | 1 Click install | 
|:-:|:-:|
| [![](https://dcbadge.vercel.app/api/server/yjEgCgvefr)](https://discord.gg/yjEgCgvefr)| [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/openchatai/opencopilot)
 

> [!TIP]
> If you are looking for a managed version of OpenCopilot, [check out the cloud version ](https://cloud.opencopilot.so/) - it's production-ready with our latest planning engine that can handle and understand complex user requests. 



<img width="1445" alt="image" style="border-radius:20px" src="https://github.com/openchatai/OpenCopilot/assets/32633162/340d174b-6ddd-452f-a66d-6c5567cc4583">


**Documentation [available here](https://docs.opencopilot.so)**

------
# 🔥 OpenCopilot

---- 
OpenCopilot allows you to have your own product's AI copilot. It integrates with your underlying APIs and can execute API calls whenever needed. It uses LLMs to determine if the user's request requires calling an API endpoint. Then, it decides which endpoint to call and passes the appropriate payload based on the given API definition.

## How does it work?
- Provide your APIs/actions definition, including your public endpoints and how to call them. Currently, OpenCopilot supports Swagger OpenAPI 3.0 for bulk import.
- OpenCopilot validates your schema to achieve the best results.
- Finally, you can integrate our user-friendly chat bubble into your SaaS app.



## 🚀 Getting Started

- Make sure you have docker installed. 

- To begin, clone this Git repository:

```
git clone git@github.com:openchatai/OpenCopilot.git
```

In the `.env` file located in the `llm-server` directory, make sure to replace the placeholder value for the `OPENAI_API_KEY` variable with your actual token:

```
OPENAI_API_KEY=YOUR_TOKEN_HERE
```

### For Linux Machines

To install the necessary dependencies and set up the environment for OpenCopilot, use the following command:

```bash
make install
```

### For ARM Machines (Mac Silicon)

If you are using an ARM machine, specifically Mac Silicon, use the following command to install dependencies and set up the environment:

```bash
make install-arm
```

Once the installation is complete, you can access the OpenCopilot console at [http://localhost:8888](http://localhost:8888).

## Additional Commands

- **make migrate**: Run Alembic migrations.
- **make down**: Stop and remove all containers.
- **make exec-dashboard**: Access the dashboard container's shell.
- **make exec-llm-server**: Access the llm-server container's shell.
- **make restart**: Restart all containers.
- **make logs**: Show container logs.
- **make purge**: Fully clean uninstall (remove containers, networks, volumes, .env).
- **make help**: Display help message with available targets.


This will install the necessary dependencies and set up the environment for the OpenCopilot project.

Once the installation is complete, you can access the OpenCopilot console at http://localhost:8888



## Try it out:
**You can try it out on [opencopilot.so](http://opencopilot.so/)**



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
- It is not suitable for handling large APIs (you will need to write JSON transformers to make it work, refer to the docs for more)



## 🛣️ Teach the copilot via flows:
Most of the time, the copilot can figure out what actions to execute when the user requests something, but in case there is a complex flow, you can define it to help the copilot:

<img width="1453" alt="image 2" src="https://github.com/openchatai/OpenCopilot/assets/32633162/81cb899c-0200-40c6-bc2f-4fe49e112085">



## 🛣️ Embed on your app in a few lines of code
Less than <10 lines of codes to implement on your web app or desktop app

<img width="1445" alt="image" src="https://github.com/openchatai/OpenCopilot/assets/32633162/d2ad2597-9de2-4177-b894-7ce92dfd1fcd">



### Important links
- The backend server (API) is reachable via http://localhost:8888/backend
- The dashboard server is reachable via http://localhost:8888/ 
- You can also [use our SDK](https://github.com/openchatai/typescript-sdk)
 

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!



## Contributors ✨

- Learn how OpenCopilot codebase works and how you can contribute using Onbaord AI's tool: [learnthisrepo.com/opencopilot](https://learnthisrepo.com/opencopilot)
- This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!

## Analytics

This product collects anonymous usage data to help improve your experience. You can opt-out by setting `ENABLE_EXTERNAL_API_LOGGING=no` in your environment variables.


