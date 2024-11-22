// ฟังก์ชันในการโหลดไฟล์ JSON
function loadLocationData() {
    // ใช้ path ที่ถูกต้องเพื่อโหลด location_log.json จาก static
    $.getJSON('/static/json/location_log.json', function(data) {
        initializeMap(data);
    }).fail(function() {
        console.log("Error: Failed to load location_log.json");
    });
}

// ฟังก์ชันในการสร้างแผนที่และเพิ่มข้อมูล IP
function initializeMap(locations) {
    // สร้างแผนที่
    var map = L.map('map').setView([0, 0], 2); // ตั้งค่าแผนที่ให้เริ่มที่ตำแหน่ง (0,0) และ zoom level 2

    // เพิ่มแผนที่พื้นฐาน (Tile Layer)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

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
}

// เมื่อฟอร์มถูกส่ง
$('#location-form').on('submit', function(e) {
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
        success: function(data) {
            // แสดงผลข้อมูลที่ได้รับมา
            initializeMap(data);  // แสดงแผนที่ใหม่
            $('#details').empty();  // เคลียร์รายละเอียดเก่า
            data.forEach(function(location) {
                if (location.location) {
                    $('#details').append(`
                        <div>
                            <h3>IP: ${location.ip}</h3>
                            <p><b>Address:</b> ${location.address}</p>
                            <p><b>Location:</b> (${location.location[0]}, ${location.location[1]})</p>
                        </div>
                    `);
                }
            });
        },
        error: function() {
            alert("Error: Failed to get location data");
        }
    });

    $('#ip').val('');
    $('#url').val('');
});

// เรียกใช้ฟังก์ชันในการโหลดข้อมูลเมื่อหน้าโหลด
loadLocationData();
