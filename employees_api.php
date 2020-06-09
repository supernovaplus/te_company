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


// if(!$entityBody){
//     $response->error = "Body missing";
//     $conn->close();
//     die(json_encode($response));
// }


switch($_SERVER['REQUEST_METHOD']){
    case("UPDATE"):
        if(!$body || !$body->id){
            $response->error = "Body or ID missing";break;
        }
        if($stmt = $conn->prepare("UPDATE employees SET name=?, ingameid=?, join_date=?, leave_date=?, note=?, auto_rank=?, custom_rank=?, discordid=? WHERE id=?")){
            $stmt->bind_param("sisssiiii", $name, $ingameid, $join_date, $leave_date, $note, $auto_rank, $custom_rank, $discordid, $id);
            
            
            $name = $body->name;
            $ingameid = $body->ingameid;
            $join_date = $body->join_date;
            $leave_date = $body->leave_date;
            $note = $body->note;
            $auto_rank = $body->auto_rank;
            $custom_rank = $body->custom_rank;
            $discordid = $body->discordid;
            $id = $body->id;

            if($stmt->execute()){
                $response->response = "Data updated";
                $response->status = 201;
            }else{
                $response->error = "Error while updating values #1";
                $response->error = $stmt->error;

            }

        }else{
            $response->error = "Error while updating values #2";
        }
        break;
    case("PUT"):
        if($user["permission_name"] == "ceo" || $user["permission_name"] == "hr"){

            if($stmt = $conn->prepare("INSERT INTO employees (name, ingameid, join_dat, note, auto_rank, custom_rank, discordid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")){
                    $stmt->bind_param("sissiii", $name, $ingameid, $join_date, $note, $auto_rank, $custom_rank, $discordid);
                    
                    $name = $body->name;
                    $ingameid = $body->ingameid;
                    $join_date = $body->join_date;
                    $note = $body->note;
                    $auto_rank = $body->auto_rank;
                    $custom_rank = $body->custom_rank;
                    $discordid = $body->discordid;

                    if($stmt->execute()){
                        $response->response = "Data saved";
                        $response->status = 201;
                    }else{
                        $response->error = "Error while inserting values #1";
                    }

            }else{
                $response->error = "Error while inserting values #2";
            }
        }

        break;
    
    default:
        break;
}


$conn->close();
echo json_encode($response);