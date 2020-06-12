<?php
require_once("./utils/check_login_json.php");
require_once("./utils/conn_json.php");

$response = (object) array(
    "status" => 400,
    "error" => null
);

$q = isset($_GET["q"]) ? $_GET["q"] : null;

if($_SERVER['REQUEST_METHOD'] != "GET" ||  !$q){
    $response->error = "Invalid request";

}else{
    $args_array = array_unique(explode(",", $q));
    $fetch_array = [];
    for ($i=0; $i < count($args_array); $i++) {
        switch($args_array[$i]){
            case(1): array_push($fetch_array,   [&$response->employees,   "CALL showTable();"]);                  break;
            case(2): array_push($fetch_array,   [&$response->ranks,       "select * from ranks_config;"]);        break;
            case(3): array_push($fetch_array,   [&$response->vouchers,    "select * from vouchers_config;"]);     break;
            case(4): array_push($fetch_array,   [&$response->pays,        "select * from pays;"]);                break;
            case(10): array_push($fetch_array,  [&$response->pays,        "SELECT *, sum(amount) as s FROM pays where ceo_covered = 0 group by manag_id;"]); break;
        }
    }

    if(count($fetch_array) == 0){
        $response->error = "Invalid args";
        
    }else{
        $query = "";

        for ($i=0; $i < count($fetch_array); $i++) { 
            $query .= $fetch_array[$i][1];
        }

        if (mysqli_multi_query($conn, $query)) {

            $column = 0;
            do {
                $fetch_array[$column][0] = [];
                if ($result = mysqli_store_result($conn)) {
                    while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
                        array_push($fetch_array[$column][0], $row);
                    }
                    mysqli_free_result($result);
                    $column++;
                }
    
                $response->status = 200;
            } while (mysqli_next_result($conn));

        }else{
            $response->error = "Database error";
        }
    }

}


if(!$response->error){
    $response->user = $user;
}

$conn->close();
echo json_encode($response);