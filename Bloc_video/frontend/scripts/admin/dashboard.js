import { supabase } from '../supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const logoutBtn = document.getElementById('logout-btn');
    const addAdminBtn = document.getElementById('add-admin-btn');
    const addAdminSection = document.getElementById('add-admin-section');
    const addAdminForm = document.getElementById('add-admin-form');
    const addAdminSubmitBtn = addAdminForm.querySelector('button[type="submit"]');
    const addAdminMessage = document.getElementById('add-admin-message');
    const videosTableBody = document.querySelector('#videos-table tbody');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/frontend/pages/admin/login.html';
        return;
    }

    logoutBtn.addEventListener('click', async () => {
        logoutBtn.classList.add('loading');
        logoutBtn.disabled = true;
        await supabase.auth.signOut();
        window.location.href = '/frontend/pages/admin/login.html';
    });

    addAdminBtn.addEventListener('click', () => {
        addAdminSection.style.display = addAdminSection.style.display === 'none' ? 'block' : 'none';
        addAdminMessage.textContent = '';
        addAdminMessage.classList.remove('error-message', 'success-message');
    });

    addAdminForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        addAdminMessage.textContent = 'Ajout en cours...';
        addAdminMessage.classList.remove('error-message', 'success-message');
        addAdminSubmitBtn.classList.add('loading');
        addAdminSubmitBtn.disabled = true;

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        addAdminSubmitBtn.classList.remove('loading');
        addAdminSubmitBtn.disabled = false;

        if (error) {
            addAdminMessage.textContent = `Erreur: ${error.message}`;
            addAdminMessage.classList.add('error-message');
        } else if (data.user) {
            addAdminMessage.textContent = `Administrateur ${data.user.email} ajouté avec succès ! Un email de confirmation a été envoyé.`;
            addAdminMessage.classList.add('success-message');
            addAdminForm.reset();
        } else {
            addAdminMessage.textContent = 'Erreur inattendue lors de l\'ajout de l\'administrateur.';
            addAdminMessage.classList.add('error-message');
        }
    });

    async function loadVideos() {
        const { data: videos, error } = await supabase
            .from('videos')
            .select(`
                id,
                titre,
                date_post,
                categories ( nom )
            `)
            .order('date_post', { ascending: false });

        if (error) {
            console.error('Erreur lors du chargement des vidéos:', error);
            return;
        }

        videosTableBody.innerHTML = videos.map(video => `
            <tr data-id="${video.id}">
                <td data-label="Titre">${video.titre}</td>
                <td data-label="Catégorie">${video.categories ? video.categories.nom : 'N/A'}</td>
                <td data-label="Date de publication">${new Date(video.date_post).toLocaleDateString()}</td>
                <td data-label="Actions" class="actions">
                    <a href="#">Éditer</a>
                    <button class="delete-btn"><span class="btn-text">Supprimer</span></button>
                </td>
            </tr>
        `).join('');
    }

    videosTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const deleteButton = e.target.closest('.delete-btn');
            const row = deleteButton.closest('tr');
            const videoId = row.dataset.id;

            if (confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
                deleteButton.classList.add('loading');
                deleteButton.disabled = true;

                const { error } = await supabase
                    .from('videos')
                    .delete()
                    .eq('id', videoId);

                deleteButton.classList.remove('loading');
                deleteButton.disabled = false;

                if (error) {
                    console.error('Erreur de suppression:', error);
                    alert(`La suppression a échoué: ${error.message}`);
                } else {
                    row.remove();
                    alert('Vidéo supprimée avec succès.');
                }
            }
        }
    });

    loadVideos();
});