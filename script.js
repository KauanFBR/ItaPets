// PARTE DO CONTATO.HTML
function showToast(message, isSuccess = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    if (isSuccess) {
        toast.style.background = '#4CAF50';
    }

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const form = document.getElementById('form-contato');

form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameField = form.querySelector('#nome');
    const emailField = form.querySelector('#email');
    const messageField = form.querySelector('#mensagem');
    const telefoneField = form.querySelector('#telefone');
    const generoFields = form.querySelectorAll('input[name="genero"]');
    const servicoFields = form.querySelectorAll('input[type="checkbox"]');
    const petField = form.querySelector('#pets');

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();
    const telefone = telefoneField.value.trim();
    const pet = petField.value;

    let isValid = true;

    [nameField, emailField, messageField, telefoneField, petField].forEach(f => f.classList.remove('invalid'));
    generoFields.forEach(f => f.classList.remove('invalid'));
    servicoFields.forEach(f => f.classList.remove('invalid'));

    if (name.length < 3) {
        nameField.classList.add('invalid');
        showToast('Nome deve ter pelo menos 3 caracteres');
        isValid = false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        emailField.classList.add('invalid');
        showToast('Email inválido');
        isValid = false;
    }

    if (message.length < 10) {
        messageField.classList.add('invalid');
        showToast('Mensagem deve ter pelo menos 10 caracteres');
        isValid = false;
    }

    if (telefone.length < 14) {
        telefoneField.classList.add('invalid');
        showToast('Telefone inválido');
        isValid = false;
    }


    const generoSelecionado = [...generoFields].some(f => f.checked);
    if (!generoSelecionado) {
        generoFields.forEach(f => f.classList.add('invalid'));
        showToast('Selecione um gênero');
        isValid = false;
    }


    const servicoSelecionado = [...servicoFields].some(f => f.checked);
    if (!servicoSelecionado) {
        servicoFields.forEach(f => f.classList.add('invalid'));
        showToast('Selecione pelo menos um serviço');
        isValid = false;
    }


    if (pet === 'Selecione...') {
        petField.classList.add('invalid');
        showToast('Selecione o tipo de pet');
        isValid = false;
    }

    if (isValid) {
        console.log('Formulário válido:', { name, email, telefone, pet, message });
        form.reset();
        showToast('Mensagem enviada com sucesso!', true);
    }
});


const telefoneInput = document.getElementById('telefone');

telefoneInput?.addEventListener('input', (e) => {

    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 0) {
        value = value.replace(/^(\d{2})(\d)/, '($1)$2');
        value = value.replace(/(\d{5})(\d{4})$/, '$1-$2');
    }

    e.target.value = value;
});

// FIM DO CONTATO.HTML

// PARTE DO INDEX.HTML

