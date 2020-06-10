<?php
require_once("./utils/check_login.php");
$title = "employees";
require_once("./utils/header.php");
require_once("./utils/links.php");

echo '<div id="root"></div>
<script src="utils/misc-min.js"></script>';

echo isset($_GET["turnin"]) ? '<script src="turnin.js"></script>' : '<script src="employees.js"></script>';

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