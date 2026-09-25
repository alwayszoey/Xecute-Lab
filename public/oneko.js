// oneko.js: Authentic pixel cat companion following cursor / touches
// Based on adryd325/oneko.js (https://github.com/adryd325/oneko.js)
// Enhanced with mobile touch tracking, soundless purr/alert interactivity, and safe direction fallback

(function oneko() {
  const isReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  if (document.getElementById("oneko")) return;

  const nekoEl = document.createElement("div");
  let persistPosition = true;

  // Initial position: center-right so it is immediately visible
  let nekoPosX = Math.min(Math.max(64, window.innerWidth - 80), 360);
  let nekoPosY = Math.min(Math.max(64, window.innerHeight - 80), 360);

  let mousePosX = nekoPosX;
  let mousePosY = nekoPosY;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  const nekoSpeed = 10;
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function setSprite(name, frame) {
    const set = spriteSets[name] || spriteSets.idle;
    const sprite = set[frame % set.length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // Every ~15-20 seconds when idle
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 160) === 0 &&
      idleAnimation === null
    ) {
      let availableIdleAnimations = ["sleeping", "scratchSelf"];
      if (nekoPosX < 40) {
        availableIdleAnimations.push("scratchWallW");
      }
      if (nekoPosY < 40) {
        availableIdleAnimations.push("scratchWallN");
      }
      if (nekoPosX > window.innerWidth - 40) {
        availableIdleAnimations.push("scratchWallE");
      }
      if (nekoPosY > window.innerHeight - 40) {
        availableIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        availableIdleAnimations[
          Math.floor(Math.random() * availableIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction = "";
    if (diffY / distance > 0.5) direction += "N";
    else if (diffY / distance < -0.5) direction += "S";

    if (diffX / distance > 0.5) direction += "W";
    else if (diffX / distance < -0.5) direction += "E";

    setSprite(direction || "idle", frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  let lastFrameTimestamp;
  function onAnimationFrame(timestamp) {
    if (!nekoEl.isConnected) {
      return;
    }
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function init() {
    const nekoFile = "/oneko.gif";

    if (persistPosition) {
      try {
        const storedNeko = JSON.parse(window.localStorage.getItem("oneko"));
        if (storedNeko !== null && typeof storedNeko === "object") {
          nekoPosX = storedNeko.nekoPosX || nekoPosX;
          nekoPosY = storedNeko.nekoPosY || nekoPosY;
          mousePosX = nekoPosX;
          mousePosY = nekoPosY;
        }
      } catch (e) {
        // ignore
      }
    }

    nekoEl.id = "oneko";
    nekoEl.setAttribute("aria-hidden", "true");
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "fixed";
    nekoEl.style.pointerEvents = "auto"; // allow tapping / hovering to pet!
    nekoEl.style.cursor = "pointer";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    nekoEl.style.zIndex = "2147483647"; // Keep above modals
    nekoEl.style.backgroundImage = `url("${nekoFile}")`;
    nekoEl.style.backgroundRepeat = "no-repeat";
    nekoEl.title = "Oneko the cat (ลากเมาส์ หรือแตะหน้าจอให้แมววิ่งตาม)";

    // Interactive pet on click / tap
    nekoEl.addEventListener("click", () => {
      idleAnimation = "scratchSelf";
      idleAnimationFrame = 0;
      setSprite("alert", 0);
    });

    const appendCat = () => {
      if (document.body && !document.getElementById("oneko")) {
        document.body.appendChild(nekoEl);
      }
    };

    if (document.body) {
      appendCat();
    } else {
      document.addEventListener("DOMContentLoaded", appendCat);
    }

    // Mouse movement
    window.addEventListener("mousemove", (event) => {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    }, { passive: true });

    // Touch support for mobile devices / tablets
    window.addEventListener("touchstart", (event) => {
      if (event.touches && event.touches[0]) {
        mousePosX = event.touches[0].clientX;
        mousePosY = event.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener("touchmove", (event) => {
      if (event.touches && event.touches[0]) {
        mousePosX = event.touches[0].clientX;
        mousePosY = event.touches[0].clientY;
      }
    }, { passive: true });

    // Save position before unload
    if (persistPosition) {
      window.addEventListener("beforeunload", () => {
        try {
          window.localStorage.setItem("oneko", JSON.stringify({
            nekoPosX: Math.round(nekoPosX),
            nekoPosY: Math.round(nekoPosY)
          }));
        } catch (e) {}
      });
    }

    window.requestAnimationFrame(onAnimationFrame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
