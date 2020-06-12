<?php
require_once("./utils/check_login_json.php");
require_once("./utils/conn_json.php");


error_reporting(E_ALL);


$response = (object) array(
    'status' => 400, 
    'error' => null, 
    'response' => null,
    'data' => []
);


if ($conn -> connect_errno) {
    $response->error = "Database Error";
    $conn->close();
    die(json_encode($response));
}



switch($_SERVER['REQUEST_METHOD']){
    case ("GET"):
        $result = $conn->query("SELECT * FROM pays");
        
        if ($result->num_rows > 0) {
          while($row = $result->fetch_assoc()) {
            array_push($response->data, $row);
          }
          $response->status = 200;
        }
        break;

    case ("PUT"):
        $entityBody = file_get_contents('php://input');
        $body = json_decode($entityBody);

        if(!isset($body)){
            $response->error = "Body missing";
            $conn->close();
            die(json_encode($response));
        }

        if(isset($body) && count($body) > 0){

            function trybind_insert($data){
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
        
            for ($i=0; $i < count($body); $i++) { 
        
                $insert = trybind_insert([
                    [$body[$i]->employee_id,            "employee_id",          "i"],
                    [$body[$i]->amount,                 "amount",               "i"],
                    [$body[$i]->vouchers_id,            "vouchers_id",          "i"],
                    [$body[$i]->accepted_by_id,         "accepted_by_id",       "i"],
                    [$body[$i]->vouchers_holding_id,    "vouchers_holding_id",  "i"],
                    [$body[$i]->rank_id,                "rank_id",              "i"],
                    [$body[$i]->employee_cut,           "employee_cut",         "i"],
                    [$body[$i]->total_calculated_sum,   "total_calculated_sum", "i"]
                ]);
        
                if($stmt = $conn->prepare("INSERT INTO transactions ( $insert->query ) VALUES ( $insert->values )")){
                    $stmt->bind_param($insert->types, ...$insert->arr);
            
                    if($stmt->execute()){
                        $response->response = "Data saved";
                        $response->status = 201;
                    }else{
                        $response->error = $stmt->error;
                    }
            
                }else{
                    $response->error = "Error while inserting values #2";
                }
            }
        
        }else{
            $response->error = "Invalid Body";
        }
    break;
}



$conn->close();
echo json_encode($response);