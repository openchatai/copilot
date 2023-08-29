@extends('layout.app', ['title' => __('Dashboard')])
@section('content')
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

        <!-- Page header -->
        <div class="mb-8">

            <!-- Title -->
            <h1 class="text-2xl md:text-3xl text-slate-800 font-bold">{{$bot->getName()}}: general settings✨</h1>
            <ul class="inline-flex flex-wrap text-sm font-medium">
                <li class="flex items-center">
                    <a class="text-slate-500 hover:text-indigo-500" href="{{route('index')}}">Home</a>
                    <svg class="h-4 w-4 fill-current text-slate-400 mx-3" viewBox="0 0 16 16">
                        <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"></path>
                    </svg>
                </li>
                <li class="flex items-center">
                    <a class="text-slate-500 hover:text-indigo-500" >General Settings</a>
                </li>

            </ul>
        </div>

        <div class="bg-white shadow-lg rounded-sm mb-8">
            <div class="flex flex-col md:flex-row md:-mr-px">

                <!-- Sidebar -->
                @include('layout.sidebar-bot-page')

                <!-- Panel -->
                <div class="grow">
                    <form action="{{route('chatbot.settings.update', ['id' => request()->route('id')])}}" method="POST">
                        @if ($errors->any())
                            <div x-show="open" x-data="{ open: true }" style="margin-bottom: 1rem;">
                                <div class="px-4 py-2 rounded-sm text-sm bg-amber-100 border border-amber-200 text-amber-600">
                                    <div class="flex w-full justify-between items-start">
                                        <div class="flex">
                                            <svg class="w-4 h-4 shrink-0 fill-current opacity-80 mt-[3px] mr-3"
                                                 viewBox="0 0 16 16">
                                                <path
                                                    d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z"></path>
                                            </svg>
                                            <div>

                                                @foreach($errors->all() as $error)
                                                    <p class="font-medium leading-snug">- {{ $error }}</p>
                                                @endforeach
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        @endif
                        @csrf
                        <!-- Panel body -->
                        <div class="p-6 space-y-6">

                            <!-- Business Profile -->
                            <section>
                                <h3 class="text-xl leading-snug text-slate-800 font-bold mb-1">General Settings</h3>
                                <div class="text-sm">Control your copilot settings and prompts</div>
                                <div class="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-5">
                                    <div class="sm:w-1/3">
                                        <label class="block text-sm font-medium mb-1" for="name">Name</label>
                                        <input id="name" name="name" class="form-input w-full" type="text"
                                               value="{{$bot->getName()}}">
                                    </div>
                                    <div class="sm:w-1/3">
                                        <label class="block text-sm font-medium mb-1" for="business-id">Copilot ID</label>
                                        <input id="business-id" class="form-input w-full disabled" type="text"
                                               value="{{$bot->getId()->toString()}}" disabled>
                                    </div>
                                </div>
                            </section>

                            <!-- Enhanced privacy -->
                            <section>
                                <h3 class="text-xl leading-snug text-slate-800 font-bold mb-1">ِCustom Context</h3>
                                <div class="text-sm">You can change your copilot initial context / prompt from here. also
                                    you can change the copilot response language.
                                </div>
                                <div class="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-5">
                                    <div class="sm:w-1/3">
                                        <label class="block text-sm font-medium mb-1" for="name">Manual context</label>
                                        <textarea name="prompt_message" id="" class="form-input w-full promptMessage"
                                                  id="promptMessage" rows="10">{{$bot->getPromptMessage()}}</textarea>
                                    </div>
                                    <span style="margin-left: 1rem; margin-right: 1rem;">✨or ✨</span>
                                    <div class="sm:w-1/3">
                                        <div class="1-click-box">
                                            <div class="m-1.5">
                                                <!-- Start -->
                                                <button
                                                    class="btn border-slate-200 hover:border-slate-300 text-indigo-500"
                                                    onclick="fillPrompt('main')">🤖 General Copilot
                                                </button>
                                                <button
                                                    class="btn border-slate-200 hover:border-slate-300 text-indigo-500"
                                                    onclick="fillPrompt('e_commerce')">🛍️ SaaS E-Commerce
                                                </button>

                                                <!-- End -->
                                            </div>
                                            <div class="m-1.5">
                                                <!-- Start -->
                                                <button
                                                    class="btn border-slate-200 hover:border-slate-300 text-indigo-500"
                                                    onclick="fillPrompt('accounting')">➗ SaaS Accounting
                                                </button>
                                                <button
                                                    class="btn border-slate-200 hover:border-slate-300 text-indigo-500"
                                                    onclick="fillPrompt('marketing')">👛 Marketing
                                                </button>
                                                <!-- End -->
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </section>


                            <!-- Password -->
                            <section>
                                <h3 class="text-xl leading-snug text-slate-800 font-bold mb-1">Delete the co-pilot</h3>
                                <div class="text-sm">Deleting the bot will delete all the data associated with it.</div>
                                <div class="mt-5">
                                    <a class="btn border-slate-200 shadow-sm text-indigo-500"
                                       href="{{route('chatbot.settings.delete', ['id' =>$bot->getId()])}}">Delete</a>
                                </div>
                            </section>
                        </div>

                            <!-- Panel footer -->
                            <footer>
                                <div class="flex flex-col px-6 py-5 border-t border-slate-200 ">
                                    <div class="flex self-end">
                                        <button class="btn bg-indigo-500 hover:bg-indigo-600 text-white ml-3"
                                                type="submit">Save Changes
                                        </button>
                                    </div>
                            </div>
                        </footer>

                    </form>

                </div>

            </div>
        </div>

    </div>
