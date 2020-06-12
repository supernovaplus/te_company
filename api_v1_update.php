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

function trybind_update($list, $list2){
    $query = "UPDATE employees SET ";
    $types = "";
    $arr = [];

    for ($i=0; $i < count($list); $i++) { 
        if(isset($list[$i][0]) && $list[$i][0]){
            array_push($arr, $list[$i][0]);
            if(count($arr) > 1){ $query .= ", "; }
            $query .= $list[$i][1]."=?";
            $types .= $list[$i][2];
        }
    }

    $query .= " WHERE ".$list2[0][1]."=?";
    $types .= $list2[0][2];
    array_push($arr, $list2[0][0]);

    return (object) array('arr' => $arr, 'types' => $types, 'query' => $query);
}

if($_SERVER['REQUEST_METHOD'] != "UPDATE"){
    $response->error = "Invalid request";

}else if(!isset($body) || !$body->id){
    $response->error = "Body missing";

}else{
    
    $insert = trybind_update([
        [&$body->name,           "name",         "s"],
        [&$body->ingameid,       "ingameid",     "i"],
        [&$body->join_date,      "join_date",    "s"],
        [&$body->leave_date,     "leave_date",   "s"],
        [&$body->note,           "note",         "s"],
        [&$body->auto_rank,      "auto_rank",    "i"],
        [&$body->custom_rank,    "custom_rank",  "i"],
        [&$body->discordid,      "discordid",    "i"]
    ],[
        [&$body->id,             "id",           "i"]
    ]);

    if(count($insert->arr) < 2){ 
        $response->error = "Invalid body";

    }else if($stmt = $conn->prepare($insert->query)){
        $stmt->bind_param($insert->types, ...$insert->arr);

        if($stmt->execute()){
            $response->response = "Data updated";
            $response->status = 201;
        }else if($stmt->error){
            $response->error = $stmt->error;
        }else{
            $response->error = "UPDATE ERR #1";
        }

    }else{
        $response->error = "UPDATE ERR #2";
    }
}

$conn->close();
echo json_encode($response);