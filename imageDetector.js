// Simple client-side image detector for Rubik's Cube faces.
// - Loads an uploaded image into a canvas
// - Draws a 3x3 overlay and samples an area around each cell center
// - Maps sampled RGB to nearest cube color (R,B,W,G,O,Y)
// - Exposes applyAllDetected() which writes detected colors into the existing UI and arrays in Rubik.js

(function(){
    // detectedColors stores per-face arrays of 9 letters
    const detectedColors = {};

    // approximate reference colors for cube stickers (tweakable)
    const refs = {
        'W': [245,245,245],
        'Y': [250,200,30],
        'R': [180,40,40],
        'O': [245,140,30],
        'G': [30,150,50],
        'B': [40,70,200]
    };

    // mapping from face letter to DOM index order (HTML layout)
    const faceIndexMap = {
        'R': [7,8,9,4,5,6,1,2,3],
        'B': [7,4,1,8,5,2,9,6,3],
        'W': [1,2,3,4,5,6,7,8,9],
        'G': [1,4,7,2,5,8,3,6,9],
        'O': [1,2,3,4,5,6,7,8,9],
        'Y': [1,2,3,4,5,6,7,8,9]
    };

    function avgAround(ctx, x, y, size){
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const half = Math.floor(size/2);
        const sx = Math.max(0, Math.floor(x-half));
        const sy = Math.max(0, Math.floor(y-half));
        const ex = Math.min(w, Math.floor(x+half));
        const ey = Math.min(h, Math.floor(y+half));
        const sw = ex - sx;
        const sh = ey - sy;
        if(sw<=0 || sh<=0) return [0,0,0];
        const data = ctx.getImageData(sx, sy, sw, sh).data;
        let r=0,g=0,b=0,c=0;
        for(let i=0;i<data.length;i+=4){ r+=data[i]; g+=data[i+1]; b+=data[i+2]; c++; }
        return [Math.round(r/c), Math.round(g/c), Math.round(b/c)];
    }

    function mapColor(rgb){
        let best=null; let bestDist=1e9;
        for(const k in refs){
            const rc = refs[k];
            const d = (rgb[0]-rc[0])*(rgb[0]-rc[0]) + (rgb[1]-rc[1])*(rgb[1]-rc[1]) + (rgb[2]-rc[2])*(rgb[2]-rc[2]);
            if(d<bestDist){ bestDist=d; best=k; }
        }
        return best;
    }

    function drawOverlay(ctx){
        const w = ctx.canvas.width; const h = ctx.canvas.height;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 2;
        for(let i=1;i<3;i++){
            // vertical
            ctx.beginPath(); ctx.moveTo(Math.round(w*i/3),0); ctx.lineTo(Math.round(w*i/3),h); ctx.stroke();
            // horizontal
            ctx.beginPath(); ctx.moveTo(0,Math.round(h*i/3)); ctx.lineTo(w,Math.round(h*i/3)); ctx.stroke();
        }
    }

    function processImage(file, canvasId, faceLetter){
        const reader = new FileReader();
        reader.onload = function(ev){
            const img = new Image();
            img.onload = function(){
                const canvas = document.getElementById(canvasId);
                const ctx = canvas.getContext('2d');
                // clear
                ctx.clearRect(0,0,canvas.width,canvas.height);
                // draw image fit-cover style: fill canvas, maintain aspect
                const cw = canvas.width, ch = canvas.height;
                const iw = img.width, ih = img.height;
                const r = Math.max(cw/iw, ch/ih);
                const nw = iw * r, nh = ih * r;
                const dx = (cw - nw)/2, dy = (ch - nh)/2;
                ctx.drawImage(img, dx, dy, nw, nh);

                // overlay grid
                drawOverlay(ctx);

                // sample 3x3 centers
                const samples = [];
                for(let row=0; row<3; row++){
                    for(let col=0; col<3; col++){
                        const sx = Math.round((col + 0.5) * cw / 3);
                        const sy = Math.round((row + 0.5) * ch / 3);
                        const rgb = avgAround(ctx, sx, sy, 9); // sample 9x9
                        const letter = mapColor(rgb);
                        samples.push(letter);
                        // draw small marker with letter
                        ctx.fillStyle = 'rgba(0,0,0,0.6)';
                        ctx.font = '14px Arial';
                        ctx.fillText(letter, sx-7, sy+6);
                    }
                }
                detectedColors[faceLetter] = samples;
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function applyFaceToUI(faceLetter, colors){
        // colors is array of 9 letters in row-major top-left -> bottom-right
        const map = faceIndexMap[faceLetter];
        if(!map) return;
        for(let i=0;i<9;i++){
            const idx = map[i];
            const id = faceLetter + String(idx);
            const letter = colors[i];
            // set class on the button if exists
            const el = document.getElementById(id);
            if(el){ el.className = 'button ' + letter; }
            // set global arrays if present (r,b,w,g,o,y)
            try{
                if(faceLetter==='R') r[idx] = letter;
                if(faceLetter==='B') b[idx] = letter;
                if(faceLetter==='W') w[idx] = letter;
                if(faceLetter==='G') g[idx] = letter;
                if(faceLetter==='O') o[idx] = letter;
                if(faceLetter==='Y') y[idx] = letter;
            }catch(e){ /* ignore if arrays not present */ }
        }
    }

    // Public: apply all detected faces into UI and update textarea
    window.applyAllDetected = function(){
        const faces = ['R','B','W','G','O','Y'];
        let any=false;
        for(const f of faces){
            if(detectedColors[f] && detectedColors[f].length===9){
                applyFaceToUI(f, detectedColors[f]);
                any=true;
            }
        }
        if(any){
            try{ print(); } catch(e){}
            alert('Applied detected faces. Review the grid and press Submit to solve.');
        } else {
            alert('No detected faces available. Upload images for faces first.');
        }
    };

    function init(){
        const mapping = [ ['fileR','canvasR','R'], ['fileB','canvasB','B'], ['fileW','canvasW','W'], ['fileG','canvasG','G'], ['fileO','canvasO','O'], ['fileY','canvasY','Y'] ];
        mapping.forEach(([fileId,canvasId,face])=>{
            const fi = document.getElementById(fileId);
            if(!fi) return;
            fi.addEventListener('change', function(ev){
                if(fi.files && fi.files[0]){
                    processImage(fi.files[0], canvasId, face);
                }
            });
        });
        // If there is an 'openUploads' button, ensure it scrolls to the upload area.
        const openBtn = document.getElementById('openUploads');
        if(openBtn){
            openBtn.addEventListener('click', function(){
                scrollToUploads();
            });
        }
    }

    // Smooth scroll helper exposed globally so index.html can call it directly
    window.scrollToUploads = function(){
        const el = document.getElementById('imageUpload');
        if(el){ el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    };

    window.addEventListener('DOMContentLoaded', init);

})();
