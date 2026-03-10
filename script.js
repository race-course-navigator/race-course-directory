// script.js - Logic for rendering and filtering
// courses and REGION_MAP are loaded from data.js

const RACE_REGION_MAP = {
    "北海道・東北": ["北海道", "青森", "岩手", "みやぎ", "宮城", "秋田", "山形", "福島"],
    "関東": ["茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川"],
    "中部": ["新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜", "静岡", "愛知"],
    "近畿": ["三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山"],
    "中国・四国": ["鳥取", "島根", "岡山", "広島", "山口", "徳島", "香川", "愛媛", "高知"],
    "九州・沖縄": ["福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"]
};

// "宮城" also matches "みやぎ" just in case

const PREF_SUFFIX_MAP = {
    "北海道": "北海道", "青森": "青森県", "岩手": "岩手県", "宮城": "宮城県", "みやぎ": "宮城県", "秋田": "秋田県", "山形": "山形県", "福島": "福島県",
    "茨城": "茨城県", "栃木": "栃木県", "群馬": "群馬県", "埼玉": "埼玉県", "千葉": "千葉県", "東京": "東京都", "神奈川": "神奈川県",
    "新潟": "新潟県", "富山": "富山県", "石川": "石川県", "福井": "福井県", "山梨": "山梨県", "長野": "長野県", "岐阜": "岐阜県", "静岡": "静岡県", "愛知": "愛知県",
    "三重": "三重県", "滋賀": "滋賀県", "京都": "京都府", "大阪": "大阪府", "兵庫": "兵庫県", "奈良": "奈良県", "和歌山": "和歌山県",
    "鳥取": "鳥取県", "島根": "島根県", "岡山": "岡山県", "広島": "広島県", "山口": "山口県", "徳島": "徳島県", "香川": "香川県", "愛媛": "愛媛県", "高知": "高知県",
    "福岡": "福岡県", "佐賀": "佐賀県", "長崎": "長崎県", "熊本": "熊本県", "大分": "大分県", "宮崎": "宮崎県", "鹿児島": "鹿児島県", "沖縄": "沖縄県"
};

let activeRegion = ["all"];
let activeArea = ["all"];
let activeLevel = ["all"];

function updateAreaFilters() {
    const container = document.getElementById("area-filters");
    const group = document.getElementById("prefecture-filter-group");
    if (!container || !group) return;

    if (activeRegion === "all") {
        group.classList.add("filter-group-hidden");
        return;
    } else {
        group.classList.remove("filter-group-hidden");
    }

    // 現在選択されている地域に含まれる（かつデータが存在する）都道府県を抽出
    let availableAreas = [];
    if (activeRegion.includes("all")) {
        availableAreas = [...new Set(courses.map(c => c.area))];
    } else {
        const allowedPrefectures = activeRegion.flatMap(reg => REGION_MAP[reg] || []);
        availableAreas = [...new Set(courses.filter(c => allowedPrefectures.includes(c.area)).map(c => c.area))];
    }

    container.innerHTML = `<button class="chip ${activeArea.includes("all") ? 'active' : ''}" data-value="all">All</button>`;

    availableAreas.sort().forEach(area => {
        const btn = document.createElement("button");
        btn.className = `chip ${activeArea.includes(area) ? 'active' : ''}`;
        btn.dataset.value = area;
        btn.textContent = area.replace("県", "").replace("府", "").replace("東京都", "東京");
        container.appendChild(btn);
    });

    // Re-bind listeners for dynamic area chips
    container.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const val = chip.dataset.value;
            if (val === "all") {
                activeArea = ["all"];
            } else {
                if (activeArea.includes("all")) activeArea = [];
                if (activeArea.includes(val)) {
                    activeArea = activeArea.filter(v => v !== val);
                    if (activeArea.length === 0) activeArea = ["all"];
                } else {
                    activeArea.push(val);
                }
            }
            updateAreaFilters();
            renderCourses();
        });
    });
}

