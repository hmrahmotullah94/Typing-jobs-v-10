/* =====================================
   Typing Jobs Pro v10.0
   MAIN JAVASCRIPT ENGINE
   Made by Rahmotullah
===================================== */


// ====================/* =====================================
   Typing Jobs Pro v10.0
   FINAL JAVASCRIPT ENGINE
   Made by Rahmotullah
===================================== */



// ===============================
// STORAGE
// ===============================

let customs =
JSON.parse(
localStorage.getItem("typing_custom")
) || [];




// ===============================
// VARIABLES
// ===============================

let chars=[];

let timer=null;

let time=0;

let active=false;

let done=false;

let wrongCount=0;

let testMode=false;



// ===============================
// BANGLA GRAPHEME
// ===============================

const segmenter =
new Intl.Segmenter(
"bn",
{
granularity:"grapheme"
}
);




// ===============================
// DOM
// ===============================


const input =
document.getElementById(
"input-area"
);


const display =
document.getElementById(
"display-text"
);





// ===============================
// LESSON DATA
// ===============================


const bnW=[

"বাংলা",
"কম্পিউটার",
"প্রযুক্তি",
"শিক্ষা",
"টাইপিং",
"অনুশীলন",
"বিশ্ববিদ্যালয়",
"গবেষণা",
"বাংলাদেশ",
"স্বাধীনতা",
"সফলতা",
"পরিশ্রম"

];



const enW=[

"computer",
"keyboard",
"typing",
"practice",
"education",
"technology",
"research",
"university",
"success",
"development",
"learning"

];



const bnP=[

"বাংলা ভাষা আমাদের মাতৃভাষা। নিয়মিত অনুশীলনের মাধ্যমে টাইপিং দক্ষতা বৃদ্ধি করা যায়।",

"কম্পিউটার শিক্ষা বর্তমান যুগে অত্যন্ত গুরুত্বপূর্ণ। প্রযুক্তির ব্যবহার জীবনকে সহজ করেছে।",

"পরিশ্রম এবং অধ্যবসায়ের মাধ্যমে সফলতা অর্জন করা সম্ভব।"

];



const enP=[

"Computer education is very important in modern life.",

"Regular practice can improve typing speed and accuracy.",

"Technology has changed the way people work and learn."

];



const meanings={

computer:"গণনা যন্ত্র",

keyboard:"লেখার বোর্ড",

typing:"দ্রুত লেখা",

practice:"অনুশীলন",

education:"শিক্ষা",

technology:"প্রযুক্তি",

research:"গবেষণা",

success:"সফলতা"

};






// ===============================
// INIT APP
// ===============================


function initApp(){


let lang =
document.getElementById("lang").value;


let mode =
document.getElementById("mode").value;


let pool=[];



if(mode==="words"){


let source =
lang==="bn"
?
bnW
:
enW;



pool =
source.map((w,i)=>{


return {

n:"Lesson-"+(i+1),

t:
Array(5)
.fill(w)
.join(" "),

m:
meanings[w] || ""

};


});


}





else if(mode==="para"){


let source =
lang==="bn"
?
bnP
:
enP;



pool =
source.map((p,i)=>{


return {

n:"Paragraph-"+(i+1),

t:p,

m:""

};


});


}





else if(mode==="custom"){


pool =
customs.map((c,i)=>{


return {

n:"Custom-"+(i+1),

t:c,

m:""

};


});


}



window.activePool=pool;



let sel =
document.getElementById(
"lesson-sel"
);



sel.innerHTML =
pool.map((d,i)=>{


return `

<option value="${i}">
${d.n}
</option>

`;

}).join("");



loadLesson();


}






// ===============================
// LOAD LESSON
// ===============================


function loadLesson(){


let index =
document.getElementById(
"lesson-sel"
).value;


let data =
window.activePool[index];


if(!data)
return;



chars =
Array.from(
segmenter.segment(data.t)
)
.map(x=>x.segment);




display.innerHTML =
chars.map((c,i)=>{


return `

<span 
id="c-${i}"
class="char ${i===0?'current':''}">
${c}
</span>

`;


}).join("");



document.getElementById(
"meaning-display"
).innerHTML =
data.m
?
"অর্থ: "+data.m
:
"";



resetApp();


}







