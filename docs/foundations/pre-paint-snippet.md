# Pre-paint theme script (FOUC prevention)

Add this script to your host app's `index.html` `<head>`, BEFORE any stylesheet,
so the correct theme is on `<html>` before first paint. It deliberately does not
know which themes exist — it only reads what `useTheme` persisted.

```html
<script>
  (function () {
    try {
      var pref = localStorage.getItem('ui-theme');      // theme id or 'system' or null
      var mode = localStorage.getItem('ui-theme-mode');  // 'dark' | 'light' | null
      var systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
      var resolvedMode = mode || (systemDark ? 'dark' : 'light');
      // Canonical pair when preference is 'system' or unset.
      var theme = (pref && pref !== 'system') ? pref
        : (resolvedMode === 'dark' ? 'precision' : 'warehouse');
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-theme-mode', resolvedMode);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'precision');
      document.documentElement.setAttribute('data-theme-mode', 'dark');
    }
  })();
</script>
```

Then import the tokens once in your app entry:

```ts
import '@metalogix/ui-standards/tokens/global.css'; // or the copied path
```
