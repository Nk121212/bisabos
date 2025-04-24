let data = [];
const cardsPerPage = 3;
let currentPage = 1;

function renderCards(page) {
  const start = (page - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const currentCards = data.slice(start, end);

  const container = document.getElementById('card-container');
  container.innerHTML = '';

  currentCards.forEach(item => {
    container.innerHTML += `
    <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
            <img src="${item.image}" class="card-img-top" alt="Image 1">
            <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text">${item.text}</p>
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