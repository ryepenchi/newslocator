
// Leaflet Construction
var map = L.map('map', {
    attributionControl: false
}).setView([48.517587, 8.648699], 5);

// Mapbox
function mapbox_access_token() {
	return fetch("./static/config.json")
		.then(response => {
			var t = response.json();
			return t;
		})
}

// Mapbox Tilelayer
function mapbox_tile_layer(t) {
	var M_TILE_URL = "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token="
	var mapboxTiles = L.tileLayer(M_TILE_URL + t.mapbox_access_token, {
		   attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		   tileSize: 512,
		   zoomOffset: -1
	}).addTo(map);	
}
// Load Tilelayer after access token retrieval
async function create_Tile_layer() {
	var t = await mapbox_access_token();
	mapbox_tile_layer(t);
}
// create_Tile_layer();

// Custom Marker Icon
var custom_icon = L.Icon.extend({
	options: {
		iconSize: [40, 40],
		iconAnchor: [20, 40],
		popupAnchor: [0, -38]
	}
})
var newsicon = new custom_icon({
	iconUrl: "static/img/newsicon.svg",
});

// Info Button
var info = L.control.custom({
	position: 'topright',
	content: '<i class="material-icons">help</i>',
	classes: 'ctl info',
	style: {
		'border': '2px solid rgba(0,0,0,0.2)',
		'background-clip': 'padding-box',
		'font-size': '28px',
		"color": 'rgba(100,100,100,1)'
	},
	events: {
		click: openInfoMenu
	}
}).addTo(map);

// Time Filter Control
var time_filter = L.control.custom({
	position: 'topright',
	content: '<i class="material-icons">query_builder</i>',
	classes: 'ctl info',
	style: {
		'border': '2px solid rgba(0,0,0,0.2)',
		'background-clip': 'padding-box',
		'font-size': '28px',
		"color": 'rgba(100,100,100,1)',
	},
	events: {
		click: openFilterMenu
	}
}).addTo(map);

// Article List
var article_list = L.control.custom({
	position: 'topright',
	content: '<i class="material-icons">view_list</i>',
	classes: 'ctl article_list',
	style: {
		'border': '2px solid rgba(0,0,0,0.2)',
		'background-clip': 'padding-box',
		'font-size': '28px',
		"color": 'rgba(100,100,100,1)',
	},
	events: {
		click: openArticleMenu
	}
}).addTo(map);

// var article_list = L.control({position: 'bottomright'});
// article_list.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'ctl article-list');
//     this._div.innerHTML = '<span class="slide"><a href="#" onClick="openRightMenu()"><i class="far fa-newspaper"></i></a></span>';
//     // this.update();
//     return this._div;
// }
// article_list.addTo(map);


// Title Control Element
// var title = L.control({position: 'topright'});
// title.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'ctl title');
//     this._div.innerHTML = '<h1 class="map-title">Newslocator</h1>';
//     // this.update();
//     return this._div;
// }
// title.addTo(map);

// var dates = L.control({position: 'topleft'});
// dates.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'ctl dates');
//     this._div.innerHTML = '<h4 id="dates"></h4>';
//     // this.update();
//     return this._div;
// }
// dates.addTo(map);

// Time Filter Control Button
// var filter = L.control({position: 'bottomright'});
// filter.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'ctl filter');
//     this._div.innerHTML = '<span class="slide"><a href="#" onClick="openSlideMenu()"><i class="fas fa-filter"></i></a></span>';
//     // this.update();
//     return this._div;
// }
// filter.addTo(map);

// Attribution
L.control.attribution({
    position: "bottomleft"
}).addTo(map);

// Repository Link Control
var repo = L.control.custom({
	position: 'bottomleft',
	content: '<a href="https://github.com/ryepenchi/newslocator" target="_blank"><img src="./static/img/github_small.svg" /></a>',
	classes: 'ctl repo-link',
	style: {
		'border': '2px solid rgba(0,0,0,0.2)',
		'background-clip': 'padding-box',
		'font-size': '28px',
		"color": 'rgba(100,100,100,1)'
	}
}).addTo(map);

// var repo = L.control({position: 'bottomleft'});
// repo.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'ctl repo-link');
//     this._div.innerHTML = '<span class="slide"><a href="https://github.com/ryepenchi/newslocator" target="_blank"><i class="fab fa-github"></i></a></span>';
//     // this.update();
//     return this._div;
// }
// repo.addTo(map);

