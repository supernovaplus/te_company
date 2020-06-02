<?php
require_once("./utils/config.php");
header('Content-Type: application/json');

if(isset($_COOKIE["key"])){
    if(!in_array($_COOKIE["key"], array_keys($passList))){
        setcookie("key", "-", time(), "/"); //clear cookie
        echo '{"status":401,"error":"not allowed"}';
        exit;
    }
}else{
    echo '{"status":401,"error":"not allowed"}';
    exit;
}
?>