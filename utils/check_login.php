<?php
require_once("./utils/config.php");


if(isset($_COOKIE["key"])){
    if(!in_array($_COOKIE["key"], array_keys($passList))){
        setcookie("key", "-", time(), "/"); //clear cookie
        header("Location: login_panel.php?url=".$_SERVER["REQUEST_URI"]);
        exit;
    }else{
        $user = $passList[$_COOKIE["key"]];
    }
}else{
    header("Location: login_panel.php?url=".$_SERVER["REQUEST_URI"]);
    exit;
}
?>