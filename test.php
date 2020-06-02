<?php

include_once("./utils/header.php");
include_once("./utils/links.php");

?>

<script>
    (()=>{
        fetch("secured.php",{
            credentials: 'include'
        }).then(res=>res.json()).then(res=>console.log(res));
    })();

</script>

<?php

include_once("./utils/footer.php");