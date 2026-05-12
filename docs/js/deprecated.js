/* ============================================================================
 * Deprecation marker shim for foodoc-rendered JSDoc output.
 *
 * foodoc emits an HTML comment "<!-- deprecated -->" right before every
 * @deprecated form-group block (see tag/_details.hbs). This script scans
 * those comments on page load and adds semantic CSS classes so deprecated.css
 * can style them prominently:
 *
 *   - .form-group.is-deprecated       on every deprecation callout
 *   - .is-deprecated-method on the <dt> that wraps a deprecated method header
 *   - .has-deprecated on <body> when at least one deprecation is class-level
 * ============================================================================ */
(function () {
  function markDeprecations() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
    var node, classLevel = false;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim() !== 'deprecated') continue;
      var formGroup = node.nextElementSibling;
      if (!formGroup || !formGroup.classList.contains('form-group')) continue;
      formGroup.classList.add('is-deprecated');

      // foodoc nests both class-level AND method-level deprecations in
      // <dd class="symbol-details">, distinguished by the symbol kind:
      //   - class/namespace deprecation: <dd class="symbol-details class ...">
      //   - method/property deprecation: <dd class="symbol-details member ...">
      //                              or  <dd class="symbol-details function ...">
      // We only want the badge/strikethrough treatment for the latter.
      var memberDetails = formGroup.closest(
        'dd.symbol-details.member, dd.symbol-details.function'
      );
      if (memberDetails) {
        var dt = memberDetails.previousElementSibling;
        if (dt && dt.classList.contains('symbol-title')) {
          dt.classList.add('is-deprecated-method');
          // Inject a real <span> badge into the h4 so we can style it
          // without inheriting the h4's monospace font + text-indent quirks.
          var h4 = dt.querySelector('h4');
          if (h4 && !h4.querySelector('.deprecated-badge')) {
            var badge = document.createElement('span');
            badge.className = 'deprecated-badge';
            badge.textContent = 'deprecated';
            h4.appendChild(badge);
          }
        }
      } else {
        classLevel = true;
      }
    }
    if (classLevel) document.body.classList.add('has-deprecated');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markDeprecations);
  } else {
    markDeprecations();
  }
})();
