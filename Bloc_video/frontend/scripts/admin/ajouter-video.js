import { supabase } from '../supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const addVideoForm = document.getElementById('add-video-form');
    const categorieSelect = document.getElementById('categorie');
    const submitButton = addVideoForm.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const videoFileInput = document.getElementById('video-file');
    const thumbnailFileInput = document.getElementById('thumbnail-file');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/frontend/pages/admin/login.html';
        return;
    }
    const user = session.user;

    async function loadCategories() {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('id, nom');

        if (error) {
            console.error('Erreur chargement catégories:', error);
            errorMessage.textContent = `Erreur chargement catégories: ${error.message}`;
            errorMessage.style.display = 'block';
            errorMessage.classList.add('error-message');
            return;
        }

        categorieSelect.innerHTML = categories.map(cat => 
            `<option value="${cat.id}">${cat.nom}</option>`
        ).join('');
    }

    addVideoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        errorMessage.classList.remove('error-message');

        submitButton.classList.add('loading');
        submitButton.disabled = true;

        const videoFile = videoFileInput.files[0];
        const thumbnailFile = thumbnailFileInput.files[0];

        if (!videoFile || !thumbnailFile) {
            errorMessage.textContent = 'Veuillez sélectionner un fichier vidéo et une miniature.';
            errorMessage.style.display = 'block';
            errorMessage.classList.add('error-message');
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            return;
        }

        const videoFileName = `${Date.now()}-${videoFile.name}`;
        const thumbnailFileName = `${Date.now()}-${thumbnailFile.name}`;

        // Upload de la vidéo
        const { data: videoUploadData, error: videoUploadError } = await supabase.storage
            .from('videos')
            .upload(videoFileName, videoFile);

        if (videoUploadError) {
            console.error('Erreur upload vidéo:', videoUploadError);
            errorMessage.textContent = `Erreur lors de l'upload de la vidéo: ${videoUploadError.message}`;
            errorMessage.style.display = 'block';
            errorMessage.classList.add('error-message');
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            return;
        }

        // Upload de la miniature
        const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabase.storage
            .from('thumbnails')
            .upload(thumbnailFileName, thumbnailFile);

        if (thumbnailUploadError) {
            console.error('Erreur upload miniature:', thumbnailUploadError);
            errorMessage.textContent = `Erreur lors de l'upload de la miniature: ${thumbnailUploadError.message}`;
            errorMessage.style.display = 'block';
            errorMessage.classList.add('error-message');
            // Tenter de supprimer la vidéo uploadée si la miniature échoue
            await supabase.storage.from('videos').remove([videoUploadData.path]);
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            return;
        }

        // Obtenir les URLs publiques
        const { data: videoPublicUrl } = supabase.storage.from('videos').getPublicUrl(videoUploadData.path);
        const { data: thumbnailPublicUrl } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailUploadData.path);

        const newVideo = {
            titre: document.getElementById('titre').value,
            description: document.getElementById('description').value,
            url: videoPublicUrl.publicUrl, // URL publique de la vidéo
            miniature: thumbnailPublicUrl.publicUrl, // URL publique de la miniature
            categorie_id: document.getElementById('categorie').value,
            user_id: user.id,
            date_post: new Date()
        };

        const { error } = await supabase.from('videos').insert([newVideo]);

        submitButton.classList.remove('loading');
        submitButton.disabled = false;

        if (error) {
            console.error('Erreur ajout vidéo:', error);
            errorMessage.textContent = `Erreur lors de l'ajout de la vidéo: ${error.message}`;
            errorMessage.style.display = 'block';
            errorMessage.classList.add('error-message');
            // Tenter de supprimer les fichiers uploadés si l'insertion en DB échoue
            await supabase.storage.from('videos').remove([videoUploadData.path]);
            await supabase.storage.from('thumbnails').remove([thumbnailUploadData.path]);
        } else {
            successMessage.textContent = 'Vidéo ajoutée avec succès !';
            successMessage.style.display = 'block';
            successMessage.classList.add('success-message');
            addVideoForm.reset();
            setTimeout(() => {
                successMessage.style.display = 'none';
                window.location.href = '/frontend/pages/admin/dashboard.html';
            }, 2000);
        }
    });

    loadCategories();
});