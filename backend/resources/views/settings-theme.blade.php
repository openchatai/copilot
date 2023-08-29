@extends('layout.app', ['title' => __('Dashboard')])
@section('content')

    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Page header -->
        <div class="mb-8">

            <!-- Title -->
            <h1 class="text-2xl md:text-3xl text-slate-800 font-bold">{{$bot->getName()}} ✨</h1>
            <ul class="inline-flex flex-wrap text-sm font-medium">
                <li class="flex items-center">
                    <a class="text-slate-500 hover:text-indigo-500" href="{{route('index')}}">Home</a>
                    <svg class="h-4 w-4 fill-current text-slate-400 mx-3" viewBox="0 0 16 16">
                        <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"></path>
                    </svg>
                </li>
                <li class="flex items-center">
                    <a class="text-slate-500 hover:text-indigo-500">Embed on your product</a>
                </li>

            </ul>
        </div>

        <div class="bg-white shadow-lg rounded-sm mb-8">
            <div class="flex flex-col md:flex-row md:-mr-px">

                <!-- Sidebar -->
                @include('layout.sidebar-bot-page')

                <!-- Panel -->
                <div class="grow">
                    <div class="data-sources-real-time" id="data-sources-updates-container">

                    </div>
                    <div class="p-6 space-y-6 sm:flex" style="display: flex; justify-content: space-between">
                        <div class="inputs" style="width: 100%">
                            <!-- Form Section -->
                            <section class="sm:w-1/2">
                                <h3 class="text-xl leading-snug text-slate-800 font-bold mb-1">Embed on your
                                    product!</h3>
                                <div class="text-sm">If your APIs requires authorization then you might need to provide
                                    the needed headers to enable OpenCopilot from accessing it
                                </div>

                                <!-- Start -->
                                <div style="margin-top: 3rem; margin-bottom: 3rem;">
                                    <div class="flex items-center justify-between"
                                         style="margin-top: 1rem; margin-bottom: 1rem;">
                                        <strong>1. Copy the following code into your website head script </strong>
                                    </div>
                                    <textarea id="tooltip" class="form-input w-full" style="height: 250px"
                                              type="text" disabled><script src="{{asset('pilot.js')}}"></script>
<script>
    initAiCoPilot({
        initialMessages: ["how are the things"],
        token: "{{$bot->getToken()}}",
        triggerSelector: "#triggerSelector",
        headers: {
            Authorization: "Bearer your_auth_token_goes_here",
        },
    });
</script>
                                            </textarea>
                                </div>

                                <strong> ✨ OR ✨ </strong>

                                <div style="margin-top: 3rem">
                                    <div class="flex items-center justify-between"
                                         style="margin-top: 1rem; margin-bottom: 1rem;">
                                        <a href="{{route('demo', ['token' => $bot->token])}}" class="text-sm font-medium text-indigo-500 hover:text-indigo-600" target="_blank">Try your copilot on our example dashboard</a>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
@endsection

@section('scripts')

@endsection
