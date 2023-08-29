@extends('layout.app', ['title' => __('Dashboard')])
@section('content')
    <style>
        .image-uploader {
            border: 2px dashed #aaa;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            border-radius: 9px;
            background: #fafaf9;
        }

        .image-uploader img {
            max-width: 100%;
            max-height: 200px;
            margin-bottom: 1rem;
        }

        .img-thumbnail {
            padding: 0.25rem;
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 0.25rem;
            width: 69px;
            margin-left: 4px;
            display: inline;
            margin-right: 1rem;
        }
    </style>

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

                <h1 class="text-3xl text-slate-800 font-bold mb-6">Upload your swagger.json file ✨</h1>
                <p style="margin-bottom: 1rem">You copilot will use these APIs to communicate with your product and execute actions</p>
                <!-- Form -->
                @if ($errors->has('swagger_file'))
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
                                        @foreach( $errors->get('swagger_file') as $message )
                                            {{ $message }}
                                        @endforeach
                                    </div>
                                </div>
                                <button class="opacity-70 hover:opacity-80 ml-3 mt-[3px]" @click="open = false">
                                    <div class="sr-only">Close</div>
                                    <svg class="w-4 h-4 fill-current">
                                        <path
                                            d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                @endif
                <form action="{{route('onboarding.swagger.create')}}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <div class="space-y-4 mb-8">
                        <!-- Company Name -->
                        <div>
                            <div class="image-uploader" id="imageUploader">
                                <div class="emoji" style="font-size: 30px">
                                    ⬆️
                                </div>
                                <p style="font-weight: bold; margin-bottom: 1rem"> Click to upload or drag & drop

                                </p>
                                    <span
                                        style="color: #2563eb">You can upload one file only, please make sure to read the instructions</span>

                            </div>
                            <input type="file" name="swagger_file" id="fileInput" style="display: none" required
                                   accept="application/json">


                            <div class="uploaded-images" id="uploadedImages" style="margin-top: 1rem">

                            </div>

                        </div>

                        <br>
                        <div class="flex items-center justify-center space-x-6 mb-8 text-center">
                            <strong>
                                🪄 OR 🪄
                            </strong>
                        </div>

                        <br>
                        <div class="flex items-center justify-center space-x-6 mb-8 text-center">
                            <div x-data="{ modalOpen: false }">
                                <button class="btn border-slate-200 hover:border-slate-300 text-indigo-500" @click.prevent="modalOpen = true" aria-controls="news-modal">Use our pre-made demo swagger file to try it out quickly (🐶pet store SaaS system)</button>
                                <!-- Modal backdrop -->
                                <div class="fixed inset-0 bg-slate-900 bg-opacity-30 z-50 transition-opacity" x-show="modalOpen" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition ease-out duration-100" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" aria-hidden="true" style="display: none;"></div>
                                <!-- Modal dialog -->
                                <div id="news-modal" class="fixed inset-0 z-50 overflow-hidden flex items-center my-4 justify-center px-4 sm:px-6" role="dialog" aria-modal="true" x-show="modalOpen" x-transition:enter="transition ease-in-out duration-200" x-transition:enter-start="opacity-0 translate-y-4" x-transition:enter-end="opacity-100 translate-y-0" x-transition:leave="transition ease-in-out duration-200" x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 translate-y-4" style="display: none;">
                                    <div class="bg-white rounded shadow-lg overflow-auto max-w-lg w-full max-h-full" @click.outside="modalOpen = false" @keydown.escape.window="modalOpen = false">
                                        <div class="relative">
                                            <div style="font-size: 3rem">🐶🐕</div>
                                            <!-- Close button -->
                                            <button class="absolute top-0 right-0 mt-5 mr-5 text-slate-50 hover:text-white" @click="modalOpen = false">
                                                <div class="sr-only">Close</div>
                                                <svg class="w-4 h-4 fill-current">
                                                    <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z"></path>
                                                </svg>
                                            </button>
                                        </div>
                                        <div class="p-5">
                                            <!-- Modal header -->
                                            <div class="mb-2">
                                                <div class="text-lg font-semibold text-slate-800">Pet Store Demo</div>
                                            </div>
                                            <!-- Modal content -->
                                            <div class="text-sm mb-5">
                                                <div class="space-y-2">
                                                    <p>
                                                        In this pet store you can <strong> add, delete, update and view pets, you can also search and manage inventory, and finally you can place orders </strong>.
                                                    </p>
                                                    <p>
                                                        We already configured the APIs and the backend, you can test it almost immediately.
                                                    </p>
                                                </div>
                                            </div>
                                            <!-- Modal footer -->
                                            <div class="flex flex-wrap justify-end space-x-2">
                                                <a href="{{route('handleSwaggerViaPremadeTemplate')}}" class="btn bg-emerald-500 hover:bg-emerald-600 text-white" >Let's do it</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <br>
                        <div class="flex items-center justify-between space-x-6 mb-8">
                            <div>
                                <div class="font-medium text-slate-800 text-sm mb-1">
                                    Important Instructions
                                </div>
                                <div class="text-xs">
                                    <ul>
                                        <li>✅ Make sure each <strong>endpoint have description and operation id</strong>, results will be significantly better with a good description</li>
                                        <li>✅ Make sure that the swagger file is valid, the system might not be able to parse invalid
                                        files, <a href="https://editor.swagger.io/" target="_blank" class="anchor">use this tool validate your schema</a></li>
                                        <li>✅ Do not add any Authorization layers, we will show you how to authorize your own requests by yourself</li>
                                        <li>✅ This *very* new product, so many things does not make sense/work at this stage </li>

                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <a class="text-sm underline hover:no-underline" href="{{route('onboarding.001-step-welcome')}}">&lt;-
                            Back</a>
                        <button type="submit" class="btn bg-indigo-500 hover:bg-indigo-600 text-white" style=" background-color: rgb(79 70 229 / var(--tw-bg-opacity));">Next Step
                            -&gt;
                        </button>
                    </div>
                </form>

            </div>
        </div>
    </div>
    @if(session('error'))
        <div x-data="{ modalOpen: true }">
            <!-- Modal backdrop -->
            <div class="fixed inset-0 bg-slate-900 bg-opacity-30 z-50 transition-opacity" x-show="modalOpen" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition ease-out duration-100" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" aria-hidden="true" style=""></div>
            <!-- Modal dialog -->
            <div id="news-modal" class="fixed inset-0 z-50 overflow-hidden flex items-center my-4 justify-center px-4 sm:px-6" role="dialog" aria-modal="true" x-show="modalOpen" x-transition:enter="transition ease-in-out duration-200" x-transition:enter-start="opacity-0 translate-y-4" x-transition:enter-end="opacity-100 translate-y-0" x-transition:leave="transition ease-in-out duration-200" x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 translate-y-4" style="">
                <div class="bg-white rounded shadow-lg overflow-auto max-w-lg w-full max-h-full" @click.outside="modalOpen = false" @keydown.escape.window="modalOpen = false">
                    <div class="relative">
                        <!-- Close button -->
                        <button class="absolute top-0 right-0 mt-5 mr-5 text-slate-50 hover:text-white" @click="modalOpen = false">
                            <div class="sr-only">Close</div>
                            <svg class="w-4 h-4 fill-current">
                                <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="p-5">
                        <!-- Modal header -->
                        <div class="mb-2">
                            <div class="mb-3">
                                <div class="text-xs inline-flex font-medium bg-rose-100 text-rose-600 rounded-full text-center px-2.5 py-1">Parsing failure</div>
                            </div>
                            <div class="text-lg font-semibold text-slate-800">We could not parse your swagger file 🏃&zwj;♂️</div>
                        </div>
                        <!-- Modal content -->
                        <div class="text-sm mb-5">
                            <div class="space-y-2">
                                <p>
                                    It might be you, it might be us, but we could not parse your swagger file. Try to double check it, and <strong>if you are sure that it is valid, please contact us via hey@openchat.so and we will help you out.</strong>
                                </p>
                            </div>
                        </div>
                        <!-- Modal footer -->
                        <div class="flex flex-wrap justify-end space-x-2">
                            <button class="btn-sm bg-indigo-500 hover:bg-indigo-600 text-white" @click="modalOpen = false">Cool, I Got it</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif

