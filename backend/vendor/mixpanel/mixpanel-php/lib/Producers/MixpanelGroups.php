<?php
require_once(dirname(__FILE__) . "/MixpanelBaseProducer.php");

/**
 * Provides an API to create/update group profiles on Mixpanel
 */
class Producers_MixpanelGroups extends Producers_MixpanelBaseProducer {

    /**
     * Internal method to prepare a message given the message data
     * @param $group_key
     * @param $group_id
     * @param $operation
     * @param $value
     * @param boolean $ignore_time If the $ignore_time property is true, Mixpanel will not automatically update the "Last Seen" property of the group Profile. Otherwise, Mixpanel will add a "Last Seen" property associated with the current time
     * @return array
     */
    private function _constructPayload($group_key, $group_id, $operation, $value, $ignore_time = false) {
        $payload = array(
            '$token' => $this->_token,
            '$group_key' => $group_key,
            '$group_id' => $group_id,
            '$time' => microtime(true),
            $operation => $value
        );
        if ($ignore_time === true) $payload['$ignore_time'] = true;
        return $payload;
    }

    /**
     * Set properties on a group profile. If the group profile does not exist, it creates it with these properties.
     * If it does exist, it sets the properties to these values, overwriting existing values.
     * @param string|int $group_key the group_key used for groups in Project Settings
     * @param string|int $group_id the group id used for the group profile
     * @param array $props associative array of properties to set on the group profile
     * @param boolean $ignore_time If the $ignore_time property is true, Mixpanel will not automatically update the "Last Seen" property of the group profile. Otherwise, Mixpanel will add a "Last Seen" property associated with the current time
     */
    public function set($group_key, $group_id, $props, $ignore_time = false) {
        $payload = $this->_constructPayload($group_key, $group_id, '$set', $props, $ignore_time);
        $this->enqueue($payload);
    }

    /**
     * Set properties on a group profile. If the Group profile does not exist, it creates it with these properties.
     * If it does exist, it sets the properties to these values but WILL NOT overwrite existing values.
     * @param string|int $group_key the group_key used for groups in Project Settings
     * @param string|int $group_id the group id used for the group profile
     * @param array $props associative array of properties to set on the group profile
     * @param boolean $ignore_time If the $ignore_time property is true, Mixpanel will not automatically update the "Last Seen" property of the group profile. Otherwise, Mixpanel will add a "Last Seen" property associated with the current time
     */
    public function setOnce($group_key, $group_id, $props, $ignore_time = false) {
        $payload = $this->_constructPayload($group_key, $group_id, '$set_once', $props, $ignore_time);
        $this->enqueue($payload);
    }

    /**
     * Unset properties on a group profile. If the group does not exist, it creates it with no properties.
     * If it does exist, it unsets these properties. NOTE: In other libraries we use 'unset' which is
     * a reserved word in PHP.
     * @param string|int $group_key the group_key used for groups in Project Settings
     * @param string|int $group_id the group id used for the group profile
     * @param array $props associative array of properties to unset on the group profile
     * @param boolean $ignore_time If the $ignore_time property is true, Mixpanel will not automatically update the "Last Seen" property of the group profile. Otherwise, Mixpanel will add a "Last Seen" property associated with the current time
     */
    public function remove($group_key, $group_id, $props, $ignore_time = false) {
        $payload = $this->_constructPayload($group_key, $group_id, '$remove', $props, $ignore_time);
        $this->enqueue($payload);
    }

    /**
     * Adds $val to a list located at $prop. If the property does not exist, it will be created. If $val is a string
     * and the list is empty or does not exist, a new list with one value will be created.
     * @param string|int $group_key the group_key used for groups in Project Settings
     * @param string|int $group_id the group id used for the group profile
     * @param string $prop the property that holds the list
     * @param string|array $val items to add to the list
     * @param boolean $ignore_time If the $ignore_time property is true, Mixpanel will not automatically update the "Last Seen" property of the group profile. Otherwise, Mixpanel will add a "Last Seen" property associated with the current time
     */
    public function union($group_key, $group_id, $prop, $val, $ignore_time = false) {
        $payload = $this->_constructPayload($group_key, $group_id, '$union', array("$prop" => $val), $ignore_time);
        $this->enqueue($payload);
    }

    /**
     * Delete this group profile from Mixpanel
     * @param string|int $group_key the group_key used for groups in Project Settings
     * @param string|int $group_id the group id used for the group profile
     * @param boolean $ignore_time If the $ignore_time property is true, Mixpanel will not automatically update the "Last Seen" property of the profile. Otherwise, Mixpanel will add a "Last Seen" property associated with the current time
     */
    public function deleteGroup($group_key, $group_id, $ignore_time = false) {
        $payload = $this->_constructPayload($group_key, $group_id, '$delete', "", $ignore_time);
        $this->enqueue($payload);
    }

    /**
     * Returns the "groups" endpoint
     * @return string
     */
    function _getEndpoint() {
        return $this->_options['groups_endpoint'];
    }

}
