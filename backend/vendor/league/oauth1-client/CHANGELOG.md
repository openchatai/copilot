# Changelog

## v1.10.1

- Fix deprecation error (#147)

## v1.10.0

- Adds customizable application scope (setting the `x_auth_access_type` query parameter when fetching temporary credentials) on the Twitter provider - thanks to @Diegslapasteque

## v1.9.3

- Reverts bug in `v1.9.1` and will reintroduce `x_auth_access_type` to Twitter provider in `v1.10.0`.

## v1.9.2

- Adds `x_auth_access_type` to Twitter provider - thanks to @Diegslapasteque

## v1.9.1

- Remove deprecated Guzzle function call.

## v1.9.0

- Adds support for PHP 8.0.
- Allows optional authorization URL parameters to be passed.

## v1.8.2

- Fixes an issue where the base string used to generate signatures did not account for non-standard ports.

## v1.8.1

- Reverts the public API changes introduced in v1.8.0 where language level type declarations and return types that were introduced caused inheritence to break.
- Fixes a Composer warning with relation to autoloading test files.

## v1.8.0

- We allow installation with Guzzle 6 **or** Guzzle 7.
- The minimum PHP version has been bumped from PHP 5.6 to 7.1.
