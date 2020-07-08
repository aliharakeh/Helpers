<?php
// show error and warnings
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// needed to use composer packages
include 'vendor/autoload.php';

// the packages used
use Illuminate\Database\Capsule\Manager as DB;
use Illuminate\Events\Dispatcher;
use Illuminate\Container\Container;

// database instance
$db = new DB;

// set connection
$db->addConnection([
    'driver'    => 'mysql',
    'host'      => 'localhost',
    'database'  => 'task_management',
    'username'  => 'root',
    'password'  => 'root',
    // 'charset'   => 'utf8',
    // 'collation' => 'utf8_unicode_ci',
    // 'prefix'    => '',
]);

// Set the event dispatcher used by Eloquent models
$db->setEventDispatcher(new Dispatcher(new Container));

// Make this db instance available globally via static methods
$db->setAsGlobal();

// Setup the Eloquent ORM
$db->bootEloquent();

// using query builder
$users = DB::table('users')->select('id', 'username')->get();
foreach($users as $user)
  echo $user->id . " ===> " . $user->username . "<br />";

// raw query
$users = DB::select('select id, username from users');
foreach($users as $user)
  echo $user->id . " ===> " . $user->username . "<br />";