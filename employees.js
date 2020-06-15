const root = document.getElementById("root")
root.className = "employees";
const data = {};

fetchData();

function fetchData(callback){
    fetch("api_v1_get.php?q=employees,ranks,vouchers")
    .then(res=>res.json())
    .then(res=>{
        if(res.error !== null){
            root.innerHTML = res.error;
        }else if(res.employees && res.employees.length > 0){
            for (const key in data) { delete key; }
            Object.assign(data, res);

            if(callback === undefined){
                windowAllEmployees()
            }else{
                callback();
            }
        }else{
            root.innerHTML = "error 2";
        };
    }).catch(err=>{
        root.innerHTML = "error 1";
        console.log(err);
    });
}

function windowAllEmployees(){
    root.innerHTML = "";
    const table = document.createElement("table");
    const filter = ["leave_date", "custom_rank"];
    const keys = Object.keys(data.employees[0]).filter(k => !filter.includes(k) );
    
    if(data.user.permission_name === "ceo" || data.user.permission_name === "hr"){
        root.appendChild(cel(["div",["input",{type:"button", value: "add new employee", onclick: windowAddNewEmployee}]]));
    }

    table.appendChild(cel(["tr",   ...keys.map(k => ["th", {innerText: k}]), ["th", {innerText: "action"}]]));

    for (let i = 0; i < data.employees.length; i++) {
        table.appendChild(cel([ "tr",   
                                ...keys.map(k => ["td", {innerText: data.employees[i][k]}]), 
                                ["td",["input", {type: "button", value: "edit", onclick: ()=>{
                                    windowEditEmployee(data.employees[i]["id"])
                                }}]]]));
    }

    root.appendChild(table);
}

function windowAddNewEmployee(){
    root.innerHTML = "";
    const filter = ["id","vouchers","rank","leave_date"];
    const keys = Object.keys(data.employees[0]).filter(k => !filter.includes(k) );

    root.appendChild(
        cel(["form", {autocomplete: "off"},
                ["table", ...keys.map(k => 
                    ["tr",
                        ["th", {innerText: k}], 
                        ["td", type_add_new(k)]] 
                    )]]));

    const responseBox = document.createElement("p");
    const dd = document.createElement("div");
    dd.appendChild(responseBox);
    root.appendChild(dd);

    const input = [...document.querySelectorAll("input:not([type=button]),select")];

    const backButton = createBackButton();
    const submitButton = cel(["input", {type: "button", value: "submit"}]);
    submitButton.onclick = () => {
        const errors = [];
        const body = {};
        for (let i = 0; i < input.length; i++) {
            if(input[i].required){
                if(!input[i].value){
                    errors.push("Missing value on "+input[i].name);
                }else if(input[i].name === "join_date" && !input[i].value.includes("-")){
                    errors.push("Invalid date on "+input[i].name);
                }else if(input[i].name === "ingameid" && data.employees.find(el => el.ingameid == input[i].value)){
                    errors.push("User already exits on "+input[i].name);
                }else{
                    body[input[i].name] = input[i].value;
                }
            }else if(input[i].value){
                body[input[i].name] = input[i].value;
            }

        }

        if(errors.length > 0){
            responseBox.innerText = _err("\n" + errors.join("\n")); return;
        }
        
        console.log(body);
        fetch("api_v1_put.php?q=add_employee",{
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify(body)
            }).then(res=>res.json()).then(res=>{
                if(res.status && res.status === 201){
                    submitButton.value = res.response;
                    responseBox.innerText = "";
                    submitButton.disabled = true;
                    backButton.gotData();
                }else{
                    if(res.error){
                        responseBox.innerText = _err(res.error);
                    }else{
                        responseBox.innerText = _err("#G1");
                    }
                }
        }).catch(err=>{
            console.error(err);
            responseBox.innerText = _err("#G2");
        });
    };
    root.appendChild(submitButton);
    root.appendChild(backButton.btn);
}

