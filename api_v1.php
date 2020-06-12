<?php
require_once("./utils/check_login_json.php");
require_once("./utils/conn_json.php");

$response = (object) array(
    "status" => 400,
    "error" => null
);

if ($conn -> connect_errno) {
    $response->error = "Database Error";
    die(json_encode($response));
}


switch($_SERVER['REQUEST_METHOD']){
    case("GET"):
        $args = $_GET["data"];
        if(!isset($args) || !$args){
            $response->error = "Missing args";
            break;
        }
        $args_array = array_unique(explode("-", $args));
        $fetch_array = [];
        for ($i=0; $i < count($args_array); $i++) {
            switch($args_array[$i]){
                case(1): array_push($fetch_array, [&$response->employees,"CALL showTable();"]);             break;
                case(2): array_push($fetch_array, [&$response->ranks,"select * from ranks_config;"]);       break;
                case(3): array_push($fetch_array, [&$response->vouchers,"select * from vouchers_config;"]); break;
                case(4): array_push($fetch_array, [&$response->pays,"select * from pays;"]);                break;
                case(10): array_push($fetch_array, [&$response->pays,"SELECT *, sum(amount) as s FROM pays where ceo_covered = 0 group by manag_id;"]); break;
            }
        }

        if(count($fetch_array) == 0){
            $response->error = "Invalid args";
        }else{
            function fetchdb($data){
                global $response, $conn; 
                $query = "";
                for ($i=0; $i < count($data); $i++) { 
                    $query .= $data[$i][1];
                }
                if (mysqli_multi_query($conn, $query)) {
                    $column = 0;
                    do {
                        $data[$column][0] = [];
                        if ($result = mysqli_store_result($conn)) {
                            while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
                                array_push($data[$column][0], $row);
                            }
                            mysqli_free_result($result);
                            $column++;
                        }
                        
                    } while (mysqli_next_result($conn));
                }
            }

            fetchdb($fetch_array);

            $response->status = 200;
        }

    break;

};

if(!$response->error){
    $response->user = $user;
}

$conn->close();
echo json_encode($response);