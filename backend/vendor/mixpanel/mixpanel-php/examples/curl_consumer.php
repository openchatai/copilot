<?php
require_once("../lib/Mixpanel.php"); // import the Mixpanel class

// Make calls using the PHP cURL extension not using SSL
// Warning: This will block until the requests are complete.
$mp = new Mixpanel("MIXPANEL_PROJECT_TOKEN", array(
    "debug"             => true,
    "consumer"          => "curl",
    "fork"              => false,
    "use_ssl"           => false
));

$mp->track("test_event", array("color" => "blue"));
$mp->track("test_event", array("color" => "red"));
