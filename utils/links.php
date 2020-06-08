<?php
echo '<div id="links">';
foreach ([

        "index.php",
        "employees.php",
        "turnin.php",
        "data.php",
        "login_panel.php",
        "test.php"

    ] as $key => $value) {
        echo "<a href='".$value."'>".$value."</a>";
}
echo '</div>';