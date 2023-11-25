<?php

class ConsumerStrategies_CurlConsumerTest extends PHPUnit_Framework_TestCase {

    public function testSettings() {
        $consumer = new CurlConsumer(array(
            "host"      => "localhost",
            "endpoint"  => "/endpoint",
            "timeout"   => 2,
            "use_ssl"   => false,
            "fork"      => false
        ));

        $this->assertEquals("localhost", $consumer->getHost());
        $this->assertEquals("/endpoint", $consumer->getEndpoint());
        $this->assertEquals(2, $consumer->getTimeout());
        $this->assertEquals("http", $consumer->getProtocol());
        $this->assertEquals(false, $consumer->getFork());
    }

    public function testBlocking() {
        $consumer = new CurlConsumer(array(
            "host"      => "localhost",
            "endpoint"  => "/endpoint",
            "timeout"   => 2,
            "use_ssl"   => true,
            "fork"      => false
        ));
        $consumer->persist(array("msg"));
        $this->assertEquals(1, $consumer->blockingCalls);
    }

    public function testForked() {
        $consumer = new CurlConsumer(array(
            "host"      => "localhost",
            "endpoint"  => "/endpoint",
            "timeout"   => 2,
            "use_ssl"   => true,
            "fork"      => true
        ));
        $consumer->persist(array("msg"));
        $this->assertEquals(1, $consumer->forkedCalls);
    }

    public function testExecuteCurlFailure() {
        $error_handler = new ErrorHandler();
        $consumer = new ConsumerStrategies_CurlConsumer(array(
            "host"      => "some.domain.that.should.not.ever.exist.tld",
            "endpoint"  => "/endpoint",
            "timeout"   => 2,
            "use_ssl"   => false,
            "fork"      => false,
            "error_callback"    => array($error_handler, 'handle_error')
        ));
        $resp = $consumer->persist(array("msg"));
        $this->assertFalse($resp);
        $this->assertEquals($error_handler->last_code, CURLE_COULDNT_RESOLVE_HOST);
    }

    public function testOptions() {
        function callback() { }

        $consumer = new ConsumerStrategies_CurlConsumer(array(
            "host"      => "localhost",
            "endpoint"  => "/endpoint",
            "timeout"   => 2,
            "connect_timeout" => 1,
            "use_ssl"   => true,
            "fork"      => false,
            "num_threads"      => 5,
            "error_callback"    => 'callback'
        ));

        $this->assertEquals($consumer->getHost(), "localhost");
        $this->assertEquals($consumer->getEndpoint(), "/endpoint");
        $this->assertEquals($consumer->getTimeout(), 2);
        $this->assertEquals($consumer->getConnectTimeout(), 1);
        $this->assertEquals($consumer->getProtocol(), "https");
        $this->assertEquals($consumer->getNumThreads(), 5);
    }

}

class ErrorHandler {
    public $last_code = -1;
    public $last_msg = "";

    public function handle_error($code, $msg) {
        $this->last_code = $code;
        $this->last_msg = $msg;
    }
}

class CurlConsumer extends ConsumerStrategies_CurlConsumer {

    public $forkedCalls = 0;
    public $blockingCalls = 0;

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

    protected function _execute($url, $data)
    {
        $this->blockingCalls++;
        return parent::_execute($url, $data);
    }

    protected function _execute_forked($url, $data)
    {
        $this->forkedCalls++;
        return parent::_execute_forked($url, $data);
    }

}