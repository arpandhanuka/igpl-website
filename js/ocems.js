(function () {
  'use strict';

  var REFRESH_MS = 60 * 1000;
  var APPROACH_RATIO = 0.8;
  var STATUS_ORDER = { exceed: 3, approaching: 2, ok: 1 };
  var WARN_SVG = '<svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M11.3 1.046a1 1 0 011.414 0l1.925 1.925-5.657 7.071 4.596.46-3.89 5.443a1 1 0 01-1.617-1.17l2.667-3.733-4.243-.424 6.714-8.572z"/></svg>';
  var CHECK_SVG = '<svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
  var EXCEED_SVG = '<svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>';
  var PLANT_ICON = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/></svg>';

  var tabsEl = document.getElementById('ocems-tabs');
  var panelsEl = document.getElementById('ocems-panels');
  var syncEl = document.getElementById('ocems-last-sync');
  var statusEl = document.getElementById('ocems-status');
  var refreshTimer = null;

  function initOcemsLiveData() {
  if (!tabsEl || !panelsEl) return;
  if (panelsEl.getAttribute('data-ocems-started') === 'true') return;
  panelsEl.setAttribute('data-ocems-started', 'true');

  var activeTab = 'all';

  function slugify(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function formatLabel(code) {
    var labels = { SO2: 'SO\u2082' };
    return labels[code] || code;
  }

  function formatValue(value) {
    var n = Number(value);
    if (!isFinite(n)) return '—';
    if (Math.abs(n) >= 100) return n.toFixed(2);
    if (Math.abs(n) >= 10) return n.toFixed(2);
    return n.toFixed(n % 1 === 0 ? 0 : 2);
  }

  function formatLimit(limit, unit) {
    var n = Number(limit);
    var limitText = isFinite(n) ? (n % 1 === 0 ? String(n) : n.toFixed(0)) : '—';
    return (unit || '') + ' / \u2264' + limitText;
  }

  function formatTime(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function paramStatus(value, limit) {
    var v = Number(value);
    var l = Number(limit);
    if (!isFinite(v) || !isFinite(l) || l <= 0) return 'ok';
    if (v > l) return 'exceed';
    if (v >= l * APPROACH_RATIO) return 'approaching';
    return 'ok';
  }

  function worstStatus(statuses) {
    var worst = 'ok';
    statuses.forEach(function (s) {
      if (STATUS_ORDER[s] > STATUS_ORDER[worst]) worst = s;
    });
    return worst;
  }

  function stackStatus(stack) {
    return worstStatus((stack.parameters || []).map(function (p) {
      return paramStatus(p.value, p.limitUpto);
    }));
  }

  function plantStatus(stacks) {
    return worstStatus(stacks.map(stackStatus));
  }

  function statusLabel(status) {
    if (status === 'exceed') return { icon: EXCEED_SVG, text: 'Exceeded' };
    if (status === 'approaching') return { icon: WARN_SVG, text: 'Approaching' };
    return { icon: CHECK_SVG, text: 'Normal' };
  }

  function badgeTone(status) {
    if (status === 'exceed') return 'red';
    if (status === 'approaching') return 'amber';
    return 'green';
  }

  function groupByPlant(stacks) {
    var groups = {};
    stacks.forEach(function (stack) {
      var plant = stack.plant || 'Other';
      if (!groups[plant]) groups[plant] = [];
      groups[plant].push(stack);
    });
    Object.keys(groups).forEach(function (plant) {
      groups[plant].sort(function (a, b) {
        return String(a.stack || '').localeCompare(String(b.stack || ''));
      });
    });
    return groups;
  }

  function sortPlants(plants) {
    return plants.sort(function (a, b) {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  function renderParam(param) {
    var status = paramStatus(param.value, param.limitUpto);
    var rowClass = status === 'ok' ? 'ocems-param' : 'ocems-param ocems-param--' + status;
    return (
      '<div class="' + rowClass + '">' +
        '<span class="ocems-param__label">' + formatLabel(param.parameterCode) + '</span>' +
        '<span class="ocems-param__value ocems-param__value--' + status + '">' + formatValue(param.value) + '</span>' +
        '<span class="ocems-param__limit">' + formatLimit(param.limitUpto, param.unit || '') + '</span>' +
      '</div>'
    );
  }

  function renderStackCard(stack) {
    var status = stackStatus(stack);
    var stackClass = status === 'ok' ? 'ocems-stack' : 'ocems-stack ocems-stack--' + status;
    var latest = (stack.parameters || []).reduce(function (max, p) {
      return !max || (p.lastUpdated && p.lastUpdated > max) ? p.lastUpdated : max;
    }, null);

    return (
      '<div class="' + stackClass + '">' +
        '<div class="ocems-stack__header">' +
          '<div class="min-w-0 flex-1">' +
            '<div class="ocems-stack__name">' + stack.stack + '</div>' +
            '<span class="ocems-stack__badge ocems-stack__badge--' + badgeTone(status) + '">' + (stack.stackType || 'Stack') + '</span>' +
          '</div>' +
          '<span class="ocems-stack__time">' + formatTime(latest) + '</span>' +
        '</div>' +
        '<div class="ocems-stack__params">' +
          (stack.parameters || []).map(renderParam).join('') +
        '</div>' +
      '</div>'
    );
  }

  function renderPlantCard(plant, stacks) {
    var slug = slugify(plant);
    var status = plantStatus(stacks);
    var label = statusLabel(status);
    var totalParams = stacks.reduce(function (sum, s) {
      return sum + (s.count || (s.parameters || []).length);
    }, 0);

    return (
      '<article class="ocems-facility ocems-facility--' + status + '" data-ocems-panel="' + slug + '" role="tabpanel">' +
        '<div class="ocems-facility__header">' +
          '<div class="ocems-facility__title">' + PLANT_ICON + plant + '</div>' +
          '<div class="ocems-facility__meta">' +
            '<span class="ocems-pill">' + stacks.length + ' Stack' + (stacks.length === 1 ? '' : 's') + '</span>' +
            '<span class="ocems-pill">' + totalParams + ' Params</span>' +
            '<span class="ocems-pill ocems-pill--status">' + label.icon + ' ' + label.text + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="ocems-facility__body">' +
          stacks.map(renderStackCard).join('') +
        '</div>' +
      '</article>'
    );
  }

  function renderTabs(plants) {
    var html = '<button type="button" class="ocems-tab ocems-tab--active" role="tab" aria-selected="true" data-ocems-tab="all">All</button>';
    plants.forEach(function (plant) {
      html += '<button type="button" class="ocems-tab" role="tab" aria-selected="false" data-ocems-tab="' + slugify(plant) + '">' + plant + '</button>';
    });
    tabsEl.innerHTML = html;
    bindTabs();
  }

  function applyTabFilter() {
    panelsEl.querySelectorAll('[data-ocems-panel]').forEach(function (panel) {
      var show = activeTab === 'all' || panel.getAttribute('data-ocems-panel') === activeTab;
      panel.style.display = show ? '' : 'none';
    });
  }

  function bindTabs() {
    tabsEl.querySelectorAll('[data-ocems-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        activeTab = tab.getAttribute('data-ocems-tab');
        tabsEl.querySelectorAll('[data-ocems-tab]').forEach(function (t) {
          t.classList.toggle('ocems-tab--active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        applyTabFilter();
      });
    });
  }

  function setStatus(text, isError) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle('text-[#EA580C]', !!isError);
    statusEl.classList.toggle('text-[#64748B]', !isError);
  }

  function setSyncTime(iso) {
    if (!syncEl) return;
    syncEl.textContent = formatTime(iso || new Date().toISOString());
  }

  function render(data) {
    var stacks = (data && data.stacks) || [];
    if (!stacks.length) {
      panelsEl.innerHTML = '<p class="font-[Inter] text-[15px] text-[#64748B] text-center py-8">No stack data available.</p>';
      return;
    }

    var groups = groupByPlant(stacks);
    var plants = sortPlants(Object.keys(groups));

    renderTabs(plants);
    panelsEl.innerHTML = plants.map(function (plant) {
      return renderPlantCard(plant, groups[plant]);
    }).join('');

    applyTabFilter();
    setSyncTime(data.updatedAt || (stacks[0].parameters && stacks[0].parameters[0] && stacks[0].parameters[0].lastUpdated));
    setStatus(data.stale ? 'Showing cached data — live feed temporarily unavailable' : '');
  }

  function renderLoading() {
    panelsEl.innerHTML =
      '<div class="col-span-full flex flex-col items-center justify-center py-16 gap-3">' +
        '<div class="ocems-spinner" aria-hidden="true"></div>' +
        '<p class="font-[Inter] text-[14px] text-[#64748B]">Loading live OCEMS data…</p>' +
      '</div>';
  }

  function renderError(message) {
    panelsEl.innerHTML =
      '<div class="col-span-full text-center py-12">' +
        '<p class="font-[Inter] text-[15px] text-[#EA580C] mb-2">Unable to load OCEMS data</p>' +
        '<p class="font-[Inter] text-[13px] text-[#64748B]">' + message + '</p>' +
      '</div>';
    setStatus('Connection error', true);
  }

  function fetchData() {
    return fetch('/api/ocems', { headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      });
  }

  function load(isInitial) {
    if (isInitial) renderLoading();

    fetchData()
      .then(function (data) {
        if (data.error && !data.stacks) throw new Error(data.detail || data.error);
        render(data);
      })
      .catch(function (err) {
        if (isInitial) renderError(err.message);
        else setStatus('Update failed — showing last data', true);
      });
  }

  load(true);
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(function () { load(false); }, REFRESH_MS);
  }

if (typeof window !== 'undefined') {
  window.initOcemsLiveData = initOcemsLiveData;
  if (!document.getElementById('ocems-wrap') || document.getElementById('ocems-wrap').getAttribute('data-lazy') !== 'true') {
    initOcemsLiveData();
  }
}
})();
