document.addEventListener('DOMContentLoaded', function () {

    const linkHome = document.querySelector('a.home');
    const linksHide = document.querySelectorAll('a.hidefirst');

    linksHide.forEach(link => {
        link.classList.add('d-none');
    });
        
    if (linkHome) {
        linkHome.click();
    }

    checkToken();

});

const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const toggleBtn = document.getElementById('toggleSidebar');

let table;
let thead;
let tbody;
let paginationDiv;
const rowsPerPage = 5;
// let currentPage = 1;
let allData = [];

function setWithExpiry(key, value, ttl) {
    const now = new Date();

    const item = {
        value: value,
        expiry: now.getTime() + ttl // ttl = time to live (dalam ms)
    };

    localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }

    return item.value;
}

function logout(){
    localStorage.removeItem('userToken');
    checkToken();
}

function checkToken(){

    const linkLogin = document.querySelector('a.login');
    const linkLogout = document.querySelector('a.logout');
    const linkHome = document.querySelector('a.home');
    const linkOrder = document.querySelector('a.order');
    const linkOrderAdmin = document.querySelector('a.order_admin');

    const token = getWithExpiry('userToken');

    if(token){
        //hide sidebar menu sign in
        linkLogin.classList.add('d-none');
        linkLogout.classList.remove('d-none');

        if (linkOrder) {
            linkOrder.classList.remove('order');
            linkOrder.className = 'order_admin ' + linkOrder.className.trim();
            linkOrder.className = linkOrder.className.trimStart();
        }

    }else{
        //hide sidebar menu sign out
        linkLogout.classList.add('d-none');
        linkLogin.classList.remove('d-none');

        if (linkOrderAdmin) {
            linkOrder.classList.remove('order_admin');
            linkOrder.className = 'order ' + linkOrder.className.trim();
            linkOrder.className = linkOrder.className.trimStart();
        }
    }

    if(linkHome){
        linkHome.click();
    }

}

function displayTable(data, page) {
    tbody.innerHTML = ''; // Kosongkan isi tabel sebelum menampilkan data baru
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    if (paginatedData.length === 0 && data.length > 0) {
        // Jika halaman saat ini kosong tetapi ada data, kembali ke halaman terakhir
        currentPage = Math.ceil(data.length / rowsPerPage);
        displayTable(data, currentPage);
        return;
    }

    paginatedData.forEach(item => {
        const row = tbody.insertRow();
        for (const key in item) {
        const cell = row.insertCell();
        cell.textContent = item[key];
        }
    });
}

function displayPagination(data) {
    paginationDiv.innerHTML = ''; // Kosongkan tombol pagination sebelumnya
    const pageCount = Math.ceil(data.length / rowsPerPage);

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.classList.add('pagination-button');
        button.textContent = i;
        if (i === currentPage) {
        button.classList.add('active');
        }
        button.addEventListener('click', () => {
        currentPage = i;
        displayTable(data, currentPage);
        updateActiveButton();
        });
        paginationDiv.appendChild(button);
    }
}

function updateActiveButton() {
    const buttons = document.querySelectorAll('.pagination-button');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (parseInt(button.textContent) === currentPage) {
        button.classList.add('active');
        }
    });
}

function populateTableHeader(data) {
    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const headerRow = thead.insertRow();
        headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
        });
    }
}

function checkScreenSize() {
    if (window.innerWidth <= '768') {
        //disini jadi berubah fungsinya kalau di set classnya hidden jadi nya malah muncul jadi di balikan aja gini
        sidebar.classList.remove('hidden');
    } else {
        sidebar.classList.remove('hidden');
    }
}

// Initial check
checkScreenSize();

// Add event listener for window resize
window.addEventListener('resize', checkScreenSize);

// Toggle sidebar --> ketika di klik button toggle (garis 3 menu sidebar)
toggleBtn.addEventListener('click', () => {
    // alert('clicked');
    sidebar.classList.toggle('hidden');
});

const menuItems = document.querySelectorAll('#sidebar .list-group-item');

