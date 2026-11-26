const mapSearch=document.querySelector('#map-search');
const mapStatus=document.querySelector('#map-status');
const mapItems=document.querySelector('#map-items');
const mapCount=document.querySelector('#map-count');
const mapElement=document.querySelector('#rink-map');

if(typeof L==='undefined'){
  mapElement.textContent='Карта временно недоступна.';
}else{
  const map=L.map(mapElement,{scrollWheelZoom:false}).setView([55.751,37.618],10);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:18,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  const colors={open:'#08775c',upcoming:'#b45b17',pending:'#496779'};
  const points=rinks.map((r,index)=>{
    const position=rinkCoordinates[index];
    if(!position)return null;
    const type=r.statusType==='open'?'open':['upcoming','announced'].includes(r.statusType)?'upcoming':'pending';
    const marker=L.circleMarker([position.lat,position.lon],{
      radius:7,weight:2,color:'#fff',fillColor:colors[type],fillOpacity:1
    });
    marker.bindPopup(`<div class="map-popup"><strong>${escapeHtml(r.name)}</strong><span>${escapeHtml(r.address)}</span><span>${escapeHtml(r.status)}</span><span>Взрослый вход: ${escapeHtml(r.adult)}</span>${position.approx?'<span>Точка по адресу приблизительная</span>':''}${link('Официальный источник',r.source)}</div>`);
    return marker;
  });
  const plotted=L.featureGroup().addTo(map);
  let initial=true;
  function renderMap(){
    const term=mapSearch.value.trim().toLocaleLowerCase('ru');
    const filtered=rinks.map((r,index)=>({...r,index})).filter(r=>{
      const matches=`${r.name} ${r.area} ${r.address}`.toLocaleLowerCase('ru').includes(term);
      const status=mapStatus.value;
      return matches&&(status==='all'||status==='open'&&r.statusType==='open'||status==='upcoming'&&['upcoming','announced'].includes(r.statusType)||status==='pending'&&!['open','upcoming','announced'].includes(r.statusType));
    });
    plotted.clearLayers();
    filtered.forEach(r=>{if(points[r.index])plotted.addLayer(points[r.index]);});
    mapItems.innerHTML=filtered.length?filtered.map(r=>`<button class="map-item" type="button" data-index="${r.index}"><strong>${escapeHtml(r.name)}</strong><span>${escapeHtml(r.area)} · ${escapeHtml(r.address)}</span><span>${escapeHtml(r.status)} · ${escapeHtml(r.adult)}</span></button>`).join(''):'<p class="empty">Ничего не найдено.</p>';
    mapCount.textContent=`${filtered.length} из ${rinks.length}`;
    if(plotted.getLayers().length){
      if(plotted.getLayers().length===1)map.setView(plotted.getBounds().getCenter(),13);
      else if(initial||term||mapStatus.value!=='all')map.fitBounds(plotted.getBounds().pad(.08),{maxZoom:12});
    }
    initial=false;
  }
  mapItems.addEventListener('click',event=>{
    const button=event.target.closest('button[data-index]');
    if(!button)return;
    const marker=points[Number(button.dataset.index)];
    if(marker){map.setView(marker.getLatLng(),14);marker.openPopup();}
  });
  mapSearch.addEventListener('input',renderMap);
  mapStatus.addEventListener('change',renderMap);
  renderMap();
}
