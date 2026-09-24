/* Jost Burger — melhoria progressiva, sem bibliotecas.
   Os links, o conteúdo e o cardápio funcionam mesmo sem JavaScript.
   A rolagem suave está no CSS e respeita prefers-reduced-motion. */
(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const menu = document.querySelector(".site-nav");
  const menuButton = document.querySelector(".menu-toggle");
  const hero = document.querySelector(".hero");
  const orderSection = document.querySelector(".order-section");
  const mobileOrder = document.querySelector(".mobile-order");
  const mobileOrderLink = mobileOrder?.querySelector("a");

  if (!header || !menu || !menuButton || !hero || !orderSection || !mobileOrder) return;

  document.documentElement.classList.add("js");
  menuButton.hidden = false;

  // Manter estes limites iguais aos breakpoints definidos em style.css.
  const menuBreakpoint = window.matchMedia("(max-width: 850px)");
  const orderBreakpoint = window.matchMedia("(max-width: 600px)");
  let menuOpen = false;
  let framePending = false;

  // Atributo hidden também remove links fechados da navegação por teclado.
  function setMenu(open, returnFocus = false) {
    menuOpen = open && menuBreakpoint.matches;
    menu.hidden = menuBreakpoint.matches && !menuOpen;
    menuButton.setAttribute("aria-expanded", String(menuOpen));
    menuButton.setAttribute("aria-label", menuOpen ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", menuOpen);

    if (returnFocus) menuButton.focus();
    scheduleUpdate();
  }

  function updateScrollState() {
    framePending = false;
    header.classList.toggle("is-scrolled", window.scrollY > 20);

    const heroHasPassed = hero.getBoundingClientRect().bottom <= header.offsetHeight;
    const orderBounds = orderSection.getBoundingClientRect();
    const finalOrderVisible = orderBounds.top < window.innerHeight - 80 && orderBounds.bottom > header.offsetHeight;
    const showOrder = orderBreakpoint.matches && heroHasPassed && !menuOpen && !finalOrderVisible;

    // Evita duplicar a chamada enquanto os botões do hero/CTA final estão visíveis.
    mobileOrder.classList.toggle("is-visible", showOrder);
    mobileOrder.setAttribute("aria-hidden", String(!showOrder));
    if (mobileOrderLink) mobileOrderLink.tabIndex = showOrder ? 0 : -1;
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateScrollState);
  }

  menuButton.addEventListener("click", () => setMenu(!menuOpen));

  // Fechar após navegação; os links nativos preservam hash e histórico.
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) setMenu(false, true);
  });

  document.addEventListener("click", (event) => {
    if (menuOpen && !header.contains(event.target)) setMenu(false);
  });

  document.addEventListener("focusin", (event) => {
    if (menuOpen && !header.contains(event.target)) setMenu(false);
  });

  // Ao mudar para desktop, liberar a rolagem e mostrar o menu completo.
  function handleBreakpointChange() {
    setMenu(false);
    scheduleUpdate();
  }

  [menuBreakpoint, orderBreakpoint].forEach((breakpoint) => {
    if (typeof breakpoint.addEventListener === "function") {
      breakpoint.addEventListener("change", handleBreakpointChange);
    } else {
      breakpoint.addListener(handleBreakpointChange);
    }
  });

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  window.addEventListener("pageshow", scheduleUpdate);
  window.addEventListener("load", scheduleUpdate);
  document.fonts?.ready.then(scheduleUpdate);

  setMenu(false);
  updateScrollState();
})();