// ===============================
// RESET
// ===============================


function resetApp(){


clearInterval(timer);


time=0;

active=false;

done=false;

wrongCount=0;


input.value="";



document.getElementById(
"st-time"
).innerHTML=0;


document.getElementById(
"st-wpm"
).innerHTML=0;


document.getElementById(
"st-acc"
).innerHTML="100%";


document.getElementById(
"st-wrong"
).innerHTML=0;



chars.forEach((c,i)=>{


let el =
document.getElementById(
"c-"+i
);



if(el){

el.className =
i===0
?
"char current"
:
"char";

}


});


input.focus();


}








// ===============================
// TYPING EVENT
// ===============================


input.addEventListener(
"input",
()=>{


if(!active && input.value){


active=true;


timer=setInterval(()=>{


time++;


document.getElementById(
"st-time"
).innerHTML=time;


calculateWPM();


},1000);


}



checkTyping();


});







// ===============================
// CHECK
// ===============================


function checkTyping(){


let typed =
Array.from(
segmenter.segment(
input.value
)
)
.map(x=>x.segment);



let correct=0;

wrongCount=0;



chars.forEach((c,i)=>{


let el =
document.getElementById(
"c-"+i
);


if(!el)
return;



if(i < typed.length){


if(c===typed[i]){


correct++;

el.className="char correct";


}

else{


wrongCount++;

el.className="char wrong";


}


}


else if(i===typed.length){


el.className="char current";


}

else{


el.className="char";


}


});




if(typed.length){


let acc =
Math.round(
(correct/typed.length)*100
);


document.getElementById(
"st-acc"
).innerHTML=
acc+"%";


}



document.getElementById(
"st-wrong"
).innerHTML=
wrongCount;




if(
typed.length>=chars.length
&& chars.length
){


finish();


}



}








// ===============================
// WPM
// ===============================


function calculateWPM(){


if(!time)
return;


let count =
Array.from(
segmenter.segment(
input.value
)
).length;



let wpm =
Math.round(
(count/5)/(time/60)
);



document.getElementById(
"st-wpm"
).innerHTML =
wpm || 0;


}







// ===============================
// FINISH
// ===============================


function finish(){


if(done)
return;


done=true;


clearInterval(timer);



document.getElementById(
"res-data"
).innerHTML=

`

Speed:
<b>${document.getElementById("st-wpm").innerHTML} WPM</b>

<br><br>

Accuracy:
<b>${document.getElementById("st-acc").innerHTML}</b>

<br><br>

Wrong:
<b>${wrongCount}</b>

<br><br>

Time:
<b>${time} Seconds</b>

`;



document.getElementById(
"modal"
).style.display="flex";


}







// ===============================
// BUTTONS
// ===============================


document.getElementById(
"closeModal"
).onclick=()=>{


document.getElementById(
"modal"
).style.display="none";


};






document.getElementById(
"resetBtn"
).onclick=()=>{


resetApp();


};






document.getElementById(
"testBtn"
).onclick=function(){


testMode=!testMode;


if(testMode){


this.innerHTML=
"⏹ Stop Test";


document.getElementById(
"testStatus"
).innerHTML=
"Typing Test Running";


input.focus();


}

else{


this.innerHTML=
"▶ Start Test";


document.getElementById(
"testStatus"
).innerHTML=
"Typing Test Ready";


}


};







// ===============================
// CUSTOM
// ===============================


document.getElementById(
"saveCustom"
).onclick=()=>{


let text =
document.getElementById(
"c-in"
).value.trim();



if(text){


customs.push(text);


localStorage.setItem(
"typing_custom",
JSON.stringify(customs)
);


document.getElementById(
"c-in"
).value="";


renderC();

initApp();


}


};







function renderC(){


let box =
document.getElementById(
"c-list"
);


if(!box)
return;



box.innerHTML =
customs.map((c,i)=>{


return `

<div>

${c.substring(0,25)}

<button onclick="deleteCustom(${i})">
X
</button>

</div>

`;

}).join("");



}



