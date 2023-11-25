<?php
require_once("../lib/Mixpanel.php"); // import the Mixpanel class
require_once("consumers/ObConsumer.php"); // import the custom consumer

$mp = new Mixpanel("MIXPANEL_PROJECT_TOKEN", array(
    "debug"             => true,
    "max_batch_size"    => 1,
    "consumers"         => array("ob" => "ObConsumer"),
    "consumer"          => "ob"
));

$mp->track("test_event", array("color" => "blue"));
$mp->track("test_event", array("color" => "red"));
