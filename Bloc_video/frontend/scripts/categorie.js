import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const categorieNom = document.getElementById('categorie-nom');
    const videosGrid = document.getElementById('videos-grid');
    const categoriesNav = document.getElementById('categories-nav');

    const params = new URLSearchParams(window.location.search);
    const categorySlug = params.get('slug');

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

    async function loadCategoryVideos() {
        if (!categorySlug) {
            categorieNom.textContent = 'Catégorie non trouvée';
            return;
        }

        const { data: category, error: categoryError } = await supabase
            .from('categories')
            .select('nom')
            .eq('slug', categorySlug)
            .single();

        if (categoryError) {
            console.error('Erreur:', categoryError);
            categorieNom.textContent = 'Catégorie non trouvée';
            return;
        }

        document.title = `${category.nom} - Bloc Vidéo`;
        categorieNom.textContent = `Catégorie : ${category.nom}`;

        const { data: videos, error: videosError } = await supabase
            .from('videos')
            .select('titre, miniature, id')
            .in('categorie_id', 
                supabase.from('categories').select('id').eq('slug', categorySlug)
            )
            .order('date_post', { ascending: false });

        if (videosError) {
            console.error('Erreur lors du chargement des vidéos:', videosError);
            return;
        }

        videosGrid.innerHTML = videos.map(video => `
            <div class="video-card">
                <a href="/frontend/pages/video.html?id=${video.id}">
                    <img src="${video.miniature}" alt="${video.titre}">
                    <h3>${video.titre}</h3>
                </a>
            </div>
        `).join('');
    }

    loadCategories();
    loadCategoryVideos();
});
