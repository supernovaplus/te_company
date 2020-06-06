<?php
require_once("./utils/check_login.php");

include_once("./utils/header.php");
include_once("./utils/links.php");
?>

<div id="turnin">

  <div class="box upper">
    <label for="employee_names">Employee</label>
    <select name="employee_names" id="employee_names" onChange="nameClicked(this.value)"><option value="-1">Loading or not available</option></select>
  </div>

  <div id="infobox" class="box upper"></div>
  <div id="inputFields" class="box upper"><input type="submit" name="submit" value="Calculate" id="calculate" ></div>
  <div id="final" class="box"></div>
  <div id="response" class="box"></div>

</div>

<script src="./turnin.js"></script>

<?php
include_once("./utils/footer.php");