<?php
require_once("./utils/check_login_json.php");
$entityBody = file_get_contents('php://input');
$body = json_decode($entityBody);
include_once("./utils/conn_json.php");

$response = (object) array(
    'status' => 400, 
    'error' => null,
    "response" => null,
);

if(!isset($body)){
    $response->error = "Body missing";
    $conn->close();
    die(json_encode($response));
}


switch($_SERVER['REQUEST_METHOD']){
    case("UPDATE"):
        if(!$body->id){ $response->error = "ID missing"; break; }

        function trybind_update($data, &$params_array, &$query, &$types){
            for ($i=0; $i < count($data); $i++) { 
                if(isset($data[$i][0])){
                    array_push($params_array, $data[$i][0]);
                    
                    if(count($params_array) > 1){ $query .= ", "; }
                    
                    $query .= $data[$i][1]."=?";
                    $types .= $data[$i][2];
                }
            }
        }

        $query = "UPDATE employees SET ";
        $types = "";
        $params = [];

        trybind_update([
            [$body->name,           "name",         "s"],
            [$body->ingameid,       "ingameid",     "i"],
            [$body->join_date,      "join_date",    "s"],
            [$body->leave_date,     "leave_date",   "s"],
            [$body->note,           "note",         "s"],
            [$body->auto_rank,      "auto_rank",    "i"],
            [$body->custom_rank,    "custom_rank",  "i"],
            [$body->discordid,      "discordid",    "i"]
        ], $params, $query, $types);

        if(count($params) == 0){ $response->error = "Invalid body"; break; }

        $query .= " WHERE id=?";
        $types .= "i";
        array_push($params, $body->id);

        if($stmt = $conn->prepare($query)){
            $stmt->bind_param($types, ...$params);
    
            if($stmt->execute()){
                $response->response = "Data updated";
                $response->status = 201;
            }else{
                $response->error = "Error while updating values #1";
            }
        }else{
            $response->error = "Error while updating values #2";
        }
        break;

    case("PUT"):
        if(!$user["permission_name"] == "ceo" && !$user["permission_name"] == "hr"){ $response->error = "Missing permissions"; break;}
        if(!isset($body->join_date) || !isset($body->ingameid) ){ $response->error = "Invalid body"; break; }

        function trybind_insert($data, $isRequired){
            $arr = [];
            $values = "";
            $types = "";
            $query = "";
            for ($i=0; $i < count($data); $i++) { 
                if(isset($data[$i][0])){
                    array_push($arr, $data[$i][0]);
                    if(count($arr) > 1){ $values .= ", "; $query .= ", "; }
                    $values .= "?";
                    $query .= $data[$i][1];
                    $types .= $data[$i][2];
                }
            }
            return (object) array('arr' => $arr, 'values' => $values, 'types' => $types, 'query' => $query);
        }

        $insert = trybind_insert([
            [$body->name,           "name",         "s"],
            [$body->ingameid,       "ingameid",     "i"],
            [$body->join_date,      "join_date",    "s"],
            [$body->auto_rank,      "auto_rank",    "i"],
            [$body->custom_rank,    "custom_rank",  "i"],
            [$body->discordid,      "discordid",    "i"],
        ]);

        if($stmt = $conn->prepare("INSERT INTO employees ( $insert->query ) VALUES ( $insert->values )")){
            $stmt->bind_param($insert->types, ...$insert->arr);

            if($stmt->execute()){
                $response->response = "Data saved";
                $response->status = 201;
            }else{
                $response->error = "Error while inserting values #1";
            }

        }else{
            $response->error = "Error while inserting values #2";
        }

        break;
    
    default:
        break;
}

$conn->close();
echo json_encode($response);