menuItems.forEach(item => {

    item.addEventListener('click', function () {

        if (window.innerWidth <= '768') {
            sidebar.classList.remove('hidden');
        }

        // Hapus 'active' dari semua menu
        menuItems.forEach(el => el.classList.remove('active'));

        this.classList.add('active');

        var pageName = this.classList[0];

        if(pageName == 'logout'){
            logout();
        }else{
            fetch('pages/'+this.classList[0]+'.html?_=' + new Date().getTime())
            .then(response => {
                if (!response.ok) {
                    return fetch('pages/not_found.html').then(res => res.text());
                }
                return response.text();
            })
            .then(html => {
                document.getElementById('main-content').innerHTML = html;
                if(pageName == 'home'){
                    $('#mainCarousel').carousel({
                        interval: 3000,
                        pause: "hover"
                    });
                    $('.carousel').carousel({
                        pause: "hover"
                    });
                }
                if(pageName == 'service'){
                    // Load data via fetch
                    fetch('json/service_list.json?_=' + new Date().getTime())
                    .then(response => response.json())
                    .then(json => {
                        data = json;
                        renderCards(currentPage);
                        renderPagination();
                    })
                    .catch(error => {
                        console.error('Gagal memuat data:', error);
                    });
                }
                if (pageName == 'order') {

                    fetch('json/service_list.json?_=' + new Date().getTime())
                    .then(response => response.json())
                    .then(data => {
                        const select = document.getElementById('service');
                        data.forEach(item => {
                            const option = document.createElement('option');
                            option.value = item.title;
                            option.textContent = item.title;
                            select.appendChild(option);
                        });
                    })
                    .catch(err => console.error('Gagal mengambil data produk:', err));

                    const form = document.getElementById('orderForm');

                    if (form) {
                        form.addEventListener('submit', function(e) {
                            e.preventDefault();
                            const name = document.getElementById('name').value;
                            const ktp = document.getElementById('ktp').value;
                            const service = document.getElementById('service').value;
                            const alamat = document.getElementById('alamat').value;
                            const kota = document.getElementById('kota').value;
                            const detail = document.getElementById('detail').value;
                            const phone = "6285161141305";
                            const msg = `Halo, saya ingin order\nNama : ${name}\nNo KTP : ${ktp}\nKota : ${kota}\nAlamat : ${alamat}\nService : ${service}\nDetail : ${detail}`;
                            const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                            // window.open(url, "_blank");
                            const data = {
                                name: name,
                                ktp: ktp,
                                service: service,
                                kota: kota,
                                alamat: alamat,
                                detail: detail
                            };
            
                            // Kirim data ke PHP untuk disimpan
                            fetch('backend/save_order.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(data)
                            })
                            .then(response => response.json())
                            .then(result => {
                                if (result.status === 'success') {
                                    console.log('Data order berhasil disimpan!');
                                    // Setelah data disimpan, buka tautan WhatsApp
                                    window.open(url, "_blank");
                                    form.reset(); // Bersihkan form setelah berhasil (opsional)
                                } else {
                                    alert('Gagal menyimpan data order: ' + result.message);
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                alert('Terjadi kesalahan saat mengirim data.');
                            });
                        });
                    }
                }
                if(pageName == 'login'){
                    const form = document.getElementById('loginForm');
                    if (form) {
                        form.addEventListener('submit', function(e) {
                            e.preventDefault();

                            const form = e.target;
                            const formData = new FormData(form);

                            fetch('backend/login.php', {
                                method: 'POST',
                                body: formData
                            })
                            .then(response => response.json())
                            .then(data => {
                                // document.getElementById('result').innerHTML = data;
                                // alert(data.token);
                                const token = getWithExpiry('userToken');
                                if (token) {
                                    // console.log('Token masih berlaku:', token);
                                } else {
                                    // console.log('Token expired atau tidak ada');
                                    setWithExpiry('userToken', data.token, 3600000);
                                    checkToken();

                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });
                        });
                    }
                }
                if(pageName == 'order_admin'){
                    // Inisialisasi DataTables setelah konten order_admin.html dimuat
                    $(document).ready(function() {
                        $('#table_order').DataTable({
                            ajax: {
                                url: 'json/data_order.json?_=' + new Date().getTime(),
                                dataSrc: ''
                            },
                            columns: [
                                { data: 'name', title: 'Nama' },
                                { data: 'ktp', title: 'KTP' },
                                { data: 'service', title: 'Service' },
                                { data: 'kota', title: 'Kota' },
                                { data: 'alamat', title: 'Alamat' },
                                { data: 'detail', title: 'Detail' },
                                { 
                                    data: 'ktp',
                                    title: 'Action', 
                                    render: function ( data, type, row ) {
                                        return data;
                                    }
                                }
                            ],
                            // language: {
                            //     url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/id.json'
                            // }
                            // ... (opsi DataTables lainnya)
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Gagal memuat konten:', error);
            });
        }
        
    });
});