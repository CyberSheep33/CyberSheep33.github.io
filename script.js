const currentYear = document.querySelector("#current-year");
const modal = document.querySelector("#qr-modal");
const modalTitle = document.querySelector("#qr-modal-title");
const modalImage = document.querySelector("#qr-modal-image");
const modalCloseTargets = document.querySelectorAll("[data-close-modal]");
const qrTriggers = document.querySelectorAll(".qr-trigger");
const revealTargets = document.querySelectorAll("[data-reveal]");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function openModal(source, title) {
  if (!modal || !modalTitle || !modalImage) {
    return;
  }

  modalTitle.textContent = title;
  modalImage.src = source;
  modalImage.alt = title;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal || !modalImage) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalImage.src = "";
  document.body.style.overflow = "";
}

qrTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const source = trigger.dataset.previewSrc;
    const title = trigger.dataset.previewTitle || "二维码预览";

    if (!source) {
      return;
    }

    openModal(source, title);
  });
});

modalCloseTargets.forEach((target) => {
  target.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("is-open")) {
    closeModal();
  }
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealTargets.forEach((target) => observer.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}
