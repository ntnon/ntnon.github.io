// Live reload (development only)
(function () {
  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) return;

  let lastModified = {};

  function checkForChanges() {
    fetch(window.location.href, { method: "HEAD", cache: "no-cache" })
      .then((response) => {
        const modified = response.headers.get("last-modified");
        if (lastModified.html && lastModified.html !== modified) {
          window.location.reload();
        }
        lastModified.html = modified;
      })
      .catch(() => {});

    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      fetch(link.href, { method: "HEAD", cache: "no-cache" })
        .then((response) => {
          const modified = response.headers.get("last-modified");
          const key = `css_${link.href}`;
          if (lastModified[key] && lastModified[key] !== modified) {
            const newLink = link.cloneNode();
            newLink.href = link.href + "?v=" + Date.now();
            link.parentNode.insertBefore(newLink, link.nextSibling);
            link.remove();
          }
          lastModified[key] = modified;
        })
        .catch(() => {});
    });
  }

  setInterval(checkForChanges, 1000);
  console.log("🔄 Live reload enabled");
})();
