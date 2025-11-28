document.addEventListener('DOMContentLoaded', () => {
    let students = JSON.parse(localStorage.getItem('students')) || [
        { id: 1, nim: '2110012345', name: 'Ahmad Rizky', email: 'ahmad@example.com', jurusan: 'Teknologi Informasi', status: 'Aktif' },
        { id: 2, nim: '2210056789', name: 'Siti Nurhaliza', email: 'siti@example.com', jurusan: 'Sistem Informasi', status: 'Aktif' }
    ];

    const sidebar = document.getElementById('sidebar');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const btnAdd = document.getElementById('btnAdd');
    const btnAddTop = document.getElementById('btnAddTop');
    const tableBody = document.getElementById('tableBody');
    const emptyMessage = document.getElementById('emptyMessage');
    const menuLinks = document.querySelectorAll('.menu-link');

    const studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const studentForm = document.getElementById('studentForm');
    const deleteName = document.getElementById('deleteName');
    const confirmDelete = document.getElementById('confirmDelete');

    const totalMahasiswa = document.getElementById('totalMahasiswa');
    const totalJurusan = document.getElementById('totalJurusan');
    const totalAktif = document.getElementById('totalAktif');

    let currentEditId = null;
    let deleteId = null;

    function saveToLocalStorage() {
        localStorage.setItem('students', JSON.stringify(students));
    }

    function updateSummary() {
        totalMahasiswa.textContent = students.length;
        const jurusanSet = new Set(students.map(s => s.jurusan));
        totalJurusan.textContent = jurusanSet.size;
        totalAktif.textContent = students.filter(s => s.status === 'Aktif').length;
    }

    function renderTable() {
        if (students.length === 0) {
            tableBody.innerHTML = '';
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            tableBody.innerHTML = students.map((s, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${s.nim}</strong></td>
                    <td>${s.name}</td>
                    <td class="d-none d-sm-table-cell">${s.email}</td>
                    <td><span class="badge bg-primary">${s.jurusan}</span></td>
                    <td class="d-none d-md-table-cell"><span class="badge bg-success">${s.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" data-id="${s.id}" data-action="edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" data-id="${s.id}" data-name="${s.name}" data-action="delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        updateSummary();
    }

    function resetForm() {
        studentForm.reset();
        currentEditId = null;
        document.getElementById('editId').value = '';
    }

    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 260px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    // Sidebar toggle (mobile)
    toggleSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Menu aktif + scroll halus ke section
    menuLinks.forEach(btn => {
        btn.addEventListener('click', () => {
            menuLinks.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Buka modal tambah
    function openAddModal() {
        resetForm();
        document.getElementById('modalTitle').textContent = 'Tambah Mahasiswa Baru';
        studentModal.show();
    }
    btnAdd.addEventListener('click', openAddModal);
    btnAddTop.addEventListener('click', openAddModal);

    // Submit form (create / update)
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nim = document.getElementById('nim').value.trim();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const jurusan = document.getElementById('jurusan').value;

        if (!nim || !name || !email || !jurusan) {
            showAlert('Semua field wajib diisi.', 'warning');
            return;
        }

        if (currentEditId) {
            const idx = students.findIndex(s => s.id === currentEditId);
            if (idx !== -1) {
                students[idx] = { ...students[idx], nim, name, email, jurusan };
            }
            showAlert('Data mahasiswa berhasil diupdate.', 'success');
        } else {
            const newId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
            students.push({ id: newId, nim, name, email, jurusan, status: 'Aktif' });
            showAlert('Data mahasiswa berhasil ditambahkan.', 'success');
        }

        saveToLocalStorage();
        renderTable();
        studentModal.hide();
        resetForm();
    });

    // Aksi tabel (edit / delete)
    tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = parseInt(btn.dataset.id, 10);

        if (action === 'edit') {
            const s = students.find(st => st.id === id);
            if (!s) return;
            currentEditId = id;
            document.getElementById('nim').value = s.nim;
            document.getElementById('name').value = s.name;
            document.getElementById('email').value = s.email;
            document.getElementById('jurusan').value = s.jurusan;
            document.getElementById('modalTitle').textContent = 'Edit Mahasiswa';
            studentModal.show();
        }

        if (action === 'delete') {
            deleteId = id;
            deleteName.textContent = btn.dataset.name;
            deleteModal.show();
        }
    });

    confirmDelete.addEventListener('click', () => {
        if (!deleteId) return;
        students = students.filter(s => s.id !== deleteId);
        saveToLocalStorage();
        renderTable();
        deleteModal.hide();
        showAlert('Data mahasiswa berhasil dihapus.', 'danger');
        deleteId = null;
    });

    // Init
    saveToLocalStorage();
    renderTable();
});
