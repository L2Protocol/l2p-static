(() => {
  const base = document.currentScript && document.currentScript.src;
  const header = document.querySelector("main header");
  const title = document.querySelector("main h1");
  const reason = document.querySelector("main p");
  const notice = document.querySelector("main small");
  if (!base || !header || !title || !reason || !notice) return;

  const isText = (value) => typeof value === "string" && value.length > 0;
  const isLanguage = (language) =>
    language && /^[a-z]{2,3}$/.test(language.code) && /^[A-Z]{2}$/.test(language.flag)
    && ["ltr", "rtl"].includes(language.dir)
    && [language.name, language.title, language.reason, language.notice].every(isText)
    && (language.aliases === undefined || (Array.isArray(language.aliases) && language.aliases.every(isText)));

  const preferred = (languages) => {
    const requested = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (const tag of requested) {
      const primary = String(tag || "").split("-")[0].toLowerCase();
      const match = languages.find((language) => language.code === primary || (language.aliases || []).includes(primary));
      if (match) return match;
    }
    return languages.find((language) => language.code === "en") || languages[0];
  };

  const style = document.createElement("style");
  style.textContent = `
.lang-switch{display:flex;flex-wrap:wrap;gap:.3rem;margin:0;padding:0;list-style:none}
.lang-switch button{display:block;padding:3px;border:1px solid transparent;border-radius:50%;background:none;cursor:pointer;transition:border-color .15s,background-color .15s}
.lang-switch img{display:block;width:1.5rem;height:1.5rem;border-radius:50%;opacity:.6;filter:saturate(.6);transition:opacity .15s,filter .15s}
.lang-switch button:hover img,.lang-switch [aria-pressed=true] img{opacity:1;filter:none}
.lang-switch [aria-pressed=true]{border-color:#959afd;background:#959afd2e}
.lang-switch button:focus-visible{outline:2px solid #959afd;outline-offset:2px}
:root:lang(my) h1{line-height:1.5}
:root:lang(my) main p,:root:lang(my) main small{line-height:1.85}
@media (prefers-reduced-motion:reduce){.lang-switch *{transition:none}}`;

  const render = (languages) => {
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Language");
    const list = document.createElement("ul");
    list.className = "lang-switch";
    nav.append(list);

    const buttons = languages.map((language) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.lang = language.code;
      button.title = language.name;
      button.setAttribute("aria-label", language.name);
      const image = document.createElement("img");
      image.src = new URL(`../images/flags/${language.flag}.svg`, base).href;
      image.alt = "";
      image.width = 24;
      image.height = 24;
      button.append(image);
      button.addEventListener("click", () => apply(language));
      item.append(button);
      list.append(item);
      return button;
    });

    const apply = (language) => {
      const root = document.documentElement;
      root.lang = language.code;
      root.dir = language.dir;
      title.textContent = language.title;
      reason.textContent = language.reason;
      notice.textContent = language.notice;
      document.title = `${language.title} | L2Protocol`;
      buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(languages[index] === language)));
    };

    apply(preferred(languages));
    document.head.append(style);
    header.append(nav);
  };

  fetch(new URL("unavailable.json", base))
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then((data) => {
      const languages = Array.isArray(data && data.languages) ? data.languages.filter(isLanguage) : [];
      if (languages.length > 1) render(languages);
    })
    .catch(() => {});
})();
