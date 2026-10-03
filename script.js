// Interface text for messages created by this script (page text lives in the HTML)
const I18N = {
  en: {
    menuOpen: "Open menu", menuClose: "Close menu",
    tickerPause: "Pause the scrolling service list", tickerResume: "Resume the scrolling service list",
    copied: "Copied", copyFailed: "Copy failed",
    errName: "Enter your full name.",
    errEmail: "Enter your email address.",
    errEmailBad: "Enter an email address like name@example.com.",
    errService: "Choose the service you need.",
    errDeadline: "Choose your deadline.",
    errDetails: "Describe your project in a sentence or two.",
    errHuman: "Tick “I'm not a robot” and answer the question before sending.",
    errHumanWrong: "That answer isn't right. Try this new question.",
    errBot: "Please wait a few seconds and try again.",
    question: "Quick check: what is {q}?",
    sending: "Sending…", send: "Send Request",
    okTitle: "Request sent",
    okText: "Thanks, {name}. We'll reply to {email} with a price and a delivery date. For a faster answer, message us on WhatsApp.",
    msgWa: "Message on WhatsApp",
    waAfter: "Hi, I just sent a quote request on your website. My name is {name}.",
    failTitle: "Your request wasn't sent",
    failText: "We couldn't reach the email service from this page. Your details are still in the form. Send the same request on WhatsApp, or copy it and email it to {email}.",
    sendWa: "Send on WhatsApp", copyRequest: "Copy request",
  },
  zh: {
    menuOpen: "打开菜单", menuClose: "关闭菜单",
    tickerPause: "暂停滚动的服务列表", tickerResume: "继续滚动服务列表",
    copied: "已复制", copyFailed: "复制失败",
    errName: "请输入你的姓名。",
    errEmail: "请输入你的电子邮箱。",
    errEmailBad: "请输入有效的邮箱地址，例如 name@example.com。",
    errService: "请选择你需要的服务。",
    errDeadline: "请选择截止日期。",
    errDetails: "请用一两句话描述你的项目。",
    errHuman: "提交前请勾选“我不是机器人”并回答问题。",
    errHumanWrong: "答案不正确，请回答这道新题。",
    errBot: "请稍等几秒后再试。",
    question: "快速验证：{q} 等于多少？",
    sending: "正在发送…", send: "提交需求",
    okTitle: "需求已发送",
    okText: "谢谢你，{name}。我们会把价格和交付日期回复到 {email}。如需更快回复，请通过 WhatsApp 联系我们。",
    msgWa: "WhatsApp 留言",
    waAfter: "你好，我刚在你们的网站上提交了报价申请。我的名字是 {name}。",
    failTitle: "你的需求未能发送",
    failText: "此页面无法连接到邮件服务。你填写的信息仍保留在表单中。你可以通过 WhatsApp 发送同样的需求，或复制后发送邮件到 {email}。",
    sendWa: "通过 WhatsApp 发送", copyRequest: "复制需求",
  },
  es: {
    menuOpen: "Abrir menú", menuClose: "Cerrar menú",
    tickerPause: "Pausar la lista de servicios", tickerResume: "Reanudar la lista de servicios",
    copied: "Copiado", copyFailed: "No se pudo copiar",
    errName: "Escribe tu nombre completo.",
    errEmail: "Escribe tu correo electrónico.",
    errEmailBad: "Escribe un correo como nombre@ejemplo.com.",
    errService: "Elige el servicio que necesitas.",
    errDeadline: "Elige tu fecha límite.",
    errDetails: "Describe tu proyecto en una o dos frases.",
    errHuman: "Marca «No soy un robot» y responde la pregunta antes de enviar.",
    errHumanWrong: "Esa respuesta no es correcta. Prueba con esta nueva pregunta.",
    errBot: "Espera unos segundos e inténtalo de nuevo.",
    question: "Comprobación rápida: ¿cuánto es {q}?",
    sending: "Enviando…", send: "Enviar solicitud",
    okTitle: "Solicitud enviada",
    okText: "Gracias, {name}. Responderemos a {email} con un precio y una fecha de entrega. Para una respuesta más rápida, escríbenos por WhatsApp.",
    msgWa: "Escribir por WhatsApp",
    waAfter: "Hola, acabo de enviar una solicitud de presupuesto en su web. Me llamo {name}.",
    failTitle: "Tu solicitud no se envió",
    failText: "No pudimos conectar con el servicio de correo desde esta página. Tus datos siguen en el formulario. Envía la misma solicitud por WhatsApp, o cópiala y envíala por correo a {email}.",
    sendWa: "Enviar por WhatsApp", copyRequest: "Copiar solicitud",
  },
};
const LANG = (document.documentElement.lang || "en").slice(0, 2);
const t = (key, vars = {}) => {
  let s = (I18N[LANG] || I18N.en)[key] ?? I18N.en[key];
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
};
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const links = document.getElementById("nav-links");