function deleteCustom(i){


customs.splice(i,1);


localStorage.setItem(
"typing_custom",
JSON.stringify(customs)
);


renderC();

initApp();


}





// ===============================
// SETTINGS
// ===============================


document.getElementById(
"settingBtn"
).onclick=()=>{


document.getElementById(
"side"
).classList.toggle(
"active"
);


};





document.getElementById(
"f-size"
).onchange=function(){


display.style.fontSize=
this.value+"px";


input.style.fontSize=
this.value+"px";


};






document.getElementById(
"f-style"
).onchange=function(){


display.style.fontFamily=
this.value;


input.style.fontFamily=
this.value;


};






document.getElementById(
"t-style"
).onchange=function(){


document.documentElement
.setAttribute(
"data-theme",
this.value
);


};






// ===============================
// SELECT
// ===============================


document.getElementById(
"lang"
).onchange=initApp;


document.getElementById(
"mode"
).onchange=initApp;


document.getElementById(
"lesson-sel"
).onchange=loadLesson;






// ===============================
// PWA INSTALL
// ===============================


let deferredPrompt=null;



window.addEventListener(
"beforeinstallprompt",
(e)=>{


e.preventDefault();


deferredPrompt=e;


});




document.getElementById(
"installButton"
).onclick=async()=>{


if(!deferredPrompt){


alert(
"Chrome Menu থেকে Install App নির্বাচন করুন"
);


return;


}



deferredPrompt.prompt();


await deferredPrompt.userChoice;


deferredPrompt=null;


};







// ===============================
// SERVICE WORKER
// ===============================


if(
"serviceWorker" in navigator
){


window.addEventListener(
"load",
()=>{


navigator.serviceWorker.register(
"./service-worker.js"
);


});


}








// ===============================
// START
// ===============================


window.onload=()=>{


renderC();

initApp();


};==========
// STORAGE
// ===============================

let customs = JSON.parse(
    localStorage.getItem("typing_custom")
) || [];


// ===============================
// VARIABLES
// ===============================

let chars = [];

let timer = null;

let time = 0;

let active = false;

let done = false;

let wrongCount = 0;


// ===============================
// BANGLA GRAPHEME SUPPORT
// ===============================

const segmenter = new Intl.Segmenter(
    "bn",
    {
        granularity:"grapheme"
    }
);



// ===============================
// DOM
// ===============================

const input =
document.getElementById("input-area");


const display =
document.getElementById("display-text");




// ===============================
// LESSON DATA
// ===============================


const bnW = [

"বাংলা",
"কম্পিউটার",
"প্রযুক্তি",
"শিক্ষা",
"টাইপিং",
"অনুশীলন",
"বিশ্ববিদ্যালয়",
"গবেষণা",
"বাংলাদেশ",
"স্বাধীনতা",
"সফলতা",
"পরিশ্রম",
"অধ্যবসায়"

];



const enW = [

"computer",
"keyboard",
"typing",
"practice",
"education",
"technology",
"research",
"university",
"success",
"development",
"learning"

];





const bnP = [

"বাংলা ভাষা আমাদের মাতৃভাষা। নিয়মিত অনুশীলনের মাধ্যমে টাইপিং দক্ষতা বৃদ্ধি করা যায়।",

"কম্পিউটার শিক্ষা বর্তমান যুগে অত্যন্ত গুরুত্বপূর্ণ। প্রযুক্তির ব্যবহার জীবনকে সহজ করেছে।",

"পরিশ্রম এবং অধ্যবসায়ের মাধ্যমে সফলতা অর্জন করা সম্ভব।"

];





const enP = [

"Computer education is very important in modern life.",

"Regular practice can improve typing speed and accuracy.",

"Technology has changed the way people work and learn."

];





const meanings = {

computer:"গণনা যন্ত্র",

keyboard:"লেখার বোর্ড",

typing:"দ্রুত লেখা",

practice:"অনুশীলন",

education:"শিক্ষা",

technology:"প্রযুক্তি",

research:"গবেষণা",

success:"সফলতা"

};






// ===============================
// INIT APP
// ===============================


