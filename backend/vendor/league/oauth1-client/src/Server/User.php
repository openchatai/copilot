<?php

namespace League\OAuth1\Client\Server;

use ArrayIterator;

class User implements \IteratorAggregate
{
    /**
     * The user's unique ID.
     *
     * @var mixed
     */
    public $uid;

    /**
     * The user's nickname (screen name, username etc).
     *
     * @var mixed
     */
    public $nickname;

    /**
     * The user's name.
     *
     * @var mixed
     */
    public $name;

    /**
     * The user's first name.
     *
     * @var string
     */
    public $firstName;

    /**
     * The user's last name.
     *
     * @var string
     */
    public $lastName;

    /**
     * The user's email.
     *
     * @var string
     */
    public $email;

    /**
     * The user's location.
     *
     * @var string|array
     */
    public $location;

    /**
     * The user's description.
     *
     * @var string
     */
    public $description;

    /**
     * The user's image URL.
     *
     * @var string
     */
    public $imageUrl;

    /**
     * The users' URLs.
     *
     * @var string|array
     */
    public $urls = [];

    /**
     * Any extra data.
     *
     * @var array
     */
    public $extra = [];

    /**
     * Set a property on the user.
     *
     * @param string $key
     * @param mixed  $value
     *
     * @return void
     */
    public function __set($key, $value)
    {
        if (isset($this->{$key})) {
            $this->{$key} = $value;
        }
    }

    /**
     * Tells if a property is set.
     *
     * @param string $key
     *
     * @return bool
     */
    public function __isset($key)
    {
        return isset($this->{$key});
    }

    /**
     * Get a property from the user.
     *
     * @param string $key
     *
     * @return mixed
     */
    public function __get($key)
    {
        if (isset($this->{$key})) {
            return $this->{$key};
        }
    }

    /**
     * @inheritDoc
     */
    #[\ReturnTypeWillChange]
    public function getIterator()
    {
        return new ArrayIterator(get_object_vars($this));
    }
}
