<?php
require_once("./utils/check_login_json.php");
// $entityBody = file_get_contents('php://input');
// $body = json_decode($entityBody);
include_once("./utils/conn_json.php");


$response = (object) array(
    'status' => 400, 
    'error' => null,
    "employees" => [],
);


if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $result = $conn->query("CALL showTable()");

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            array_push($response->employees,$row);
        }
    }

}else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "post";
}

// if(!isset($body)){
//     $response->error = "body not found";
//     die(json_encode($response));
// }



// try {

//     $stmt = $conn->prepare("INSERT INTO transactions (employee_id, amount, vouchers_id, accepted_by_id, vouchers_holding_id, rank_id, employee_got, total_calculated_sum) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
//     $stmt->bind_param("iiiiiiii",   $employee_id, 
//                                     $amount, 
//                                     $vouchers_id, 
//                                     $accepted_by_id, 
//                                     $vouchers_holding_id, 
//                                     $rank_id, 
//                                     $employee_got, 
//                                     $total_calculated_sum
//                                 );
    
//     for ($i=0; $i < count($body); $i++) { 
//         $employee_id =  $body[$i]->employeeid;
//         $amount =       $body[$i]->amount;
//         $vouchers_id =  $body[$i]->voucherid;
//         $accepted_by_id =  $body[$i]->accepted_by_id;
//         $vouchers_holding_id = $body[$i]->accepted_by_id;
//         $rank_id =      $body[$i]->rankid;
//         $employee_got = $body[$i]->employeecut;
//         $total_calculated_sum = $body[$i]->totalmoney;

//         if($stmt->execute()){
//             $response->status = 201;
//             $response->affected_rows++;
//             $response->vouchers_added += $amount;
//         }else{
//             $response->error = "row not added";
//         }
//     }

//     $stmt->close();
//     $conn->close();
    

// } catch(PDOException $e) {
//     $response->status = 500;
//     $response->error = $e->getMessage();
// }
$conn->close();
echo json_encode($response);