$(document).ready(function () {
    const $produtosContainer = $('.produtos');
    if ($produtosContainer.length === 0) return;


    const parsePrice = txt => {
        if (!txt) return 0;
        const num = txt.replace(/[^0-9,.-]+/g, '').replace(',', '.');
        return parseFloat(num) || 0;
    };

    const controls = `
    <div class="itapets-controls d-flex flex-wrap gap-3 align-items-center mb-4">
  <input class="search form-control" type="search" placeholder="Buscar produtos..." aria-label="buscar produtos" style="max-width: 200px;">
  
  <select class="sort form-select" aria-label="Ordenar" style="max-width: 160px;">
    <option value="default">Ordenar</option>
    <option value="price-asc">Preço ↑</option>
    <option value="price-desc">Preço ↓</option>
    <option value="name-asc">Nome A-Z</option>
    <option value="name-desc">Nome Z-A</option>
  </select>
  
  <div class="price-filter d-flex align-items-center gap-2">
    <label class="form-label mb-0">R$</label>
    <input class="min-price form-control" type="number" step="0.01" min="0" placeholder="min" aria-label="preço mínimo" style="width: 90px;">
    <label class="form-label mb-0">- R$</label>
    <input class="max-price form-control" type="number" step="0.01" min="0" placeholder="max" aria-label="preço máximo" style="width: 90px;">
  </div>
</div>

  `;
    $produtosContainer.before(controls);


    const $productNodes = $produtosContainer.find('article');
    const products = $productNodes.map(function () {
        const $node = $(this);
        const $titleEl = $node.find('h3');
        const $priceEl = $node.find('span');
        return {
            node: $node,
            title: $titleEl.text().trim(),
            price: parsePrice($priceEl.text()),
            priceEl: $priceEl,
            titleEl: $titleEl,
            linkEl: $node.find('a'),
            visible: true
        };
    }).get();


    const $searchInput = $('.search');
    const $sortSelect = $('.sort');
    const $minPriceInput = $('.min-price');
    const $maxPriceInput = $('.max-price');

    function applyFiltersAndSort() {
        const q = ($searchInput.val() || '').trim().toLowerCase();
        const sort = $sortSelect.val();
        const minP = parseFloat($minPriceInput.val()) || 0;
        const maxP = parseFloat($maxPriceInput.val()) || Infinity;


        products.forEach(p => {
            const matchSearch = q === '' || p.title.toLowerCase().includes(q);
            const matchPrice = p.price >= minP && p.price <= maxP;
            p.visible = matchSearch && matchPrice;
            p.node.toggleClass('d-none', !p.visible);
        });


        const visible = products.filter(p => p.visible);
        if (sort !== 'default') {
            let sorted = visible.slice();
            if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
            if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
            if (sort === 'name-asc') sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
            if (sort === 'name-desc') sorted.sort((a, b) => b.title.localeCompare(a.title, 'pt-BR'));
            sorted.forEach(s => $produtosContainer.append(s.node));
            products.filter(p => !p.visible).forEach(p => $produtosContainer.append(p.node));
        }
    }

    $searchInput.on('input', applyFiltersAndSort);
    $sortSelect.on('change', applyFiltersAndSort);
    $minPriceInput.on('input', applyFiltersAndSort);
    $maxPriceInput.on('input', applyFiltersAndSort);

    applyFiltersAndSort();

    const observer = new IntersectionObserver(entries => {
        entries.forEach(ent => {
            const el = ent.target;
            if (ent.isIntersecting) {
                $(el).css({ transition: 'opacity .45s ease, transform .45s ease', opacity: 1, transform: 'translateY(0)' });
            } else {
                $(el).css({ opacity: 0, transform: 'translateY(18px)' });
            }
        });
    }, { threshold: 0.12 });

    products.forEach(p => {
        p.node.css({ opacity: 0, transform: 'translateY(18px)' });
        observer.observe(p.node[0]);
    });

  
    $(window).on('keydown', e => {
        if (e.key === '/') {
            if (document.activeElement !== $searchInput[0]) {
                e.preventDefault();
                $searchInput.focus();
            }
        }
    });
});

document.querySelectorAll("a").forEach(a => {
    a.classList.add("text-decoration-none");
});

// FIM DA PARTE DO INDEX.HTML

// PARTE DOS PRODUTOS

$(document).ready(function () {

    const precoBase = parseFloat($('.preco').text().replace('R$', '').replace(',', '.'));
    const $inputQtd = $('.quantidade');
    const $total = $('.preco-total');

    function atualizarTotal() {
        const qtd = parseInt($inputQtd.val());
        const total = (precoBase * qtd).toFixed(2).replace('.', ',');
        $total.text(`Total: R$ ${total}`);
    }

    $('.mais').click(function () {
        let qtd = parseInt($inputQtd.val());
        $inputQtd.val(qtd + 1);
        atualizarTotal();
    });

    $('.menos').click(function () {
        let qtd = parseInt($inputQtd.val());
        if (qtd > 1) {
            $inputQtd.val(qtd - 1);
            atualizarTotal();
        }
    });

    atualizarTotal();
});


// FIM DA PARTE DOS PRODUTOS