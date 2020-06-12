<?php
require_once("./utils/check_login_json.php");
$entityBody = file_get_contents('php://input');
$body = json_decode($entityBody);
include_once("./utils/conn_json.php");

// error_reporting(E_ALL);

$response = (object) array(
    'status' => 400, 
    'error' => null
);

function tryinsert($list){
    $arr = [];
    $values = "";
    $types = "";
    $query = "";
    $errors = "";

    for ($i=0; $i < count($list); $i++) { 
        if(isset($list[$i][0]) && $list[$i][0]){
            array_push($arr, $list[$i][0]);
            if(count($arr) > 1){
                $values .= ", ";
                $query .= ", ";
            }
            $values .= "?";
            $query .= $list[$i][1];
            $types .= $list[$i][2];
        }else if(!isset($list[$i][3])){
            $errors .= "Missing ". $list[$i][1] ."\n";
        }
    }

    return (object) array('arr' => $arr, 'values' => $values, 'types' => $types, 'query' => $query, 'errors' => $errors);
}

function trypush($list, $tablename){
    global $conn, $stmt, $response;

    $insert = tryinsert($list);

    if($insert->errors != "" || count($insert->arr) == 0){ 
        $response->error = "Missing data\n".$insert->errors;
    
    }else if($stmt = $conn->prepare("INSERT INTO $tablename ( $insert->query ) VALUES ( $insert->values )")){
        $stmt->bind_param($insert->types, ...$insert->arr);
    
        if($stmt->execute()){
            $response->response = "Data added";
            $response->status = 201;
        }else if($stmt->error){
            $response->error = $stmt->error;
        }else{
            $response->error = "PUT ERR #1";
        }

    }else{
        $response->error = "PUT ERR #2";
    }
}



$q = isset($_GET["q"]) ? $_GET["q"] : null;

if($_SERVER['REQUEST_METHOD'] != "PUT" ||  !$q){
    $response->error = "Invalid request";
    
}else if(!isset($body)){
    $response->error = "Missing/Invalid body";

}else if(!$user["permission_name"] == "ceo" && !$user["permission_name"] == "hr"){
    $response->error = "Missing permissions";

}else{    
    switch($q){
        case("add_employee"):
            if(is_array($body)){
                $response->error = "Invalid body";
                break;
            }

            trypush([
                [&$body->name,           "name",         "s"],
                [&$body->ingameid,       "ingameid",     "i"],
                [&$body->join_date,      "join_date",    "s"],
                [&$body->auto_rank,      "auto_rank",    "i"],
                [&$body->note,           "note",         "s",   "optional"],
                [&$body->custom_rank,    "custom_rank",  "i"],
                [&$body->discordid,      "discordid",    "i"]
            ], "employees");

            break;

        case("add_vouchers"):
            if(!is_array($body)){
                $response->error = "Invalid body";
                break;
            }

            for ($i=0; $i < count($body); $i++) { 
                trypush([
                    [&$body[$i]->employee_id,            "employee_id",          "i"],
                    [&$body[$i]->amount,                 "amount",               "i"],
                    [&$body[$i]->vouchers_id,            "vouchers_id",          "i"],
                    [&$body[$i]->accepted_by_id,         "accepted_by_id",       "i"],
                    [&$body[$i]->vouchers_holding_id,    "vouchers_holding_id",  "i"],
                    [&$body[$i]->rank_id,                "rank_id",              "i"],
                    [&$body[$i]->employee_cut,           "employee_cut",         "i"],
                    [&$body[$i]->total_calculated_sum,   "total_calculated_sum", "i"]
                ], "transactions");
                
                if($response->error) break;
            }

            break;

        default:
            $response->error = "Invalid args";
            break;
    }

}

$conn->close();
echo json_encode($response);


