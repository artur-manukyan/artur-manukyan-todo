const refreshIcon = document.querySelector( ".refresh" );
const todayDateElement = document.getElementById( "date" );
const list  = document.getElementById( "list" );
const input = document.getElementById( "input" );
const plusIcon = document.getElementById( "plus-icon" )
const checkedIcon = "fa-check-circle";
const uncheckedIcon = "fa-circle";
const lineThrough = "lineThrough";
let bleepAdd = new Audio();
let bleepComplete = new Audio();
let bleepRefresh = new Audio();
bleepAdd.src = "./Sounds/add.mp3"
bleepComplete.src = "./Sounds/complete.mp3"
bleepRefresh.src = "./Sounds/refresh.mp3"

bleepAdd.muted = false;
bleepComplete.muted = false;

let taskList = [];
let id = 0;

function addListItem( inputText, id, done = false, removed = false ) {
    if ( removed ) {
        return;
    }
    const doneIcon = done ? checkedIcon : uncheckedIcon;
    const lineTheText = done ? lineThrough : "";
    const listItem = `<li class="item draggable" draggable="true">
                        <i class="fa ${doneIcon}" button="complete" id="${id}"></i>
                        <p class="text ${lineTheText}">${inputText}</p>
                        <i class="fa fa-trash-o delete" button="remove" id="${id}"></i>
                    </li>`;
    const position = "beforeend";
    list.insertAdjacentHTML(position, listItem);
};

function completeListItem( element ) {
    element.classList.toggle(checkedIcon);
    element.classList.toggle(uncheckedIcon);
    element.parentNode.querySelector(".text").classList.toggle(lineThrough)
    taskList[element.id].done = taskList[element.id].done ? false : true;
    localStorage.setItem("storedTasks", JSON.stringify(taskList)) 
};

function removeListitem( element ) {
    element.parentNode.parentNode.removeChild( element.parentNode );
    taskList[element.id].removed = true;
    localStorage.setItem("storedTasks", JSON.stringify(taskList))
};

function loadListItems( array ) {
    array.forEach(element => {
       addListItem(element.name, element.id, element.done, element.removed);
   });
};

document.addEventListener( "keyup", function( event ) {
    if ( event.keyCode == 13 ) {
        const inputValue = input.value; 
        if ( inputValue ) {
            addListItem( inputValue, id, done=false, removed=false );
            bleepAdd.play();
            taskList.push(
                {
                    name: inputValue,
                    id: id,
                    done: false,
                    removed: false
                }
            );
        }
        input.value = "";
        id++
    }
    localStorage.setItem("storedTasks", JSON.stringify(taskList))
}); 

plusIcon.addEventListener("click", function( event ) {
    const inputValue = input.value; 
    if ( inputValue ) {
        addListItem( inputValue, id, done=false, removed=false );
        bleepAdd.play();
        taskList.push(
            {
                name: inputValue,
                id: id,
                done: false,
                removed: false
            }
        );
    }
    input.value = "";
    id++
    localStorage.setItem("storedTasks", JSON.stringify(taskList))
});

list.addEventListener("click", function( event ) {
    let element = event.target;
    const elementButton = event.target.attributes.button.value;
    if ( elementButton == "complete") {
        completeListItem( element );
        bleepComplete.play();
    } else if ( elementButton == "remove" ) {
        removeListitem( element );        
    }
});

refreshIcon.addEventListener("click", function() {
    // bleepRefresh.play(); 
    localStorage.clear();
    location.reload();
    // setTimeout(function(){ location.reload(); }, 400);
});

let today = new Date();
let options = {
        weekday: "short",
        month: "short",
        day: "numeric" }
todayDateElement.innerHTML = today.toLocaleDateString("en-US", options)

let fromStorage = localStorage.getItem("storedTasks")
if ( fromStorage ) {
    taskList = JSON.parse( fromStorage );
    loadListItems( taskList );
    id = taskList.length;
} else {
    taskList = [];
    id = 0;
}


// DRAG AND DROP HALF READY :((( 
const draggables = document.querySelectorAll(".draggable");
const dropContainer = document.getElementById("list")

draggables.forEach(draggable => {
    draggable.addEventListener("dragstart", () => {
        draggable.classList.add("now-dragging");
    })

    draggable.addEventListener("dragend", () => {
        draggable.classList.remove("now-dragging");
    })
})

dropContainer.addEventListener("dragover", event => {
    event.preventDefault();
    const afterElement = getDragAfterElement(event.clientY);
    const draggable = document.querySelector(".now-dragging");
    if ( afterElement == null ) {
        dropContainer.appendChild(draggable);
    } else {
        dropContainer.insertBefore(draggable, afterElement);
    }
})

function getDragAfterElement(y) {
    const draggableElements = [...dropContainer.querySelectorAll(".draggable:not(.now-dragging)")]
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2;
        if ( offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
