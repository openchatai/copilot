@php use App\Http\Services\Endpoint;use App\Http\Services\SwaggerParser; @endphp
@extends('layout.app', ['title' => __('Dashboard')])
@section('content')

    @php
        /** @var SwaggerParser $parser */
            $parser;

            /** @var Endpoint[] $enndpoints */
            $endpoints = $parser->getEndpoints();
            @endphp

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
                               href="{{route('onboarding.001-step-welcome')}}">1</a>
                        </li>
                        <li>
                            <a class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-indigo-500 text-white"
                               href="{{route('onboarding.002-step-swagger')}}">2</a>
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
        <!-- Progress bar -->
        <div class="px-4 py-8">
            <div class="max-w-md mx-auto">

                <h1 class="text-3xl text-slate-800 font-bold mb-6">Validations & recommendations ✨</h1>
                <p style="margin-bottom: 1rem">We will validate your Swagger file to make sure you will get the best
                    results</p>

                <div class="xl:-translate-x-16">

                    <!-- Post -->
                    <article class="pt-6">
                        <div class="xl:flex">
                            <div class="w-10 shrink-0">
                            </div>
                            <div class="grow pb-6 border-slate-200">

                                <!-- List -->
                                <ul class="my-2">
                                    <!-- List item -->

                                    @if(count($parser->getEndpointsWithoutOperationId($endpoints)))
                                        <li class="relative py-2">
                                            <div class="flex items-center mb-1">
                                                <div
                                                    class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                                    aria-hidden="true"></div>
                                                <div class="absolute left-0 rounded-full bg-rose-500"
                                                     aria-hidden="true">
                                                    <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                                        <path></path>
                                                    </svg>
                                                </div>
                                                <h3 class="text-lg font-bold text-slate-800 pl-9">Operation ID
                                                    <span
                                                        class="text-xs inline-flex font-medium bg-rose-100 text-rose-600 rounded-full text-center px-2.5 py-1">please fix</span>
                                                </h3>
                                            </div>
                                            <div class="pl-9">Some of your endpoints does not have an operation ID.
                                                it's required for the LLM to identify your endpoints. <a
                                                    href="https://swagger.io/docs/specification/paths-and-operations/"
                                                    style="font-weight: bold"> Learn how to fix? -></a>
                                            </div>

                                            <div class="px-5 py-4 rounded-sm border border-slate-200"
                                                 x-data="{ open: false }"
                                                 style="margin-left: 2.25rem;margin-top: 1rem;margin-bottom: 1rem;">
                                                <button class="flex items-center justify-between w-full group mb-1"
                                                        @click.prevent="open = !open" :aria-expanded="open"
                                                        aria-expanded="true">
                                                    <div class="text-sm text-slate-800 font-medium">See which endpoints
                                                        to fix
                                                    </div>
                                                    <svg
                                                        class="w-8 h-8 shrink-0 fill-current text-slate-400 group-hover:text-slate-500 ml-3 rotate-180"
                                                        :class="{ 'rotate-180': open }" viewBox="0 0 32 32">
                                                        <path d="M16 20l-5.4-5.4 1.4-1.4 4 4 4-4 1.4 1.4z"></path>
                                                    </svg>
                                                </button>
                                                <div class="text-sm" x-show="open" style="">
                                                    <table class="table-auto w-full">
                                                        <!-- Table header -->
                                                        <thead
                                                            class="text-xs uppercase text-slate-400 bg-slate-50 rounded-sm">
                                                        <tr>
                                                            <th class="p-2">
                                                                <div class="font-semibold text-left">Path</div>
                                                            </th>
                                                            <th class="p-2">
                                                                <div class="font-semibold text-center">Type</div>
                                                            </th>
                                                            <th class="p-2">
                                                                <div class="font-semibold text-center">Operation Id
                                                                </div>
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <!-- Table body -->
                                                        <tbody class="text-sm font-medium divide-y divide-slate-100">
                                                        @foreach($parser->getEndpointsWithoutOperationId($endpoints) as $endpoint)
                                                            <tr>
                                                                <td class="p-2">
                                                                    <div class="flex items-center">
                                                                        <div
                                                                            class="text-slate-800">{{$endpoint->path}}</div>
                                                                    </div>
                                                                </td>
                                                                <td class="p-2">
                                                                    <div class="text-center">{{$endpoint->type}}</div>
                                                                </td>
                                                                <td class="p-2">
                                                                    <div
                                                                        class="text-center text-emerald-500">{{$endpoint->operationId}}</div>
                                                                </td>
                                                            </tr>
                                                        @endforeach
                                                        <!-- Row -->

                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        </li>
                                    @else
                                        <li class="relative py-2">
                                            <div class="flex items-center mb-1">
                                                <div
                                                    class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                                    aria-hidden="true"></div>
                                                <div class="absolute left-0 rounded-full bg-indigo-500"
                                                     aria-hidden="true">
                                                    <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                                        <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z"></path>
                                                    </svg>
                                                </div>
                                                <h3 class="text-lg font-bold text-slate-800 pl-9">Operation ID
                                                    <span
                                                        class="text-xs inline-flex font-medium bg-emerald-100 text-emerald-600 rounded-full text-center px-2.5 py-1">great success</span>
                                                </h3>
                                            </div>
                                            <div class="pl-9">All your endpoints have an operation ID. This is great for
                                                the LLM to identify your endpoints.
                                            </div>
                                        </li>
                                    @endif
                                    <!-- List item -->

                                    @if(count($parser->getEndpointsWithoutDescription($endpoints)))
                                        <li class="relative py-2">
                                            <div class="flex items-center mb-1">
                                                <div
                                                    class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                                    aria-hidden="true"></div>
                                                <div class="absolute left-0 rounded-full bg-rose-500"
                                                     aria-hidden="true">
                                                    <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                                        <path></path>
                                                    </svg>
                                                </div>
                                                <h3 class="text-lg font-bold text-slate-800 pl-9">Description
                                                    <span
                                                        class="text-xs inline-flex font-medium bg-rose-100 text-rose-600 rounded-full text-center px-2.5 py-1">please fix</span>
                                                </h3>
                                            </div>
                                            <div class="pl-9">
                                                Some of your endpoints does not have a description. it's highly
                                                recommended to add a description to your endpoints
                                                <strong> <a
                                                        href="https://www.baeldung.com/swagger-set-example-description#:~:text=Add%20Description%20to%20Methods%20and%20Parameters&text=%40Operation%20defines%20the%20properties%20of,that%20accompany%20the%20response%20codes.">
                                                        Learn how to fix -> </a></strong>
                                            </div>

                                            <div class="px-5 py-4 rounded-sm border border-slate-200"
                                                 x-data="{ open: false }"
                                                 style="margin-left: 2.25rem;margin-top: 1rem;margin-bottom: 1rem;">
                                                <button class="flex items-center justify-between w-full group mb-1"
                                                        @click.prevent="open = !open" :aria-expanded="open"
                                                        aria-expanded="true">
                                                    <div class="text-sm text-slate-800 font-medium">See which endpoints
                                                        to fix
                                                    </div>
                                                    <svg
                                                        class="w-8 h-8 shrink-0 fill-current text-slate-400 group-hover:text-slate-500 ml-3 rotate-180"
                                                        :class="{ 'rotate-180': open }" viewBox="0 0 32 32">
                                                        <path d="M16 20l-5.4-5.4 1.4-1.4 4 4 4-4 1.4 1.4z"></path>
                                                    </svg>
                                                </button>
                                                <div class="text-sm" x-show="open" style="">
                                                    <table class="table-auto w-full">
                                                        <!-- Table header -->
                                                        <thead
                                                            class="text-xs uppercase text-slate-400 bg-slate-50 rounded-sm">
                                                        <tr>
                                                            <th class="p-2">
                                                                <div class="font-semibold text-left">Path</div>
                                                            </th>
                                                            <th class="p-2">
                                                                <div class="font-semibold text-center">Type</div>
                                                            </th>
                                                            <th class="p-2">
                                                                <div class="font-semibold text-center">Operation Id
                                                                </div>
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <!-- Table body -->
                                                        <tbody class="text-sm font-medium divide-y divide-slate-100">
                                                        @foreach($parser->getEndpointsWithoutDescription($endpoints) as $endpoint)
                                                            <tr>
                                                                <td class="p-2">
                                                                    <div class="flex items-center">
                                                                        <div
                                                                            class="text-slate-800">{{$endpoint->path}}</div>
                                                                    </div>
                                                                </td>
                                                                <td class="p-2">
                                                                    <div class="text-center">{{$endpoint->type}}</div>
                                                                </td>
                                                                <td class="p-2">
                                                                    <div
                                                                        class="text-center text-emerald-500">{{$endpoint->operationId}}</div>
                                                                </td>
                                                            </tr>
                                                        @endforeach
                                                        <!-- Row -->

                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>


                                        </li>
                                    @else
                                        <li class="relative py-2">
                                            <div class="flex items-center mb-1">
                                                <div
                                                    class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                                    aria-hidden="true"></div>
                                                <div class="absolute left-0 rounded-full bg-indigo-500"
                                                     aria-hidden="true">
                                                    <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                                        <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z"></path>
                                                    </svg>
                                                </div>
                                                <h3 class="text-lg font-bold text-slate-800 pl-9">Description
                                                    <span
                                                        class="text-xs inline-flex font-medium bg-emerald-100 text-emerald-600 rounded-full text-center px-2.5 py-1">great success</span>
                                                </h3>
                                            </div>
                                            <div class="pl-9">
                                                All your endpoints have a description. This is great for the LLM to
                                                understand what your endpoints do.
                                            </div>
                                        </li>
                                    @endif

                                    @if(count($parser->getEndpointsWithoutName($endpoints)))
                                        <li class="relative py-2">
                                            <div class="flex items-center mb-1">
                                                <div
                                                    class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                                    aria-hidden="true"></div>
                                                <div class="absolute left-0 rounded-full bg-rose-500"
                                                     aria-hidden="true">
                                                    <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                                        <path></path>
                                                    </svg>
                                                </div>
                                                <h3 class="text-lg font-bold text-slate-800 pl-9">Names
                                                    <span
                                                        class="text-xs inline-flex font-medium bg-rose-100 text-rose-600 rounded-full text-center px-2.5 py-1">please fix</span>
                                                </h3>
                                            </div>
                                            <div class="pl-9">
                                                All your endpoints have a name. This is great for the LLM to understand
                                                what your endpoints do.
                                            </div>

                                            <div class="px-5 py-4 rounded-sm border border-slate-200"
                                                 x-data="{ open: false }"
                                                 style="margin-left: 2.25rem;margin-top: 1rem;margin-bottom: 1rem;">
                                                <button class="flex items-center justify-between w-full group mb-1"
                                                        @click.prevent="open = !open" :aria-expanded="open"
                                                        aria-expanded="true">
                                                    <div class="text-sm text-slate-800 font-medium">See which endpoints
                                                        to fix
                                                    </div>
                                                    <svg
                                                        class="w-8 h-8 shrink-0 fill-current text-slate-400 group-hover:text-slate-500 ml-3 rotate-180"
                                                        :class="{ 'rotate-180': open }" viewBox="0 0 32 32">
                                                        <path d="M16 20l-5.4-5.4 1.4-1.4 4 4 4-4 1.4 1.4z"></path>
                                                    </svg>
                                                </button>
                                                <div class="text-sm" x-show="open" style="">
                                                    <table class="table-auto w-full">
                                                        <!-- Table header -->
                                                        <thead
                                                            class="text-xs uppercase text-slate-400 bg-slate-50 rounded-sm">
                                                        <tr>
                                                            <th class="p-2">
                                                                <div class="font-semibold text-left">Path</div>
                                                            </th>
                                                            <th class="p-2">
                                                                <div class="font-semibold text-center">Type</div>
                                                            </th>
                                                            <th class="p-2">
                                                                <div class="font-semibold text-center">Operation Id
                                                                </div>
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <!-- Table body -->
                                                        <tbody class="text-sm font-medium divide-y divide-slate-100">
                                                        @foreach($parser->getEndpointsWithoutName($endpoints) as $endpoint)
                                                            <tr>
                                                                <td class="p-2">
                                                                    <div class="flex items-center">
                                                                        <div
                                                                            class="text-slate-800">{{$endpoint->path}}</div>
                                                                    </div>
                                                                </td>
                                                                <td class="p-2">
                                                                    <div class="text-center">{{$endpoint->type}}</div>
                                                                </td>
                                                                <td class="p-2">
                                                                    <div
                                                                        class="text-center text-emerald-500">{{$endpoint->operationId}}</div>
                                                                </td>
                                                            </tr>
                                                        @endforeach
                                                        <!-- Row -->

                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        </li>
                                    @else
                                        <li class="relative py-2">
                                            <div class="flex items-center mb-1">
                                                <div
                                                    class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                                    aria-hidden="true"></div>
                                                <div class="absolute left-0 rounded-full bg-indigo-500"
                                                     aria-hidden="true">
                                                    <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                                        <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z"></path>
                                                    </svg>
                                                </div>
                                                <h3 class="text-lg font-bold text-slate-800 pl-9">Names
                                                    <span
                                                        class="text-xs inline-flex font-medium bg-emerald-100 text-emerald-600 rounded-full text-center px-2.5 py-1">great success</span>
                                                </h3>
                                            </div>
                                            <div class="pl-9">
                                                All your endpoints have a description. This is great for the LLM to
                                                understand what your endpoints do.
                                            </div>
                                        </li>
                                    @endif

                                    @if(count($endpoints) > 15)
                                        <li class="relative py-2">
                                            <div class="flex items-center mb-1">
                                                <div
                                                    class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                                    aria-hidden="true"></div>
                                                <div class="absolute left-0 rounded-full bg-rose-500"
                                                     aria-hidden="true">
                                                    <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                                        <path></path>
                                                    </svg>
                                                </div>
                                                <h3 class="text-lg font-bold text-slate-800 pl-9">Too many endpoints
                                                    <span
                                                        class="text-xs inline-flex font-medium bg-sky-100 text-sky-600 rounded-full text-center px-2.5 py-1">recommendation</span>
                                                </h3>
                                            </div>
                                            <div class="pl-9">
                                                You swagger file contain too many endpoints. we are still not capable of
                                                parsing large swagger files, please pick your most important endpoints
                                                and try it <strong>(we recommend less than 15 endpoints)</strong>
                                            </div>

                                        </li>
                                    @else
                                        <li class="relative py-2">
                                            <div class="flex items-center mb-1">
                                                <div
                                                    class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                                    aria-hidden="true"></div>
                                                <div class="absolute left-0 rounded-full bg-indigo-500"
                                                     aria-hidden="true">
                                                    <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                                        <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z"></path>
                                                    </svg>
                                                </div>
                                                <h3 class="text-lg font-bold text-slate-800 pl-9">Good number of
                                                    endpoints
                                                    <span
                                                        class="text-xs inline-flex font-medium bg-emerald-100 text-emerald-600 rounded-full text-center px-2.5 py-1">great success</span>
                                                </h3>
                                            </div>
                                            <div class="pl-9">
                                                {{count($endpoints)}} endpoints is a good number to start with. You can
                                                always add more later.
                                            </div>
                                        </li>
                                    @endif

                                    @if(!empty($parser->getAuthorizationType()) && $parser->getAuthorizationType() == SwaggerParser::OAUTH2)
                                        <li class="relative py-2">
                                            <div class="flex items-center mb-1">
                                                <div
                                                    class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                                    aria-hidden="true"></div>
                                                <div class="absolute left-0 rounded-full bg-rose-500"
                                                     aria-hidden="true">
                                                    <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                                        <path></path>
                                                    </svg>

                                                </div>
                                                <h3 class="text-lg font-bold text-slate-800 pl-9">
                                                    OAuth2.0 Authorization
                                                    <span
                                                        class="text-xs inline-flex font-medium bg-sky-100 text-sky-600 rounded-full text-center px-2.5 py-1">recommendation</span>
                                                </h3>
                                            </div>
                                            <div class="pl-9">
                                                Your swagger file contains OAuth2.0 authorization. Our system is still
                                                in early beta and <i>might</i> struggle with OAuth2.0 authorization. but
                                                let's give it a try.
                                            </div>

                                        </li>
                                    @else
                                        <li class="relative py-2">
                                            <div class="flex items-center mb-1">
                                                <div
                                                    class="absolute left-0 h-full w-0.5 bg-slate-200 self-start ml-2.5 -translate-x-1/2 translate-y-3"
                                                    aria-hidden="true"></div>
                                                <div class="absolute left-0 rounded-full bg-indigo-500"
                                                     aria-hidden="true">
                                                    <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 20 20">
                                                        <path d="M14.4 8.4L13 7l-4 4-2-2-1.4 1.4L9 13.8z"></path>
                                                    </svg>
                                                </div>
                                                <h3 class="text-lg font-bold text-slate-800 pl-9">Supported
                                                    Authorization
                                                    <span
                                                        class="text-xs inline-flex font-medium bg-emerald-100 text-emerald-600 rounded-full text-center px-2.5 py-1">great success</span>
                                                </h3>
                                            </div>
                                            <div class="pl-9">
                                                @if($parser->getAuthorizationType() == null)
                                                    Your swagger file does not contain any authorization, you are goodto
                                                    go.
                                                @else
                                                    Your swagger file contains
                                                    <strong>{{$parser->getAuthorizationType()}}</strong>
                                                    authorization, we support it.
                                                @endif
                                            </div>
                                        </li>
                                    @endif
                                </ul>

                            </div>
                        </div>
                    </article>

                </div>
                <div class="flex items-center justify-between" style="margin-top: 2rem">
                    <a class="text-sm underline hover:no-underline" href="{{route('onboarding.001-step-welcome')}}">&lt;-
                        Back</a>

                    <div x-data="{ modalOpen: false }">
                        <button class="btn bg-indigo-500 hover:bg-indigo-600 text-white"
                                @click.prevent="modalOpen = true" aria-controls="danger-modal">Next ->
                        </button>
                        <!-- Modal backdrop -->
                        <div class="fixed inset-0 bg-slate-900 bg-opacity-30 z-50 transition-opacity" x-show="modalOpen"
                             x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0"
                             x-transition:enter-end="opacity-100" x-transition:leave="transition ease-out duration-100"
                             x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0"
                             aria-hidden="true" style=""></div>
                        <!-- Modal dialog -->
                        <div id="danger-modal"
                             class="fixed inset-0 z-50 overflow-hidden flex items-center my-4 justify-center px-4 sm:px-6"
                             role="dialog" aria-modal="true" x-show="modalOpen"
                             x-transition:enter="transition ease-in-out duration-200"
                             x-transition:enter-start="opacity-0 translate-y-4"
                             x-transition:enter-end="opacity-100 translate-y-0"
                             x-transition:leave="transition ease-in-out duration-200"
                             x-transition:leave-start="opacity-100 translate-y-0"
                             x-transition:leave-end="opacity-0 translate-y-4" style="">
                            <div class="bg-white rounded shadow-lg overflow-auto max-w-lg w-full max-h-full"
                                 @click.outside="modalOpen = false" @keydown.escape.window="modalOpen = false">
                                <div class="p-5 flex space-x-4">
                                    <!-- Icon -->

                                    <!-- Content -->
                                    <div>
                                        <!-- Modal header -->
                                        <div class="mb-2">
                                            <div class="text-lg font-semibold text-slate-800">To make it better</div>
                                        </div>
                                        <!-- Modal content -->
                                        <div class="text-sm mb-10">
                                            <div class="space-y-2">
                                                <p>Make sure that all recommendations are taken into consideration.
                                                    as it will help you to get the best out of the platform.
                                                </p>
                                            </div>
                                        </div>
                                        <!-- Modal footer -->
                                        <div class="flex flex-wrap justify-end space-x-2">
                                            <button
                                                class="btn-sm border-slate-200 hover:border-slate-300 text-slate-600"
                                                @click="modalOpen = false">Let me fix it
                                            </button>
                                            <a class="btn-sm bg-rose-500 hover:bg-rose-600 text-white"
                                               href="{{route('onboarding.004-step-done', ['id' => request()->route('id')])}}">Yes,
                                                continue
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    </div>
@endsection

@section('scripts')
@endsection
