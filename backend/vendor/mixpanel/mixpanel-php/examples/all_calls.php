<?php
require_once("/path/to/vendor/mixpanel/mixpanel-php/lib/Mixpanel.php"); // import the Mixpanel class

$mp = new Mixpanel("MIXPANEL_PROJECT_TOKEN", array(
    "debug"             => true,
));

// this would likely come from a database or session variable
$user_id = 12345;

// associate user 12345 to all subsequent track calls
$mp->identify($user_id);

// send property "color" = "red" with all subsequent track calls
$mp->register("color", "red");

// send property "number" = 1 with all subsequent track calls, don't overwrite an existing value
$mp->registerOnce("number", 1);
$mp->registerOnce("number", 2);  // this will do nothing

// send all of these properties with all subsequent track calls, overwriting previously set values
$mp->registerAll(array("color" => "green", "prop2" => "val2")); // color is now green instead of red

// send all of these properties with all subsequent track calls, NOT overwriting previously set values
$mp->registerAllOnce(array("color" => "blue", "prop3" => "val3")); // color is still green but prop3 is now set to val3

// track a custom "button click" event
$mp->track("button click", array("label" => "Login"));

// track a custom "logged in" event
$mp->track("logged in", array("landing page" => "/specials"));

// create/update a profile identified by id 12345 with $first_name set to John and $email set to john.doe@example.com
// now we can send them Notifications!
$mp->people->set($user_id, array(
    '$first_name' => "John",
    '$email' => "john.doe@example.com"
));

// update John's profile with property ad_source to be "google" but don't override ad_source if it exists already
$mp->people->setOnce($user_id, array("ad_source" => "google"));

// increment John's total logins by one
$mp->people->increment($user_id, "login count", 1);

// append a new favorite to John's favorites
$mp->people->append($user_id, "favorites", "Apples");

// append a few more favorites to John's favorites
$mp->people->append($user_id, "favorites", array("Baseball", "Reading"));

// track a purchase or charge of $9.99 for user 12345 where the transaction happened just now
$mp->people->trackCharge($user_id, "9.99");

// track a purchase or charge of $20 for user 12345 where the transaction happened on June 01, 2013 at 5pm EST
$mp->people->trackCharge($user_id, "20.00", strtotime("01 Jun 2013 5:00:00 PM EST"));

// clear all purchases for user 12345
$mp->people->clearCharges($user_id);

// delete the profile for user 12345
$mp->people->deleteUser($user_id);

// create an alias for user 12345 (note that this is done synchronously)
$mp->createAlias($user_id, "johndoe1");

// track an even using the alias
$mp->track("logout", array("distinct_id" => "johndoe1"));

// manually put messages on the queue (useful for batch processing)
$mp->enqueueAll(array(
    array("event" => "test"),
    array("event" => "test2")
));