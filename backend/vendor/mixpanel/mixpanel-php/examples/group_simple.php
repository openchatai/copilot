<?php
require_once("../lib/Mixpanel.php"); // import the Mixpanel class
$mp = Mixpanel::getInstance("MIXPANEL_PROJECT_TOKEN"); // instantiate the Mixpanel class

// create or update a Group profile with First Name, Last Name, E-Mail Address, Phone Number, and Favorite Color
$mp->group->set("company","Mixpanel", array(
    'Industry'       => "Tech",
    'Product'        => "Product Analytics",
));