(() => {
  const root = document.documentElement;
  const nav = document.getElementById("primary-nav");
  const menuBtn = document.getElementById("menu-toggle");
  const themeBtn = document.getElementById("theme-toggle");
  const unitList = document.getElementById("unit-list");
  const quizEl = document.getElementById("quiz");
  const scoreEl = document.getElementById("quiz-score");
  const modal = document.getElementById("lab-modal");
  const field = document.getElementById("field-canvas");
  const wave = document.getElementById("wave-canvas");

  const savedTheme = localStorage.getItem("phy-theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);

  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    if (next === "dark") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", "light");
    localStorage.setItem("phy-theme", next === "dark" ? "" : "light");
  });

  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...nav.querySelectorAll("a")];

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0.1 }
  );
  sections.forEach((s) => spy.observe(s));

  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  unitList.querySelectorAll(".unit-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const unit = btn.parentElement;
      const open = unit.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      if (open) requestAnimationFrame(drawWave);
    });
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const filter = chip.dataset.filter;
      unitList.querySelectorAll(".unit").forEach((unit) => {
        unit.classList.toggle("hidden", filter !== "all" && unit.dataset.unit !== filter);
      });
    });
  });

  const labs = [
    {
      kicker: "Practical 01",
      title: "Free-fall acceleration",
      html: `<p><strong>Aim.</strong> Measure g with a free-fall apparatus and compare with 9.81 m s<sup>−2</sup>.</p>
        <p>If air resistance is small, s = ½gt² from rest. A plot of 2s against t² should be linear with slope g. The interesting physics is the residual: a systematically low g usually means reaction-time or drag, not a new gravity.</p>
        <p><strong>Bench insight.</strong> Repeat drops beat a single “best” number. I now report g ± uncertainty and discuss whether the accepted value sits inside that interval, instead of calling a 2% difference a failure.</p>`
    },
    {
      kicker: "Practical 02",
      title: "Speed of sound in a resonance tube",
      html: `<p><strong>Aim.</strong> Find the speed of sound from resonance lengths in a closed tube.</p>
        <p>For the nth resonance, L + e = (2n−1)λ/4. Two successive lengths give λ/2 = L<sub>2</sub> − L<sub>1</sub>, so v = fλ. End correction e is not optional — ignoring it biases every wavelength.</p>
        <p><strong>Bench insight.</strong> Room temperature belongs in the report. v ≈ 331 + 0.6θ (θ in °C) is the comparison line, not a guess.</p>`
    },
    {
      kicker: "Practical 03",
      title: "Young’s double-slit with sodium light",
      html: `<p><strong>Aim.</strong> Determine the wavelength of sodium light from fringe spacing.</p>
        <p>β = λD/d. Measure D and d independently; the pattern is only as honest as those two lengths. This is Unit IV made physical: a path difference of λ produces a bright fringe.</p>
        <p><strong>Bench insight.</strong> I stopped counting “fuzzy” fringes at the edge. Using the central ten and averaging β reduced scatter more than buying a “better” lamp would have.</p>`
    },
    {
      kicker: "Practical 04",
      title: "Capacitor discharge in an RC circuit",
      html: `<p><strong>Aim.</strong> Investigate how long a capacitor takes to discharge and extract τ = RC.</p>
        <p>V(t) = V<sub>0</sub>e<sup>−t/RC</sup>. A plot of ln V against t is a straight line with slope −1/τ. This is Unit III’s ODE on the bench.</p>
        <p><strong>Bench insight.</strong> At t = τ the voltage is 37% of V<sub>0</sub>, not zero. Students who wait for “fully empty” wait forever. I also learned to zero the stopwatch against the same visual cue every trial.</p>`
    },
    {
      kicker: "Practical 05",
      title: "e/m of the electron",
      html: `<p><strong>Aim.</strong> Measure the charge-to-mass ratio with a cathode-ray deflection tube and connect it to Thomson’s discovery.</p>
        <p>Magnetic force qvB supplies centripetal force, so e/m = v/(Br) after v is fixed by the accelerating potential. The number is famous (~1.76×10<sup>11</sup> C kg<sup>−1</sup>) because it showed cathode rays were particles far lighter than hydrogen.</p>
        <p><strong>Bench insight.</strong> Beam radius is the dominant uncertainty. I now take several Helmholtz-coil currents and look for a consistent e/m rather than polishing one photograph of the path.</p>`
    }
  ];

  document.querySelectorAll(".lab-card").forEach((card) => {
    card.addEventListener("click", () => {
      const lab = labs[Number(card.dataset.lab)];
      document.getElementById("modal-kicker").textContent = lab.kicker;
      document.getElementById("modal-title").textContent = lab.title;
      document.getElementById("modal-body").innerHTML = lab.html;
      modal.showModal();
    });
  });

  document.getElementById("modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });

  const questions = [
    {
      q: "A 2 kg block slides 3 m down a rough incline while friction does −12 J of work. Gravity does +40 J. What is ΔK?",
      options: ["28 J", "52 J", "12 J", "40 J"],
      answer: 0,
      why: "Work–energy: ΔK equals the work of every force, 40 − 12 = 28 J. Do not drop friction because it is non-conservative."
    },
    {
      q: "Two waves of equal amplitude meet in phase. The resulting intensity, relative to one wave alone, is",
      options: ["2 times", "4 times", "√2 times", "unchanged"],
      answer: 1,
      why: "Amplitudes add, so 2A. Intensity goes as A², hence 4I. Superposition is linear in displacement, not in intensity."
    },
    {
      q: "In an RC discharge, after two time constants the remaining charge is about",
      options: ["50%", "25%", "14%", "5%"],
      answer: 2,
      why: "Q = Q₀ e^{−t/τ}. At t = 2τ, e^{−2} ≈ 0.135, about 14%."
    },
    {
      q: "Soap-film colours are primarily a demonstration of",
      options: ["Malus’ law", "thin-film interference", "the Compton effect", "beats"],
      answer: 1,
      why: "Path difference 2nt plus a possible reflection phase shift selects wavelengths. Polarisation (Malus) is a different experiment."
    },
    {
      q: "Doubling the intensity of light below the photoelectric threshold will",
      options: ["start emission", "double K_max", "do nothing to emission", "halve the work function"],
      answer: 2,
      why: "Below threshold, hf < φ. Extra intensity means more photons, each still too poor in energy. Quantisation, not brightness, gates the effect."
    }
  ];

  let score = 0;
  const answered = new Set();

  questions.forEach((item, i) => {
    const wrap = document.createElement("article");
    wrap.className = "quiz-item";
    wrap.innerHTML = `<h3>${i + 1}. ${item.q}</h3><div class="options"></div><p class="explain">${item.why}</p>`;
    const box = wrap.querySelector(".options");
    item.options.forEach((opt, j) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = opt;
      b.addEventListener("click", () => {
        if (answered.has(i)) return;
        answered.add(i);
        box.querySelectorAll("button").forEach((btn, k) => {
          if (k === item.answer) btn.classList.add("correct");
        });
        if (j === item.answer) score += 1;
        else b.classList.add("wrong");
        wrap.querySelector(".explain").classList.add("show");
        scoreEl.textContent = `Score: ${score} / ${questions.length}`;
      });
      box.appendChild(b);
    });
    quizEl.appendChild(wrap);
  });

  const dots = Array.from({ length: 48 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00035,
    vy: (Math.random() - 0.5) * 0.00035,
    r: 1 + Math.random() * 1.8
  }));

  function drawField(t) {
    if (!field) return;
    field.width = window.innerWidth;
    field.height = window.innerHeight;
    const ctx = field.getContext("2d");
    ctx.clearRect(0, 0, field.width, field.height);
    const light = root.getAttribute("data-theme") === "light";
    ctx.fillStyle = light ? "rgba(15,122,92,0.35)" : "rgba(62,224,176,0.55)";
    dots.forEach((d) => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > 1) d.vx *= -1;
      if (d.y < 0 || d.y > 1) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x * field.width, d.y * field.height, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = light ? "rgba(15,122,92,0.08)" : "rgba(62,224,176,0.08)";
    for (let i = 0; i < dots.length; i += 1) {
      for (let j = i + 1; j < dots.length; j += 1) {
        const dx = (dots[i].x - dots[j].x) * field.width;
        const dy = (dots[i].y - dots[j].y) * field.height;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          ctx.globalAlpha = 1 - dist / 140;
          ctx.beginPath();
          ctx.moveTo(dots[i].x * field.width, dots[i].y * field.height);
          ctx.lineTo(dots[j].x * field.width, dots[j].y * field.height);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(drawField);
  }
  requestAnimationFrame(drawField);

  const amp1 = document.getElementById("amp1");
  const amp2 = document.getElementById("amp2");
  const freq2 = document.getElementById("freq2");
  const phase = document.getElementById("phase");
  let waveTime = 0;

  function drawWave() {
    if (!wave) return;
    const ctx = wave.getContext("2d");
    const w = wave.width;
    const h = wave.height;
    ctx.fillStyle = "#061016";
    ctx.fillRect(0, 0, w, h);
    const mid = h / 2;
    const a1 = Number(amp1.value);
    const a2 = Number(amp2.value);
    const f2 = Number(freq2.value);
    const ph = Number(phase.value);

    const plot = (amp, freq, p, color, width) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      for (let x = 0; x <= w; x += 2) {
        const y = mid + amp * Math.sin((x / w) * Math.PI * 8 * freq + waveTime * freq + p);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    plot(a1, 1, 0, "rgba(231,184,106,0.7)", 2);
    plot(a2, f2, ph, "rgba(154,160,255,0.7)", 2);

    ctx.beginPath();
    ctx.strokeStyle = "#3ee0b0";
    ctx.lineWidth = 3;
    for (let x = 0; x <= w; x += 2) {
      const y1 = a1 * Math.sin((x / w) * Math.PI * 8 + waveTime);
      const y2 = a2 * Math.sin((x / w) * Math.PI * 8 * f2 + waveTime * f2 + ph);
      const y = mid + y1 + y2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    waveTime += 0.04;
    requestAnimationFrame(drawWave);
  }
  requestAnimationFrame(drawWave);
})();
