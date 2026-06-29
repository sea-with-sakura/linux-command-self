(function () {
  function textOf(heading) {
    return heading.textContent.replace(/\s+/g, ' ').trim();
  }

  function ensureId(heading, index) {
    if (heading.id) return heading.id;
    heading.id = 'section-' + index;
    return heading.id;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var body = document.querySelector('.markdown-body');
    if (!body) return;

    var headings = Array.prototype.slice.call(body.querySelectorAll('h2, h3'));
    headings = headings.filter(function (heading) {
      return textOf(heading);
    });
    if (headings.length < 3) return;

    var aside = document.createElement('aside');
    aside.className = 'doc-outline';
    aside.setAttribute('aria-label', '页面大纲');

    var title = document.createElement('div');
    title.className = 'doc-outline-title';
    title.textContent = '目录';
    aside.appendChild(title);

    var list = document.createElement('nav');
    var links = headings.map(function (heading, index) {
      var id = ensureId(heading, index);
      var link = document.createElement('a');
      link.href = '#' + encodeURIComponent(id);
      link.className = 'doc-outline-link level-' + heading.tagName.toLowerCase();
      link.textContent = textOf(heading);
      list.appendChild(link);
      return {
        heading: heading,
        link: link
      };
    });
    aside.appendChild(list);
    document.body.appendChild(aside);

    var toggle = document.createElement('button');
    toggle.className = 'doc-outline-toggle';
    toggle.type = 'button';
    toggle.textContent = '目录';
    toggle.setAttribute('aria-expanded', 'false');
    document.body.appendChild(toggle);

    function closeOutline() {
      aside.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var isOpen = aside.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.forEach(function (item) {
      item.link.addEventListener('click', function () {
        closeOutline();
      });
    });

    var activeLink = null;
    function setActive(link) {
      if (activeLink === link) return;
      if (activeLink) activeLink.classList.remove('is-active');
      activeLink = link;
      if (activeLink) activeLink.classList.add('is-active');
    }

    function updateActive() {
      var current = links[0];
      var offset = 105;
      for (var i = 0; i < links.length; i++) {
        if (links[i].heading.getBoundingClientRect().top <= offset) {
          current = links[i];
        } else {
          break;
        }
      }
      setActive(current && current.link);
    }

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
  });
})();
