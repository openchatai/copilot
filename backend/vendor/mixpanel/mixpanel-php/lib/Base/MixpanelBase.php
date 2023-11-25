<?php

/**
 * This a Base class which all Mixpanel classes extend from to provide some very basic
 * debugging and logging functionality. It also serves to persist $_options across the library.
 *
 */
class Base_MixpanelBase {


    /**
     * Default options that can be overridden via the $options constructor arg
     * @var array
     */
    private $_defaults = array(
        "max_batch_size"    => 50, // the max batch size Mixpanel will accept is 50,
        "max_queue_size"    => 1000, // the max num of items to hold in memory before flushing
        "debug"             => false, // enable/disable debug mode
        "consumer"          => "curl", // which consumer to use
        "host"              => "api.mixpanel.com", // the host name for api calls
        "events_endpoint"   => "/track", // host relative endpoint for events
        "people_endpoint"   => "/engage", // host relative endpoint for people updates
        "groups_endpoint"   => "/groups", // host relative endpoint for groups updates
        "use_ssl"           => true, // use ssl when available
        "error_callback"    => null // callback to use on consumption failures
    );


    /**
     * An array of options to be used by the Mixpanel library.
     * @var array
     */
    protected $_options = array();


    /**
     * Construct a new MixpanelBase object and merge custom options with defaults
     * @param array $options
     */
    public function __construct($options = array()) {
        $options = array_merge($this->_defaults, $options);
        $this->_options = $options;
    }


    /**
     * Log a message to PHP's error log
     * @param $msg
     */
    protected function _log($msg) {
        $arr = debug_backtrace();
        $class = $arr[0]['class'];
        $line = $arr[0]['line'];
        error_log ( "[ $class - line $line ] : " . $msg );
    }


    /**
     * Returns true if in debug mode, false if in production mode
     * @return bool
     */
    protected function _debug() {
        return isset($this->_options["debug"]) && $this->_options["debug"] == true;
    }

}
