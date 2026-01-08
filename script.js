let userStarted = false; // 🔑 tracks if user tapped to start
let voiceStarted = false; // 🔑 ensure voice only once
document.addEventListener("DOMContentLoaded", () => {
  unlockAndStartAudio();
});
const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const question = document.getElementById("surpriseQuestion");
const buttonsWrap = document.getElementById("surpriseButtons");

const song1 = document.getElementById("song1");
const song2 = document.getElementById("song2");
const voice = document.getElementById("voiceNote");

/* ===========================
   BACKGROUND FADE SLIDESHOW
=========================== */

const bgImages = document.querySelectorAll(".bg-img");
let bgIndex = 0;

function startBackgroundSlideshow() {
  if (bgImages.length <= 1) return;

  setInterval(() => {
    bgImages[bgIndex].classList.remove("active");
    bgIndex = (bgIndex + 1) % bgImages.length;
    bgImages[bgIndex].classList.add("active");
  }, 5000); // 5 sec per image (adjust if needed)
}
// ===========================
// AUDIO STEP 1 — TAP BUTTON
// ===========================
const tapOverlay = document.getElementById("tap");

function unlockAndStartAudio() {
  tapOverlay.addEventListener("click", () => {
    if (userStarted) return;
    userStarted = true;

    tapOverlay.style.display = "none";
    document.body.classList.remove("locked");

    // 🔓 UNIVERSAL AUDIO UNLOCK (iOS SAFE)
    [song1, song2, voice].forEach(a => {
      a.muted = true;
      a.currentTime = 0;
      a.play().catch(()=>{});
      a.pause();
      a.muted = false;
    });

    // ▶️ Start song1 for real
    song1.currentTime = 0;
    song1.volume = 1;
    song1.loop = false;
    song1.play();
    startBackgroundSlideshow();

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  });
}

// ===========================
// TIMER STEP 2
// ===========================
const hours   = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");

const target = new Date("January 18, 2026 00:00:00").getTime();
let step3Started = false;

const timerInterval = setInterval(() => {
  if (step3Started) { clearInterval(timerInterval); return; }
  const diff = target - Date.now();
  if (diff <= 0) startStep3();

  hours.textContent = String(Math.floor(diff / 3600000)).padStart(2, "0");
  minutes.textContent = String(Math.floor(diff % 3600000 / 60000)).padStart(2, "0");
  seconds.textContent = String(Math.floor(diff % 60000 / 1000)).padStart(2, "0");
}, 1000);

// ===========================
// STEP 3 — song2 auto-play 
// ===========================
function startStep3() {
  step3Started = true;
  document.getElementById("timer-wrapper").remove();

  song1.pause();

  song2.currentTime = 57;
  song2.loop = true;
  song2.volume = 1;
  song2.play().catch(err => {
    console.warn("song2 autoplay blocked?", err);
  });

  createTexts();
  initCanvasCelebration();
}

// ===========================
// TEXTS
// ===========================
function createTexts() {
  const t1 = document.createElement("div");
  t1.id = "mainText"; t1.className = "text";
  t1.textContent = "Happy Birthday Bachha 🎂";
  document.body.appendChild(t1);

  const t2 = document.createElement("div");
  t2.id = "subText"; t2.className = "text";
  t2.style.transition = "opacity 1s ease";
  t2.innerHTML = "Shyd ha tuza 4th birthday aahe jevha pasun aapn sobt aaho<br>aani mi promise krto ki aaj pasun tuzya har b'day aapn sobt midun mnvu";
  document.body.appendChild(t2);

  setTimeout(() => {
    t2.textContent = "I LOVE UHH SO MUCH..";
    onILoveYouTextShown();
  }, 13000);
}

// ===========================
// The rest of your JS (canvas, letters, yes/no flows, photo montage, dust) 
// remains exactly same, no changes needed except for the initial tap logic
// ===========================