@endsection

@section('scripts')
    <script>
        const imageUploader = document.getElementById('imageUploader');
        const fileInput = document.getElementById('fileInput');
        const uploadedImages = document.getElementById('uploadedImages');

        imageUploader.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    const imgElement = document.createElement('img');
                    imgElement.src = 'https://static-00.iconduck.com/assets.00/swagger-icon-512x512-halz44im.png';
                    imgElement.classList.add('img-thumbnail', 'mr-2', 'mb-2');
                    uploadedImages.appendChild(imgElement);
                };
            });
        });

        imageUploader.addEventListener('dragover', (event) => {
            event.preventDefault();
            imageUploader.classList.add('border-primary');
        });

        imageUploader.addEventListener('dragleave', (event) => {
            event.preventDefault();
            imageUploader.classList.remove('border-primary');
        });

        imageUploader.addEventListener('drop', (event) => {
            event.preventDefault();
            imageUploader.classList.remove('border-primary');
            const files = event.dataTransfer.files;
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    const imgElement = document.createElement('img');
                    imgElement.src = 'https://static-00.iconduck.com/assets.00/swagger-icon-512x512-halz44im.png';
                    imgElement.classList.add('img-thumbnail', 'mr-2', 'mb-2');
                    uploadedImages.appendChild(imgElement);
                    // add the image to the file input
                };
                fileInput.files = files;
            });
        });

        const fileInputs = document.getElementById('fileInput');

        function showLoading() {
            // Get submit button and loading icon
            const submitBtn = document.getElementById('submitBtn');

            if (fileInputs.files.length > 0) {
                document.getElementById('submitBtn').setAttribute('disabled', 'true');
                document.getElementById('loadingIcon').classList.remove('d-none');
                submitBtn.disabled = true;
                // change the text back to the original
                submitBtn.innerHTML = "{{__('all.step_6_please_wait')}}";

                // submit the form
                document.getElementById('uploadForm').submit();
            }
        }

    </script>

@endsection
