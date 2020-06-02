<?php
// define("isLoginPage", "true");
// require_once("./utils/login.php");

include_once("./utils/header.php");
include_once("./utils/links.php");

$user;
$err;
$referer = "";
require_once("./utils/keys.php");

if(isset($_GET['url'])){
    $referer = $_GET['url'];
}

if(isset($_POST["logout"])){
    setcookie("key", "-", time(), "/"); //clear cookie
    header("Location: login_panel.php?url=".$referer);
    exit;
}



if(isset($_COOKIE["key"])){
    if(!in_array($_COOKIE["key"], array_keys($passList))){
        // header("Location: login_panel.php");
        setcookie("key", "-", time(), "/"); //clear cookie
        $err = "key changed, please login again";
    }else{
        $user = $passList[$_COOKIE["key"]];
    }

}else{

    if(!isset($_POST['key']) || empty($_POST['key'])){
        $err = "Not Logged In";
    }else if(!in_array($_POST['key'], array_keys($passList))){
        $err = "Incorrect key, try again...";
    }else{
        setcookie("key", $_POST['key'], time() + (86400 * 30), "/"); // 86400 = 1 day
        $user = $passList[$_POST['key']];
    }

}




echo "<div id=\"content\">";

print_r($_POST);


$url = htmlentities($_SERVER['PHP_SELF'])."?url=$referer";


if(isset($user)){
    echo "<p>Logged In as ".$user["name"]."</p>";

    echo "<form method=\"post\" action=\"$url\">
    <input type=\"submit\" name=\"logout\" value=\"Log Out\"><br>";

    
    // print_r($_SERVER);
    if($referer != ""){
        echo "<input type=\"button\" onclick=\"window.location = '$referer';\" value=\"Go back to $referer\">";
    }

    echo "</form>";
}else{
    echo "<form method=\"post\" action=\"$url\">
        <p>$err</p>
        <label for=\"key\">Login Key: </label>
        <input type=\"text\" name=\"key\" placeholder=\"key\" required minlength=\"4\"><br>
        <input type=\"submit\" name=\"login\" value=\"Log In\"><br>
    </form>";
}


echo "</div>";

include_once("./utils/footer.php");
