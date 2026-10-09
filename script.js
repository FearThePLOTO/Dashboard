/* WebWidow: Scanner Parlor */
(function () {
	'use strict';

	var root = document.documentElement;
	var desktop = window.matchMedia('(min-width: 961px)');

	function systemTheme() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	var toggle = document.getElementById('themeToggle');

	function paint(theme) {
		root.setAttribute('data-theme', theme);
		toggle.checked = theme === 'dark';
	}

	// The OS theme wins on load, the switch overrides it for this visit only.
	paint(systemTheme());

	toggle.addEventListener('change', function () {
		paint(toggle.checked ? 'dark' : 'light');
	});

	var sidebar = document.getElementById('sidebar');
	var scrim = document.getElementById('scrim');
	var drawerBtn = document.getElementById('drawerBtn');

	function setDrawer(open) {
		sidebar.classList.toggle('open', open);
		scrim.hidden = !open;
		document.body.classList.toggle('locked', open);
		drawerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
		drawerBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
	}

	function isOpen() {
		return sidebar.classList.contains('open');
	}

	drawerBtn.addEventListener('click', function () {
		setDrawer(!isOpen());
	});

	scrim.addEventListener('click', function () {
		setDrawer(false);
	});

	sidebar.addEventListener('click', function (event) {
		if (event.target.closest('a')) {
			setDrawer(false);
		}
	});

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && isOpen()) {
			setDrawer(false);
			drawerBtn.focus();
		}
	});

	desktop.addEventListener('change', function (event) {
		if (event.matches) {
			setDrawer(false);
		}
	});

	var startX = 0;
	var startY = 0;
	var tracking = false;

	document.addEventListener('touchstart', function (event) {
		if (event.touches.length !== 1) {
			return;
		}
		startX = event.touches[0].clientX;
		startY = event.touches[0].clientY;
		tracking = startX < 40 || isOpen();
	}, { passive: true });

	document.addEventListener('touchend', function (event) {
		if (!tracking) {
			return;
		}
		tracking = false;
		var touch = event.changedTouches[0];
		var dx = touch.clientX - startX;
		var dy = touch.clientY - startY;
		if (Math.abs(dy) > 60 || Math.abs(dx) < 60) {
			return;
		}
		if (dx > 60 && startX < 40) {
			setDrawer(true);
		} else if (dx < -60) {
			setDrawer(false);
		}
	}, { passive: true });

	var input = document.getElementById('search');
	var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
	var empty = document.getElementById('empty');

	input.addEventListener('input', function () {
		var query = input.value.trim().toLowerCase();
		var visible = 0;
		cards.forEach(function (card) {
			var hit = card.getAttribute('data-domain').toLowerCase().indexOf(query) !== -1;
			card.hidden = !hit;
			if (hit) {
				visible += 1;
			}
		});
		empty.hidden = visible !== 0;
	});

	document.querySelectorAll('.mini[aria-pressed]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var on = btn.getAttribute('aria-pressed') === 'true';
			btn.setAttribute('aria-pressed', on ? 'false' : 'true');
		});
	});

	document.querySelectorAll('[data-share]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var url = btn.getAttribute('data-share');
			if (navigator.clipboard) {
				navigator.clipboard.writeText(url);
			}
			btn.setAttribute('aria-label', 'Link copied: ' + url);
		});
	});

	document.getElementById('exportBtn').addEventListener('click', function () {
		var rows = cards.map(function (card) {
			return card.getAttribute('data-domain');
		});
		var file = new Blob([JSON.stringify({ owner: 'ploto', targets: rows }, null, 2)], {
			type: 'application/json'
		});
		var link = document.createElement('a');
		link.href = URL.createObjectURL(file);
		link.download = 'webwidow-registry.json';
		document.body.appendChild(link);
		link.click();
		link.remove();
	});
})();