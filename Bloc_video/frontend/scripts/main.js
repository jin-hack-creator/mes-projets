import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const categoriesNav = document.getElementById('categories-nav');
    const videosGrid = document.getElementById('videos-grid');

    // 1. Charger les catégories
    async function loadCategories() {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('nom, slug');

        if (error) {
            console.error('Erreur lors du chargement des catégories:', error);
            return;
        }

        categoriesNav.innerHTML = categories.map(cat => `
            <a href="/pages/categorie.html?slug=${cat.slug}">${cat.nom}</a>
        `).join('');
    }

    // 2. Charger les dernières vidéos
    async function loadVideos() {
        const { data: videos, error } = await supabase
            .from('videos')
            .select('titre, miniature, id')
            .order('date_post', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Erreur lors du chargement des vidéos:', error);
            return;
        }

        videosGrid.innerHTML = videos.map(video => `
            <div class="video-card">
                <a href="/pages/video.html?id=${video.id}">
                    <img src="${video.miniature}" alt="${video.titre}">
                    <h3>${video.titre}</h3>
                </a>
            </div>
        `).join('');
    }

    // Initialiser le chargement
    loadCategories();
    loadVideos();
});
