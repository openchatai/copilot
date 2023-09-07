@php use App\Models\DemoPet; @endphp
    <!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="Mark Otto, Jacob Thornton, and Bootstrap contributors">
    <meta name="generator" content="Hugo 0.104.2">
    <title>My Pet Store</title>
    <link rel="canonical" href="https://getbootstrap.com/docs/5.2/examples/navbar-static/">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css">
    <style>
        .bd-placeholder-img {
            font-size: 1.125rem;
            text-anchor: middle;
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
        }

        @media (min-width: 768px) {
            .bd-placeholder-img-lg {
                font-size: 3.5rem;
            }
        }

        .b-example-divider {
            height: 3rem;
            background-color: rgba(0, 0, 0, .1);
            border: solid rgba(0, 0, 0, .15);
            border-width: 1px 0;
            box-shadow: inset 0 .5em 1.5em rgba(0, 0, 0, .1), inset 0 .125em .5em rgba(0, 0, 0, .15);
        }

        .b-example-vr {
            flex-shrink: 0;
            width: 1.5rem;
            height: 100vh;
        }

        .bi {
            vertical-align: -.125em;
            fill: currentColor;
        }

        .nav-scroller {
            position: relative;
            z-index: 2;
            height: 2.75rem;
            overflow-y: hidden;
        }

        .nav-scroller .nav {
            display: flex;
            flex-wrap: nowrap;
            padding-bottom: 1rem;
            margin-top: -1px;
            overflow-x: auto;
            text-align: center;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
        }

        body {
            background: #f9fafb;
        }
    </style>


    <!-- Custom styles for this template -->
    <link href="/demo/navbar-top.css" rel="stylesheet">
</head>
<body>

<nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
    <div class="container-fluid">
        <a class="navbar-brand" href="#">🐹🐰🦮 My Pet Shop Admin Dashboard </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse"
                aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarCollapse">
            <ul class="navbar-nav me-auto mb-2 mb-md-0">
                <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Link</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link disabled">Disabled</a>
                </li>
            </ul>
            <form class="d-flex" role="search">
                <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                <button class="btn btn-outline-success" type="submit">Search</button>
            </form>
        </div>
    </div>
</nav>

<main class="container">
    <div class="bg-light p-5 rounded">

        <button class="btn btn-lg btn-primary" id="triggerSelector" role="button" style="margin-top: 3rem">🤖 Open your
            product's copilot
        </button>
        <br>
        <br>
        <strong class="lead" style="font-weight: 700"> Welcome to your admin dashboard! here what you can do in this
            example: </strong> (<a href="https://tawleed.s3.eu-west-1.amazonaws.com/8645635423451.json" class="card-link">download the used swagger file)</a>

        <div class="mt-4">
            <ul class="list-group list-group-numbered">
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">Manage pets (delete, add)</div>
                        You can ask your copilot to add new pet and autofill data.
                    </div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">Search pets</div>
                        You can ask your copilot to find a pets with selected criteria
                    </div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">Statistics</div>
                        You can ask your copilot for a help to find trends in the numbers
                    </div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">General help</div>
                        You can ask your copilot general question in your domain and it will help you!
                    </div>
                </li>
            </ul>
        </div>

        <br>
        <strong class="lead" style="font-weight: 700">Your pets</strong>
        <br>
        <br>
        <div class="row">

            @foreach(DemoPet::orderBy('id', 'desc')->get() as $pet)
                <div class="col-lg-4">
                    <div class="card mb-4">
                        <img src="{{$pet->image ?? "https://placehold.co/600x400"}}" class="card-img-top" alt="...">
                        <div class="card-body">
                            <h5 class="card-title"> ID #{{$pet->id}} - {{$pet->name}} - {{$pet->type}} - ${{$pet->price}}</h5>
                            <p class="card-text"><strong>Breed: {{$pet->breed}} - Quantity: {{$pet->quantity}}</strong>
                            </p>
                            <p>
                                {{$pet->description}}
                            </p>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

    </div>
</main>


<script src="http://localhost:8888/backend/pilot.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
    window.onload = () => {
        initAiCoPilot({
            initialMessage: "Hello, how I can help you?", // Initial message.
            token: "{{ $token }}",
            triggerSelector: "#triggerSelector", // The selector of the element that will trigger the widget on click.
            apiUrl: "http://localhost:8888/backend/api", // The url of the copilot backend API.
            headers: {
                // Headers that you want to send with every message request to your backend.
                Authorization: "Your backend auth token",
            },
        });
    };
</script>

</body>
</html>