function initApp(){


let lang =
document.getElementById("lang").value;


let mode =
document.getElementById("mode").value;


let pool=[];



// WORD MODE

if(mode==="words"){


let source =
lang==="bn"
?
bnW
:
enW;



pool =
source.map((w,i)=>{


let text;


if(lang==="en"){


text =
Array(5)
.fill(w)
.join(" ");


}
else{


text =
Array(5)
.fill(w)
.join(" ");


}



return {

n:"Lesson-"+(i+1),

t:text,

m:
meanings[w] || ""

};


});


}




// PARAGRAPH MODE

else if(mode==="para"){


let source =
lang==="bn"
?
bnP
:
enP;



pool =
source.map((p,i)=>{


return {

n:"Paragraph-"+(i+1),

t:p,

m:""

};


});


}




// CUSTOM MODE

else if(mode==="custom"){


pool =
customs.map((c,i)=>{


return {


n:"Custom-"+(i+1),

t:c,

m:""

};


});


}




window.activePool = pool;



let sel =
document.getElementById("lesson-sel");



sel.innerHTML =
pool.map((d,i)=>{


return `

<option value="${i}">
${d.n}
</option>

`;


}).join("");



loadLesson();


}







// ===============================
// LOAD LESSON
// ===============================


function loadLesson(){


let index =
document.getElementById("lesson-sel").value;



let data =
window.activePool[index];



if(!data)
return;



chars =
Array.from(
segmenter.segment(data.t)
)
.map(x=>x.segment);




display.innerHTML =

chars.map((c,i)=>{


return `

<span 
id="c-${i}"
class="char ${i===0?'current':''}">

${c}

</span>

`;



}).join("");





document.getElementById(
"meaning-display"
).innerHTML =

data.m
?
"অর্থ: "+data.m
:
"";



resetApp();


}






// ===============================
// RESET
// ===============================


function resetApp(){


clearInterval(timer);


time=0;

active=false;

done=false;

wrongCount=0;


input.value="";



document.getElementById("st-time").innerHTML=0;

document.getElementById("st-wpm").innerHTML=0;

document.getElementById("st-acc").innerHTML="100%";

document.getElementById("st-wrong").innerHTML=0;



chars.forEach((c,i)=>{


let el =
document.getElementById("c-"+i);


if(el){


el.className =
i===0
?
"char current"
:
"char";


}


});


input.focus();


}
// ===============================
// INPUT EVENT
// ===============================


input.addEventListener(
"input",
()=>{


if(!active && input.value.length>0){


active=true;


timer=setInterval(()=>{


time++;


document.getElementById(
"st-time"
).innerHTML=time;


calculateWPM();


},1000);


}


checkTyping();


});





// ===============================
// TYPING CHECK
// ===============================


function checkTyping(){


let typed =
Array.from(
segmenter.segment(input.value)
)
.map(x=>x.segment);



let correct=0;


wrongCount=0;



chars.forEach((c,i)=>{


let el =
document.getElementById(
"c-"+i
);



if(!el)
return;



if(i < typed.length){


if(c===typed[i]){


correct++;


el.className=
"char correct";


}

else{


wrongCount++;


el.className=
"char wrong";


}


}


else if(i===typed.length){


el.className=
"char current";


}

else{


el.className="char";


}


});





if(typed.length>0){


let acc =
Math.round(
(correct / typed.length)*100
);



document.getElementById(
"st-acc"
).innerHTML=
acc+"%";


}



document.getElementById(
"st-wrong"
).innerHTML=
wrongCount;





if(
typed.length>=chars.length &&
chars.length>0
){


finish();


}



}







// ===============================
// WPM CALCULATION
// ===============================


function calculateWPM(){


if(time<=0)
return;



let count =
Array.from(
segmenter.segment(input.value)
)
.length;



let wpm =
Math.round(
(count/5)/(time/60)
);



document.getElementById(
"st-wpm"
).innerHTML =
wpm || 0;



}







// ===============================
// FINISH RESULT
// ===============================


