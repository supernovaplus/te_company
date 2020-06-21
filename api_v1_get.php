<?php
require_once("./utils/check_login_json.php");
require_once("./utils/conn_json.php");

$response = (object) array(
    "status" => 400,
    "error" => null
);

$q = isset($_GET["q"]) ? $_GET["q"] : null;
// $getid = isset($_GET["id"]) ? intval($_GET["id"]) : null;
$page = isset($_GET["page"]) ? intval($_GET["page"]) : 1;

if($_SERVER['REQUEST_METHOD'] != "GET" ||  !$q){
    $response->error = "Invalid request";

}else{
    $args_array = array_unique(explode(",", $q));
    $fetch_array = [];
    for ($i=0; $i < count($args_array); $i++) {
        switch($args_array[$i]){
            case("employees"):  array_push($fetch_array,        [&$response->employees,     "CALL showTable();"]);                              break;
            case("ranks"):      array_push($fetch_array,        [&$response->ranks,         "select * from ranks_config;"]);                    break;
            case("vouchers"):   array_push($fetch_array,        [&$response->vouchers,      "select * from vouchers_config;"]);                 break;
            case("pays"):       array_push($fetch_array,        [&$response->pays,          "select * from pays;"]);                            break;
            // case(10):           array_push($fetch_array, [&$response->pays,              "SELECT *, sum(amount) as s FROM pays where ceo_covered = 0 group by manag_id,type;"]); break;
            case("vauc"):           array_push($fetch_array,    [&$response->vauc,          "SELECT sum(amount) as amount, sum(total_calculated_sum * (employee_cut * 0.1)) as sum, accepted_by_id, name FROM `transactions`  left join vouchers_config on vouchers_config.id = transactions.vouchers_id where ceo_covered = 0 group by accepted_by_id, vouchers_id;"]);                                                                                                                                   break;
            case("pay_t"):           array_push($fetch_array,   [&$response->pays_t,        "select sum, manag_id from (SELECT manag_id, sum((case when type = \"give\" THEN -amount ELSE amount END)) as sum FROM pays where ceo_covered = 0 group by manag_id) as pa left join employees on employees.id = pa.manag_id;"]); break;

            case("pays_log"): 
                array_push($fetch_array,   [&$response->pays_log,        "select * from pays order by id asc limit ". ($page - 1) * 20 .", 20;"]);
                array_push($fetch_array,   [&$response->pages,        "select count(*) as count from pays;"]);
                break;
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
            $pointer = 0;
            do {
                $fetch_array[$pointer][0] = [];
                if ($result = mysqli_store_result($conn)) {
                    while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
                        array_push($fetch_array[$pointer][0], $row);
                    }
                    mysqli_free_result($result);
                    $pointer++;
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