<?php
// show error and warnings
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// needed to use composer packages
include 'vendor/autoload.php';

// an instance of the validation class
$factory = new JeffOchoa\ValidatorFactory();

// form data
$data = [
  'username' => 'test'
];

// rules to apply on the form data
$rules = [
  'username' => 'required||unique:posts|max:2'
];

// create the validator object
$validator = $factory->make($data, $rules);


// print the results

echo 'pass';
echo '<br/>';
echo $validator->passes(); // 1 if all field are correct else null
echo '<br/>';
echo '<br/>';

echo 'fail';
echo '<br/>';
echo $validator->fails(); // 1 if any field is wrong else null
echo '<br/>';
echo '<br/>';

echo 'error';
echo '<br/>';
echo $validator->errors(); // error messages in case validation failed
echo '<br/>';
echo '<br/>';