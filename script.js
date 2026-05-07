// ================= STORAGE =================

let users =
JSON.parse(localStorage.getItem("users")) || [];

let students =
JSON.parse(localStorage.getItem("students")) || [];

let editIndex = null;

const currentUser =
JSON.parse(localStorage.getItem("currentUser"));

// ================= PAGE PROTECTION =================

if (
    location.pathname.includes("dashboard.html")
    && !currentUser
){
    location.href = "login.html";
}

// ================= TOAST =================

function showToast(message,color="#22c55e"){

    const toast =
    document.getElementById("toast");

    if(!toast) return;

    toast.innerText = message;

    toast.style.background = color;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);
}

// ================= REGISTER =================

function registerUser(){

    const username =
    document.getElementById("username")
    .value
    .trim();

    const password =
    document.getElementById("password")
    .value
    .trim();

    const role =
    document.getElementById("role").value;

    if(!username || !password){

        return showToast(
            "Please fill all fields",
            "#ef4444"
        );
    }

    // CHECK DUPLICATE USER

    const exists = users.some(
        user => user.username === username
    );

    if(exists){

        return showToast(
            "Username already exists",
            "#ef4444"
        );
    }

    // HASH PASSWORD

    const hashedPassword =
    CryptoJS.SHA256(password).toString();

    users.push({

        username:username,
        password:hashedPassword,
        role:role

    });

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

    showToast("Registration Successful");

    setTimeout(()=>{

        location.href = "login.html";

    },1200);
}

// ================= LOGIN =================

function login(){

    const username =
    document.getElementById("loginUsername")
    .value
    .trim();

    const password =
    document.getElementById("loginPassword")
    .value
    .trim();

    if(!username || !password){

        return showToast(
            "Please fill all fields",
            "#ef4444"
        );
    }

    const hashedPassword =
    CryptoJS.SHA256(password).toString();

    const user = users.find(user =>

        user.username === username
        &&
        user.password === hashedPassword

    );

    if(!user){

        return showToast(
            "Invalid Credentials",
            "#ef4444"
        );
    }

    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );

    showToast("Login Successful");

    setTimeout(()=>{

        location.href = "dashboard.html";

    },1000);
}

// ================= LOGOUT =================

function logout(){

    localStorage.removeItem("currentUser");

    location.href = "login.html";
}

// ================= ADD STUDENT =================

function addStudent(){

    const name =
    document.getElementById("name")
    .value
    .trim();

    const age =
    document.getElementById("age")
    .value;

    const course =
    document.getElementById("course")
    .value
    .trim();

    if(!name || !age || !course){

        return showToast(
            "Please fill all fields",
            "#ef4444"
        );
    }

    students.push({

        name:name,
        age:Number(age),
        course:course

    });

    clearForm();

    saveData();

    showToast("Student Added");
}

// ================= EDIT STUDENT =================

function editStudent(index){

    if(currentUser.role !== "admin"){

        return showToast(
            "Only Admin Can Edit",
            "#ef4444"
        );
    }

    const student = students[index];

    document.getElementById("name").value =
    student.name;

    document.getElementById("age").value =
    student.age;

    document.getElementById("course").value =
    student.course;

    editIndex = index;

    document.getElementById("updateBtn")
    .style.display = "inline-block";

    window.scrollTo({

        top:0,
        behavior:"smooth"

    });
}

// ================= UPDATE STUDENT =================

function updateStudent(){

    if(editIndex === null) return;

    students[editIndex] = {

        name:
        document.getElementById("name")
        .value
        .trim(),

        age:Number(
            document.getElementById("age")
            .value
        ),

        course:
        document.getElementById("course")
        .value
        .trim()

    };

    editIndex = null;

    document.getElementById("updateBtn")
    .style.display = "none";

    clearForm();

    saveData();

    showToast("Student Updated");
}

// ================= DELETE STUDENT =================

function deleteStudent(index){

    if(currentUser.role !== "admin"){

        return showToast(
            "Only Admin Can Delete",
            "#ef4444"
        );
    }

    const confirmDelete =
    confirm("Delete this student?");

    if(!confirmDelete) return;

    students.splice(index,1);

    saveData();

    showToast(
        "Student Deleted",
        "#ef4444"
    );
}

// ================= DISPLAY STUDENTS =================

