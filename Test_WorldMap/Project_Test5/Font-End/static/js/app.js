let map; // ตัวแปรเก็บแผนที่
let markers = []; // เก็บตัว marker เพื่อใช้งานซ้ำ
let userLocation = null; // ตำแหน่งของผู้ใช้ (จุดเริ่มต้น)

// ฟังก์ชันเพิ่มข้อมูล Log ใหม่ในหน้าเว็บ
function appendLog(location) {
    if (location.location) {
        // สร้าง marker สำหรับตำแหน่งใหม่
        let marker = L.marker(location.location).addTo(map);
        markers.push(marker);

        // ตั้งข้อความเมื่อคลิก marker
        marker.bindPopup(`
            <b>IP: ${location.ip}</b><br>
            <b>Address:</b> ${location.address}<br>
            <b>Location:</b> (${location.location[0]}, ${location.location[1]})
        `);

        // อัปเดต Log ในส่วนของ #details
        $('#details').append(`
            <div>
                <h3>IP: ${location.ip}</h3>
                <p><b>Address:</b> ${location.address}</p>
                <p><b>Location:</b> (${location.location[0]}, ${location.location[1]})</p>
            </div>
        `);

        // ลากเส้นแบบแอนิเมชันจากตำแหน่งใหม่ไปยังตำแหน่งของผู้ใช้งาน
        if (userLocation) {
            animateLine(map, location.location, userLocation, 'red', 10); // ใช้แอนิเมชัน
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

    // ลบเอฟเฟกต์หลังจากเวลาผ่านไป
    setTimeout(() => {
        map.removeLayer(circle);
    }, 500);
}

// ฟังก์ชันกำหนดตำแหน่ง IP ปัจจุบันของผู้ใช้งานเมื่อโปรแกรมเริ่มทำงาน
function initializeLocation() {
    $.ajax({
        url: '/initialize_location',
        method: 'GET',
        success: function(locationData) {
            appendLog(locationData); // เพิ่มตำแหน่งปัจจุบันลงในแผนที่และ Log
            userLocation = locationData.location; // เก็บตำแหน่งของผู้ใช้งาน
            map.setView(locationData.location, 5); // ตั้งค่าแผนที่ให้แสดงตำแหน่งนี้
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
        url: '/get_location',
        method: 'POST',
        data: { ip, url },
        success: function(locationData) {
            appendLog(locationData); // เพิ่ม Log ใหม่เข้าไปในหน้าเว็บ
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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
}

// เรียกใช้งานเมื่อหน้าเว็บโหลด
initializeMap();
initializeLocation(); // ปักมุดตำแหน่งปัจจุบันของผู้ใช้งาน
