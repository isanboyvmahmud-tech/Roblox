/**
 * Roblox Avatar Engine (Three.js R6 Blocky Character)
 * 3D Avatar Customizer, Animations, Accessories & Textures
 */

class RobloxAvatar {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.isInteractive = options.interactive !== false;
        this.autoRotate = options.autoRotate || false;
        
        // Character customization state (loaded from localStorage or defaults)
        this.state = this.loadState();

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.characterGroup = null;

        // Body parts
        this.parts = {};
        this.accessories = {};
        
        // Animation state
        this.animTime = 0;
        this.currentEmote = 'idle'; // 'idle', 'dance', 'wave', 'walk'
        this.emoteTimer = 0;

        // Mouse rotation
        this.isDragging = false;
        this.prevMouseX = 0;
        this.targetRotationY = 0;

        if (this.canvas) {
            this.init();
        }
    }

    loadState() {
        const saved = localStorage.getItem('roblox_avatar_custom');
        if (saved) {
            try { return JSON.parse(saved); } catch(e){}
        }
        return {
            colors: {
                head: '#F5CD2F',      // Classic Roblox Yellow
                torso: '#0D69AC',     // Classic Roblox Blue
                leftArm: '#F5CD2F',
                rightArm: '#F5CD2F',
                leftLeg: '#4B974B',   // Classic Roblox Green
                rightLeg: '#4B974B'
            },
            face: 'smile',            // 'smile', 'chill', 'winning', 'ninja', 'beast'
            hat: 'cap',               // 'none', 'cap', 'fedora', 'crown', 'headphones', 'valkyrie'
            shirt: 'roblox',          // 'default', 'roblox', 'tuxedo', 'gamer', 'hero'
            backItem: 'none'          // 'none', 'sword', 'wings'
        };
    }

    saveState() {
        localStorage.setItem('roblox_avatar_custom', JSON.stringify(this.state));
    }

    init() {
        const width = this.canvas.clientWidth || 300;
        const height = this.canvas.clientHeight || 400;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x191B1D);

        // Camera
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        this.camera.position.set(0, 3.5, 9);
        this.camera.lookAt(0, 2.5, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.scene.add(dirLight);

        const backLight = new THREE.DirectionalLight(0x4A90E2, 0.4);
        backLight.position.set(-5, 6, -5);
        this.scene.add(backLight);

        // Pedestal (Avatar stage)
        const pedestalGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.4, 32);
        const pedestalMat = new THREE.MeshStandardMaterial({
            color: 0x24272B,
            roughness: 0.4,
            metalness: 0.2
        });
        const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
        pedestal.position.y = -0.2;
        pedestal.receiveShadow = true;
        this.scene.add(pedestal);

        // Pedestal neon ring
        const ringGeo = new THREE.TorusGeometry(2.45, 0.05, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00A2FF });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.01;
        this.scene.add(ring);

        // Build character
        this.buildCharacter();

        // Mouse / Touch Controls
        if (this.isInteractive) {
            this.setupEvents();
        }

        // Start render loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupEvents() {
        const onDown = (clientX) => {
            this.isDragging = true;
            this.prevMouseX = clientX;
        };

        const onMove = (clientX) => {
            if (!this.isDragging) return;
            const deltaX = clientX - this.prevMouseX;
            this.prevMouseX = clientX;
            this.targetRotationY += deltaX * 0.015;
        };

        const onUp = () => {
            this.isDragging = false;
        };

        this.canvas.addEventListener('mousedown', (e) => onDown(e.clientX));
        window.addEventListener('mousemove', (e) => onMove(e.clientX));
        window.addEventListener('mouseup', onUp);

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) onDown(e.touches[0].clientX);
        });
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) onMove(e.touches[0].clientX);
        });
        window.addEventListener('touchend', onUp);

        // Handle resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas || !this.renderer || !this.camera) return;
        const w = this.canvas.clientWidth || 320;
        const h = this.canvas.clientHeight || 380;
        if (w > 0 && h > 0) {
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        }
    }

    // Canvas face texture generator
    createFaceTexture(faceType) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.fillStyle = this.state.colors.head;
        ctx.fillRect(0, 0, 256, 256);

        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (faceType === 'smile') {
            // Classic Roblox Smile
            // Eyes
            ctx.beginPath();
            ctx.arc(80, 100, 16, 0, Math.PI * 2);
            ctx.arc(176, 100, 16, 0, Math.PI * 2);
            ctx.fill();

            // Smile curve
            ctx.beginPath();
            ctx.arc(128, 130, 50, 0.15 * Math.PI, 0.85 * Math.PI, false);
            ctx.stroke();

        } else if (faceType === 'chill') {
            // Chill Face with Sunglasses
            ctx.fillStyle = '#111';
            ctx.fillRect(45, 80, 70, 45);
            ctx.fillRect(141, 80, 70, 45);
            ctx.fillRect(100, 95, 56, 12);
            // Glare
            ctx.fillStyle = '#00A2FF';
            ctx.fillRect(55, 85, 20, 10);
            ctx.fillRect(151, 85, 20, 10);
            // Chill smirk
            ctx.beginPath();
            ctx.moveTo(90, 170);
            ctx.quadraticCurveTo(135, 185, 175, 160);
            ctx.stroke();

        } else if (faceType === 'winning') {
            // Winning Smile
            ctx.beginPath();
            ctx.arc(75, 95, 16, 0, Math.PI * 2);
            ctx.arc(181, 95, 16, 0, Math.PI * 2);
            ctx.fill();
            // Open mouth smile
            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.arc(128, 140, 55, 0, Math.PI, false);
            ctx.fill();
            ctx.stroke();
            // Tongue
            ctx.beginPath();
            ctx.fillStyle = '#FF5252';
            ctx.arc(128, 175, 25, 0, Math.PI, true);
            ctx.fill();

        } else if (faceType === 'ninja') {
            // Ninja mask eyes
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 130, 256, 126);
            ctx.fillStyle = '#E53935';
            ctx.fillRect(0, 120, 256, 16);
            // Fierce eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(60, 95); ctx.lineTo(110, 85); ctx.lineTo(100, 105); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(196, 95); ctx.lineTo(146, 85); ctx.lineTo(156, 105); ctx.fill();
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(88, 95, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(168, 95, 6, 0, Math.PI * 2); ctx.fill();

        } else if (faceType === 'beast') {
            // Angry/Beast Face
            ctx.beginPath();
            ctx.moveTo(60, 75); ctx.lineTo(105, 95);
            ctx.moveTo(196, 75); ctx.lineTo(151, 95);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(80, 108, 14, 0, Math.PI * 2);
            ctx.arc(176, 108, 14, 0, Math.PI * 2);
            ctx.fill();

            // Gritted teeth
            ctx.fillStyle = '#fff';
            ctx.fillRect(75, 145, 106, 30);
            ctx.strokeRect(75, 145, 106, 30);
            for(let x = 96; x < 180; x += 21) {
                ctx.beginPath();
                ctx.moveTo(x, 145); ctx.lineTo(x, 175);
                ctx.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(c);
        return texture;
    }

    // Shirt pattern texture generator
    createShirtTexture(shirtType, baseColor) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 256, 256);

        if (shirtType === 'roblox') {
            // Classic tilted R Logo
            ctx.save();
            ctx.translate(128, 128);
            ctx.rotate(-0.1);
            // Outer square
            ctx.fillStyle = '#fff';
            ctx.fillRect(-45, -45, 90, 90);
            // Inner hollow square
            ctx.fillStyle = baseColor;
            ctx.fillRect(-18, -18, 36, 36);
            ctx.restore();

        } else if (shirtType === 'tuxedo') {
            // Tuxedo with Red Bow Tie
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, 256, 256);
            // White V shirt
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.moveTo(70, 0); ctx.lineTo(186, 0); ctx.lineTo(128, 180); ctx.fill();
            // Red Bowtie
            ctx.fillStyle = '#E53935';
            ctx.beginPath();
            ctx.moveTo(110, 40); ctx.lineTo(146, 60); ctx.lineTo(146, 40); ctx.lineTo(110, 60); ctx.fill();
            ctx.beginPath(); ctx.arc(128, 50, 7, 0, Math.PI * 2); ctx.fill();
            // Buttons
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(128, 85, 4, 0, Math.PI * 2);
            ctx.arc(128, 120, 4, 0, Math.PI * 2);
            ctx.arc(128, 155, 4, 0, Math.PI * 2);
            ctx.fill();

        } else if (shirtType === 'gamer') {
            // Neon Gamer Hoodie
            ctx.fillStyle = '#1A1C23';
            ctx.fillRect(0, 0, 256, 256);
            // Neon stripes
            ctx.strokeStyle = '#00FFA3';
            ctx.lineWidth = 12;
            ctx.strokeRect(30, 40, 196, 176);
            ctx.fillStyle = '#00E5FF';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PRO', 128, 140);

        } else if (shirtType === 'hero') {
            // Superhero Crest
            ctx.fillStyle = '#D32F2F';
            ctx.fillRect(0, 0, 256, 256);
            // Gold Shield
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(128, 50); ctx.lineTo(190, 80); ctx.lineTo(170, 160); ctx.lineTo(128, 200); ctx.lineTo(86, 160); ctx.lineTo(66, 80); ctx.fill();
            // Star
            ctx.fillStyle = '#1E88E5';
            ctx.beginPath(); ctx.arc(128, 125, 25, 0, Math.PI * 2); ctx.fill();
        }

        return new THREE.CanvasTexture(c);
    }

    buildCharacter() {
        if (this.characterGroup) {
            this.scene.remove(this.characterGroup);
        }

        this.characterGroup = new THREE.Group();
        this.parts = {};
        this.accessories = {};

        // Stud texture on top surfaces
        const studMat = (color) => new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.35,
            metalness: 0.1
        });

        // --- 1. TORSO (2.0 x 2.0 x 1.0) ---
        const torsoGeo = new THREE.BoxGeometry(2.0, 2.0, 1.0);
        const torsoMat = studMat(this.state.colors.torso);
        torsoMat.map = this.createShirtTexture(this.state.shirt, this.state.colors.torso);

        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 2.5;
        torso.castShadow = true;
        torso.receiveShadow = true;
        this.characterGroup.add(torso);
        this.parts.torso = torso;

        // --- 2. HEAD (1.2 x 1.2 x 1.2) ---
        const headGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        
        // Materials for head (face on the front +Z face)
        const faceTex = this.createFaceTexture(this.state.face);
        const headMaterials = [
            studMat(this.state.colors.head), // right
            studMat(this.state.colors.head), // left
            studMat(this.state.colors.head), // top
            studMat(this.state.colors.head), // bottom
            new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.35 }), // front
            studMat(this.state.colors.head)  // back
        ];

        const head = new THREE.Mesh(headGeo, headMaterials);
        head.position.y = 1.6;
        head.castShadow = true;
        torso.add(head);
        this.parts.head = head;

        // Classic Head Stud (Cylinder on top of head)
        const studGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const studMesh = new THREE.Mesh(studGeo, studMat(this.state.colors.head));
        studMesh.position.y = 0.65;
        head.add(studMesh);

        // --- 3. LEFT ARM (1.0 x 2.0 x 1.0) with shoulder pivot ---
        const armGeo = new THREE.BoxGeometry(1.0, 2.0, 1.0);
        
        // Left Arm Pivot
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(1.5, 0.8, 0);
        const leftArmMesh = new THREE.Mesh(armGeo, studMat(this.state.colors.leftArm));
        leftArmMesh.position.y = -0.8;
        leftArmMesh.castShadow = true;
        leftArmPivot.add(leftArmMesh);
        torso.add(leftArmPivot);
        this.parts.leftArmPivot = leftArmPivot;
        this.parts.leftArm = leftArmMesh;

        // --- 4. RIGHT ARM (1.0 x 2.0 x 1.0) with shoulder pivot ---
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(-1.5, 0.8, 0);
        const rightArmMesh = new THREE.Mesh(armGeo, studMat(this.state.colors.rightArm));
        rightArmMesh.position.y = -0.8;
        rightArmMesh.castShadow = true;
        rightArmPivot.add(rightArmMesh);
        torso.add(rightArmPivot);
        this.parts.rightArmPivot = rightArmPivot;
        this.parts.rightArm = rightArmMesh;

        // --- 5. LEFT LEG (1.0 x 2.0 x 1.0) with hip pivot ---
        const legGeo = new THREE.BoxGeometry(1.0, 2.0, 1.0);

        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(0.5, -1.0, 0);
        const leftLegMesh = new THREE.Mesh(legGeo, studMat(this.state.colors.leftLeg));
        leftLegMesh.position.y = -0.9;
        leftLegMesh.castShadow = true;
        leftLegPivot.add(leftLegMesh);
        torso.add(leftLegPivot);
        this.parts.leftLegPivot = leftLegPivot;
        this.parts.leftLeg = leftLegMesh;

        // --- 6. RIGHT LEG (1.0 x 2.0 x 1.0) with hip pivot ---
        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(-0.5, -1.0, 0);
        const rightLegMesh = new THREE.Mesh(legGeo, studMat(this.state.colors.rightLeg));
        rightLegMesh.position.y = -0.9;
        rightLegMesh.castShadow = true;
        rightLegPivot.add(rightLegMesh);
        torso.add(rightLegPivot);
        this.parts.rightLegPivot = rightLegPivot;
        this.parts.rightLeg = rightLegMesh;

        // Attach Hats / Accessories
        this.attachAccessories();

        this.scene.add(this.characterGroup);
    }

    attachAccessories() {
        if (!this.parts.head) return;

        // Remove previous accessories
        if (this.accessories.hat) this.parts.head.remove(this.accessories.hat);
        if (this.accessories.back) this.parts.torso.remove(this.accessories.back);

        const hatType = this.state.hat;
        const hatGroup = new THREE.Group();

        if (hatType === 'cap') {
            // Classic Red Baseball Cap
            const capBase = new THREE.Mesh(
                new THREE.CylinderGeometry(0.7, 0.72, 0.35, 16),
                new THREE.MeshStandardMaterial({ color: 0xE53935 })
            );
            capBase.position.y = 0.65;
            hatGroup.add(capBase);

            // Visor
            const visor = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.08, 0.6),
                new THREE.MeshStandardMaterial({ color: 0xB71C1C })
            );
            visor.position.set(0, 0.55, 0.75);
            visor.rotation.x = 0.2;
            hatGroup.add(visor);

        } else if (hatType === 'fedora') {
            // Black Fedora with Crimson Band
            const brim = new THREE.Mesh(
                new THREE.CylinderGeometry(1.2, 1.2, 0.08, 24),
                new THREE.MeshStandardMaterial({ color: 0x1E1E1E })
            );
            brim.position.y = 0.62;
            hatGroup.add(brim);

            const crown = new THREE.Mesh(
                new THREE.CylinderGeometry(0.65, 0.75, 0.55, 24),
                new THREE.MeshStandardMaterial({ color: 0x252525 })
            );
            crown.position.y = 0.9;
            hatGroup.add(crown);

            const ribbon = new THREE.Mesh(
                new THREE.CylinderGeometry(0.76, 0.76, 0.12, 24),
                new THREE.MeshStandardMaterial({ color: 0xC62828 })
            );
            ribbon.position.y = 0.7;
            hatGroup.add(ribbon);

        } else if (hatType === 'crown') {
            // Golden Royal Crown
            const crownBase = new THREE.Mesh(
                new THREE.CylinderGeometry(0.72, 0.7, 0.4, 8),
                new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 })
            );
            crownBase.position.y = 0.75;
            hatGroup.add(crownBase);

            // Jewels
            for(let i=0; i<8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const jewel = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(0.08),
                    new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xE53935 : 0x00E5FF })
                );
                jewel.position.set(Math.sin(angle) * 0.73, 0.85, Math.cos(angle) * 0.73);
                hatGroup.add(jewel);
            }

        } else if (hatType === 'headphones') {
            // Neon RGB Gamer Headphones
            const arch = new THREE.Mesh(
                new THREE.TorusGeometry(0.72, 0.08, 12, 24, Math.PI),
                new THREE.MeshStandardMaterial({ color: 0x222222 })
            );
            arch.rotation.x = Math.PI;
            arch.position.y = 0.7;
            hatGroup.add(arch);

            const earL = new THREE.Mesh(
                new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16),
                new THREE.MeshBasicMaterial({ color: 0x00FFA3 })
            );
            earL.rotation.z = Math.PI / 2;
            earL.position.set(0.72, 0.05, 0);
            hatGroup.add(earL);

            const earR = earL.clone();
            earR.position.set(-0.72, 0.05, 0);
            hatGroup.add(earR);

        } else if (hatType === 'valkyrie') {
            // Mythic Valkyrie Helm
            const helm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.72, 0.75, 0.45, 16),
                new THREE.MeshStandardMaterial({ color: 0x37474F, metalness: 0.6 })
            );
            helm.position.y = 0.75;
            hatGroup.add(helm);

            // Wings on sides
            [-0.75, 0.75].forEach(side => {
                const wing = new THREE.Mesh(
                    new THREE.ConeGeometry(0.25, 1.1, 4),
                    new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8 })
                );
                wing.position.set(side, 1.1, 0);
                wing.rotation.z = side > 0 ? -0.4 : 0.4;
                hatGroup.add(wing);
            });
        }

        this.parts.head.add(hatGroup);
        this.accessories.hat = hatGroup;

        // Back items
        if (this.state.backItem === 'sword') {
            const swordGroup = new THREE.Group();
            swordGroup.position.set(0, 0, -0.6);
            swordGroup.rotation.z = 0.65;

            // Scabbard / Blade
            const blade = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 2.5, 0.08),
                new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 })
            );
            swordGroup.add(blade);

            // Gold Hilt
            const hilt = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.12, 0.12),
                new THREE.MeshStandardMaterial({ color: 0xFFD700 })
            );
            hilt.position.y = 0.8;
            swordGroup.add(hilt);

            this.parts.torso.add(swordGroup);
            this.accessories.back = swordGroup;

        } else if (this.state.backItem === 'wings') {
            const wingsGroup = new THREE.Group();
            wingsGroup.position.set(0, 0.2, -0.6);

            [-1, 1].forEach(side => {
                const wing = new THREE.Mesh(
                    new THREE.BoxGeometry(1.6, 0.8, 0.05),
                    new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.85 })
                );
                wing.position.set(side * 1.1, 0.2, 0);
                wing.rotation.z = side * 0.35;
                wingsGroup.add(wing);
            });

            this.parts.torso.add(wingsGroup);
            this.accessories.back = wingsGroup;
        }
    }

    // Set body part color
    setColor(partName, colorHex) {
        if (!this.state.colors[partName]) return;
        this.state.colors[partName] = colorHex;
        this.saveState();
        this.buildCharacter();
    }

    // Set Face
    setFace(faceId) {
        this.state.face = faceId;
        this.saveState();
        this.buildCharacter();
    }

    // Set Hat
    setHat(hatId) {
        this.state.hat = hatId;
        this.saveState();
        this.attachAccessories();
    }

    // Set Shirt
    setShirt(shirtId) {
        this.state.shirt = shirtId;
        this.saveState();
        this.buildCharacter();
    }

    // Set Back item
    setBackItem(itemId) {
        this.state.backItem = itemId;
        this.saveState();
        this.attachAccessories();
    }

    // Trigger emote
    playEmote(emoteName) {
        this.currentEmote = emoteName;
        this.emoteTimer = 0;
    }

    animate() {
        requestAnimationFrame(this.animate);

        this.animTime += 0.03;
        this.emoteTimer += 0.03;

        // Smooth rotation interpolation
        if (this.characterGroup) {
            if (this.autoRotate && !this.isDragging) {
                this.targetRotationY += 0.008;
            }
            this.characterGroup.rotation.y += (this.targetRotationY - this.characterGroup.rotation.y) * 0.1;

            // Handle Emotes / Animations
            if (this.currentEmote === 'idle') {
                // Subtle breathing
                this.parts.torso.position.y = 2.5 + Math.sin(this.animTime * 2) * 0.04;
                if (this.parts.leftArmPivot) {
                    this.parts.leftArmPivot.rotation.z = Math.sin(this.animTime * 1.5) * 0.05;
                    this.parts.leftArmPivot.rotation.x = 0;
                }
                if (this.parts.rightArmPivot) {
                    this.parts.rightArmPivot.rotation.z = -Math.sin(this.animTime * 1.5) * 0.05;
                    this.parts.rightArmPivot.rotation.x = 0;
                }
                if (this.parts.leftLegPivot) this.parts.leftLegPivot.rotation.x = 0;
                if (this.parts.rightLegPivot) this.parts.rightLegPivot.rotation.x = 0;

            } else if (this.currentEmote === 'dance') {
                // Fun Roblox Dance
                this.parts.torso.position.y = 2.5 + Math.abs(Math.sin(this.animTime * 6)) * 0.3;
                this.parts.torso.rotation.z = Math.sin(this.animTime * 6) * 0.15;
                if (this.parts.leftArmPivot) {
                    this.parts.leftArmPivot.rotation.z = Math.PI * 0.7 + Math.sin(this.animTime * 6) * 0.4;
                }
                if (this.parts.rightArmPivot) {
                    this.parts.rightArmPivot.rotation.z = -Math.PI * 0.7 - Math.cos(this.animTime * 6) * 0.4;
                }
                if (this.parts.leftLegPivot) {
                    this.parts.leftLegPivot.rotation.x = Math.sin(this.animTime * 6) * 0.5;
                }
                if (this.parts.rightLegPivot) {
                    this.parts.rightLegPivot.rotation.x = -Math.sin(this.animTime * 6) * 0.5;
                }

                if (this.emoteTimer > 8) this.currentEmote = 'idle';

            } else if (this.currentEmote === 'wave') {
                // Wave arm
                this.parts.torso.position.y = 2.5;
                if (this.parts.rightArmPivot) {
                    this.parts.rightArmPivot.rotation.z = -Math.PI * 0.85;
                    this.parts.rightArmPivot.rotation.x = Math.sin(this.animTime * 12) * 0.35;
                }
                if (this.emoteTimer > 4) this.currentEmote = 'idle';
            }
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
