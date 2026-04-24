const searchInput = document.getElementById('search-input');
const resultsGrid = document.getElementById('results-grid');
const noResults = document.getElementById('no-results');
const loadingSpinner = document.getElementById('loading-spinner');
const statsDisplay = document.getElementById('stats-display');

let searchTimeout = null;

async function fetchStudents(query = '') {
    loadingSpinner.classList.remove('hidden');
    
    try {
        const response = await fetch(`/api/students?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        renderResults(data);
        
        if (query) {
            statsDisplay.textContent = `${data.length} arquivos encontrados`;
        } else {
            statsDisplay.textContent = `636 Registros Ativos`;
        }
    } catch (error) {
        console.error('Error fetching students:', error);
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function formatWhatsApp(phone) {
    if (!phone) return '#';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 || cleaned.length === 11) {
        return `https://wa.me/55${cleaned}`;
    }
    return `https://wa.me/${cleaned}`;
}

function renderResults(students) {
    resultsGrid.innerHTML = '';
    
    if (students.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    students.forEach((student, index) => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.style.animationDelay = `${index * 0.05}s`;

        const waContato1 = formatWhatsApp(student.contato1);
        const waContato2 = formatWhatsApp(student.contato2);
        const waFiliacao1 = formatWhatsApp(student.contato_filiacao1);
        const waFiliacao2 = formatWhatsApp(student.contato_filiacao2);

        card.innerHTML = `
            <div class="card-header">
                <h3>${student.nome}</h3>
                <div class="badges">
                    <span class="badge badge-period"><i class="fas fa-clock"></i> ${student.periodo}</span>
                    <span class="badge badge-class"><i class="fas fa-users"></i> Turma ${student.turma}</span>
                </div>
            </div>
            
            <div class="contact-section">
                <div class="contact-group">
                    <span class="contact-label"><i class="fas fa-user-graduate"></i> Contatos do Aluno</span>
                    ${student.contato1 ? `<a href="${waContato1}" target="_blank" class="contact-item link"><i class="fab fa-whatsapp"></i> ${student.contato1} <span class="action-text">WhatsApp</span></a>` : ''}
                    ${student.contato2 ? `<a href="${waContato2}" target="_blank" class="contact-item link"><i class="fab fa-whatsapp"></i> ${student.contato2} <span class="action-text">WhatsApp</span></a>` : ''}
                </div>

                <div class="contact-group">
                    <span class="contact-label"><i class="fas fa-user-friends"></i> Responsável 1: ${student.filiacao1 || 'N/A'}</span>
                    ${student.contato_filiacao1 ? `<a href="${waFiliacao1}" target="_blank" class="contact-item link"><i class="fab fa-whatsapp"></i> ${student.contato_filiacao1} <span class="action-text">WhatsApp</span></a>` : '<span class="contact-item">Sem telefone cadastrado</span>'}
                </div>

                ${student.filiacao2 ? `
                <div class="contact-group">
                    <span class="contact-label"><i class="fas fa-user-friends"></i> Responsável 2: ${student.filiacao2}</span>
                    ${student.contato_filiacao2 ? `<a href="${waFiliacao2}" target="_blank" class="contact-item link"><i class="fab fa-whatsapp"></i> ${student.contato_filiacao2} <span class="action-text">WhatsApp</span></a>` : '<span class="contact-item">Sem telefone cadastrado</span>'}
                </div>` : ''}
            </div>
        `;
        
        resultsGrid.appendChild(card);
    });
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchStudents(query);
    }, 300);
});

// Initial load
fetchStudents();
