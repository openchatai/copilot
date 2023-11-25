<?php
// import the Mixpanel class
require_once("../lib/Mixpanel.php");

// instantiate the Mixpanel class
$mp = Mixpanel::getInstance("MIXPANEL_PROJECT_TOKEN");

// associate a user id to subsequent events
$mp->identify(12345);

// track a "Login Success" event with a property "Ad Source" having value "Google"
$mp->track("Login Success", array("Ad Source" => "Google"));

// track an "Item Viewed" event with a property "Item" having value "Cool New Shoes"
$mp->track("Item Viewed", array("Item" => "Cool New Shoes"));

// stop associating events to user 12345
$mp->unregister("distinct_id");

// event "Some Event" won't be associated with user 12345
$mp->track("Some Event");