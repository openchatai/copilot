<?php
require_once("../lib/Mixpanel.php"); // import the Mixpanel class
$mp = Mixpanel::getInstance("MIXPANEL_PROJECT_TOKEN"); // instantiate the Mixpanel class

// create or update a profile with First Name, Last Name, E-Mail Address, Phone Number, and Favorite Color
$mp->people->set(12345, array(
    '$first_name'       => "John",
    '$last_name'        => "Doe",
    '$email'            => "john.doe@example.com",
    '$phone'            => "5555555555",
    "Favorite Color"    => "red"
));
