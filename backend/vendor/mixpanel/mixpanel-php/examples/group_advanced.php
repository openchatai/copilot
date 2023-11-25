<?php
// import the Mixpanel class
require_once("../lib/Mixpanel.php");

// instantiate the Mixpanel class
$mp = Mixpanel::getInstance("MIXPANEL_PROJECT_TOKEN");

//create or update a grou pprofile with properties Industry and Product
$mp->group->set("company","Mixpanel3", array(
    'Industry'       => "Tech",
    'Product'        => "Product Analytics",
    'Features'       => array("Insights"),
    'test'           => "test1234",
));

// create or update a group profile with properties
// using SetOnce Industry will not be overwritten as the value already exists

$mp->group->setOnce("company","Mixpanel3", array(
    'Industry'       => "TechTest",
    'Name'           => "Mixpanel",
));


// unsets the property test 
$mp->group->remove("company","Mixpanel3", array("test"));


// add Funnels Cohorts and Flows to a list of "Features" for Group profile Mixpanel3
$mp->group->union("company","Mixpanel3", "Features", array("Funnels","Flows","Cohorts") );


//deletegroup
$mp->group->deleteGroup("company","Mixpanel3");