function renderCourses() {
    const container = document.getElementById("course-list");
    container.innerHTML = "";

    const filtered = courses.filter(c => {
        const regionMatch = activeRegion.includes("all") || activeRegion.some(reg => REGION_MAP[reg].includes(c.area));
        const areaMatch = activeArea.includes("all") || activeArea.includes(c.area);
        const levelMatch = activeLevel.includes("all") || activeLevel.includes(c.difficulty);
        return regionMatch && areaMatch && levelMatch;
    });

    const fragment = document.createDocumentFragment();

    filtered.forEach((course, index) => {
        const card = document.createElement("div");
        card.className = "course-card fade-in";
        card.style.animationDelay = `${Math.min(index * 0.05, 1)}s`; // Cap delay

        const encodedQuery = encodeURIComponent(course.mapQuery);
        // Direct Google Maps Search URL for native app triggering
        const googleMapsAppUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

        // Use a static-looking placeholder or a generated SVG for the map preview
        // This avoids 20+ iframes loading at once
        card.innerHTML = `
            <div class="card-image">
                <div class="map-placeholder">
                    <i class="fas fa-map-marked-alt"></i>
                    <span>Tap to view map</span>
                </div>
                <div class="badge-area">${course.area}</div>
                <div class="map-overlay"></div>
            </div>
            <div class="card-content">
                <h3>${course.name}</h3>
                <div class="card-specs">
                    <div class="spec-item">
                        <span class="spec-label">Dist.</span>
                        <span class="spec-value">${course.distance}km</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">D+</span>
                        <span class="spec-value">${course.elevation}m</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Lv.</span>
                        <span class="spec-value difficulty-${course.difficulty}">${course.difficulty}</span>
                    </div>
                </div>
                <div class="trailhead-info">
                    <i class="fas fa-location-dot"></i> 登山口: ${course.trailhead}
                </div>
                <div class="card-footer" style="justify-content: flex-end;">
                    <div class="station-info" style="margin-right: auto;">
                         <span class="station"><i class="fas fa-train"></i>${course.transit.split('、')[0].split('駅')[0]}駅</span>
                        <span class="access-pill">${course.accessTime}分</span>
                    </div>
                    ${course.url ? `
                    <div class="official-link-hint" style="font-size: 0.7rem; color: var(--accent-color); font-weight: bold;">
                        <i class="fas fa-external-link-alt"></i> 
                    </div>` : ''}
                </div>
            </div>
        `;

        card.addEventListener("click", () => showDetail(course));
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}

function showDetail(course) {
    const modal = document.getElementById("modal-container");
    const body = document.getElementById("modal-body");

    const encodedQuery = encodeURIComponent(course.mapQuery);
    const googleMapsAppUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
    const freeEmbedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

    body.innerHTML = `
        <div class="modal-header">
            <span class="badge-area">${course.area}</span>
            <h2>${course.name}</h2>
        </div>
        <div class="modal-grid">
            <div class="modal-main-image" id="modal-map-container">
                <div class="map-load-prompt">
                    <i class="fas fa-map-location-dot" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
                    <button class="btn-load-map" onclick="loadModalMap('${freeEmbedUrl}')">
                        <i class="fas fa-play"></i> インタラクティブ地図を読み込む
                    </button>
                    <p style="font-size: 0.8rem; margin-top: 10px; opacity: 0.7;">※データ通信量にご注意ください</p>
                </div>
            </div>
            <div class="modal-info">
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> コース概要</h4>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                        ${course.summary.split('<br>').map(s => `<li style="position: relative; padding-left: 1.2rem; margin-bottom: 0.5rem;"><span style="position: absolute; left: 0; color: var(--accent-color);">■</span>${s.replace('・', '')}</li>`).join('')}
                    </ul>
                </div>
                <div class="detail-grid-small">
                    <div class="detail-box">
                        <span class="label">累積標高</span>
                        <span class="value">${course.elevation}m</span>
                    </div>
                    <div class="detail-box">
                        <span class="label">難易度</span>
                        <span class="value difficulty-${course.difficulty}">${course.difficulty}</span>
                    </div>
                    <div class="detail-box">
                        <span class="label" style="font-size: 0.7rem; line-height: 1.2;">最寄り駅アクセス</span>
                        <span class="value">${course.accessTime}分</span>
                    </div>
                </div>
                <div class="detail-section">
                    <h4><i class="fas fa-location-dot"></i> 登山口</h4>
                    <p>${course.trailhead}</p>
                </div>
                ${course.event !== "なし" ? `
                <div class="detail-section event-section">
                    <h4><i class="fas fa-flag-checkered"></i> 関連大会</h4>
                    <p>${course.event}</p>
                </div>` : ''}
            </div>
        </div>
        <div class="modal-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="${googleMapsAppUrl}" target="_blank" class="btn-secondary" style="background: #4285F4; color: white; border-color: #4285F4;">
                Googleマップアプリで開く <i class="fas fa-directions"></i>
            </a>
            ${course.url ? `<a href="${course.url}" target="_blank" class="btn-primary">公式サイト <i class="fas fa-external-link-alt"></i></a>` : ''}
        </div>
    `;

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

// Global helper for loading map in modal
window.loadModalMap = function (url) {
    const container = document.getElementById("modal-map-container");
    if (container) {
        container.innerHTML = `<iframe width="100%" height="100%" src="${url}" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>`;
    }
};

// Close Modal
document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("modal-container").classList.remove("show");
    document.body.style.overflow = "auto";
});

window.addEventListener("click", (e) => {
    const modal = document.getElementById("modal-container");
    if (e.target === modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
    }
});

// Filters
document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
        const group = chip.closest(".filter-group").dataset.group;
        const val = chip.dataset.value;

        if (group === "region") {
            if (val === "all") {
                activeRegion = ["all"];
            } else {
                if (activeRegion.includes("all")) activeRegion = [];
                if (activeRegion.includes(val)) {
                    activeRegion = activeRegion.filter(v => v !== val);
                    if (activeRegion.length === 0) activeRegion = ["all"];
                } else {
                    activeRegion.push(val);
                }
            }
            activeArea = ["all"]; // Reset area when region changes
            updateAreaFilters();
        } else if (group === "level") {
            if (val === "all") {
                activeLevel = ["all"];
            } else {
                if (activeLevel.includes("all")) activeLevel = [];
                if (activeLevel.includes(val)) {
                    activeLevel = activeLevel.filter(v => v !== val);
                    if (activeLevel.length === 0) activeLevel = ["all"];
                } else {
                    activeLevel.push(val);
                }
            }
        }

        // Update UI states for both groups (since they might have changed)
        document.querySelectorAll(".filter-group[data-group='region'] .chip").forEach(c => {
            c.classList.toggle("active", activeRegion.includes(c.dataset.value));
        });
        document.querySelectorAll(".filter-group[data-group='level'] .chip").forEach(c => {
            c.classList.toggle("active", activeLevel.includes(c.dataset.value));
        });

        renderCourses();
    });
});

