<?php
require_once("../lib/Mixpanel.php"); // import the Mixpanel class

$mp = new Mixpanel("MIXPANEL_PROJECT_TOKEN", array(
    "debug"             => true,
    "consumer"          => "socket",
    "use_ssl"           => false
));

$mp->track("test_event", array("color" => "blue"));
$mp->track("test_event", array("color" => "red"));
