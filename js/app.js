
  const WHATSAPP="573244047881"; // EDITA: tu número con código de país, sin +
  const IMG={1:"fotos/1.jpg",2:"fotos/2.jpg",3:"fotos/3.jpg",4:"fotos/4.jpg",5:"fotos/5.jpg"};


// EDITA: productos. img = número de foto (1 a 5), pos = parte de la foto que se ve
const P=[
 {id:"a1",n:"Oud Real",o:"arabe",notas:"Oud, ámbar y pimienta rosa",p:120000,s:6,img:1,pos:"50% 50%"},
 {id:"a2",n:"Ámbar Dorado",o:"arabe",notas:"Ámbar, vainilla y sándalo",p:135000,s:4,img:5,pos:"60% 70%"},
 {id:"a3",n:"Noche de Azafrán",o:"arabe",notas:"Azafrán, cuero y madera",p:110000,s:3,img:3,pos:"55% 50%"},
 {id:"u1",n:"Rosa Suave",o:"americano",notas:"Rosa, peonía y almizcle",p:150000,s:5,img:2,pos:"12% 50%"},
 {id:"u2",n:"Urban Azul",o:"americano",notas:"Cítricos, menta y madera",p:140000,s:2,img:2,pos:"50% 60%"},
 {id:"u3",n:"Bosque Ámbar",o:"americano",notas:"Tabaco suave, cuero y haba tonka",p:165000,s:0,img:4,pos:"80% 50%"}
];


const $=s=>document.querySelector(s),money=n=>"$"+n.toLocaleString("es-CO");
const ls={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let ovr=ls.get("stock",{}),cart={},orders=ls.get("orders",[]);
const stock=p=>ovr[p.id]??p.s;
$("#hAr").style.backgroundImage=`url(${IMG[1]})`;$("#hUs").style.backgroundImage=`url(${IMG[2]})`;

function renderGrid(){
 $("#grid").innerHTML=P.map(p=>{const s=stock(p);return `<article class="card" data-o="${p.o}" ${curF!=="todos"&&p.o!==curF?"hidden":""}>
 <img src="${IMG[p.img]}" style="object-position:${p.pos}" alt="Perfume ${p.n}">
 <div class="info"><h3>${p.n}</h3><p class="notes">${p.notas}</p>
 <span class="stock ${s>0&&s<=3?"low":""}">${s<=0?"Agotado":s<=3?"Quedan "+s:"Disponible"}</span>
 <div class="row"><span class="price">${money(p.p)}</span><button class="btn" data-add="${p.id}" ${s<=0?"disabled":""}>${s<=0?"Agotado":"Agregar"}</button></div></div></article>`}).join("");
}

let curF="todos";
function filtrar(f){curF=f;document.querySelectorAll(".tabs button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.f===f));renderGrid()}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>filtrar(b.dataset.f));
document.querySelectorAll("[data-go]").forEach(a=>a.addEventListener("click",()=>filtrar(a.dataset.go)));
$("#grid").addEventListener("click",e=>{const id=e.target.dataset.add;if(id){add(id,1);setDrawer(true)}});

// Carrito
function add(id,d){
    const p=P.find(x=>x.id===id),q=(cart[id]||0)+d;
 if(q>stock(p)){$("#msg").textContent=`Solo hay ${stock(p)} de ${p.n}.`;return}
 $("#msg").textContent="";if(q<=0)delete cart[id];else cart[id]=q;renderCart()
}

function renderCart(){
 const ids=Object.keys(cart);let t=0,c=0;
 $("#lines").innerHTML=ids.length?ids.map(id=>{const p=P.find(x=>x.id===id),q=cart[id];t+=p.p*q;c+=q;
  return `<div class="line"><div><strong>${p.n}</strong><br><small>${money(p.p)} c/u</small></div><div class="qty"><button data-d="-1" data-id="${id}" aria-label="Quitar uno">−</button> ${q} <button data-d="1" data-id="${id}" aria-label="Agregar uno">+</button></div></div>`}).join(""):"<p>Tu carrito está vacío. Agrega un perfume del catálogo.</p>";
 $("#tot").textContent=money(t);$("#cnt").textContent=c;$("#send").disabled=!ids.length}
$("#lines").addEventListener("click",e=>{const b=e.target.closest("button[data-id]");if(b)add(b.dataset.id,+b.dataset.d)});

function setDrawer(o){$("#drawer").classList.toggle("open",o);$("#drawer").setAttribute("aria-hidden",!o)}
$("#open").onclick=()=>setDrawer(true);$("#close").onclick=()=>setDrawer(false);
$("#send").onclick=()=>{
 const n=$("#cn").value.trim(),c=$("#cc").value.trim();
 if(!n||!c){$("#msg").textContent="Escribe tu nombre y tu dirección de envío.";return}
 let t=0;const l=Object.keys(cart).map(id=>{const p=P.find(x=>x.id===id);t+=p.p*cart[id];return `- ${cart[id]} x ${p.n} (${money(p.p*cart[id])})`});
 const txt=`Hola, quiero hacer este pedido:\n${l.join("\n")}\nTotal: ${money(t)}\nNombre: ${n}\nEnvío a: ${c}`;
 window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(txt)}`,"_blank");
};

// Panel del dueño
function renderAdmin(){
 $("#inv").innerHTML="<tr><th>Perfume</th><th>Stock</th></tr>"+P.map(p=>`<tr><td>${p.n}</td><td><input type="number" min="0" value="${stock(p)}" data-st="${p.id}"></td></tr>`).join("");
 $("#op").innerHTML=P.map(p=>`<option value="${p.id}">${p.n} (${stock(p)})</option>`).join("");
 $("#ords").innerHTML="<tr><th>Fecha</th><th>Cliente</th><th>Pedido</th><th>Estado</th></tr>"+(orders.length?orders.map((o,i)=>`<tr><td>${o.f}</td><td>${o.c}</td><td>${o.q} x ${o.n}</td><td><button class="btn alt" data-ent="${i}">${o.e?"Entregado":"Pendiente"}</button></td></tr>`).join(""):"<tr><td colspan='4'>Aún no hay pedidos registrados.</td></tr>");
}

$("#inv").addEventListener("change",e=>{const id=e.target.dataset.st;if(id){ovr[id]=Math.max(0,+e.target.value||0);ls.set("stock",ovr);renderGrid();renderAdmin()}});
$("#oadd").onclick=()=>{const p=P.find(x=>x.id===$("#op").value),q=+$("#oq").value,c=$("#oc").value.trim();
 if(!c||q<1||q>stock(p)){alert("Revisa el cliente y la cantidad (stock: "+stock(p)+").");return}
 ovr[p.id]=stock(p)-q;orders.unshift({f:new Date().toLocaleDateString("es-CO"),c,n:p.n,q,e:false});ls.set("stock",ovr);ls.set("orders",orders);$("#oc").value="";renderGrid();renderAdmin()};
$("#ords").addEventListener("click",e=>{const i=e.target.dataset.ent;if(i!==undefined){orders[i].e=!orders[i].e;ls.set("orders",orders);renderAdmin()}});
$("#exp").onclick=async()=>{const s=JSON.stringify(P.map(p=>({id:p.id,n:p.n,stock:stock(p)})));try{await navigator.clipboard.writeText(s);$("#expmsg").textContent="Copiado."}catch(e){$("#expmsg").textContent=s}};

function hashAdmin(){
    $("#admin").hidden=location.hash!=="#admin";if(!$("#admin").hidden)renderAdmin()
    }

addEventListener("hashchange",hashAdmin);
renderGrid();renderCart();hashAdmin();
