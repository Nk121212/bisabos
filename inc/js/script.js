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

function checkScreenSize() {
    if (window.innerWidth <= '768') {
        //disini jadi berubah fungsinya kalau di set classnya hidden jadi nya malah muncul jadi di balikan aja gini
        sidebar.classList.add('hidden');
        sidebar.classList.remove('hidden');
    } else {
        sidebar.classList.remove('hidden');
    }
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

    const token = getWithExpiry('userToken');

    if(token){
        //hide sidebar menu sign in
        linkLogin.classList.add('d-none');
        linkLogout.classList.remove('d-none');
    }else{
        //hide sidebar menu sign out
        linkLogout.classList.add('d-none');
        linkLogin.classList.remove('d-none');
    }

    if(linkHome){
        linkHome.click();
    }

}

// Initial check
checkScreenSize();

// Add event listener for window resize
window.addEventListener('resize', checkScreenSize);

// Toggle sidebar
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
});

const menuItems = document.querySelectorAll('#sidebar .list-group-item');

menuItems.forEach(item => {
    item.addEventListener('click', function () {
        // Hapus 'active' dari semua menu
        menuItems.forEach(el => el.classList.remove('active'));

        // console.log(this.classList[0]);
        // Tambahkan 'active' ke yang diklik
        this.classList.add('active');

        // Auto close sidebar on mobile after clicking menu item
        if (window.innerWidth <= 768) {
            sidebar.classList.add('hidden');
        }

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
                    fetch('json/service_list.json')
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

                    fetch('json/service_list.json')
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
                            const product = document.getElementById('service').value;
                            const alamat = document.getElementById('alamat').value;
                            const phone = "6285161141305";
                            const msg = `Halo, saya ingin order\nNama : ${name}\nAlamat : ${alamat}\nService : ${product}`;
                            const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                            window.open(url, "_blank");
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
            })
            .catch(error => {
                console.error('Gagal memuat konten:', error);
            });
        }
        
    });
});