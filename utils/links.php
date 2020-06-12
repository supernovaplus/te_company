<?php
echo '<div id="links">';
foreach ([

        "index.php",
        "index.php?turnin",
        "index.php?pays",
        "login_panel.php",
        "data.php",

    ] as $key => $value) {
        echo "<a href='".$value."'>".$value."</a>";
}
echo '</div>';