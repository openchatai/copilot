<?php

class MixpanelPeopleProducerTest extends PHPUnit_Framework_TestCase {

    /**
     * @var Producers_MixpanelPeople
     */
    protected $_instance = null;

    protected function setUp()
    {
        parent::setUp();
        $this->_instance = new Producers_MixpanelPeople("token");
    }

    protected function tearDown()
    {
        parent::tearDown();
        $this->_instance->reset();
        $this->_instance = null;
    }

    public function testSet() {
        $this->_instance->set(12345, array("name" => "John"), "192.168.0.1");
        $queue = $this->_instance->getQueue();
        $msg = $queue[count($queue)-1];

        $this->assertEquals(12345, $msg['$distinct_id']);
        $this->assertEquals("token", $msg['$token']);
        $this->assertEquals("192.168.0.1", $msg['$ip']);
        $this->assertArrayNotHasKey('$ignore_time', $msg);
        $this->assertArrayNotHasKey('$ignore_alias', $msg);
        $this->assertArrayHasKey('$set', $msg);
        $this->assertArrayHasKey("name", $msg['$set']);
        $this->assertEquals("John", $msg['$set']['name']);
    }

    public function testSetIgnoreTime() {
        $this->_instance->set(12345, array("name" => "John"), "192.168.0.1", true);
        $queue = $this->_instance->getQueue();
        $msg = $queue[count($queue)-1];

        $this->assertEquals(12345, $msg['$distinct_id']);
        $this->assertEquals("token", $msg['$token']);
        $this->assertEquals("192.168.0.1", $msg['$ip']);
        $this->assertEquals(true, $msg['$ignore_time']);
        $this->assertArrayHasKey('$set', $msg);
        $this->assertArrayHasKey("name", $msg['$set']);
        $this->assertEquals("John", $msg['$set']['name']);
    }

   public function testSetIgnoreAlias() {
        $this->_instance->set(12345, array("name" => "John"), "192.168.0.1", false, true);
        $queue = $this->_instance->getQueue();
        $msg = $queue[count($queue)-1];

        $this->assertEquals(12345, $msg['$distinct_id']);
        $this->assertEquals("token", $msg['$token']);
        $this->assertEquals("192.168.0.1", $msg['$ip']);
        $this->assertArrayNotHasKey('$ignore_time', $msg);
        $this->assertEquals(true, $msg['$ignore_alias']);
        $this->assertArrayHasKey('$set', $msg);
        $this->assertArrayHasKey("name", $msg['$set']);
        $this->assertEquals("John", $msg['$set']['name']);
    }


    public function testSetOnce() {
        $this->_instance->setOnce(12345, array("name" => "John"), "192.168.0.1");
        $queue = $this->_instance->getQueue();
        $msg = $queue[count($queue)-1];

        $this->assertEquals(12345, $msg['$distinct_id']);
        $this->assertEquals("token", $msg['$token']);
        $this->assertEquals("192.168.0.1", $msg['$ip']);
        $this->assertArrayHasKey('$set_once', $msg);
        $this->assertArrayHasKey("name", $msg['$set_once']);
        $this->assertEquals("John", $msg['$set_once']['name']);
    }

    public function testIncrement() {
        $this->_instance->increment(12345, "logins", 1, "192.168.0.1");
        $queue = $this->_instance->getQueue();
        $msg = $queue[count($queue)-1];

        $this->assertEquals(12345, $msg['$distinct_id']);
        $this->assertEquals("token", $msg['$token']);
        $this->assertEquals("192.168.0.1", $msg['$ip']);
        $this->assertArrayHasKey('$add', $msg);
        $this->assertArrayHasKey("logins", $msg['$add']);
        $this->assertEquals(1, $msg['$add']['logins']);
    }

    public function testAppendSingle() {
        $this->_instance->append(12345, "actions", "Logged In", "192.168.0.1");
        $queue = $this->_instance->getQueue();
        $msg = $queue[count($queue)-1];

        $this->assertEquals(12345, $msg['$distinct_id']);
        $this->assertEquals("token", $msg['$token']);
        $this->assertEquals("192.168.0.1", $msg['$ip']);
        $this->assertArrayHasKey('$append', $msg);
        $this->assertArrayHasKey("actions", $msg['$append']);
        $this->assertEquals("Logged In", $msg['$append']['actions']);
    }

    public function testAppendMultiple() {
        $this->_instance->append(12345, "actions", array("Logged In", "Logged Out"), "192.168.0.1");
        $queue = $this->_instance->getQueue();
        $msg = $queue[count($queue)-1];

        $this->assertEquals(12345, $msg['$distinct_id']);
        $this->assertEquals("token", $msg['$token']);
        $this->assertEquals("192.168.0.1", $msg['$ip']);
        $this->assertArrayHasKey('$union', $msg);
        $this->assertArrayHasKey("actions", $msg['$union']);
        $this->assertEquals(array("Logged In", "Logged Out"), $msg['$union']['actions']);
    }

    public function testTrackCharge() {
        date_default_timezone_set("America/Los_Angeles");
        $time = time();
        $this->_instance->trackCharge(12345, "20.00", $time, "192.168.0.1");
        $queue = $this->_instance->getQueue();
        $msg = $queue[count($queue)-1];

        $this->assertEquals(12345, $msg['$distinct_id']);
        $this->assertEquals("token", $msg['$token']);
        $this->assertEquals("192.168.0.1", $msg['$ip']);
        $this->assertArrayHasKey('$append', $msg);
        $this->assertArrayHasKey('$transactions', $msg['$append']);
        $this->assertArrayHasKey('$amount', $msg['$append']['$transactions']);
        $this->assertArrayHasKey('$time', $msg['$append']['$transactions']);
        $this->assertEquals("20.00", $msg['$append']['$transactions']['$amount']);
        $this->assertEquals(date("c", $time), $msg['$append']['$transactions']['$time']);
    }

    public function testClearCharges() {
        $this->_instance->clearCharges(12345,"192.168.0.1");
        $queue = $this->_instance->getQueue();
        $msg = $queue[count($queue)-1];

        $this->assertEquals(12345, $msg['$distinct_id']);
        $this->assertEquals("token", $msg['$token']);
        $this->assertEquals("192.168.0.1", $msg['$ip']);
        $this->assertArrayHasKey('$set', $msg);
        $this->assertArrayHasKey('$transactions', $msg['$set']);
        $this->assertSameSize(array(), $msg['$set']['$transactions']);
    }

    public function testDeleteUser() {
        $this->_instance->deleteUser(12345,"192.168.0.1");
        $queue = $this->_instance->getQueue();
        $msg = $queue[count($queue)-1];

        $this->assertEquals(12345, $msg['$distinct_id']);
        $this->assertEquals("token", $msg['$token']);
        $this->assertEquals("192.168.0.1", $msg['$ip']);
        $this->assertArrayHasKey('$delete', $msg);
        $this->assertEquals("", $msg['$delete']);
    }
}
