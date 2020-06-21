<?php
require_once("./utils/check_login.php");
$title = "employees";
require_once("./utils/header.php");
require_once("./utils/links.php");


echo '<div id="root">Loading</div>
<script src="utils/misc-min.js"></script>
<script>const _root=document.getElementById("root");setTimeout(()=>{if(_root.innerText==="Loading"){_root.innerText="Error";};},4000);</script>';

if(count($_GET) == 0){
    echo '<script src="employees.js"></script>';
}else if(isset($_GET["turnin"])){
    echo '<script src="turnin.js"></script>';
}else if(isset($_GET["pays_log"])){
    echo '<script src="pays_log.js"></script>';
}else if(isset($_GET["pays_manage"])){
    echo '<script src="pays_manage.js"></script>';
}else{
    echo '<script>_root.innerText="Invalid Request";</script>';
}

// if(window.location.search){
//     if(window.location.search === "?turnin"){
//         document.body.appendChild(cel(["script",{src: "turnin.js"}]));
//     }else{
//         document.getElementById("root").innerText = "404 Not Found";
//     }
// }else{
//     document.body.appendChild(cel(["script",{src: "employees.js"}]));
// }
// </script>

require_once("./utils/footer.php");