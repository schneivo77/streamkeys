# finden des Media-Objeks

- in Chrome Dev Tools unter "Elements" nach "<video" suchen
- Rechtsklick aufs Element und "Copy -> Copy JS Path"

- genauere Suche in bestimmtem DIV:
  - z.B. 'div.media-display > video'

- in `Sitelist.js` ist tatsächlich das `name`-Attribut der `sites`-Objekte wichtig, da aus ihm der REGEX gebildet wird mit welchem geprüft wird, ob die aktuelle Seite verwendet wird oder nicht
  - die `url` wurde in meinem Fall ignoriert
    - Erklärung: https://github.com/berrberr/streamkeys/#2-add-site-to-sitelist