// --- Tab System ---
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;

        // Update Buttons
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // Update Content: Ensure only the targeted section gets 'active'
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        const targetSection = document.getElementById(`${tabId}-section`);
        if (targetSection) {
            targetSection.classList.add("active");
        }

        // Immediately sync and render based on the new tab
        if (tabId === "races") {
            updateRacePrefectureFilters();
            renderRaces();
        } else if (tabId === "courses") {
            updateAreaFilters();
            renderCourses();
        }

        // Scroll to top immediately to ensure filters are in view
        window.scrollTo({ top: 0 });
    });
});

// --- Race Viewer Logic ---
let raceRegion = ["all"];
let racePrefecture = ["all"];
let raceMonth = "all";
let raceKeyword = "";

function updateRacePrefectureFilters() {
    const container = document.getElementById("race-prefecture-filters");
    const group = document.getElementById("race-prefecture-filter-group");
    if (!container || !group) return;

    if (raceRegion.includes("all")) {
        group.classList.add("filter-group-hidden");
        return;
    } else {
        group.classList.remove("filter-group-hidden");
    }

    const allValidPrefs = Object.values(RACE_REGION_MAP).flat();
    let availablePrefs = new Set();

    races_data.forEach(r => {
        allValidPrefs.forEach(validPref => {
            if (r.prefecture.includes(validPref)) {
                if (raceRegion.some(reg => RACE_REGION_MAP[reg].includes(validPref))) {
                    availablePrefs.add(validPref);
                }
            }
        });
    });

    let availablePrefsArray = [...availablePrefs].sort();

    container.innerHTML = `<button class="chip ${racePrefecture.includes("all") ? 'active' : ''}" data-value="all">All</button>`;

    availablePrefsArray.forEach(pref => {
        const btn = document.createElement("button");
        btn.className = `chip ${racePrefecture.includes(pref) ? 'active' : ''}`;
        btn.dataset.value = pref;
        btn.textContent = PREF_SUFFIX_MAP[pref] || pref;
        container.appendChild(btn);
    });

    // Re-bind listeners for dynamic area chips
    container.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const val = chip.dataset.value;
            if (val === "all") {
                racePrefecture = ["all"];
            } else {
                if (racePrefecture.includes("all")) racePrefecture = [];
                if (racePrefecture.includes(val)) {
                    racePrefecture = racePrefecture.filter(v => v !== val);
                    if (racePrefecture.length === 0) racePrefecture = ["all"];
                } else {
                    racePrefecture.push(val);
                }
            }
            updateRacePrefectureFilters();
            renderRaces();
        });
    });
}

