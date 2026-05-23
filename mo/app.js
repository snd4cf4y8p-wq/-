const tabs = document.querySelectorAll(".mission-tab");
const panels = document.querySelectorAll(".mission-panel");

function activateTab(target) {
  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.target === target);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === target);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.target));
});
