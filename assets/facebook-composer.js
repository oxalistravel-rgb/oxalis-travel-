(function() {
    let adminPassword = '';

    // Intercept fetch to grab the password when the user logs in or interacts
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        if (args[1] && args[1].headers && args[1].headers['x-admin-password']) {
            adminPassword = args[1].headers['x-admin-password'];
        }
        return origFetch.apply(this, args);
    };

    function esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    async function fetchProgrammes() {
        const res = await window.fetch('/api/programmes', {
            headers: { 'x-admin-password': adminPassword }
        });
        if (res.ok) {
            return await res.json();
        }
        return [];
    }

    async function deleteProgramme(id) {
        if (!confirm("Supprimer ce programme ?")) return;
        await window.fetch(`/api/programmes/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-password': adminPassword }
        });
        renderFeed();
    }

    async function saveProgramme(data, id = null) {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/programmes/${id}` : '/api/programmes';
        await window.fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': adminPassword
            },
            body: JSON.stringify(data)
        });
        renderFeed();
    }

    function createComposerUI(programme = null, onCancel = null) {
        const container = document.createElement('div');
        container.className = 'bg-white rounded-2xl shadow p-4 mb-6 border border-border';

        const isEdit = !!programme;
        const p = programme || {};

        container.innerHTML = `
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    OT
                </div>
                <div class="flex-1">
                    <input type="text" id="fb-dest" placeholder="Destination (ex: حمّام الشارف)" class="w-full text-lg font-bold border-none focus:ring-0 p-0" value="${esc(p.destination)}">
                </div>
            </div>
            <textarea id="fb-desc" placeholder="Que voulez-vous partager sur ce programme ?" class="w-full border-none focus:ring-0 p-0 mb-4 text-gray-700 resize-none" rows="3">${esc(p.description)}</textarea>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <input type="text" id="fb-prix" placeholder="Prix (ex: 7000 دج)" class="border border-gray-200 rounded p-2 text-sm" value="${esc(p.prix)}">
                <input type="text" id="fb-dates" placeholder="Dates (ex: 22 et 23 mai)" class="border border-gray-200 rounded p-2 text-sm" value="${esc(p.dates)}">
                <input type="text" id="fb-photo" placeholder="URL de la photo" class="border border-gray-200 rounded p-2 text-sm" value="${esc(p.image || '')}">
                <input type="text" id="fb-video" placeholder="URL de la vidéo" class="border border-gray-200 rounded p-2 text-sm" value="${esc(p.video || '')}">
            </div>

            <div class="flex justify-between items-center border-t pt-3">
                <div class="flex gap-2 text-gray-500">
                    <button class="p-2 hover:bg-gray-100 rounded-full cursor-pointer flex items-center gap-1 text-sm" onclick="document.getElementById('fb-photo').focus()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        Photo
                    </button>
                    <button class="p-2 hover:bg-gray-100 rounded-full cursor-pointer flex items-center gap-1 text-sm" onclick="document.getElementById('fb-video').focus()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        Vidéo
                    </button>
                </div>
                <div class="flex gap-2">
                    ${isEdit ? `<button id="fb-cancel" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Annuler</button>` : ''}
                    <button id="fb-submit" class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">${isEdit ? 'Enregistrer' : 'Publier'}</button>
                </div>
            </div>
        `;

        if (isEdit) {
            container.querySelector('#fb-cancel').addEventListener('click', onCancel);
        }

        container.querySelector('#fb-submit').addEventListener('click', () => {
            const dest = container.querySelector('#fb-dest').value.trim();
            const desc = container.querySelector('#fb-desc').value.trim();
            const prix = container.querySelector('#fb-prix').value.trim();
            const dates = container.querySelector('#fb-dates').value.trim();
            const image = container.querySelector('#fb-photo').value.trim();
            const video = container.querySelector('#fb-video').value.trim();

            if (!dest) {
                alert("La destination est requise");
                return;
            }

            const data = {
                ...p,
                destination: dest,
                description: desc,
                prix: prix,
                dates: dates,
                image: image,
                video: video,
                actif: p.actif !== undefined ? p.actif : true
            };

            saveProgramme(data, p.id);
        });

        return container;
    }

    async function renderFeed() {
        const titleEl = Array.from(document.querySelectorAll('h2')).find(el => el.textContent.includes('Vos programmes'));
        if (!titleEl) return;

        // Hide original elements
        const parent = titleEl.parentElement;
        if (parent) {
            Array.from(parent.children).forEach(child => {
                if (child.tagName === 'BUTTON' && child.textContent.includes('Ajouter un programme')) {
                    child.style.display = 'none';
                }
                if (child.classList.contains('space-y-4') || (child.classList.contains('text-center') && child.textContent.includes('Aucun programme'))) {
                    child.style.display = 'none';
                }
            });
        }
        titleEl.style.display = 'none';

        let fbContainer = document.getElementById('fb-custom-feed');
        if (!fbContainer) {
            fbContainer = document.createElement('div');
            fbContainer.id = 'fb-custom-feed';
            fbContainer.className = 'max-w-2xl mx-auto';
            parent.appendChild(fbContainer);
        }

        fbContainer.innerHTML = '';

        // Add Composer
        fbContainer.appendChild(createComposerUI());

        // Fetch and Add Posts
        const programmes = await fetchProgrammes();

        // Sort newest first based on id if it's a timestamp
        programmes.sort((a, b) => {
            const idA = parseInt(a.id);
            const idB = parseInt(b.id);
            if (!isNaN(idA) && !isNaN(idB)) return idB - idA;
            return 0;
        });

        programmes.forEach(p => {
            const post = document.createElement('div');
            post.className = 'bg-white rounded-2xl shadow mb-6 overflow-hidden border border-border';
            post.id = `fb-post-${p.id}`;

            let mediaHtml = '';
            if (p.video) {
                // simple video embed if it's a direct url or youtube
                let videoSrc = esc(p.video);
                if (videoSrc.includes('youtube.com/watch?v=')) {
                    const vid = videoSrc.split('v=')[1].split('&')[0];
                    videoSrc = `https://www.youtube.com/embed/${vid}`;
                    mediaHtml = `<iframe class="w-full h-64 object-cover" src="${videoSrc}" frameborder="0" allowfullscreen></iframe>`;
                } else {
                    mediaHtml = `<video class="w-full h-64 object-cover" controls src="${videoSrc}"></video>`;
                }
            } else if (p.image) {
                mediaHtml = `<img class="w-full h-64 object-cover" src="${esc(p.image)}" alt="${esc(p.destination)}">`;
            }

            post.innerHTML = `
                <div class="p-4 flex justify-between items-start">
                    <div class="flex gap-3">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            OT
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-900 leading-tight">${esc(p.destination)}</h3>
                            <p class="text-xs text-gray-500">${esc(p.dates)} • ${esc(p.prix)}</p>
                        </div>
                    </div>
                    <div class="relative group">
                        <button class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100" aria-label="Options">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                        </button>
                        <div class="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border hidden group-hover:block z-10">
                            <button class="fb-edit-btn w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Modifier</button>
                            <button class="fb-delete-btn w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Supprimer</button>
                        </div>
                    </div>
                </div>
                <div class="px-4 pb-3">
                    <p class="text-gray-800 whitespace-pre-wrap" dir="auto">${esc(p.description)}</p>
                </div>
                ${mediaHtml}
            `;

            // Bind actions
            post.querySelector('.fb-delete-btn').addEventListener('click', () => deleteProgramme(p.id));
            post.querySelector('.fb-edit-btn').addEventListener('click', () => {
                const editor = createComposerUI(p, () => {
                    renderFeed();
                });
                post.replaceWith(editor);
            });

            fbContainer.appendChild(post);
        });
    }

    const observer = new MutationObserver(() => {
        const title = Array.from(document.querySelectorAll('h2')).find(el => el.textContent.includes('Vos programmes'));
        if (title && !document.getElementById('fb-custom-feed')) {
            renderFeed();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