@endsection

@section('scripts')
    <script>
        // Enum for different cases
        const Cases = {
            MAIN: 'main',
            E_COMMERCE: 'e_commerce',
            ACCOUNTING: 'accounting',
            E_LEARNING: 'e_learning',
            MARKETING: 'marketing',
        };

        // Enum for prompts
        const Prompts = {
            [Cases.MAIN]: `You are a helpful AI co-pilot.
             Your job is to support and help the user.
             Sometimes you might need to call some API endpoints to get the data you need to answer the user's question.
             You will be given a context and a question; you need to answer the question based on the context.`,

            [Cases.E_COMMERCE]: `You are an AI e-commerce assistant, here to assist and guide the user through their online commerce journey.
             Occasionally, you might interact with various API endpoints to fetch information needed to address the user's inquiries.
              You know a lot about e-commerce and online shopping, and you're here to help the user run their online business smoothly.
               You'll receive a situation and a query, and your task is to respond to the question using the given scenario.`,

            [Cases.ACCOUNTING]: `You are an AI accounting assistant, ready to help users manage their financial tasks and responsibilities.
             At times, you might access specific accounting software or databases to gather relevant information.
             Your expertise lies in financial matters, and you're here to provide assistance with accounting-related queries.
             You'll be provided with a context and a question, and your goal is to answer the question based on the provided information.`,

            [Cases.E_LEARNING]: `You are an AI e-learning companion, dedicated to supporting users in their educational journey.
              Occasionally, you might need to access educational databases or platforms to retrieve data needed to address the user's questions.
              Your knowledge spans various subjects and learning methodologies, and you're here to help users achieve their learning goals.
              When given a scenario and a question, your objective is to craft a response using the context provided.`,

            [Cases.MARKETING]: `You are an AI marketing assistant, geared towards helping users excel in their marketing efforts.
             You have the capability to interact with marketing-related APIs to gather relevant data that addresses the user's inquiries.
             With a solid understanding of marketing strategies and trends, you're here to assist users in achieving their marketing objectives.
             When presented with a situation and a question, your task is to formulate a response based on the given context.`
        };


        console.log(prompt);



        function fillPrompt(content) {
            event.preventDefault();
            document.getElementsByClassName('promptMessage')[0].innerHTML = Prompts[content];
        }

    </script>
@endsection
