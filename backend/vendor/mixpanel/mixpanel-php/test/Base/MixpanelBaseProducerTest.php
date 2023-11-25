<?php

class MixpanelBaseProducerTest extends PHPUnit_Framework_TestCase {

    /**
     * @var _Producers_MixpanelBaseProducer
     */
    protected $_instance = null;
    protected $_file = null;
    protected function setUp() {
        parent::setUp();
        $this->_file = dirname(__FILE__)."/output-".time().".txt";
        $this->_instance = new _Producers_MixpanelBaseProducer("token", array("consumer" => "file", "debug" => true, "file" => $this->_file));
    }

    protected function tearDown() {
        parent::tearDown();
        $this->_instance->reset();
        $this->_instance = null;
        @unlink($this->_file);
    }

    public function testTokenMatch() {
        $this->assertEquals("token", $this->_instance->getToken());
    }

    public function testFlush() {
        $event1 = array("event" => "test", "properties" => array("prop1" => "val1"));
        $event2 = array("event" => "test2", "properties" => array("prop2" => "val2"));
        $this->_instance->enqueue($event1);
        $this->_instance->enqueue($event2);
        $this->_instance->flush(1);
        $contents = file_get_contents($this->_file);
        $this->assertEquals('[{"event":"test","properties":{"prop1":"val1"}}]'."\n".
        '[{"event":"test2","properties":{"prop2":"val2"}}]'."\n", $contents);
    }

    public function testReset() {
        $event1 = array("event" => "test", "properties" => array("prop1" => "val1"));
        $this->_instance->enqueue($event1);
        $this->_instance->reset();
        $this->assertEmpty($this->_instance->getQueue());
    }

    public function testEnqueue() {
        $this->_instance->reset();
        $event1 = array("event" => "test", "properties" => array("prop1" => "val1"));
        $this->_instance->enqueue($event1);
        $queue = $this->_instance->getQueue();
        $this->assertCount(1, $queue);
        $this->assertEquals($event1, $queue[0]);
    }

    public function testEnqueueAll() {
        $this->_instance->reset();
        $event1 = array("event" => "test", "properties" => array("prop1" => "val1"));
        $event2 = array("event" => "test2", "properties" => array("prop1" => "val1"));
        $events = array($event1, $event2);
        $this->_instance->enqueueAll($events);
        $queue = $this->_instance->getQueue();
        $this->assertCount(2, $queue);
        $this->assertEquals($event1, $queue[0]);
        $this->assertEquals($event2, $queue[1]);
    }

    public function testSetMaxQueueSize() {
        $this->_instance->enqueue(array("event" => "test"));
        $queue = $this->_instance->getQueue();
        $this->assertEquals(1, count($queue));
        $this->_instance->flush();
        $new_instance = new Producers_MixpanelEvents("token", array('max_queue_size' => 0));
        $new_instance->track("test");
        $queue = $new_instance->getQueue();
        $this->assertEquals(0, count($queue));
    }
}

// stub for tests
class _Producers_MixpanelBaseProducer extends Producers_MixpanelBaseProducer {
    function _getEndpoint() {
    }
}
