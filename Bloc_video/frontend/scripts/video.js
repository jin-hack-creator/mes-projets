import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const videoDetails = document.getElementById('video-details');
    const categoriesNav = document.getElementById('categories-nav');
    const openNoteModalBtn = document.getElementById('open-note-modal-btn');
    const anonymousNoteModal = document.getElementById('anonymous-note-modal');
    const closeButton = anonymousNoteModal.querySelector('.close-button');
    const anonymousNoteForm = document.getElementById('anonymous-note-form');
    const noteContentInput = document.getElementById('note-content');
    const noteMessage = document.getElementById('note-message');
    const sendNoteButton = anonymousNoteForm.querySelector('button[type="submit"]');

    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('id');

    async function loadCategories() {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('nom, slug');

        if (error) {
            console.error('Erreur lors du chargement des catégories:', error);
            return;
        }

        categoriesNav.innerHTML = categories.map(cat => `
            <a href="/frontend/pages/categorie.html?slug=${cat.slug}">${cat.nom}</a>
        `).join('');
    }

    async function loadVideo() {
        if (!videoId) {
            videoDetails.innerHTML = `<p>Aucune vidéo sélectionnée.</p>`;
            return;
        }

        const { data: video, error } = await supabase
            .from('videos')
            .select(`
                titre,
                description,
                url,
                date_post,
                categories ( nom, slug )
            `)
            .eq('id', videoId)
            .single();

        if (error) {
            console.error('Erreur lors du chargement de la vidéo:', error);
            videoDetails.innerHTML = `<p>Erreur lors du chargement de la vidéo.</p>`;
            return;
        }

        document.title = `${video.titre} - Bloc Vidéo`;

        videoDetails.innerHTML = `
            <div class="video-player-container">
                <iframe 
                    width="100%" 
                    height="500"
                    src="${video.url.replace("watch?v=", "embed/")}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="video-details">
                <h2>${video.titre}</h2>
                <p class="video-meta"><span>Catégorie: <a href="/frontend/pages/categorie.html?slug=${video.categories.slug}">${video.categories.nom}</a></span><span>Publié le: ${new Date(video.date_post).toLocaleDateString()}</span></p>
                <p>${video.description}</p>
            </div>
        `;
    }

    // Gérer l'ouverture de la modale
    openNoteModalBtn.addEventListener('click', () => {
        anonymousNoteModal.style.display = 'flex';
        noteContentInput.value = ''; // Réinitialiser le champ
        noteMessage.textContent = ''; // Réinitialiser le message
        noteMessage.classList.remove('success-message', 'error-message');
    });

    // Gérer la fermeture de la modale
    closeButton.addEventListener('click', () => {
        anonymousNoteModal.style.display = 'none';
    });

    // Fermer la modale si on clique en dehors du contenu
    anonymousNoteModal.addEventListener('click', (e) => {
        if (e.target === anonymousNoteModal) {
            anonymousNoteModal.style.display = 'none';
        }
    });

    // Gérer l'envoi de la note anonyme
    anonymousNoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const content = noteContentInput.value;

        if (!content.trim()) {
            noteMessage.textContent = 'Veuillez écrire une note.';
            noteMessage.classList.add('error-message');
            return;
        }

        sendNoteButton.classList.add('loading');
        sendNoteButton.disabled = true;

        const { error } = await supabase
            .from('anonymous_notes')
            .insert([{ video_id: videoId, content: content }]);

        sendNoteButton.classList.remove('loading');
        sendNoteButton.disabled = false;

        if (error) {
            console.error('Erreur envoi note anonyme:', error);
            noteMessage.textContent = `Erreur lors de l'envoi: ${error.message}`;
            noteMessage.classList.add('error-message');
        } else {
            noteMessage.textContent = 'Note envoyée avec succès ! Merci pour votre retour.';
            noteMessage.classList.add('success-message');
            noteContentInput.value = '';
            setTimeout(() => {
                anonymousNoteModal.style.display = 'none';
            }, 3000);
        }
    });

    loadCategories();
    loadVideo();
});