function displayStudents(){

    const table =
    document.getElementById("studentList");

    if(!table) return;

    table.innerHTML = "";

    const emptyMsg =
    document.getElementById("emptyMsg");

    if(students.length === 0){

        emptyMsg.style.display = "block";

    }else{

        emptyMsg.style.display = "none";
    }

    students.forEach((student,index)=>{

        let actions = "";

        if(currentUser.role === "admin"){

            actions = `

            <button onclick="editStudent(${index})">

                ✏️ Edit

            </button>

            <button onclick="deleteStudent(${index})">

                ❌ Delete

            </button>

            `;

        }else{

            actions = `

            <span>

                👁 View Only

            </span>

            `;
        }

        table.innerHTML += `

        <tr>

            <td>${student.name}</td>

            <td>${student.age}</td>

            <td>${student.course}</td>

            <td
            style="
            display:flex;
            gap:10px;
            justify-content:center;
            flex-wrap:wrap;
            ">

                ${actions}

            </td>

        </tr>

        `;
    });
}

// ================= SEARCH =================

function searchStudent(){

    const input =
    document.getElementById("search")
    .value
    .toLowerCase();

    const rows =
    document.querySelectorAll("#studentList tr");

    rows.forEach(row=>{

        const text =
        row.innerText.toLowerCase();

        row.style.display =
        text.includes(input)
        ? ""
        : "none";
    });
}

// ================= DASHBOARD =================

function updateDashboard(){

    const totalStudents =
    document.getElementById("totalStudents");

    const avgAge =
    document.getElementById("avgAge");

    const totalCourses =
    document.getElementById("totalCourses");

    if(!totalStudents) return;

    totalStudents.innerText =
    students.length;

    const average =

    students.reduce(

        (sum,student)=>

        sum + Number(student.age || 0),

        0

    ) / (students.length || 1);

    avgAge.innerText =
    average.toFixed(1);

    const uniqueCourses =
    new Set(

        students.map(
            student => student.course
        )
    );

    totalCourses.innerText =
    uniqueCourses.size;
}

// ================= CHARTS =================

let courseChartInstance;
let ageChartInstance;

function updateCharts(){

    if(!window.Chart) return;

    // ===== COURSE DATA =====

    let courseData = {};

    students.forEach(student=>{

        const course =
        student.course || "Unknown";

        courseData[course] =
        (courseData[course] || 0) + 1;
    });

    // DESTROY OLD CHART

    if(courseChartInstance){

        courseChartInstance.destroy();
    }

    // CREATE COURSE CHART

    courseChartInstance = new Chart(

        document.getElementById("courseChart"),

        {

            type:"bar",

            data:{

                labels:Object.keys(courseData),

                datasets:[{

                    label:"Students Per Course",

                    data:Object.values(courseData),

                    borderWidth:2

                }]
            },

            options:{

                responsive:true,

                maintainAspectRatio:false
            }
        }
    );

    // ===== AGE DATA =====

    let ageData = {

        "<20":0,
        "20-25":0,
        "25+":0
    };

    students.forEach(student=>{

        if(student.age < 20){

            ageData["<20"]++;

        }else if(student.age <= 25){

            ageData["20-25"]++;

        }else{

            ageData["25+"]++;
        }
    });

    if(ageChartInstance){

        ageChartInstance.destroy();
    }

    ageChartInstance = new Chart(

        document.getElementById("ageChart"),

        {

            type:"doughnut",

            data:{

                labels:Object.keys(ageData),

                datasets:[{

                    data:Object.values(ageData),

                    borderWidth:2

                }]
            },

            options:{

                responsive:true,

                maintainAspectRatio:false
            }
        }
    );
}

// ================= DARK MODE =================

function toggleDarkMode(){

    document.body.classList.toggle("light");

    document.body.classList.toggle("dark");
}

// ================= CLEAR FORM =================

function clearForm(){

    const name =
    document.getElementById("name");

    const age =
    document.getElementById("age");

    const course =
    document.getElementById("course");

    if(name) name.value = "";

    if(age) age.value = "";

    if(course) course.value = "";
}

// ================= SAVE DATA =================

function saveData(){

    localStorage.setItem(

        "students",

        JSON.stringify(students)
    );

    displayStudents();

    updateDashboard();

    updateCharts();
}

// ================= INIT =================

if(location.pathname.includes("dashboard.html")){

    displayStudents();

    updateDashboard();

    updateCharts();

    if(currentUser.role !== "admin"){

        document.getElementById(
            "adminControls"
        ).style.display = "none";
    }
}