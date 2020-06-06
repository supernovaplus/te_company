const employeediv = document.getElementById("content");

var data = [];

fetchData();

function fetchData(callback){
    fetch("data.php")
    .then(res=>res.json())
    .then(res=>{
        if(res.employees.length > 0){
            data = res;
            if(callback === undefined){
                displayAllEmployees()
            }else{
                callback();
            }
        }else{employeediv.innerHTML = "error 2";};
    })
    .catch(err=>{employeediv.innerHTML = "error 1";console.log(err);});
}




function displayAllEmployees(){
    employeediv.innerHTML = "";
    const table = document.createElement("table");
    employeediv.appendChild(table);

    const keys = Object.keys(data.employees[0]);

    table.innerHTML += `<tr>${keys.map(k=>`<th>${k}</th>`).join("")}<th>action</th></tr>`;

    for (let i = 0; i < data.employees.length; i++) {
        table.innerHTML += `<tr>${keys.map(k=>`<td>${data.employees[i][k]}</td>`).join("")}<td><input type="button" value="edit" onclick="editEmployee(${data.employees[i]["id"]})"></d></tr>`;
    }
}

const updateTable = [
    {name: "id", edit: false},
    {name: "name", edit: true, type: "text"},
    {name: "ingameid", edit: true, type: "number"},
    {name: "join_date", edit: true, type: "text"},
    {name: "leave_date", edit: false},
    {name: "note", edit: true, type: "text"},
    {name: "auto_rank", edit: true, type: "bool"},
    {name: "custom_rank", edit: true, type: "customrank"},
    {name: "discordid", edit: true, type: "number"},
    {name: "vouchers", edit: false},
    {name: "rank", edit: false},
]

function editEmployee(id){
    const found = data.employees.find(el=>el.id == id);
    if(!found) return;
    employeediv.innerHTML = "";

    const table = document.createElement("table");
    for (let i = 0; i < updateTable.length; i++) {
        const k = updateTable[i];
        let string = "";
        
        string += `<tr><th>${k.name}</th><td>`;
        if(k.edit === false){
            string += found[k.name];
        }else{
            string += `<input type="checkbox" onclick="this.nextElementSibling.disabled = !this.nextElementSibling.disabled"></input>`;
            switch(k.type){
                case("number"):
                case("text"):
                    string += `<input type="${k.type}" name="${k.name}" value="${found[k.name]}" disabled></input>`;
                    break;

                case("customrank"):
                    string += generateCustomRank(found[k.custom_rank])
                    break;

                case("bool"):
                    string += generateTrueFalseField(found[k.auto_rank])
                    break;

                default:
                    break;
            }
        }
        table.innerHTML += string + "</td><tr/>";
    }
    employeediv.appendChild(table);

    const backButton = document.createElement("input");
    backButton.type = "button";
    backButton.value = "back";
    backButton.onclick = displayAllEmployees;
    employeediv.appendChild(backButton)

    const refreshButton = document.createElement("input");
    refreshButton.type = "button";
    refreshButton.value = "refresh";
    refreshButton.onclick = () => fetchData(()=>{
        editEmployee(id);
        const p = document.createElement("p");
        p.innerText = `Refreshed ${new Date().toTimeString()}`;
        employeediv.appendChild(p);
    });
    employeediv.appendChild(refreshButton);

    return employeediv;
}


function generateCustomRank(currentRankId){
    return `<select id="customRankSelect" disabled>
    ${data.ranks.map(rank=>`<option value="${rank.id}" ${rank.id == currentRankId ? "selected" : ""}>${rank.id} - ${rank.name}</option>`).join("")}
    </select>`;
}

function generateTrueFalseField(bool,name="customBool"){
    return `
    <select id="${name}" disabled>
        <option value="1" ${bool === true ? "selected" : ""}>1 - True (default)</option>
        <option value="0" ${bool === false ? "selected" : ""}>0 - False</option>
    </select>`;
}