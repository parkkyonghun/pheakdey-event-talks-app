document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule');
    const categorySearchInput = document.getElementById('category-search');
    const categoryFiltersContainer = document.getElementById('category-filters');

    // talksData and fullSchedule are globally available from generate-site.js
    let displayedSchedule = [...fullSchedule];

    function renderSchedule(scheduleToRender) {
        scheduleContainer.innerHTML = ''; // Clear previous schedule

        scheduleToRender.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('schedule-item');

            if (item.type === 'talk') {
                itemDiv.dataset.categories = item.category.map(cat => cat.toLowerCase()).join(' ');
                itemDiv.innerHTML = `
                    <p class="time">${item.startTime} - ${item.endTime}</p>
                    <h2>${item.title}</h2>
                    <p class="speakers">Speaker(s): ${item.speakers.join(', ')}</p>
                    <p>${item.description}</p>
                    <div class="categories">
                        ${item.category.map(cat => `<span class="category-label">${cat}</span>`).join('')}
                    </div>
                `;
            } else if (item.type === 'break') {
                itemDiv.classList.add('break');
                itemDiv.innerHTML = `
                    <p class="time">${item.startTime} - ${item.endTime}</p>
                    <h2>${item.name}</h2>
                `;
            }
            scheduleContainer.appendChild(itemDiv);
        });
    }

    function populateCategoryFilters() {
        const allCategories = new Set();
        talksData.forEach(talk => {
            talk.category.forEach(cat => allCategories.add(cat));
        });

        categoryFiltersContainer.innerHTML = '';
        allCategories.forEach(cat => {
            const tag = document.createElement('span');
            tag.classList.add('category-tag');
            tag.textContent = cat;
            tag.addEventListener('click', () => toggleCategoryFilter(cat));
            categoryFiltersContainer.appendChild(tag);
        });
    }

    let activeCategories = new Set();

    function toggleCategoryFilter(category) {
        const categoryTag = Array.from(categoryFiltersContainer.children).find(tag => tag.textContent === category);

        if (activeCategories.has(category.toLowerCase())) {
            activeCategories.delete(category.toLowerCase());
            categoryTag.classList.remove('active');
        } else {
            activeCategories.add(category.toLowerCase());
            categoryTag.classList.add('active');
        }
        applyFilters();
    }

    function applyFilters() {
        let filteredTalks = [];
        if (activeCategories.size === 0 && categorySearchInput.value.trim() === '') {
            filteredTalks = [...talksData]; // No filters, show all talks
        } else {
            filteredTalks = talksData.filter(talk => {
                const matchesSearch = categorySearchInput.value.trim() === '' ||
                                      talk.category.some(cat => cat.toLowerCase().includes(categorySearchInput.value.trim().toLowerCase()));
                const matchesCategoryTags = activeCategories.size === 0 ||
                                            talk.category.some(cat => activeCategories.has(cat.toLowerCase()));
                return matchesSearch && matchesCategoryTags;
            });
        }

        // Reconstruct the full schedule with filtered talks and breaks
        const newDisplayedSchedule = [];
        fullSchedule.forEach(item => {
            if (item.type === 'talk') {
                if (filteredTalks.some(ft => ft.id === item.id)) {
                    newDisplayedSchedule.push(item);
                }
            } else {
                newDisplayedSchedule.push(item); // Always include breaks
            }
        });

        renderSchedule(newDisplayedSchedule);
    }

    categorySearchInput.addEventListener('input', applyFilters);

    // Initial render
    renderSchedule(fullSchedule);
    populateCategoryFilters();
});
