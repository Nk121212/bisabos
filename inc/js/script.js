document.addEventListener('DOMContentLoaded', function () {
    // alert('a');
    const link = document.querySelector('a.home');
      
    // Kalau link ditemukan, lakukan klik otomatis
    if (link) {
        link.click();
    }
});

const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const toggleBtn = document.getElementById('toggleSidebar');

// Check screen size on load
function checkScreenSize() {
    if (window.innerWidth <= '768') {
        //disini jadi berubah fungsinya kalau di set classnya hidden jadi nya malah muncul jadi di balikan aja gini
        sidebar.classList.add('hidden');
        sidebar.classList.remove('hidden');
    } else {
        sidebar.classList.remove('hidden');
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
        
        fetch('pages/'+this.classList[0]+'.html')
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
                    const form = document.getElementById('orderForm');
                    if (form) {
                        form.addEventListener('submit', function(e) {
                            e.preventDefault();
                            const name = document.getElementById('name').value;
                            const product = document.getElementById('service').value;
                            const phone = "6285161141305";
                            const msg = `Halo, saya ingin order\nNama : ${name}\nService : ${product}`;
                            const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                            window.open(url, "_blank");
                        });
                    }
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
                }
            })
            .catch(error => {
                console.error('Gagal memuat konten:', error);
            });
        
    });
});