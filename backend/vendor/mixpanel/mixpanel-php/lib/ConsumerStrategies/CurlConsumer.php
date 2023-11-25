<?php
require_once(dirname(__FILE__) . "/AbstractConsumer.php");

/**
 * Consumes messages and sends them to a host/endpoint using cURL
 */
class ConsumerStrategies_CurlConsumer extends ConsumerStrategies_AbstractConsumer {

    /**
     * @var string the host to connect to (e.g. api.mixpanel.com)
     */
    protected $_host;


    /**
     * @var string the host-relative endpoint to write to (e.g. /engage)
     */
    protected $_endpoint;


    /**
     * @var int connect_timeout The number of seconds to wait while trying to connect. Default is 5 seconds.
     */
    protected $_connect_timeout;


    /**
     * @var int timeout The maximum number of seconds to allow cURL call to execute. Default is 30 seconds.
     */
    protected $_timeout;


    /**
     * @var string the protocol to use for the cURL connection
     */
    protected $_protocol;


    /**
     * @var bool|null true to fork the cURL process (using exec) or false to use PHP's cURL extension. false by default
     */
    protected $_fork = null;


    /**
     * @var int number of cURL requests to run in parallel. 1 by default
     */
    protected $_num_threads;


    /**
     * Creates a new CurlConsumer and assigns properties from the $options array
     * @param array $options
     * @throws Exception
     */
    function __construct($options) {
        parent::__construct($options);

        $this->_host = $options['host'];
        $this->_endpoint = $options['endpoint'];
        $this->_connect_timeout = isset($options['connect_timeout']) ? $options['connect_timeout'] : 5;
        $this->_timeout = isset($options['timeout']) ? $options['timeout'] : 30;
        $this->_protocol = isset($options['use_ssl']) && $options['use_ssl'] == true ? "https" : "http";
        $this->_fork = isset($options['fork']) ? ($options['fork'] == true) : false;
        $this->_num_threads = isset($options['num_threads']) ? max(1, intval($options['num_threads'])) : 1;

        // ensure the environment is workable for the given settings
        if ($this->_fork == true) {
            $exists = function_exists('exec');
            if (!$exists) {
                throw new Exception('The "exec" function must exist to use the cURL consumer in "fork" mode. Try setting fork = false or use another consumer.');
            }
            $disabled = explode(', ', ini_get('disable_functions'));
            $enabled = !in_array('exec', $disabled);
            if (!$enabled) {
                throw new Exception('The "exec" function must be enabled to use the cURL consumer in "fork" mode. Try setting fork = false or use another consumer.');
            }
        } else {
            if (!function_exists('curl_init')) {
                throw new Exception('The cURL PHP extension is required to use the cURL consumer with fork = false. Try setting fork = true or use another consumer.');
            }
        }
    }


    /**
     * Write to the given host/endpoint using either a forked cURL process or using PHP's cURL extension
     * @param array $batch
     * @return bool
     */
    public function persist($batch) {
        if (count($batch) > 0) {
            $url = $this->_protocol . "://" . $this->_host . $this->_endpoint;
            if ($this->_fork) {
                $data = "data=" . $this->_encode($batch);
                return $this->_execute_forked($url, $data);
            } else {
                return $this->_execute($url, $batch);
            }
        } else {
            return true;
        }
    }


    /**
     * Write using the cURL php extension
     * @param $url
     * @param $batch
     * @return bool
     */
    protected function _execute($url, $batch) {
        if ($this->_debug()) {
            $this->_log("Making blocking cURL call to $url");
        }

        $mh = curl_multi_init();
        $chs = array();

        $batch_size = ceil(count($batch) / $this->_num_threads);
        for ($i=0; $i<$this->_num_threads && !empty($batch); $i++) {
            $ch = curl_init();
            $chs[] = $ch;
            $data = "data=" . $this->_encode(array_splice($batch, 0, $batch_size));
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $this->_connect_timeout);
            curl_setopt($ch, CURLOPT_TIMEOUT, $this->_timeout);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_multi_add_handle($mh,$ch);
        }

        $running = 0;

        do {
            curl_multi_exec($mh, $running);
            curl_multi_select($mh);
        } while ($running > 0);

        $info = curl_multi_info_read($mh);

        $error = false;
        foreach ($chs as $ch) {
            $response = curl_multi_getcontent($ch);
            if (false === $response) {
                $this->_handleError(curl_errno($ch), curl_error($ch));
                $error = true;
            }
            elseif ("1" != trim($response)) {
                $this->_handleError(0, $response);
                $error = true;
            }
            curl_multi_remove_handle($mh, $ch);
        }

        if (CURLE_OK != $info['result']) {
            $this->_handleError($info['result'], "cURL error with code=".$info['result']);
            $error = true;
        }

        curl_multi_close($mh);
        return !$error;
    }


    /**
     * Write using a forked cURL process
     * @param $url
     * @param $data
     * @return bool
     */
    protected function _execute_forked($url, $data) {

        if ($this->_debug()) {
            $this->_log("Making forked cURL call to $url");
        }

        $exec = 'curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d ' . $data . ' "' . $url . '"';

        if(!$this->_debug()) {
            $exec .= " >/dev/null 2>&1 &";
        }

        exec($exec, $output, $return_var);

        if ($return_var != 0) {
            $this->_handleError($return_var, $output);
        }

        return $return_var == 0;
    }

    /**
     * @return int
     */
    public function getConnectTimeout()
    {
        return $this->_connect_timeout;
    }

    /**
     * @return string
     */
    public function getEndpoint()
    {
        return $this->_endpoint;
    }

    /**
     * @return bool|null
     */
    public function getFork()
    {
        return $this->_fork;
    }

    /**
     * @return string
     */
    public function getHost()
    {
        return $this->_host;
    }

    /**
     * @return array
     */
    public function getOptions()
    {
        return $this->_options;
    }

    /**
     * @return string
     */
    public function getProtocol()
    {
        return $this->_protocol;
    }

    /**
     * @return int
     */
    public function getTimeout()
    {
        return $this->_timeout;
    }


    /**
     * Number of requests/batches that will be processed in parallel using curl_multi_exec.
     * @return int
     */
    public function getNumThreads() {
        return $this->_num_threads;
    }
}
