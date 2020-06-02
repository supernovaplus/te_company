<?php
require_once("./utils/keys.php");
header('Content-Type: application/json');

if(isset($_COOKIE["key"])){
    if(!in_array($_COOKIE["key"], array_keys($passList))){
        setcookie("key", "-", time(), "/"); //clear cookie
        echo '{"error":"big"}';
        exit;
    }
}else{
    echo '{"error":"big"}';
    exit;
}
?>