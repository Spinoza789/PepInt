# Attribution and third-party licences

## Anatomical data

Adapted geometry in `data/atlas.json` and `human-head-anatomy.html` is distributed under **Creative Commons Attribution-ShareAlike 4.0 International**:
https://creativecommons.org/licenses/by-sa/4.0/

Source: [Z-Anatomy model files](https://github.com/LluisV/Z-Anatomy/tree/PC-Version/Resources/Models/FBX).

- **Z-Anatomy — the libre 3D atlas of anatomy:** Gauthier Kervyn, Marcin Zielinski, Lluis Vinent. CC BY-SA 4.0.
- **BodyParts3D — Database Center for Life Science:** Kousaku Okubo. CC BY-SA 2.1 Japan.
- Additional references acknowledged upstream: **Brainder / White matter**, University of Washington; **Cranial Nerves and Foramina**, University of Dundee, CAHID, CC BY 4.0.

Upstream credit details: https://github.com/Z-Anatomy/Models-of-human-anatomy/blob/master/License.txt

Third-party inner-ear geometry identified upstream as CC BY-NC-SA is excluded. Included cochlear nerves and cochlear nuclei are nervous-system objects, not those inner-ear meshes.

Changes: head selection, uniform translation and scaling, inferior neck clipping, quantized vertex positions, correction of winding for reflected source transforms, recalculated normals, materials, and interactive layouts. Source object names, URLs, SHA-256 hashes, and transformations are retained in `data/manifest.json`.

## Three.js

The application and standalone HTML include Three.js under its MIT licence:

The MIT License

Copyright © 2010-2023 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

https://github.com/mrdoob/three.js/blob/r159/LICENSE

## Interface

Interface, presentation, and interaction: @kirallik. This notice does not grant an additional licence for the original application code; the anatomical data and dependency licences above remain applicable.
