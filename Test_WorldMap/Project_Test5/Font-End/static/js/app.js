// ฟังก์ชันในการโหลดข้อมูล location_log.json
function loadLocationData() {
    $.getJSON('/static/json/location_log.json', function(data) {
        initializeMap(data);
    }).fail(function() {
        console.log("Error: Failed to load location_log.json");
    });
}

// ฟังก์ชันในการลากเส้นแบบค่อยๆ เกิดขึ้น
function animateLine(map, start, end, color = 'red', speed = 50) {
    // คำนวณจำนวนขั้นตอน (ระยะทางแบ่งย่อย)
    const steps = 100;
    const latStep = (end[0] - start[0]) / steps;
    const lngStep = (end[1] - start[1]) / steps;

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
        }
    }, speed);
}

// ฟังก์ชันในการสร้างแผนที่และเพิ่มข้อมูล IP
function initializeMap(locations) {
    var map = L.map('map').setView([0, 0], 2); // ตั้งค่าแผนที่ให้เริ่มที่ตำแหน่ง (0,0) และ zoom level 2

    // เพิ่มแผนที่พื้นฐาน (Tile Layer)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // กำหนด IP เป้าหมาย
    const targetIp = "184.22.180.231";
    let targetLocation = null;

    // วนลูปข้อมูลแต่ละรายการ
    locations.forEach(function(location) {
        if (location.location) {
            // สร้าง marker สำหรับแต่ละ IP
            var marker = L.marker([location.location[0], location.location[1]]).addTo(map);

            // เมื่อคลิกที่ marker ให้แสดงรายละเอียด IP
            marker.bindPopup(`
                <b>IP: ${location.ip}</b><br>
                <b>Address: </b>${location.address}<br>
                <b>Location: </b>(${location.location[0]}, ${location.location[1]})
            `);

            // บันทึกตำแหน่งของ IP เป้าหมาย
            if (location.ip === targetIp) {
                targetLocation = location.location;
            }

            // สร้างข้อมูลในส่วนรายละเอียด
            $('#details').append(`
                <div>
                    <h3>IP: ${location.ip}</h3>
                    <p><b>Address:</b> ${location.address}</p>
                    <p><b>Location:</b> (${location.location[0]}, ${location.location[1]})</p>
                </div>
            `);
        }
    });

    // เพิ่มเส้นที่ลากมายังตำแหน่งของ IP เป้าหมายทีละขั้น
    if (targetLocation) {
        locations.forEach(function(location) {
            if (location.location && location.location !== targetLocation) {
                animateLine(map, location.location, targetLocation, 'blue', 50); // สีฟ้าและความเร็ว 50ms
            }
        });
    }
}

// เมื่อฟอร์มถูกส่ง
$('#location-form').on('submit', function (e) {
    e.preventDefault();

    var ip = $('#ip').val();
    var url = $('#url').val();

    $.ajax({
        url: '/get_location',
        method: 'POST',
        data: {
            ip: ip,
            url: url
        },
        success: function () {
            // รีเฟรชแผนที่เมื่อส่งข้อมูลสำเร็จ
            loadLocationData();  // โหลดข้อมูลใหม่จากเซิร์ฟเวอร์
        },
        error: function () {
            alert("Error: Failed to get location data");
        }
    });

    // ล้างค่าในฟอร์มหลังการส่ง
    $('#ip').val('');
    $('#url').val('');
});

// เรียกใช้ฟังก์ชันในการโหลดข้อมูลเมื่อหน้าโหลด
loadLocationData();
