<?php
require_once("../lib/Mixpanel.php"); // import the Mixpanel class
require_once("consumers/ObConsumer.php"); // import the Mixpanel class

// define a callback function to handle errors made in a consumer
function handleError($code, $data) {
    echo "This is my  customer error handler. I've received an error! code = " . $code . " : data = " . $data . "<br />";
}

// instantiate Mixpanel with some different options including a custom consumer and a custom error callback
$mp = new Mixpanel("MIXPANEL_PROJECT_TOKEN", array(
    "debug"             => true,
    "max_batch_size"    => 1,
    "consumers"         => array("ob" => "ObConsumer"),
    "consumer"          => "ob",
    "error_callback"    => "handleError" // register the error callback
));

$mp->track("test_event", array("color" => "blue"));
$mp->track("test_event", array("color" => "red"));
$mp->track("force_error"); // a magical event we've defined as an error in our custom "ObConsumer"
