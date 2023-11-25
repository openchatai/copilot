<?php
// import the Mixpanel class
require_once("../lib/Mixpanel.php");

// instantiate the Mixpanel class
$mp = Mixpanel::getInstance("MIXPANEL_PROJECT_TOKEN");

// create or update a profile with First Name, Last Name, E-Mail Address, Phone Number, and Favorite Color
$mp->people->set(12345, array(
    '$first_name'       => "John",
    '$last_name'        => "Doe",
    '$email'            => "john.doe@example.com",
    '$phone'            => "5555555555",
    "Favorite Color"    => "red"
));

// increment the count of login attempts for user 12345
$mp->people->increment(12345, "Login Attempts", 1);

// add "Home Page" to a list of "Page Views" for user 12345
$mp->people->append(12345, "Page Views", "Home Page");

// add Cats, Pizza, and Baseball to a list of "Favorites" for user 12345
$mp->people->append(12345, "Favorites", array("Cats", "Pizza", "Baseball"));

// track a purchase or charge of $9.99 for user 12345 where the transaction happened just now
$mp->people->trackCharge(12345, "9.99");

// track a purchase or charge of $20 for user 12345 where the transaction happened on June 01, 2013 at 5pm EST
$mp->people->trackCharge(12345, "20.00", strtotime("01 Jun 2013 5:00:00 PM EST"));