function finish(){


if(done)
return;



done=true;


active=false;


clearInterval(timer);



document.getElementById(
"res-data"
).innerHTML=

`

Speed :
<b>
${document.getElementById("st-wpm").innerHTML}
WPM
</b>

<br><br>

Accuracy :
<b>
${document.getElementById("st-acc").innerHTML}
</b>

<br><br>

Wrong :
<b>
${wrongCount}
</b>

<br><br>

Time :
<b>
${time}
Seconds
</b>

`;



document.getElementById(
"modal"
).style.display="flex";


}







// ===============================
// NEXT LESSON
// ===============================


function nextLesson(){


document.getElementById(
"modal"
).style.display="none";



let sel =
document.getElementById(
"lesson-sel"
);



if(sel.options.length){


sel.selectedIndex =
(sel.selectedIndex+1)
%
sel.options.length;



}



loadLesson();


}







// ===============================
// MODAL CLOSE
// ===============================


document.getElementById(
"closeModal"
)
.onclick=()=>{


document.getElementById(
"modal"
).style.display="none";


};







// ===============================
// ENTER + ESC CONTROL
// ===============================


input.addEventListener(
"keydown",
(e)=>{


if(e.key==="Enter"){


e.preventDefault();



if(done){

nextLesson();

}


}



});




window.addEventListener(
"keydown",
(e)=>{


if(e.key==="Escape"){

resetApp();

}


});








// ===============================
// CUSTOM SAVE
// ===============================


document.getElementById(
"saveCustom"
)
.onclick=()=>{


let text =
document.getElementById(
"c-in"
).value.trim();



if(text){


customs.push(text);



localStorage.setItem(
"typing_custom",
JSON.stringify(customs)
);



document.getElementById(
"c-in"
).value="";



renderC();


initApp();


}



};






// ===============================
// CUSTOM LIST
// ===============================


function renderC(){


let box =
document.getElementById(
"c-list"
);



if(!box)
return;



box.innerHTML =
customs.map((c,i)=>{


return `

<div style="
padding:8px;
margin:5px 0;
background:#eee;
border-radius:8px;
">


${c.substring(0,25)}...


<button 
onclick="deleteCustom(${i})">

X

</button>


</div>

`;



}).join("");



}







function deleteCustom(i){


customs.splice(i,1);


localStorage.setItem(
"typing_custom",
JSON.stringify(customs)
);



renderC();


initApp();


}








// ===============================
// FONT SIZE
// ===============================


document.getElementById(
"f-size"
)
.onchange=function(){


display.style.fontSize=
this.value+"px";


input.style.fontSize=
this.value+"px";


};







// ===============================
// FONT STYLE
// ===============================


document.getElementById(
"f-style"
)
.onchange=function(){


display.style.fontFamily=
this.value;


input.style.fontFamily=
this.value;


};







// ===============================
// THEME
// ===============================


document.getElementById(
"t-style"
)
.onchange=function(){


document.documentElement
.setAttribute(
"data-theme",
this.value
);


};







// ===============================
// SIDEBAR
// ===============================


document.getElementById(
"settingBtn"
)
.onclick=()=>{


document.getElementById(
"side"
)
.classList.toggle(
"active"
);


};








// ===============================
// SELECT CHANGE
// ===============================


document.getElementById(
"lang"
)
.onchange=initApp;



document.getElementById(
"mode"
)
.onchange=initApp;



document.getElementById(
"lesson-sel"
)
.onchange=loadLesson;








// ===============================
// PWA INSTALL
// ===============================


let deferredPrompt=null;



window.addEventListener(
"beforeinstallprompt",
(e)=>{


e.preventDefault();


deferredPrompt=e;


});





document.getElementById(
"installButton"
)
.onclick=async()=>{


if(!deferredPrompt){


alert(
"Chrome Menu থেকে Install App নির্বাচন করুন"
);


return;


}



deferredPrompt.prompt();



await deferredPrompt.userChoice;



deferredPrompt=null;


};







// ===============================
// SERVICE WORKER
// ===============================


if(
"serviceWorker" in navigator
){


window.addEventListener(
"load",
()=>{


navigator.serviceWorker.register(
"./service-worker.js"
)
.then(()=>{

console.log(
"Service Worker Ready"
);


})
.catch(err=>{

console.log(err);

});


});


}







// ===============================
// START APP
// ===============================


window.onload=()=>{


renderC();


initApp();


};