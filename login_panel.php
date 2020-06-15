<?php
require_once("./utils/header.php");
require_once("./utils/links.php");

$user; $err;
$referer = isset($_GET['url']) ? $_GET['url'] : "";
require_once("./utils/config.php");

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
        setcookie("key", $_POST['key'], [
            'expires' => time() + (86400 * 30),// 86400 = 1 day
            'path' => '/',
            // 'domain' => 'domain.com',
            // 'secure' => true,
            // 'httponly' => true,
            'samesite' => 'Strict',
        ]);
        $user = $passList[$_POST['key']];
    }

}

echo "<div id=\"root\">";

$url = htmlentities($_SERVER['PHP_SELF'])."?url=$referer";

if(isset($user)){
    echo "<div><p>Logged In as ".$user["name"]." (".$user["permission_name"].")</p></div>";
    echo "<form method=\"post\" action=\"$url\"><input type=\"submit\" name=\"logout\" value=\"Log Out\">";
    if($referer != ""){
        echo "<input type=\"button\" onclick=\"window.location = '$referer';\" value=\"Go back to $referer\">";
    }
    echo "</form>";
}else{
    echo "
    <div>
        <p>$err</p>
    </div>
    <form method=\"post\" action=\"$url\">
        <label for=\"key\">Enter Login Key: </p><input type=\"text\" name=\"key\" placeholder=\"key\" required minlength=\"4\">
        <input type=\"submit\" name=\"login\" value=\"Log In\"><br>
    </form>";
}

echo "</div>
<script>0</script>";

require_once("./utils/footer.php");
