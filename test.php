<?php

include_once("./utils/header.php");
include_once("./utils/links.php");

?>

<script>
    (()=>{
        fetch("secured.php",{
            credentials: 'include'
        }).then(res=>res.json()).then(res=>{

            const el = document.createElement("p");
            el.innerText = JSON.stringify(res);
            document.body.appendChild(el);

        });
    })();

</script>

<?php

include_once("./utils/footer.php");