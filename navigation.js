function showPage(page){

let pages=document.getElementsByClassName("page");

for(let i=0;i<pages.length;i++){

pages[i].style.display="none";

}

document.getElementById(page).style.display="block";

let buttons=document.getElementsByClassName("navbtn");

for(let b of buttons){
b.classList.remove("active");
}

document.getElementById("btn_"+page).classList.add("active");

window.scrollTo(0,0);

}