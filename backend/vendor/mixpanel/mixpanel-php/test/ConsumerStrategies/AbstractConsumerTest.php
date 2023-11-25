<?php

class ConsumerStrategies_AbstractConsumerTest extends PHPUnit_Framework_TestCase {

    /**
     * @var AbstractConsumer
     */
    protected $_instance = null;

    protected function setUp()
    {
        parent::setUp();
        $this->_instance = new AbstractConsumer();
    }

    protected function tearDown()
    {
        parent::tearDown();
        $this->_instance = null;
    }

    public function test_encode() {
        $encoded = base64_encode(json_encode(array("1" => "one")));
        $this->assertEquals($encoded, $this->_instance->encode(array("1" => "one")));
    }

}

class AbstractConsumer extends ConsumerStrategies_AbstractConsumer {
    /**
     * Persist a batch of messages in whatever way the implementer sees fit
     * @param array $batch an array of messages to consume
     * @return boolean success or fail
     */
    function persist($batch)
    {
        // TODO: Implement persist() method.
    }

    function encode($msg) {
        return $this->_encode($msg);
    }

}

