let tables = document.querySelectorAll(".table");

let popup = document.getElementById("popup");

let selectedTable;

let selectedName =
document.getElementById("selectedTable");


let bookings =
JSON.parse(localStorage.getItem("bookings")) || {};


// Load booked tables

tables.forEach(table => {

    let number = table.dataset.table;

    if(bookings[number]){
        table.classList.add("booked");
    }


    table.onclick = () => {


        if(table.classList.contains("booked")){
            return;
        }


        selectedTable = number;

        selectedName.textContent = number;


        table.classList.add("selected");


        popup.style.display="flex";


    }

});


// Play button

document.getElementById("play").onclick=()=>{

    document.getElementById("details")
    .classList.remove("hidden");

};



// Book button

document.getElementById("book").onclick = () => {


    let firstName =
    document.getElementById("firstName").value.trim();


    let lastName =
    document.getElementById("lastName").value.trim();


    let time =
    document.getElementById("time").value;



    // Check required fields

    if(
        firstName === "" ||
        lastName === "" ||
        time === ""
    ){

        alert(
        "Please enter your first name, last name, and booking time."
        );

        return;

    }



    let booking = {

        people:
        document.getElementById("people").value,

        firstName:firstName,

        lastName:lastName,

        time:time

    };



    bookings[selectedTable] = booking;



    localStorage.setItem(
        "bookings",
        JSON.stringify(bookings)
    );



    document
    .querySelector(`[data-table="${selectedTable}"]`)
    .classList.remove("selected");


    document
    .querySelector(`[data-table="${selectedTable}"]`)
    .classList.add("booked");


    popup.style.display="none";

};