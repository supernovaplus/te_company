<?php
echo '<div id="links">';
foreach ([

        "index.php",
        "index.php?turnin",
        "index.php?pays",
        "login_panel.php",
        "api_v1_get.php?q=1,2,3",

    ] as $key => $value) {
        echo "<a href='".$value."'>".$value."</a>";
}
echo '</div>';