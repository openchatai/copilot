<?php
require_once(dirname(__FILE__) . "/../Base/MixpanelBase.php");

/**
 * Provides some base methods for use by a Consumer implementation
 */
abstract class ConsumerStrategies_AbstractConsumer extends Base_MixpanelBase {

    /**
     * Creates a new AbstractConsumer
     * @param array $options
     */
    function __construct($options = array()) {

        parent::__construct($options);

        if ($this->_debug()) {
            $this->_log("Instantiated new Consumer");
        }

    }

    /**
     * Encode an array to be persisted
     * @param array $params
     * @return string
     */
    protected function _encode($params) {
        return base64_encode(json_encode($params));
    }

    /**
     * Handles errors that occur in a consumer
     * @param $code
     * @param $msg
     */
    protected function _handleError($code, $msg) {
        if (isset($this->_options['error_callback'])) {
            $handler = $this->_options['error_callback'];
            call_user_func($handler, $code, $msg);
        }

        if ($this->_debug()) {
            $arr = debug_backtrace();
            $class = get_class($arr[0]['object']);
            $line = $arr[0]['line'];
            error_log ( "[ $class - line $line ] : " . print_r($msg, true) );
        }
    }

    /**
     * Number of requests/batches that will be processed in parallel.
     * @return int
     */
    public function getNumThreads() {
        return 1;
    }

    /**
     * Persist a batch of messages in whatever way the implementer sees fit
     * @param array $batch an array of messages to consume
     * @return boolean success or fail
     */
    abstract function persist($batch);
}