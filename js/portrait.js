document.querySelectorAll("[data-portrait]").forEach((frame) => {
  const img = new Image();
  img.alt = "Portrait of Francesco Mok";
  img.className = "portrait-photo";
  img.decoding = "sync";
  img.onload = () => {
    frame.replaceChildren(img);
  };
  img.src = frame.getAttribute("data-portrait");
});
