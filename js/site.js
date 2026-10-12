const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#section-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    const label = toggle.querySelector(".sr-only");
    if (label) label.textContent = open ? "Close menu" : "Open menu";
    document.body.classList.toggle("lock", open);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080) closeMenu();
  });
}

function closeMenu() {
  nav?.classList.remove("is-open");
  toggle?.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
  const label = toggle?.querySelector(".sr-only");
  if (label) label.textContent = "Open menu";
  document.body.classList.remove("lock");
}

const sections = [...document.querySelectorAll("main section[id]")];
const links = [...document.querySelectorAll("#section-nav a")];

function setActive(id) {
  links.forEach((link) => {
    const current = link.getAttribute("href") === `#${id}`;
    if (current) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

if (sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { rootMargin: "-20% 0px -45% 0px", threshold: [0.15, 0.4, 0.7] },
  );

  sections.forEach((section) => observer.observe(section));
  window.addEventListener("scroll", () => {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
    if (atBottom) setActive(sections[sections.length - 1].id);
  }, { passive: true });
}

const revealNodes = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion) {
  revealNodes.forEach((node) => node.classList.add("is-in"));
} else if (revealNodes.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  revealNodes.forEach((node) => revealObserver.observe(node));
}
