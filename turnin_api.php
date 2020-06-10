<?php
require_once("./utils/check_login_json.php");
$entityBody = file_get_contents('php://input');
require_once("./utils/conn_json.php");

$body = json_decode($entityBody);

$response = (object) array(
    'status' => 400, 
    'affected_rows' => 0, 
    'error' => null, 
    'vouchers_added' => 0
);

if ($conn -> connect_errno) {
    $response->error = "Database Error";
    $conn->close();
    die(json_encode($response));
}

if(!isset($body)){
    $response->error = "Body missing";
    $conn->close();
    die(json_encode($response));
}

try {

    $stmt = $conn->prepare("INSERT INTO transactions (employee_id, amount, vouchers_id, accepted_by_id, vouchers_holding_id, rank_id, employee_got, total_calculated_sum) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iiiiiiii",   $employee_id, 
                                    $amount, 
                                    $vouchers_id, 
                                    $accepted_by_id, 
                                    $vouchers_holding_id, 
                                    $rank_id, 
                                    $employee_got, 
                                    $total_calculated_sum
                                );
    
    for ($i=0; $i < count($body); $i++) { 
        $employee_id =  $body[$i]->employeeid;
        $amount =       $body[$i]->amount;
        $vouchers_id =  $body[$i]->voucherid;
        $accepted_by_id =  $body[$i]->accepted_by_id;
        $vouchers_holding_id = $body[$i]->accepted_by_id;
        $rank_id =      $body[$i]->rankid;
        $employee_got = $body[$i]->employeecut;
        $total_calculated_sum = $body[$i]->totalmoney;

        if($stmt->execute()){
            $response->status = 201;
            $response->affected_rows++;
            $response->vouchers_added += $amount;
        }else{
            $response->error = "row not added";
        }
    }

    $stmt->close();
    $conn->close();
    

} catch(PDOException $e) {
    $response->status = 500;
    $response->error = $e->getMessage();
}

echo json_encode($response);