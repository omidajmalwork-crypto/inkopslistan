// -------- Language dictionary --------
const dict = {
  en: {
    title  :'🛒 Grocery List',
    add    :'Add',
    placeholder:'Paste or type…',
    switch :'Svenska',
    clear  :'🗑 Clear all',
    confirm:'Clear the entire list?'
  },
  sv: {
    title  :'🛒 Inköpslista',
    add    :'Lägg till',
    placeholder:'Klistra in eller skriv…',
    switch :'English',
    clear  :'🗑 Rensa allt',
    confirm:'Rensa hela listan?'
  }
};

let lang='en';
function toggleLang(){
  lang = lang==='en'?'sv':'en';
  document.querySelector('.lang-switch').textContent = dict[lang].switch;

  document.getElementById('title').textContent    = dict[lang].title;
  document.getElementById('addBtn').textContent   = dict[lang].add;
  document.getElementById('inp').placeholder      = dict[lang].placeholder;
  document.getElementById('clearBtn').textContent = dict[lang].clear;
}

// -------- Grocery List --------
const k='groceries';
const list = document.getElementById('list');
const inp = document.getElementById('inp');

function load(){
  const arr=JSON.parse(localStorage.getItem(k)||'[]');
  list.innerHTML='';
  arr.forEach((it,i)=>row(it,i));
  updateMood();
}

function row(it,i){
  const li=document.createElement('li');

  const del=document.createElement('span');
  del.textContent='🗑';
  del.className='del';
  del.onclick=()=>remove(li,i);

  const span=document.createElement('span');
  span.textContent=it.text;
  if(it.done) span.classList.add('done');

  const label=document.createElement('label');
  label.className='toggle';
  const chk=document.createElement('input');
  chk.type='checkbox';
  chk.checked=it.done;
  chk.onchange=()=>toggle(i);
  const slider=document.createElement('span');
  slider.className='slider';
  label.append(chk,slider);

  li.append(del,span,label);
  list.appendChild(li);

  span.onclick = ()=> { span.classList.toggle('done'); toggle(i); };
}

function handleAdd(){
  const raw = inp.value.trim();
  if(!raw) return;
  const items = raw.split(/[, \n]+/).map(s=>s.trim()).filter(Boolean);
  const arr = JSON.parse(localStorage.getItem(k)||'[]');
  items.forEach(t=>arr.push({text:t,done:false}));
  localStorage.setItem(k,JSON.stringify(arr));
  inp.value='';
  load();
}

function remove(li,i){
  li.style.animation='crumble .4s ease forwards';
  setTimeout(()=>{
    const arr=JSON.parse(localStorage.getItem(k));
    arr.splice(i,1);
    localStorage.setItem(k,JSON.stringify(arr));
    load();
  },400);
}

function toggle(i){
  const arr=JSON.parse(localStorage.getItem(k));
  arr[i].done = !arr[i].done;
  localStorage.setItem(k,JSON.stringify(arr));
  load();
}

function clearAll(){
  if(!confirm(dict[lang].confirm)) return;
  localStorage.removeItem(k);
  load();
}

// -------- Mood Logic --------
function updateMood(){
  const arr=JSON.parse(localStorage.getItem(k)||'[]');
  document.body.classList.remove('sleep','angry','happy');
  document.querySelectorAll('.mood-img').forEach(img=>img.classList.remove('shown'));

  if(arr.length===0){
    document.body.classList.add('sleep');
    document.getElementById('sleep').classList.add('shown');
  } else if(arr.every(it=>it.done)){
    document.body.classList.add('happy');
    document.getElementById('happy').classList.add('shown');
  } else {
    document.body.classList.add('angry');
    document.getElementById('angry').classList.add('shown');
  }
}

// -------- Weather --------
const apiKey = 'DIN_API_KEY_HÄR'; // byt mot din nyckel
const city = 'Stockholm';

async function fetchWeather(){
  try{
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    const data = await res.json();
    if(data.cod!==200) throw new Error('API error');
    const temp = Math.round(data.main.temp);
    const weatherMain = data.weather[0].main;

    document.getElementById('temp').textContent = `${temp}°C`;
    document.getElementById('city').textContent = data.name;

    const iconMap = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Snow: '❄️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Mist: '🌫️'
    };
    document.querySelector('.weather-icon').textContent = iconMap[weatherMain] || '❓';
  } catch(err){
    console.warn('Weather API failed, using fallback');
    document.getElementById('temp').textContent = '20°C';
    document.getElementById('city').textContent = city;
    document.querySelector('.weather-icon').textContent = '☀️';
  }
}

// -------- Init --------
document.getElementById('inp').addEventListener('keydown', e=>{
  if(e.key==='Enter') handleAdd();
});
load();
toggleLang();
fetchWeather();
