<?php
// import the Mixpanel class
require_once("../lib/Mixpanel.php");

// instantiate the Mixpanel class
$mp = Mixpanel::getInstance("MIXPANEL_PROJECT_TOKEN");

// create an alias for user id 12345 (note that this is a synchronous call)
$mp->createAlias(12345, "john.doe@example.com");

// update the record previously identified by 12345 using the new alias
$mp->people->set("john.doe@example.com", array(
    '$last_name'        => "Doe-Aliased",
    'aliased'           => "indeed"
));