toggle.addEventListener("click", () => {
  const open = links.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? t("menuClose") : t("menuOpen"));
});

links.addEventListener("click", (e) => {
  if (e.target.closest("a") && links.classList.contains("is-open")) toggle.click();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && links.classList.contains("is-open")) {
    toggle.click();
    toggle.focus();
  }
});

// Background video scrubbed by scroll position (down = forward, up = backward)
const video = document.querySelector(".bg-video video");

if (video && !reduceMotion.matches) {
  let target = 0;
  let current = 0;
  let seeking = false;

  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
  };

  const setTarget = () => {
    if (video.duration) target = progress() * (video.duration - 0.05);
  };

  video.addEventListener("seeked", () => { seeking = false; });

  // Ease toward the target time so playback glides instead of jumping
  const tick = () => {
    if (video.duration) {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.001) current = target;
      if (!seeking && Math.abs(video.currentTime - current) > 0.01) {
        seeking = true;
        video.currentTime = current;
      }
    }
    requestAnimationFrame(tick);
  };

  const start = () => {
    // iOS Safari only paints frames after playback has started once
    video.play().then(() => video.pause()).catch(() => {});
    setTarget();
    current = target;
    requestAnimationFrame(tick);
  };

  if (video.readyState >= 1) start();
  else video.addEventListener("loadedmetadata", start, { once: true });

  addEventListener("scroll", setTarget, { passive: true });
  addEventListener("resize", setTarget);
}

// Ticker pause button (hover and keyboard focus pause it through CSS)
const ticker = document.querySelector(".ticker");
const tickerToggle = ticker?.querySelector(".ticker-toggle");
if (tickerToggle) {
  tickerToggle.addEventListener("click", () => {
    const paused = ticker.classList.toggle("is-paused");
    tickerToggle.setAttribute("aria-pressed", String(paused));
    tickerToggle.setAttribute("aria-label", paused ? t("tickerResume") : t("tickerPause"));
  });
}

// 3D tilt on featured images (mouse only; off for reduced motion)
if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion.matches) {
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });
}

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Contact details used by the quote form
const CONTACT = { whatsapp: "601164557105", email: "alireza1708karami@gmail.com" };
const waLink = (text) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Copy buttons (clipboard API, with a textarea fallback)
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  btn.dataset.label ??= btn.textContent;
  const value = btn.dataset.copy;
  let ok = false;
  try {
    await navigator.clipboard.writeText(value);
    ok = true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.append(ta);
    ta.select();
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
  }
  btn.textContent = ok ? t("copied") : t("copyFailed");
  clearTimeout(btn._t);
  btn._t = setTimeout(() => { btn.textContent = btn.dataset.label; }, 1800);
});

