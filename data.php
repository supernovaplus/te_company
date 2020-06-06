<?php
include_once("./utils/check_login_json.php");
include_once("./utils/conn.php");

$response = (object) array(
    "employees" => [],
    "ranks" => [],
    "vouchers" => [],
    "config" => []
);

$query = "CALL showTable();";
$query .= "select * from ranks_config;";
$query .= "select * from vouchers_config;";

if (mysqli_multi_query($conn, $query)) {
    $column = 0;

    do {
        $pointer = &$response->employees;
        if($column == 1){
            $pointer = &$response->ranks;
        }else if($column == 2){
            $pointer = &$response->vouchers;
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

$conn->close();

echo json_encode($response);