// Control Logic
function renderData() {
	if (from_date.toLocaleDateString() == to_date.toLocaleDateString()) {
		document.getElementById("dates").innerHTML = from_date.toLocaleDateString() + "<br><br><br>";
	} else {
		document.getElementById("dates").innerHTML = "<div>" + from_date.toLocaleDateString() + "<br> - <br>" + to_date.toLocaleDateString() + "</div>";
	}
	var request = new XMLHttpRequest();
	var fromrq = "from_date=" + from_date.toLocaleString();
	var torq = "to_date=" + to_date.toLocaleString();
	request.open('GET', '/points?' + fromrq + "&" + torq, true);

	request.onload = function() {
		if (this.status >= 200 && this.status < 400) {
			// Success
			// Create MapMarkers
			var data = JSON.parse(this.response);
			var markers = data.points.map(function(arr) {
				const t = document.createElement("b");
				t.innerHTML = arr.word + "<br>";
				const a = document.createElement("a");
				a.innerHTML = "Article"
				a.onclick = () => {
					var myChildren = [];
					console.log(arr.aids);
					for (const id of arr.aids) {
						myChildren.push(document.getElementById(id));
					}
					var myNode = document.getElementById("card-collection");
					while (myNode.firstChild) {
						if (!arr.aids.includes(myNode.firstChild.id)) {
							myNode.removeChild(myNode.firstChild);
						}
					}
					for (const c of myChildren) {
						myNode.append(c)
					}
					closeFilterMenu();
					openRightMenu();
				};
				a.style = "cursor: pointer;"
				t.append(a);
				// const links = arr.links.map(function (l) {
				// 	const a = document.createElement("a");
				// 	a.href = l;
				// 	a.className = "truncate";
				// 	a.innerText = l;
				// 	a.target = "_blank";
				// 	const b = document.createElement("br");
				// 	a.append(b);
				// 	t.append(a);
				// });
				return L.marker([arr.lat, arr.lon], {icon: newsicon}).bindPopup(t);
			});
			map.removeLayer(layer);
			layer = L.layerGroup(markers);
			map.addLayer(layer);
			// Create Cards
			var myNode = document.getElementById("card-collection");
			while (myNode.firstChild) {
				myNode.removeChild(myNode.firstChild);
			}
			data.articles.map(function (arr) {
				const span = document.createElement("span");
				span.className = "card-title";
				span.innerText = arr.title;
				const para = document.createElement("span");
				para.className = "card-places truncate";
				para.innerHTML = arr.words;
				const cardcontent = document.createElement("div");
				cardcontent.className = "card-content card-body white-text";
				cardcontent.appendChild(span);
				cardcontent.appendChild(para);
				const diva = document.createElement("div");
				// diva.className = "card-action";
				// const l = document.createElement("a");
				// l.href = arr.link;
				// l.innerText = "Article"
				// l.target = "_blank";
				// diva.appendChild(l);
				
				const cardheader = document.createElement("div");
				cardheader.className = "card-content card-header orange-text text-lighten-1";
				const carddate = document.createElement("span");
				carddate.innerText = arr.pubdate;
				cardheader.appendChild(carddate);
				const l = document.createElement("a");
				l.href = arr.link;
				l.innerHTML = '<span><i class="material-icons">open_in_new</i></span>';
				l.target = "_blank";
				cardheader.appendChild(l);
				const card = document.createElement("div");
				card.id = arr.id;
				card.onclick = () => renderArticlePlaces(arr.points);
				card.style = "cursor: pointer;"
				card.className = "card blue-grey lighten-1 collection-item";
				card.appendChild(cardheader);
				card.appendChild(cardcontent);
				card.appendChild(diva);
				const cardlink = document.createElement("a");
				document.getElementById("card-collection").appendChild(card);
			});
		} else {
			//Reached target Server, but it returned an error
			console.log("Mimimi")
		}
	};

	request.onerror = function() {
		//There was a connection error of some sort
	};

	request.send();
}

function renderArticlePlaces(arr) {
	var markers = arr.map(function(arr) {
		const ptext = document.createElement("b");
		ptext.innerHTML = arr.word;
		return L.marker([arr.lat, arr.lon]).bindPopup(ptext);
	});
	map.removeLayer(layer);
	layer = L.layerGroup(markers);
	map.addLayer(layer);
}

function setToToday() {
	today = new Date();
	from_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(),0,0);
	to_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(),23,59);
}

// Initial data loading
var today, from_date, to_date;
setToToday();
var layer = L.layerGroup();
window.onload = () => renderData();


// Date Buttons
function modDates(f1,t1,f2,t2) {
	if (from_date.toLocaleDateString() == to_date.toLocaleDateString()) {
		from_date.setDate(from_date.getDate()+f1);
		to_date.setDate(to_date.getDate()+t1);
	} else {
		from_date.setDate(from_date.getDate()+f2);
		to_date.setDate(to_date.getDate()+t2);
	}
	renderData();
}

document.getElementById("today").onclick = () => {
	setToToday();
	renderData();
};
document.getElementById("m1d").onclick = () => modDates(-1, -1, -1, -8);
document.getElementById("p1d").onclick = () => modDates(1, 1, 8, 1);
document.getElementById("m1w").onclick = () => modDates(-7, 0, -7, -7);
document.getElementById("p1w").onclick = () => modDates(0, 7, 7, 7);

// Menu Functions
function openFilterMenu () {
	document.getElementById('filtermenu').classList.remove("collapsed");
	document.getElementById('filtermenu').classList.add("expanded");
  }
  
function closeFilterMenu () {
	document.getElementById('filtermenu').classList.add("collapsed");
	document.getElementById('filtermenu').classList.remove("expanded");
}
function openInfoMenu () {
	document.getElementById('infomenu').classList.remove("collapsed");
	document.getElementById('infomenu').classList.add("expanded");
}

function closeInfoMenu () {
	document.getElementById('infomenu').classList.add("collapsed");
	document.getElementById('infomenu').classList.remove("expanded");
}
function openArticleMenu () {
	document.getElementById('articlemenu').classList.remove("collapsed");
	document.getElementById('articlemenu').classList.add("expanded");
}

function closeArticleMenu () {
	document.getElementById('articlemenu').classList.add("collapsed");
	document.getElementById('articlemenu').classList.remove("expanded");
}

// function closeMenu(menu) {
// 	document.getElementById(menu).classList.add("collapsed");
// 	document.getElementById(menu).classList.remove("expanded");
// }
// function openMenu (menu) {
// 	document.getElementById(menu).classList.remove("collapsed");
// 	document.getElementById(menu).classList.add("expanded");
// }
// var openFilterMenu = openMenu('filtermenu');
// var closeFilterMenu = closeMenu('filtermenu');
// var openInfoMenu = openMenu('infomenu');
// var closeInfoMenu = closeMenu('infomenu');
// var openArticleMenu = openMenu('articlemenu');
// var closeArticleMenu = closeMenu('articlemenu');