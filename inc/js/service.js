let data = [];
const cardsPerPage = 4;
let currentPage = 1;

function renderCards(page) {
  const start = (page - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const currentCards = data.slice(start, end);

  const container = document.getElementById('card-container');
  container.innerHTML = '';

  currentCards.forEach(item => {
    container.innerHTML += `
      <div class="col-md-6 mb-6">
          <div class="card">
              <div class="card-body text-center">

                  <h5 class="card-title">${item.title}</h5>

                  <img src="${item.image}" class="img-fluid" alt="Gambar Responsif">
                  
                  <p class="card-text"><span class="badge badge-success">Harga Paket</span></p>
                  
                  <h6 class="card-subtitle mb-3 text-muted"><strong>Rp 100.000</strong> <a onclick="kirimWhatsApp('Halo, saya tertarik dengan produk Anda.')" href="#" class="btn btn-success"><i class="fab fa-whatsapp"></i></a></h6>
              </div>
          </div>
      </div>
    `;
  });
}

function renderPagination() {
  const totalPages = Math.ceil(data.length / cardsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#">${i}</a>
      </li>
    `;
  }

  document.querySelectorAll('#pagination .page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = parseInt(e.target.textContent);
      renderCards(currentPage);
      renderPagination();
    });
  });
}