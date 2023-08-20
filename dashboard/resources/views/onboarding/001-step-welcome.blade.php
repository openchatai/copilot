@extends('layout.app', ['title' => __('Dashboard')])
@section('content')
    <div class="min-h-screen h-full flex flex-col after:flex-1">


        <!-- Header -->

        <!-- Progress bar -->
        <div class="px-4 pt-12 pb-8">
            <div class="max-w-md mx-auto w-full">
                <div class="relative">
                    <div class="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-slate-200" aria-hidden="true"></div>
                    <ul class="relative flex justify-between w-full">
                        <li>
                            <a class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-indigo-500 text-white"
                            >1</a>
                        </li>
                        <li>
                            <a class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-slate-100 text-slate-500"
                            >2</a>
                        </li>
                        <li>
                            <a class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-slate-100 text-slate-500"
                            >3</a>
                        </li>
                        <li>
                            <a class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-slate-100 text-slate-500"
                            >4</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="px-4 py-8">
            <div class="max-w-md mx-auto">

                <h1 class="text-3xl text-slate-800 font-bold mb-6">Let's create your own product copilot 🔥</h1>
                <p style="margin-bottom: 2rem">And here how we are going to do it:</p>
                <!-- Form -->
                <form>
                    <div class="space-y-3 mb-8">
                        <ul class="-my-2">
                            <!-- List item -->
                            <li class="relative py-2">
                                <div class="flex items-center mb-1">
                                    <div
                                        class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                        aria-hidden="true"></div>
                                    <div class="absolute left-0 rounded-full bg-indigo-500" aria-hidden="true">
                                        <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                            <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z"></path>
                                        </svg>
                                    </div>
                                    <h3 class="text-lg font-bold text-slate-800 pl-9">
                                        Your API definition (Swagger)
                                    </h3>
                                </div>
                                <div class="pl-9">
                                    We will use this definition to give your copilot the ability of understanding your
                                    product.
                                </div>
                            </li>
                            <!-- List item -->
                            <li class="relative py-2">
                                <div class="flex items-center mb-1">
                                    <div
                                        class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                        aria-hidden="true"></div>
                                    <div class="absolute left-0 rounded-full bg-indigo-500" aria-hidden="true">
                                        <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                            <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z"></path>
                                        </svg>
                                    </div>
                                    <h3 class="text-lg font-bold text-slate-800 pl-9">We validate your API definition</h3>
                                </div>
                                <div class="pl-9">
                                   We will validate your swagger file to make sure that it is valid and that we can understand it.
                                </div>
                            </li>
                            <!-- List item -->
                            <li class="relative py-2">
                                <div class="flex items-center mb-1">
                                    <div
                                        class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                        aria-hidden="true"></div>
                                    <div class="absolute left-0 rounded-full bg-indigo-500" aria-hidden="true">
                                        <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                            <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z"></path>
                                        </svg>
                                    </div>
                                    <h3 class="text-lg font-bold text-slate-800 pl-9">You integrate the copilot on your
                                        product</h3>
                                </div>
                                <div class="pl-9">That is it! we will provide you with a Javascript code to put it on
                                    your product.
                                </div>
                            </li>
                            <!-- List item -->
                        </ul>
                    </div>
                    <div class="flex items-center justify-between">
                        <a class="btn bg-indigo-500 hover:bg-indigo-600 text-white ml-auto"
                           href="{{route('onboarding.002-step-swagger')}}">Let's do it! -&gt;</a>
                    </div>
                </form>

            </div>
        </div>

    </div>

@endsection

@section('scripts')

@endsection