/* ===========================
   CANVAS CELEBRATION
=========================== */
function initCanvasCelebration() {
  const canvas = document.getElementById("celebrationCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = innerWidth; canvas.height = innerHeight;

  const balloons = [], fireworks = [];
  const BALLOON_COUNT = 18;
  const colors = ["#ff2d2d","#ff5c8a"];

  for(let i=0;i<BALLOON_COUNT;i++){
    balloons.push({
      x:Math.random()*canvas.width,
      y:canvas.height+Math.random()*300,
      r:26+Math.random()*10,
      speed:3+Math.random()*1.5,
      drift:(Math.random()-0.5)*0.6,
      color:colors[Math.floor(Math.random()*colors.length)],
      phase:Math.random()*Math.PI*2,
      opacity:0.85
    });
  }

  for(let i=0;i<8;i++){
    fireworks.push({
      x:canvas.width/2+(Math.random()-0.5)*200,
      y:canvas.height/2+(Math.random()-0.5)*200,
      sparks:Array.from({length:40},()=>({x:0,y:0,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8,life:90}))
    });
  }

  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    balloons.forEach(b=>{
      b.y-=b.speed; b.phase+=0.05; b.x+=b.drift+Math.sin(b.phase)*0.6;

      ctx.globalAlpha = b.opacity;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.fill();

      ctx.strokeStyle="rgba(255,255,255,0.9)";
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(b.x,b.y+b.r);
      const ctrlX = b.x + Math.sin(b.phase)*10;
      const ctrlY = b.y + b.r + 18 + Math.cos(b.phase)*6;
      ctx.quadraticCurveTo(ctrlX,ctrlY,b.x,b.y+b.r+32);
      ctx.stroke();

      ctx.globalAlpha=1;
    });

    fireworks.forEach(f=>{
      f.sparks.forEach(s=>{
        s.life--; s.x+=s.vx; s.y+=s.vy; s.vy+=0.04;
        ctx.fillStyle=`rgba(255,190,140,${s.life/90})`;
        ctx.beginPath(); ctx.arc(f.x+s.x,f.y+s.y,2,0,Math.PI*2); ctx.fill();
      });
      f.sparks=f.sparks.filter(s=>s.life>0);
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ===========================
   LETTER SEQUENCE
=========================== */
function onILoveYouTextShown() {
  clearTimeout(window.__letterTimeout);
  window.__letterTimeout = setTimeout(() => {
    showLetterTemplate();
  }, 4000);
}

function showLetterTemplate() {
  const subText = document.getElementById("subText");
  if (subText) {
    subText.style.opacity = "0";
    setTimeout(() => subText.remove(), 1200);
  }

  const mainText = document.getElementById("mainText");
  if (mainText) mainText.style.opacity = "1";

  const overlay = document.getElementById("letterOverlay");
  const flash = document.getElementById("whiteFlash");
  const letter = document.getElementById("letterContainer");

  if (!overlay || !flash || !letter) return console.error("STEP 4 elements missing");

  overlay.style.display = "flex";
  overlay.classList.add("active");
  overlay.getBoundingClientRect();
  flash.style.opacity = "0";
  letter.style.opacity = "1";
  letter.style.transform = "scale(1) translateY(0)";
}

const letterText = document.getElementById("letterText");
const cta = document.getElementById("letterCTA");
let lines = letterText.querySelectorAll("p");
lines.forEach((line, i) => line.style.animationDelay = `${i*0.4}s`);

letterText.addEventListener("scroll", () => {
  if (letterText.scrollTop + letterText.clientHeight >= letterText.scrollHeight - 5) cta.style.opacity = "1";
});

cta.addEventListener("click", () => {
  const letter = document.getElementById("letterContainer");
  const overlay = document.getElementById("letterOverlay");

  letter.style.opacity = "0";
  letter.style.transform = "scale(0.85) translateY(30px)";

  setTimeout(() => {
    letter.remove();
    overlay.style.display = "none";
    overlay.classList.remove("active");
    showSurpriseQuestion();
  }, 800);
});

/* ===========================
   YES/NO SURPRISE QUESTION
=========================== */
function showSurpriseQuestion() {
  document.body.classList.add("surprise-active");

  const overlay = document.getElementById("surpriseOverlay");
  const questionDiv = document.getElementById("surpriseQuestion");
  const buttons = document.getElementById("surpriseButtons");

  overlay.style.display = "flex";
  questionDiv.textContent = "";
  buttons.style.display = "none";

  const questionText = "Kay tu mazya sobt hmesha sathi rahshil..?";
  let i = 0;

  const typer = setInterval(() => {
    if (i < questionText.length) questionDiv.textContent += questionText[i++];
    else {
      clearInterval(typer);
      setTimeout(() => buttons.style.display = "flex", 1000);
    }
  }, 120);
}

/* ===========================
   TYPEWRITER HELPERS
=========================== */
function typeText(el, text, speed=45, cb){
  el.innerHTML="";
  let i=0;
  const t=setInterval(()=>{
    if(text.substring(i,i+4)==="<br>"){ el.innerHTML+="<br>"; i+=4; }
    else el.innerHTML+=text.charAt(i++);
    if(i>=text.length){ clearInterval(t); cb&&cb(); }
  }, speed);
}

const canvas = document.getElementById("celebrationCanvas");
const grandEnding = document.getElementById("grandEnding");
const grandText = document.getElementById("grandText");

function typeGrandText(text,speed=50){
  grandText.textContent="";
  let i=0;
  const t=setInterval(()=>{
    grandText.textContent+=text.charAt(i++);
    if(i>=text.length) clearInterval(t);
  }, speed);
}

/* ===========================
   YES FLOW
=========================== */
yesBtn.addEventListener("click", ()=>{
  question.style.opacity="1";
  question.style.transition="none";
  buttonsWrap.style.opacity="0";
  buttonsWrap.style.pointerEvents="none";

  canvas.classList.add("foreground");
  canvas.width=canvas.width;
  startLoveCelebration();

  const yesTexts=[
    "Tuzya jvd dusra option bhi nahi aahe maa😅",
    "Bs ha jnm kadun ghe ks bhi<br>mazya sobt 🫶",
    "I love youhh so much 💖"
  ];

  let i=0;
  function next(){
    if(i>=yesTexts.length){
      setTimeout(()=>{
        question.style.transition="opacity 1.2s ease";
        question.style.opacity="0";
        setTimeout(showGrandEnding,1200);
      },4000);
      return;
    }
    typeText(question,yesTexts[i++],70,()=>setTimeout(next,2000));
  }
  next();
});

/* ===========================
   HEART CELEBRATION
=========================== */
function startLoveCelebration(){
  const ctx=canvas.getContext("2d");
  canvas.width=innerWidth;
  canvas.height=innerHeight;

  const hearts=Array.from({length:30},()=>({
    x:canvas.width/2,
    y:canvas.height/2,
    s:12+Math.random()*10,
    vx:(Math.random()-0.5)*4,
    vy:(Math.random()-0.5)*4,
    life:120
  }));

  function drawHeart(x,y,s){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(s/20,s/20);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(-10,-10,-20,5,0,20);
    ctx.bezierCurveTo(20,5,10,-10,0,0);
    ctx.fillStyle="rgba(255,80,120,0.9)";
    ctx.fill();
    ctx.restore();
  }

  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    hearts.forEach(h=>{
      h.x+=h.vx;
      h.y+=h.vy;
      h.vy+=0.02;
      h.life--;
      drawHeart(h.x,h.y,h.s);
    });
    if(hearts.some(h=>h.life>0)) requestAnimationFrame(animate);
  }
  animate();
}

/* ===========================
   GRAND ENDING
=========================== */
function showGrandEnding(){
  grandEnding.style.display="flex";
  requestAnimationFrame(()=>grandEnding.classList.add("show"));

  const text="Happy Birthday 🎂 Betaa.. Enjoy Your Special Day 🤞🧿 And Stay With Me Forever";
  typeGrandText(text,70);

  setTimeout(()=>{
    grandEnding.classList.remove("show");

    const surpriseOverlay=document.getElementById("surpriseOverlay");
    if(surpriseOverlay){
      surpriseOverlay.style.opacity="0";
      setTimeout(()=>{surpriseOverlay.style.display="none"},600);
    }

    document.getElementById("bg").style.display="none";
    startPhotoMontage();
    setTimeout(()=>grandEnding.style.display="none",600);

  },10000);
}

/* ===========================
   PHOTO MONTAGE
=========================== */
const photos=["assets/images/p01.jpg","assets/images/p02.jpg","assets/images/p03.jpg","assets/images/p04.jpg","assets/images/p05.jpg","assets/images/p06.jpg","assets/images/p07.jpg","assets/images/p08.jpg","assets/images/p09.jpg"];
let pIndex=0;
let activeImg=document.getElementById("imgA");
let idleImg=document.getElementById("imgB");

function startPhotoMontage(){
  const montage=document.getElementById("photoMontage");
  document.getElementById("lightLeak").style.opacity="1";
  montage.classList.add("show");
  montage.style.pointerEvents="none";

  pIndex=0;
  activeImg=document.getElementById("imgA");
  idleImg=document.getElementById("imgB");
  nextPhoto();
}

function nextPhoto(){
  const floodlight=document.getElementById("floodlight");

  idleImg.src = photos[pIndex];

// 🎥 Random Ken Burns pan
idleImg.style.setProperty("--pan-x", `${(Math.random()*6-3).toFixed(2)}%`);
idleImg.style.setProperty("--pan-y", `${(Math.random()*6-3).toFixed(2)}%`);

idleImg.classList.add("active","flood");

  floodlight.style.opacity="1";

  setTimeout(()=>{
    floodlight.style.opacity="0";
    activeImg.classList.remove("active","flood");
    [activeImg,idleImg]=[idleImg,activeImg];
  },350);

  pIndex++;
  if(pIndex>=photos.length){
    pIndex=0;
    if(!voiceStarted){
      voiceStarted=true;
      startVoicePhaseWithSoftDim();
    }
  }

  setTimeout(nextPhoto,2800);
}

/* ===========================
   VOICE PHASE
=========================== */
function startVoicePhaseWithSoftDim(){
  const montage = document.getElementById("photoMontage");
  const voice = document.getElementById("voiceNote");
  const text = document.getElementById("voiceText");

  // Start blur + dim
  montage.style.filter = "blur(6px) brightness(0.75)";
  montage.style.transition = "filter 1.2s ease";

  // Show voice text
  text.style.display = "flex";
  requestAnimationFrame(() => text.style.opacity = "1");

  const originalVolume = song2.volume || 1;
  let v = originalVolume;

  // Fade song2 down
  const down = setInterval(() => {
    v -= 0.07;
    song2.volume = Math.max(0.2, v);
    if (v <= 0.2) clearInterval(down);
  }, 60);

  voice.currentTime = 0;
  voice.play();

  // When voice ends
  voice.onended = () => {
    // Restore song2 volume
    let up = song2.volume;
    const restore = setInterval(() => {
      up += 0.07;
      song2.volume = Math.min(originalVolume, up);
      if (up >= originalVolume) clearInterval(restore);
    }, 60);

    // ✅ Fade out voice text
    text.style.opacity = "0";
    setTimeout(() => text.style.display = "none", 1200);

    // ✅ Remove blur + dim from montage
    montage.style.filter = "blur(0px) brightness(1)";
  };
}

/* ===========================
   NO FLOW (FUN)
=========================== */
let noCount=0;
noBtn.addEventListener("click",()=>{
  noCount++;
  if(noCount===1) typeText(question,"Arey arey 😳 ekda parat vichar kar…");
  else if(noCount===2) typeText(question,"Thoda attitude jast zala ka? 😏");
  else if(noCount===3) moveNoButton();
  else setTimeout(()=>yesBtn.click(),900);
});

function moveNoButton(){
  noBtn.style.position="fixed";
  noBtn.style.left=Math.random()*(innerWidth-noBtn.offsetWidth)+"px";
  noBtn.style.top=Math.random()*(innerHeight-noBtn.offsetHeight)+"px";
}

/* ===========================
   DUST ANIMATION
=========================== */
const dustCanvas=document.getElementById("dustCanvas");
const dctx=dustCanvas.getContext("2d");
dustCanvas.width=innerWidth;
dustCanvas.height=innerHeight;

const dust=Array.from({length:120},()=>({
  x:Math.random()*dustCanvas.width,
  y:Math.random()*dustCanvas.height,
  r:Math.random()*1.6+0.4,
  vx:(Math.random()-0.5)*0.15,
  vy:(Math.random()-0.5)*0.15,
  a:Math.random()*0.4
}));

let dustBoost=0;

function animateDust(){
  dctx.clearRect(0,0,dustCanvas.width,dustCanvas.height);
  dust.forEach(p=>{
    p.x+=p.vx;
    p.y+=p.vy;
    if(p.x<0) p.x=dustCanvas.width;
    if(p.y<0) p.y=dustCanvas.height;
    dctx.fillStyle=`rgba(255,255,255,${p.a+dustBoost})`;
    dctx.beginPath();
    dctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    dctx.fill();
  });
  requestAnimationFrame(animateDust);
}
animateDust();

/* ===========================
   CROSSFADE AUDIO
=========================== */
function crossFadeAudio(out,inAud){
  inAud.volume = 0;
  inAud.play();
  let v = 1;
  const fade = setInterval(() => {
    v -= 0.05;
    out.volume = Math.max(0, v);
    inAud.volume = Math.min(1, 1 - v);
    if(v <= 0){ 
      out.pause(); 
      clearInterval(fade); 
    }
  }, 60); // example: 60ms per step
}

