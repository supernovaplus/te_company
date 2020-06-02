<?php
include_once("./utils/conn.php");


$employeeData = [];
$ranksData = [];
$vouchersData = [];

$query = "CALL showTable();";
$query .= "select * from ranks_config;";
$query .= "select * from vouchers_config;";

if (mysqli_multi_query($conn, $query)) {
    $column = 0;

    do {
        $pointer = &$employeeData;
        if($column == 1){
            $pointer = &$ranksData;
        }else if($column == 2){
            $pointer = &$vouchersData;
        }

        if ($result = mysqli_store_result($conn)) {

            while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
                array_push($pointer, $row);
            }

            mysqli_free_result($result);
            $column++;
        }

    } while (mysqli_next_result($conn));
}

header('Content-Type: application/json');
echo "{
\"employees\": ".json_encode($employeeData).",
\"ranks\": ".json_encode($ranksData).",
\"vouchers\": ".json_encode($vouchersData)."
}";

$conn->close();