// Quote form
const form = document.getElementById("quote-form");
if (form) {
  const $ = (id) => document.getElementById(id);
  const service = $("q-service");
  const status = $("q-status");
  const submit = $("q-submit");
  const waBtn = $("q-whatsapp");
  const openedAt = Date.now();

  // Preselect the service from the link, e.g. quote.html#research-paper
  const preset = () => {
    const slug = decodeURIComponent(location.hash.slice(1));
    if ([...service.options].some((o) => o.value === slug)) service.value = slug;
  };
  preset();
  addEventListener("hashchange", preset);

  // Deadlines can't be in the past (local date)
  const now = new Date();
  $("q-deadline").min = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  // ----- Human verification: checkbox, then a small sum -----
  const robot = $("q-robot");
  const challenge = $("q-challenge");
  const answer = $("q-answer");
  const verifiedMsg = $("q-verified");
  const humanErr = $("q-human-error");
  const humanBox = $("q-human");
  let humanOk = false;
  let expected = 0;

  const newQuestion = () => {
    const a = 2 + Math.floor(Math.random() * 8);
    const b = 1 + Math.floor(Math.random() * 9);
    expected = a + b;
    $("q-question").textContent = t("question", { q: `${a} + ${b}` });
    answer.value = "";
  };

  const setHumanError = (msg) => {
    humanErr.textContent = msg;
    humanErr.hidden = !msg;
    humanBox.classList.toggle("is-invalid", Boolean(msg));
  };

  const resetHuman = () => {
    humanOk = false;
    humanBox.classList.remove("is-verified");
    verifiedMsg.hidden = true;
    challenge.hidden = true;
    robot.disabled = false;
  };

  robot.addEventListener("change", () => {
    setHumanError("");
    if (robot.checked) {
      newQuestion();
      challenge.hidden = false;
      answer.focus();
    } else {
      resetHuman();
    }
  });

  const verify = () => {
    // Accept Western and full-width digits
    const value = answer.value.trim().replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0));
    if (Number(value) === expected && value !== "") {
      humanOk = true;
      challenge.hidden = true;
      verifiedMsg.hidden = false;
      humanBox.classList.add("is-verified");
      robot.disabled = true;
      setHumanError("");
    } else {
      newQuestion();
      setHumanError(t("errHumanWrong"));
      answer.focus();
    }
  };

  $("q-verify").addEventListener("click", verify);
  answer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); verify(); }
  });
  $("q-new").addEventListener("click", () => { newQuestion(); answer.focus(); });

  // ----- Field validation -----
  const rules = {
    "q-name": (v) => (v.trim() ? "" : t("errName")),
    "q-email": (v) => !v.trim() ? t("errEmail")
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : t("errEmailBad"),
    "q-service": (v) => (v ? "" : t("errService")),
    "q-deadline": (v) => (v ? "" : t("errDeadline")),
    "q-details": (v) => (v.trim().length >= 10 ? "" : t("errDetails")),
  };

  const check = (id) => {
    const field = $(id);
    const msg = rules[id](field.value);
    const err = $(`${id}-error`);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    err.textContent = msg;
    err.hidden = !msg;
    return !msg;
  };

  Object.keys(rules).forEach((id) => {
    const field = $(id);
    // Validate when the person leaves a field they've typed in, then live while it's invalid
    field.addEventListener("blur", () => { if (field.value || field.getAttribute("aria-invalid")) check(id); });
    field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") check(id); });
    field.addEventListener("change", () => { if (field.getAttribute("aria-invalid") === "true") check(id); });
  });

  const validate = () => {
    const invalid = Object.keys(rules).filter((id) => !check(id));
    if (!humanOk) setHumanError(t("errHuman"));
    if (invalid.length) $(invalid[0]).focus();
    else if (!humanOk) (robot.checked ? answer : robot).focus();
    return invalid.length === 0 && humanOk;
  };

  // Bots fill the hidden field or submit within a couple of seconds of loading
  const looksLikeBot = () => $("q-website").value !== "" || Date.now() - openedAt < 3000;

  const serviceName = () => (service.value ? service.options[service.selectedIndex].text : "");

  // The request is written in English for the business inbox, with the visitor's language noted
  const summary = () => [
    "Quote request for Lumina Academic",
    `Name: ${$("q-name").value.trim()}`,
    `Email: ${$("q-email").value.trim()}`,
    $("q-phone").value.trim() && `WhatsApp: ${$("q-phone").value.trim()}`,
    `Service: ${serviceName()}`,
    $("q-level").value && `Level: ${$("q-level").value}`,
    $("q-deadline").value && `Deadline: ${$("q-deadline").value}`,
    $("q-length").value.trim() && `Length: ${$("q-length").value.trim()}`,
    `Details: ${$("q-details").value.trim()}`,
    `Language: ${LANG.toUpperCase()}`,
  ].filter(Boolean).join("\n");

  const showStatus = (kind, html) => {
    status.className = `form-status is-${kind}`;
    status.innerHTML = html;
    status.hidden = false;
    status.focus();
  };

  // WhatsApp button sends the filled-in request as a chat message
  waBtn.addEventListener("click", (e) => {
    if (!validate()) { e.preventDefault(); return; }
    waBtn.href = waLink(summary());
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (looksLikeBot()) {
      showStatus("error", `<p>${esc(t("errBot"))}</p>`);
      return;
    }

    const text = summary();
    const name = $("q-name").value.trim();
    const email = $("q-email").value.trim();
    const data = Object.fromEntries(new FormData(form));
    data.service = serviceName();
    data.language = LANG.toUpperCase();
    data._subject = `Quote request: ${data.service} from ${name}`;
    data._template = "table";
    data._captcha = "false";

    submit.disabled = true;
    submit.textContent = t("sending");
    status.hidden = true;

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      // FormSubmit forwards the request to the business inbox (no server needed)
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT.email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== "true") throw new Error(json.message || `HTTP ${res.status}`);

      form.reset();
      preset();
      resetHuman();
      form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
      showStatus("success", `
        <h3>${esc(t("okTitle"))}</h3>
        <p>${esc(t("okText", { name, email }))}</p>
        <div class="form-actions"><a class="btn btn-whatsapp" href="${waLink(t("waAfter", { name }))}" target="_blank" rel="noopener">${esc(t("msgWa"))}</a></div>`);
    } catch {
      showStatus("error", `
        <h3>${esc(t("failTitle"))}</h3>
        <p>${esc(t("failText", { email: CONTACT.email }))}</p>
        <div class="form-actions">
          <a class="btn btn-whatsapp" href="${waLink(text)}" target="_blank" rel="noopener">${esc(t("sendWa"))}</a>
          <button class="copy-btn" type="button" data-copy="${esc(text)}">${esc(t("copyRequest"))}</button>
        </div>`);
    } finally {
      submit.disabled = false;
      submit.textContent = t("send");
    }
  });
}
