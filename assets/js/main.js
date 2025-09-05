// Live reload functionality for development
(function () {
  let lastModified = {};

  function checkForChanges() {
    // Check if HTML file has changed
    fetch(window.location.href, {
      method: "HEAD",
      cache: "no-cache",
    })
      .then((response) => {
        const modified = response.headers.get("last-modified");
        if (lastModified.html && lastModified.html !== modified) {
          window.location.reload();
        }
        lastModified.html = modified;
      })
      .catch(() => {
        // Ignore errors, server might be restarting
      });

    // Check CSS files
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach((link) => {
      fetch(link.href, {
        method: "HEAD",
        cache: "no-cache",
      })
        .then((response) => {
          const modified = response.headers.get("last-modified");
          const key = `css_${link.href}`;
          if (lastModified[key] && lastModified[key] !== modified) {
            // Reload CSS by updating href
            const newLink = link.cloneNode();
            newLink.href = link.href + "?v=" + Date.now();
            link.parentNode.insertBefore(newLink, link.nextSibling);
            link.remove();
          }
          lastModified[key] = modified;
        })
        .catch(() => {
          // Ignore errors
        });
    });
  }

  // Only enable live reload in development (when served from localhost)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    // Check for changes every 1000ms
    setInterval(checkForChanges, 1000);
    console.log("🔄 Live reload enabled");
  }

  // Background canvas setup
  function setupBackgroundCanvas() {
    const canvas = document.getElementById("background-canvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return { canvas, ctx };
  }

  // Conditional rendering utilities
  const render = {
    show: (element) => (element.style.display = "block"),
    hide: (element) => (element.style.display = "none"),
    toggle: (element, condition) =>
      (element.style.display = condition ? "block" : "none"),
    remove: (element) => element.remove(),
    create: (tag, content, parent) => {
      const el = document.createElement(tag);
      if (content) el.innerHTML = content;
      if (parent) parent.appendChild(el);
      return el;
    },
  };

  // Main application code goes here
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Page loaded");

    // Initialize background canvas
    const { canvas, ctx } = setupBackgroundCanvas();

    // Your background program goes here
    function drawBackground() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Your background program can go here

      requestAnimationFrame(drawBackground);
    }

    drawBackground();

    // Thumbnails now have colored squares added directly in HTML

    // Clickable email header functionality
    const emailHeader = document.getElementById("copyable-email");
    if (emailHeader) {
      emailHeader.addEventListener("click", async () => {
        const email = "anton@nydal.net";

        try {
          await navigator.clipboard.writeText(email);

          // Show success feedback
          emailHeader.classList.add("copied");

          // Reset after 1.5 seconds
          setTimeout(() => {
            emailHeader.classList.remove("copied");
          }, 1500);
        } catch (err) {
          console.error("Failed to copy email: ", err);
        }
      });
    }

    // Example conditional rendering
    const exampleCondition = true;
    const heroSection = document.querySelector(".hero");
    render.toggle(heroSection, exampleCondition);
  });
})();