let upcomingRaceRegion = "all";
let upcomingRacePref = "all";

function updateUpcomingPrefFilters() {
    const prefSelect = document.getElementById("upcoming-pref-filter");
    if (!prefSelect) return;

    prefSelect.innerHTML = '<option value="all">すべて</option>';

    let prefs = [];
    if (upcomingRaceRegion === "all") {
        prefs = Object.values(RACE_REGION_MAP).flat();
    } else {
        prefs = RACE_REGION_MAP[upcomingRaceRegion] || [];
    }

    // Filter by actually available prefectures in upcoming list
    const currentMonth = new Date().getMonth() + 1;
    const targetMonths = [(currentMonth + 1) % 12 || 12, (currentMonth + 2) % 12 || 12, (currentMonth + 3) % 12 || 12];
    const available = new Set();
    races_data.filter(r => targetMonths.includes(r.month)).forEach(r => {
        prefs.forEach(p => {
            if (r.prefecture.includes(p)) available.add(p);
        });
    });

    [...available].sort().forEach(p => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = PREF_SUFFIX_MAP[p] || p;
        if (upcomingRacePref === p) opt.selected = true;
        prefSelect.appendChild(opt);
    });
}

function renderUpcomingRaces() {
    const container = document.getElementById("upcoming-races-list");
    if (!container) return;

    const currentMonth = new Date().getMonth() + 1; // 1-12
    const targetMonth1 = (currentMonth + 1) % 12 || 12; // 翌月
    const targetMonth2 = (currentMonth + 2) % 12 || 12; // 翌々月
    const targetMonth3 = (currentMonth + 3) % 12 || 12; // 3ヶ月後

    const targetMonths = [targetMonth1, targetMonth2, targetMonth3];

    let upcoming = races_data.filter(r => targetMonths.includes(r.month));

    if (upcomingRaceRegion !== "all") {
        const allowedPrefs = RACE_REGION_MAP[upcomingRaceRegion];
        if (allowedPrefs) {
            upcoming = upcoming.filter(r => allowedPrefs.some(p => r.prefecture.includes(p)));
        }
    }

    if (upcomingRacePref !== "all") {
        upcoming = upcoming.filter(r => r.prefecture.includes(upcomingRacePref));
    }

    // Sort by month/date approximated
    upcoming.sort((a, b) => {
        if (a.month !== b.month) return a.month - b.month;
        return a.date.localeCompare(b.date);
    });

    if (upcoming.length === 0) {
        container.innerHTML = `<p style="font-size: 0.9rem; opacity: 0.7; padding: 1rem; text-align: center;">該当する大会がありません。</p>`;
        return;
    }

    container.innerHTML = `
        <div class="upcoming-list-compact">
            ${upcoming.map(race => `
                <div class="upcoming-item-compact">
                    <div class="u-date">${race.date}</div>
                    <div class="u-info">
                        <div class="u-name">${race.name}</div>
                        <div class="u-meta">
                            <span class="u-pref"><i class="fas fa-location-dot"></i> ${race.prefecture}</span>
                            <span class="u-dist"><i class="fas fa-route"></i> ${race.distance}</span>
                        </div>
                    </div>
                    ${race.link ? `<a href="${race.link}" target="_blank" class="u-link"><i class="fas fa-external-link-alt"></i></a>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function renderRaces() {
    const container = document.getElementById("race-list");
    if (!container) return;
    container.innerHTML = "";

    const filtered = races_data.filter(r => {
        const regionMatch = raceRegion.includes("all") || (raceRegion.some(reg => RACE_REGION_MAP[reg] && RACE_REGION_MAP[reg].some(p => r.prefecture.includes(p))));
        const prefMatch = racePrefecture.includes("all") || racePrefecture.some(p => r.prefecture.includes(p));
        const monthMatch = raceMonth === "all" || r.month.toString() === raceMonth;
        const keywordMatch = raceKeyword === "" ||
            r.name.toLowerCase().includes(raceKeyword.toLowerCase()) ||
            r.prefecture.toLowerCase().includes(raceKeyword.toLowerCase());
        return regionMatch && prefMatch && monthMatch && keywordMatch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="no-results fade-in">該当するレースが見つかりませんでした。</div>`;
        return;
    }

    filtered.forEach((race, index) => {
        const card = document.createElement("div");
        card.className = "race-card fade-in";
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="race-header">
                <span class="race-date">${race.date}</span>
                <span class="race-pref">${race.prefecture}</span>
            </div>
            <h3>${race.name}</h3>
            <div class="race-info">
                <div class="info-item">
                    <span class="info-label">Dist.</span>
                    <span class="info-val">${race.distance}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cat.</span>
                    <span class="info-val">${race.category}</span>
                </div>
            </div>
            <div class="card-footer">
                ${race.link ? `<a href="${race.link}" target="_blank" class="race-link">公式サイト <i class="fas fa-external-link-alt"></i></a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// Event Listeners for Race Filters

// Handle static race region chips
document.querySelectorAll(".filter-group[data-group='race-region'] .chip").forEach(chip => {
    chip.addEventListener("click", () => {
        const val = chip.dataset.value;

        if (val === "all") {
            raceRegion = ["all"];
        } else {
            if (raceRegion.includes("all")) raceRegion = [];
            if (raceRegion.includes(val)) {
                raceRegion = raceRegion.filter(v => v !== val);
                if (raceRegion.length === 0) raceRegion = ["all"];
            } else {
                raceRegion.push(val);
            }
        }

        racePrefecture = ["all"]; // Reset prefecture when region changes
        updateRacePrefectureFilters();

        // Update UI state
        document.querySelectorAll(".filter-group[data-group='race-region'] .chip").forEach(c => {
            c.classList.toggle("active", raceRegion.includes(c.dataset.value));
        });

        renderRaces();
    });
});

document.getElementById("race-month-filter").addEventListener("change", (e) => {
    raceMonth = e.target.value;
    renderRaces();
});

document.getElementById("race-keyword-search").addEventListener("input", (e) => {
    raceKeyword = e.target.value;
    renderRaces();
});

const upcomingFilter = document.getElementById("upcoming-region-filter");
if (upcomingFilter) {
    upcomingFilter.addEventListener("change", (e) => {
        upcomingRaceRegion = e.target.value;
        upcomingRacePref = "all";
        updateUpcomingPrefFilters();
        renderUpcomingRaces();
    });
}

const upcomingPrefFilter = document.getElementById("upcoming-pref-filter");
if (upcomingPrefFilter) {
    upcomingPrefFilter.addEventListener("change", (e) => {
        upcomingRacePref = e.target.value;
        renderUpcomingRaces();
    });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    updateAreaFilters();
    updateRacePrefectureFilters();
    updateUpcomingPrefFilters();
    renderCourses();
    renderUpcomingRaces();
    renderRaces();

    // Explicitly handle upcoming races toggle to ensure responsiveness on mobile
    const upcomingSummary = document.querySelector(".upcoming-summary");
    const upcomingDetails = document.querySelector(".upcoming-details");
    if (upcomingSummary && upcomingDetails) {
        upcomingSummary.addEventListener("click", (e) => {
            // Native behavior might be blocked or laggy on some mobile browsers
            // Let's ensure it toggles
            // Don't call e.preventDefault() as we want the native behavior to still try
            // Just ensure the state updates if needed
        });
    }
});
