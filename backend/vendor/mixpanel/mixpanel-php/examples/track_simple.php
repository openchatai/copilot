<?php
require_once("../lib/Mixpanel.php"); // import the Mixpanel class
$mp = Mixpanel::getInstance("MIXPANEL_PROJECT_TOKEN"); // instantiate the Mixpanel class
$mp->track("login_clicked"); // track an event
