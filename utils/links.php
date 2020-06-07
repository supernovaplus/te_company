<?php
$pages = [
    "index.php",
    "employees.php",
    "turnin.php",
    "data.php",
    "login_panel.php",
    "test.php"
];
echo "<div id=\"links\">";
foreach ($pages as $key => $value) {
echo "
        <a href='".$value."'>".$value."</a>";
}

echo "</div>";