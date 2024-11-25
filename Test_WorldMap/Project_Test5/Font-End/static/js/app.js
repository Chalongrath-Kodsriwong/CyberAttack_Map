let map; // ตัวแปรเก็บแผนที่
let markers = []; // เก็บตัว marker เพื่อใช้งานซ้ำ
let userLocation = null; // ตำแหน่งของผู้ใช้ (จุดเริ่มต้น)
let geojsonLayer; // ตัวแปรเก็บ GeoJSON Layer

// ฟังก์ชันเพิ่มข้อมูล Log ใหม่ในหน้าเว็บ
function appendLog(location) {
    if (location.location) {
        let marker = L.marker(location.location).addTo(map);
        markers.push(marker);

        marker.bindPopup(`
            <b>IP: ${location.ip}</b><br>
            <b>Address:</b> ${location.address}<br>
            <b>Location:</b> (${location.location[0]}, ${location.location[1]})
        `);

        $('#details').append(`
            <div>
                <h3>IP: ${location.ip}</h3>
                <p><b>Address:</b> ${location.address}</p>
                <p><b>Location:</b> (${location.location[0]}, ${location.location[1]})</p>
            </div>
        `);

        // ถ้ามีตำแหน่งผู้ใช้ (userLocation) ให้ลากเส้นไปยังตำแหน่งนี้
        if (userLocation) {
            animateLine(map, location.location, userLocation, 'red', 10);
        }
    }
}

// ฟังก์ชันสำหรับลากเส้นแบบค่อยๆ ลากทีละขั้น
function animateLine(map, start, end, color = 'red', speed = 50) {
    const steps = 100; // จำนวนขั้นตอนในการลากเส้น
    const latStep = (end[0] - start[0]) / steps; // การเปลี่ยนแปลงละติจูดต่อขั้น
    const lngStep = (end[1] - start[1]) / steps; // การเปลี่ยนแปลงลองจิจูดต่อขั้น

    let currentLat = start[0];
    let currentLng = start[1];
    const latLngs = [[currentLat, currentLng]]; // เริ่มที่จุดแรก
    const polyline = L.polyline(latLngs, { color: color, weight: 2 }).addTo(map);

    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;

        // คำนวณตำแหน่งถัดไป
        currentLat += latStep;
        currentLng += lngStep;
        latLngs.push([currentLat, currentLng]);

        // อัปเดตเส้น Polyline
        polyline.setLatLngs(latLngs);

        // เมื่อถึงขั้นตอนสุดท้าย หยุด animation
        if (currentStep >= steps) {
            clearInterval(interval);

            // เพิ่มเอฟเฟกต์การยิง
            shootEffect(map, end, color);
        }
    }, speed);
}

// ฟังก์ชันสำหรับสร้างเอฟเฟกต์การยิงเมื่อถึงปลายทาง
function shootEffect(map, position, color = 'red') {
    const circle = L.circle(position, {
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: 50
    }).addTo(map);

    // ค้นหาประเทศที่ตำแหน่งปลายทางอยู่ในเขตประเทศนั้น
    if (geojsonLayer) {
        geojsonLayer.eachLayer(function(layer) {
            if (layer.feature.geometry.type === 'Polygon') {
                if (isPointInPolygon(position, layer.feature.geometry.coordinates[0])) {
                    // เปลี่ยนสีประเทศเป็นสีเขียว
                    layer.setStyle({
                        fillColor: 'green',
                        fillOpacity: 0.8
                    });

                    // คืนค่ากลับเป็นสีเดิมหลังจาก 1 วินาที
                    setTimeout(() => {
                        layer.setStyle({
                            fillColor: '#444',
                            fillOpacity: 0.5
                        });
                    }, 300);
                }
            }
        });
    }

    // ลบเอฟเฟกต์วงกลมทั่วไปหลังจากเวลาผ่านไป
    setTimeout(() => {
        map.removeLayer(circle);
    }, 500);
}

// ฟังก์ชันตรวจสอบว่าจุดอยู่ในพื้นที่ Polygon หรือไม่
function isPointInPolygon(point, polygon) {
    let x = point[1], y = point[0];
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i][0], yi = polygon[i][1];
        let xj = polygon[j][0], yj = polygon[j][1];

        let intersect = ((yi > y) !== (yj > y)) &&
                        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

// ฟังก์ชันเพิ่ม GeoJSON Layer สำหรับประเทศ
function addGeoJsonLayer() {
    $.getJSON('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json', function(data) {
        geojsonLayer = L.geoJSON(data, {
            style: function(feature) {
                return {
                    color: '#000',
                    weight: 1,
                    fillColor: '#444',
                    fillOpacity: 0.5
                };
            }
        }).addTo(map);
    });
}

// ฟังก์ชันกำหนดตำแหน่ง IP ปัจจุบันของผู้ใช้งานเมื่อโปรแกรมเริ่มทำงาน
function initializeLocation() {
    $.ajax({
        url: '/initialize_location',
        method: 'GET',
        success: function(locationData) {
            appendLog(locationData);  // แสดงตำแหน่งของผู้ใช้
            userLocation = locationData.location;
            map.setView(locationData.location, 5);
        },
        error: function() {
            alert("Error: Failed to initialize location");
        }
    });
}

// ฟังก์ชันเมื่อฟอร์มถูกส่ง
$('#locationForm').submit(function(event) {
    event.preventDefault();

    const ip = $('#ip').val();
    const url = $('#url').val();

    $.ajax({
        url: '/add_new_log',
        method: 'POST',
        data: { ip, url },
        success: function(locationData) {
            appendLog(locationData);  // เพิ่ม Log ใหม่ที่ได้จาก Server
        },
        error: function() {
            alert("Error: Failed to get location data");
        }
    });

    $('#ip').val('');
    $('#url').val('');
});

// ฟังก์ชันสำหรับสร้างแผนที่เมื่อหน้าเว็บโหลด
function initializeMap() {
    map = L.map('map', {
        minZoom: 2, // กำหนดการซูมออกน้อยที่สุด (ระดับ 2)
        maxZoom: 19 // ยังคงการซูมเข้าเดิมไว้
    }).setView([0, 0], 2); // ตั้งค่าแผนที่เริ่มต้น

    // เพิ่ม Tile Layer แบบโทนดำและน้ำเงิน
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
}

// ฟังก์ชันดึงข้อมูล Log เก่าและแสดงผลบนหน้าเว็บ
function loadExistingLogs() {
    $.ajax({
        url: '/get_logs',
        method: 'GET',
        success: function(logs) {
            logs.forEach(location => appendLog(location));  // แสดง Log เก่าทั้งหมด
        },
        error: function() {
            alert("Error: Failed to load existing logs");
        }
    });
}



// เรียกใช้งานเมื่อหน้าเว็บโหลด
initializeMap();
addGeoJsonLayer(); // เพิ่ม GeoJSON Layer
initializeLocation(); // ปักมุดตำแหน่งปัจจุบันของผู้ใช้งาน
loadExistingLogs(); // โหลด Log เก่าและแสดงผล
