<?php
require_once("./utils/config.php");
header('Content-Type: application/json');

if(isset($_COOKIE["key"])){
    if(!in_array($_COOKIE["key"], array_keys($passList))){
        setcookie("key", "-", time(), "/"); //clear cookie
        die('{"status":401,"error":"not allowed"}');
    }else{
        $user = $passList[$_COOKIE["key"]];
    }
}else{
    die('{"status":401,"error":"not allowed"}');
}
?>