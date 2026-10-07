// Site-wide motion: scroll reveals, interactive cards, scroll progress
// and the home page hero. Replaces AOS; pages keep their existing `data-aos` attributes and
// global.css decides how each page animates them (keyed off `body[data-page]`).

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function setupReveals() {
	const targets = document.querySelectorAll<HTMLElement>('[data-aos]');
	if (reducedMotion || !('IntersectionObserver' in window)) return;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		},
		{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
	);

	// Content already on screen is shown straight away; only content further down animates
	// in as it is scrolled to, with no delays.
	targets.forEach((el) => {
		if (el.getBoundingClientRect().top < window.innerHeight) return;
		el.classList.add('reveal');
		observer.observe(el);
	});
}

// Cursor spotlight + gentle 3D tilt on content cards.
function setupCards() {
	const cards = document.querySelectorAll<HTMLElement>('[data-aos]:not(section) > div, main a.group > div, .hobby-card');
	cards.forEach((card) => {
		card.classList.add('fx-card');
		if (!finePointer || reducedMotion) return;

		const canTilt = !card.querySelector('form');
		card.addEventListener('pointermove', (event) => {
			const rect = card.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width;
			const y = (event.clientY - rect.top) / rect.height;
			card.style.setProperty('--mx', `${x * 100}%`);
			card.style.setProperty('--my', `${y * 100}%`);
			if (canTilt) {
				card.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
				card.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
			}
		});
		card.addEventListener('pointerleave', () => {
			card.style.setProperty('--rx', '0deg');
			card.style.setProperty('--ry', '0deg');
		});
	});
}

function setupScrollProgress() {
	const bar = document.querySelector<HTMLElement>('.scroll-progress');
	if (!bar) return;
	let ticking = false;
	const update = () => {
		const max = document.documentElement.scrollHeight - window.innerHeight;
		bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
		ticking = false;
	};
	window.addEventListener(
		'scroll',
		() => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		},
		{ passive: true },
	);
	update();
}

// Rotating role line in the hero.
function setupRoleRotator() {
	const el = document.querySelector<HTMLElement>('[data-roles]');
	if (!el) return;
	const roles = (el.dataset.roles ?? '').split('|').filter(Boolean);
	if (roles.length < 2 || reducedMotion) return;

	let roleIndex = 0;
	let charIndex = roles[0].length;
	let deleting = true;
	const tick = () => {
		if (deleting) {
			charIndex--;
			if (charIndex === 0) {
				deleting = false;
				roleIndex = (roleIndex + 1) % roles.length;
			}
		} else {
			charIndex++;
		}
		el.textContent = roles[roleIndex].slice(0, charIndex) || '​';
		let wait = deleting ? 35 : 70;
		if (!deleting && charIndex === roles[roleIndex].length) {
			deleting = true;
			wait = 2200;
		}
		setTimeout(tick, wait);
	};
	setTimeout(tick, 2200);
}

// Interactive constellation behind the hero: drifting nodes that link up near each other
// and reach towards the cursor.
function setupConstellation() {
	const canvas = document.querySelector<HTMLCanvasElement>('[data-constellation]');
	const ctx = canvas?.getContext('2d');
	if (!canvas || !ctx) return;

	type Node = { x: number; y: number; vx: number; vy: number };
	let nodes: Node[] = [];
	let width = 0;
	let height = 0;
	const pointer = { x: -9999, y: -9999 };
	const linkDistance = 140;

	const resize = () => {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const count = Math.round(Math.min(90, (width * height) / 14000));
		nodes = Array.from({ length: count }, () => ({
			x: Math.random() * width,
			y: Math.random() * height,
			vx: (Math.random() - 0.5) * 0.35,
			vy: (Math.random() - 0.5) * 0.35,
		}));
	};

	const draw = () => {
		ctx.clearRect(0, 0, width, height);
		for (const node of nodes) {
			if (!reducedMotion) {
				node.x += node.vx;
				node.y += node.vy;
				if (node.x < 0 || node.x > width) node.vx *= -1;
				if (node.y < 0 || node.y > height) node.vy *= -1;
			}
		}
		for (let i = 0; i < nodes.length; i++) {
			const a = nodes[i];
			for (let j = i + 1; j < nodes.length; j++) {
				const b = nodes[j];
				const dist = Math.hypot(a.x - b.x, a.y - b.y);
				if (dist < linkDistance) {
					ctx.strokeStyle = `rgba(56, 189, 248, ${0.18 * (1 - dist / linkDistance)})`;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(a.x, a.y);
					ctx.lineTo(b.x, b.y);
					ctx.stroke();
				}
			}
			const toPointer = Math.hypot(a.x - pointer.x, a.y - pointer.y);
			if (toPointer < linkDistance * 1.4) {
				ctx.strokeStyle = `rgba(125, 211, 252, ${0.45 * (1 - toPointer / (linkDistance * 1.4))})`;
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(pointer.x, pointer.y);
				ctx.stroke();
			}
			ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
			ctx.beginPath();
			ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2);
			ctx.fill();
		}
	};

	let running = true;
	const loop = () => {
		if (running) draw();
		if (!reducedMotion) requestAnimationFrame(loop);
	};

	// Pause when the hero is off screen.
	new IntersectionObserver(([entry]) => {
		running = entry.isIntersecting;
	}).observe(canvas);

	const hero = canvas.parentElement ?? canvas;
	hero.addEventListener('pointermove', (event) => {
		const rect = canvas.getBoundingClientRect();
		pointer.x = event.clientX - rect.left;
		pointer.y = event.clientY - rect.top;
	});
	hero.addEventListener('pointerleave', () => {
		pointer.x = -9999;
		pointer.y = -9999;
	});

	window.addEventListener('resize', resize);
	resize();
	loop();
}

setupReveals();
setupCards();
setupScrollProgress();
setupRoleRotator();
setupConstellation();