function windowEditEmployee(id){
    const found = data.employees.find(el=>el.id == id);
    if(!found) return;
    root.innerHTML = "";
    const keys = Object.keys(data.employees[0]);

    root.appendChild(
        cel(["form", {autocomplete: "off"},
                ["table", ...keys.map(k => 
                    ["tr",
                        ["th", {innerText: k}], 
                        ["td", ...type_edit_emp(k, found) || "?"]] 
                    )]]));
    
    const input = [...document.querySelectorAll("input:not([type=button]):not([type=checkbox]),select")]

    const backButton = createBackButton();
    const responseBox = document.createElement("p");
    const submitButton = cel(["input", {type: "button", value: "submit"}]);
    submitButton.onclick = () => {
        const errors = [];
        const body = {};
        for (let i = 0; i < input.length; i++) {
            if(input[i].disabled) continue;
            if(input[i].required){
                if(!input[i].value){
                    errors.push("Missing value on "+input[i].name);
                }else if(input[i].name === "join_date" && !input[i].value.includes("-")){
                    errors.push("Invalid date on "+input[i].name);
                }else if(input[i].name === "ingameid" && data.employees.find(el => el.ingameid == input[i].value)){
                    errors.push("User already exits on "+input[i].name);
                }else{
                    body[input[i].name] = input[i].value;
                }
            }else if(input[i].value){
                body[input[i].name] = input[i].value;
            }
        }

        if(errors.length > 0){
            responseBox.innerText = _err("\n" + errors.join("\n")); return;
        }

        if(Object.keys(body).length === 0){
            responseBox.innerText = _err("Nothing to update"); return;
        }
        
        body.id = id;

        console.log(body);
        fetch("api_v1_update.php?q=edit_employee",{
            method: 'UPDATE',
            credentials: 'include',
            body: JSON.stringify(body)
            }).then(res=>res.json()).then(res=>{
                if(res.status && res.status === 201){
                    submitButton.value = res.response;
                    responseBox.innerText = "";
                    submitButton.disabled = true;
                    
                    Object.assign(found, body);
                }else{
                    if(res.error){
                        responseBox.innerText = _err(res.error);
                    }else{
                        responseBox.innerText = _err("#L1");
                    }
                }
        }).catch(err=>{
            console.error(err);
            responseBox.innerText = _err("#L2");
        });
    };
    root.appendChild(responseBox);
    root.appendChild(submitButton);
    root.appendChild(backButton.btn);

}

function createBackButton(){
    const btn = cel(["input",{type: "button", value: "back", onclick: windowAllEmployees}])
    return {btn, gotData: () => {
        btn.value = "back (refresh)";
        btn.onclick = (()=>fetchData(()=>windowAllEmployees()));
    }}
}

function _err(string){
    return "Error: " + string;
}


function generateCustomRank(obj){
    return ["select",{id: "customRankSelect", name: obj.name || "opt", disabled: obj.isDisabled, required: obj.isRequired},
        ...data.ranks.map(rank=>["option", {value: rank.id, selected: rank.id == obj.id, innerText: `${rank.id} - ${rank.name}`}])
    ];
}

function generateTrueFalseField(obj){
    return ["select", {id: obj.name || "opt", name: obj.name || "opt", disabled: obj.isDisabled, required: obj.isRequired},
        ["option",{value: "1", selected: obj.default === "1", innerText: `1 - ${obj.options[0] || "true"} (default)`}],
        ["option",{value: "0", selected: obj.default === "0", innerText: `0 - ${obj.options[1] || "false"}`}]
    ];
}

function type_add_new(key){
    switch(key){
        case("ingameid"):
        case("discordid"):
            return ["input",{type: "number", name: key, value:"", required: true}];
        case("custom_rank"):
            return generateCustomRank({
                id: 5,
                name: "custom_rank",
                isDisabled: false,
                isRequired: true
            });
        case("auto_rank"):
            return generateTrueFalseField({
                default: 1,
                name: "auto_rank",
                options: ["Automatic Rank","Custom Rank"],
                isDisabled: false,
                isRequired: true
            });
        case("join_date"):
            return ["input", {type: "text", name: key, value: new Date().toLocaleString('lt', { timeZone: 'GMT' }), required: true}];
        case("note"):
            return ["input", {type: "text", name: key, value:""}];
        default:
            return ["input",{type: "text", name: key, value: "", required: true}];
    };
};

function type_edit_emp(key, found){
    if(!data.user.permissions[key]){
        return found[key];
    }else{
        const prefix = ["input", {type: "checkbox", onclick: (e)=>{
            e.target.nextElementSibling.disabled = !e.target.nextElementSibling.disabled
        }}];

        switch(key){
            case("ingameid"):
            case("discordid"):
                return [prefix,["input",{type: "text", name: key, value: found[key], disabled: true, required: true}]];
            case("custom_rank"):
                return [prefix, 
                    generateCustomRank({
                        id: found.rankid,
                        name: "custom_rank",
                        isDisabled: true,
                        isRequired: true
                    })];
            case("auto_rank"):
                return [prefix, 
                    generateTrueFalseField({
                        default: found.auto_rank,
                        name: "auto_rank",
                        options: ["Automatic Rank","Custom Rank"],
                        isDisabled: true,
                        isRequired: true
                    })];
            case("leave_date"):
                return [prefix, 
                        ["input",{type: "text", name: key, value: found[key], disabled: true}], 
                        ["p", {innerText: `Today is: ${new Date().toLocaleString('lt', { timeZone: 'GMT' })}`}]];
            case("join_date"):
                return [prefix, ["input", {type: "text", name: key, value: new Date().toLocaleString('lt', { timeZone: 'GMT' }), required: true, disabled: true}]];
            case("note"):
                return [prefix, ["input", {type: "text", name: key, value: found[key], disabled: true}]];
            default:
                return [prefix, ["input",{type: "text", name: key, value: found[key], disabled: true, required: true}]];
        };
    };
};