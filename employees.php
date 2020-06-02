<?php
require_once("./utils/login.php");

include_once("./utils/header.php");
include_once("./utils/links.php");

include_once("./utils/conn.php");

echo '<div id="content" class="emp box">';

$keys =  ["id","name","ingameid","join_date","leave_date","note","auto_rank","custom_rank","vouchers","rank","discordid"];

$result = $conn->query("CALL showTable()");

if ($result->num_rows > 0) {
    echo "<table>";
    echo "<tr>";
    foreach ($keys as $key => $value) {
        echo "<th>".$value."</th>";
    }
    echo "</tr>";

    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        foreach ($keys as $key => $value) {
            echo "<td>".$row[$value]."</td>";
        }
        echo "</tr>";

    }
    echo "</table>";
} else {
  echo "0 results";
}

$conn->close();

echo '</div><script>123</script>';

include_once("./utils/footer.php");