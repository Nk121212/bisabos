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

    const formPerjanjian = document.getElementById('perjanjianForm');
                    
    if (formPerjanjian) {
        formPerjanjian.addEventListener('submit', function(e) {
            e.preventDefault();
            const total = document.getElementById('total').value;
            const startDate = document.getElementById('startDateValue').value;
            const endDate = document.getElementById('endDateValue').value;
            const maxLate = document.getElementById('maxLate').value;
            const nominalDenda = document.getElementById('nominalDenda').value;
            const param = document.getElementById('param').value;
            // const newParams = 'start_date='+startDate+'&end_date='+endDate+'maxlate='+maxLate+'&denda='+nominalDenda;
            const data = {
                total: total,
                start_date: startDate,
                end_date: endDate,
                maxlate: maxLate,
                denda: nominalDenda
            };

            const rowJsonString = JSON.stringify(data);
            const decodeData = btoa(rowJsonString);
            const base64EncodedRow = encodeURIComponent(decodeData);
            const newPdfUrl = param+'&param2='+base64EncodedRow;
            // console.log(startDate, endDate, maxLate, nominalDenda, param, newPdfUrl);
            const url = newPdfUrl;
            window.open(url, "_blank");
        });
    }

    $('#startDate').datetimepicker({
        format: 'YYYY-MM-DD'
    });

    $('#endDate').datetimepicker({
        format: 'YYYY-MM-DD'
    });

});

const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const toggleBtn = document.getElementById('toggleSidebar');
const tableElement = document.getElementById('table_order');

if (toggleBtn && sidebar && mainContent && tableElement) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        // Atur ulang lebar tabel setelah sidebar di-toggle
        tableElement.style.width = mainContent.offsetWidth + 'px';
        // Atau mungkin lebih baik menggunakan width: '100%' dan biarkan table-responsive bekerja
        // tableElement.style.width = '100%';
    });

    window.addEventListener('resize', () => {
        tableElement.style.width = '100%';
    });
}

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
    // const linkOrder = document.querySelector('a.order');
    const linkOrder = document.getElementById('linkOrder');
    // const linkOrderAdmin = document.querySelector('a.order_admin');

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
        // console.log('order_admin exist');
        if (linkOrder) {
            linkOrder.classList.remove('order_admin');
            linkOrder.className = 'order ' + linkOrder.className.trim();
            linkOrder.className = linkOrder.className.trimStart();
        }
    }

    if(linkHome){
        linkHome.click();
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

function showLoginError(errorMessage) {
    const errorModal = document.getElementById('loginErrorModal');
    const errorMessageElement = document.getElementById('loginErrorMessage');

    if (errorModal && errorMessageElement) {
        errorMessageElement.textContent = errorMessage; // Set pesan error

        // Membuat instance modal Bootstrap
        const modal = new bootstrap.Modal(errorModal);

        // Menampilkan modal
        modal.show();
    } else {
        console.error("Elemen modal error login tidak ditemukan.");
    }
}

function showPerjanjianModal(url) {
    const modalId = document.getElementById('PerjanjianModal');

    const modalBody = document.querySelector('#PerjanjianModal .modal-body');
    const paramInput = modalBody.querySelector('#param');

    paramInput.value = url;

    const modal = new bootstrap.Modal(modalId);

    modal.show();
}

function numberToIDR(amount = 0){
    const formattedIDR = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, // Menghilangkan desimal jika tidak ada
        maximumFractionDigits: 0, // Menghilangkan desimal jika tidak ada
      }).format(amount);
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
                            fetch('/api/order', {
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
                            // const formData = new FormData(form);
                            const username = form.querySelector('[name="username"]').value;
                            const password = form.querySelector('[name="password"]').value;

                            const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

                            fetch('/api/login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: body,
                            })
                            .then(response => response.json())
                            .then(data => {
                                // document.getElementById('result').innerHTML = data;
                                // alert(data.token);
                                const token = getWithExpiry('userToken');
                                if (token) {
                                    // console.log('Token masih berlaku:', token);
                                    showLoginError('Already Logged In !');
                                } else {
                                    // console.log('Token expired atau tidak ada');
                                    // console.log(data);
                                    if(!data.success){
                                        showLoginError('Please check username and password !');
                                    }else{
                                        setWithExpiry('userToken', data.token, 3600000);
                                        checkToken();
                                    }

                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                showLoginError(error);
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
                            "autoWidth": false, //ikut lebar saat di hide toggle sidebar
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
                                    width: '10%',
                                    className: 'text-center',
                                    render: function ( data, type, row ) {

                                        const rowJsonString = JSON.stringify(row);
                                        const base64EncodedRow = btoa(rowJsonString);

                                        // 3. Buat URL dengan parameter Base64 encoded
                                        const pdfUrl = `pages/surat_perjanjian.html?param=${encodeURIComponent(base64EncodedRow)}`;

                                        return `<a href="#" onclick="showPerjanjianModal('${pdfUrl}')" class="btn btn-danger"><i class="fas fa-file-pdf"></i> PDF</a>`;
                                    }
                                }
                            ]
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