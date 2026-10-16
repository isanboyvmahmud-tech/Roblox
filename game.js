/**
 * Roblox 3D Obby & Parkour Playable Game Engine (Three.js)
 * Full 3D Character Physics, Obstacles, Kill-bricks, Checkpoints, Robux Coins
 */

class RobloxGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.isRunning = false;
        
        // Scene & Renderer
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Player & Physics
        this.player = null;
        this.playerPivots = {};
        this.spawnPos = new THREE.Vector3(0, 3, 0);
        this.currentCheckpoint = 0;
        this.health = 100;
        this.isDead = false;

        this.velocity = new THREE.Vector3();
        this.isGrounded = false;
        this.moveSpeed = 14;
        this.jumpPower = 15;
        this.gravity = -36;

        // Camera control
        this.cameraDistance = 11;
        this.cameraYaw = 0;
        this.cameraPitch = 0.35;
        this.isPointerLocked = false;
        this.isMouseDragging = false;
        this.prevMousePos = { x: 0, y: 0 };

        // Input
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };

        // Game objects
        this.platforms = [];
        this.lavaBricks = [];
        this.coins = [];
        this.checkpoints = [];
        this.jumpPads = [];
        this.spinningObstacles = [];
        this.particles = [];

        // Game stats
        this.coinsCollected = 0;
        this.totalCoins = 0;
        this.gameTime = 0;
        this.timerInterval = null;

        // Callbacks
        this.onCoinCollect = null;
        this.onCheckpoint = null;
        this.onWin = null;
        this.onDeath = null;
        this.onHealthChange = null;

        this.clock = new THREE.Clock();
        this.animTime = 0;
    }

    init() {
        if (!this.canvas) return;

        const w = this.canvas.clientWidth || window.innerWidth;
        const h = this.canvas.clientHeight || window.innerHeight;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Roblox Classic Sky Blue
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.008);

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 0.9);
        sun.position.set(40, 70, 30);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 150;
        sun.shadow.camera.left = -40;
        sun.shadow.camera.right = 40;
        sun.shadow.camera.top = 40;
        sun.shadow.camera.bottom = -40;
        this.scene.add(sun);

        // Classic Roblox Skybox Clouds
        this.createSkyClouds();

        // Build Level
        this.buildLevel();

        // Build Player Avatar
        this.buildPlayer();

        // Setup Controls
        this.setupControls();

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());

        this.isRunning = true;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    createSkyClouds() {
        const cloudGeo = new THREE.BoxGeometry(40, 3, 20);
        const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
        
        for (let i = 0; i < 15; i++) {
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            cloud.position.set(
                (Math.random() - 0.5) * 400,
                55 + Math.random() * 20,
                (Math.random() - 0.5) * 400
            );
            cloud.scale.set(0.6 + Math.random() * 0.8, 1, 0.6 + Math.random() * 0.8);
            this.scene.add(cloud);
        }
    }

    buildPlayer() {
        // Load custom avatar settings from localStorage or defaults
        let avatarState = {
            colors: { head: '#F5CD2F', torso: '#0D69AC', leftArm: '#F5CD2F', rightArm: '#F5CD2F', leftLeg: '#4B974B', rightLeg: '#4B974B' },
            face: 'smile',
            hat: 'cap',
            shirt: 'roblox'
        };
        const saved = localStorage.getItem('roblox_avatar_custom');
        if (saved) {
            try { avatarState = JSON.parse(saved); } catch(e){}
        }

        this.player = new THREE.Group();
        this.player.position.copy(this.spawnPos);

        const studMat = (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.4 });

        // Torso
        const torsoGeo = new THREE.BoxGeometry(1.6, 1.8, 0.9);
        const torsoMat = studMat(avatarState.colors.torso);
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 1.9;
        torso.castShadow = true;
        this.player.add(torso);
        this.playerTorso = torso;

        // Head
        const headGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
        // Face canvas texture
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = 128; faceCanvas.height = 128;
        const ctx = faceCanvas.getContext('2d');
        ctx.fillStyle = avatarState.colors.head; ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#111'; ctx.beginPath();
        ctx.arc(40, 50, 8, 0, Math.PI * 2); ctx.arc(88, 50, 8, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 6; ctx.beginPath();
        ctx.arc(64, 70, 26, 0.1 * Math.PI, 0.9 * Math.PI, false); ctx.stroke();
        const faceTex = new THREE.CanvasTexture(faceCanvas);

        const headMaterials = [
            studMat(avatarState.colors.head), studMat(avatarState.colors.head),
            studMat(avatarState.colors.head), studMat(avatarState.colors.head),
            new THREE.MeshStandardMaterial({ map: faceTex }),
            studMat(avatarState.colors.head)
        ];
        const head = new THREE.Mesh(headGeo, headMaterials);
        head.position.y = 1.45;
        head.castShadow = true;
        torso.add(head);

        // Stud on head
        const stud = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.24, 0.16, 16),
            studMat(avatarState.colors.head)
        );
        stud.position.y = 0.55;
        head.add(stud);

        // Cap or Hat
        if (avatarState.hat === 'cap') {
            const cap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.55, 0.58, 0.25, 16),
                new THREE.MeshStandardMaterial({ color: 0xE53935 })
            );
            cap.position.y = 0.55;
            const visor = new THREE.Mesh(
                new THREE.BoxGeometry(0.65, 0.06, 0.45),
                new THREE.MeshStandardMaterial({ color: 0xB71C1C })
            );
            visor.position.set(0, 0.45, 0.55);
            visor.rotation.x = 0.2;
            head.add(cap);
            head.add(visor);
        } else if (avatarState.hat === 'crown') {
            const crown = new THREE.Mesh(
                new THREE.CylinderGeometry(0.58, 0.55, 0.35, 8),
                new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.7 })
            );
            crown.position.y = 0.65;
            head.add(crown);
        }

        // Left Arm Pivot
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(1.2, 0.6, 0);
        const armGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
        const leftArm = new THREE.Mesh(armGeo, studMat(avatarState.colors.leftArm));
        leftArm.position.y = -0.7;
        leftArm.castShadow = true;
        leftArmPivot.add(leftArm);
        torso.add(leftArmPivot);
        this.playerPivots.leftArm = leftArmPivot;

        // Right Arm Pivot
        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(-1.2, 0.6, 0);
        const rightArm = new THREE.Mesh(armGeo, studMat(avatarState.colors.rightArm));
        rightArm.position.y = -0.7;
        rightArm.castShadow = true;
        rightArmPivot.add(rightArm);
        torso.add(rightArmPivot);
        this.playerPivots.rightArm = rightArmPivot;

        // Left Leg Pivot
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(0.42, -0.9, 0);
        const legGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
        const leftLeg = new THREE.Mesh(legGeo, studMat(avatarState.colors.leftLeg));
        leftLeg.position.y = -0.8;
        leftLeg.castShadow = true;
        leftLegPivot.add(leftLeg);
        torso.add(leftLegPivot);
        this.playerPivots.leftLeg = leftLegPivot;

        // Right Leg Pivot
        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(-0.42, -0.9, 0);
        const rightLeg = new THREE.Mesh(legGeo, studMat(avatarState.colors.rightLeg));
        rightLeg.position.y = -0.8;
        rightLeg.castShadow = true;
        rightLegPivot.add(rightLeg);
        torso.add(rightLegPivot);
        this.playerPivots.rightLeg = rightLegPivot;

        this.scene.add(this.player);
    }

    buildLevel() {
        // Clear previous
        this.platforms = [];
        this.lavaBricks = [];
        this.coins = [];
        this.checkpoints = [];
        this.jumpPads = [];
        this.spinningObstacles = [];

        // Materials
        const createMat = (color, roughness = 0.5) => new THREE.MeshStandardMaterial({ color, roughness });
        const lavaMat = new THREE.MeshBasicMaterial({ color: 0xFF1744 }); // Neon Red Killbrick
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 });

        // Helper to add platform
        const addBlock = (x, y, z, w, h, d, color = 0x4CAF50, isLava = false) => {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mat = isLava ? lavaMat : createMat(color);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = {
                width: w, height: h, depth: d,
                isLava: isLava
            };
            this.scene.add(mesh);

            if (isLava) {
                this.lavaBricks.push(mesh);
            } else {
                this.platforms.push(mesh);
            }
            return mesh;
        };

        // Helper to add Coin
        const addCoin = (x, y, z) => {
            const coinGroup = new THREE.Group();
            coinGroup.position.set(x, y, z);

            const coinMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.7, 0.7, 0.15, 20),
                goldMat
            );
            coinMesh.rotation.x = Math.PI / 2;
            coinGroup.add(coinMesh);

            // "R$" text / diamond symbol
            const gem = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.3),
                new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
            );
            coinGroup.add(gem);

            this.scene.add(coinGroup);
            this.coins.push({
                group: coinGroup,
                baseY: y,
                collected: false
            });
            this.totalCoins++;
        };

        // Helper to add Checkpoint
        const addCheckpoint = (x, y, z, index) => {
            const pad = new THREE.Mesh(
                new THREE.BoxGeometry(6, 0.5, 6),
                createMat(0x00A2FF) // Blue checkpoint
            );
            pad.position.set(x, y, z);
            pad.receiveShadow = true;
            this.scene.add(pad);
            this.platforms.push(pad);

            // Glowing light beacon
            const beacon = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.2, 12, 16),
                new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.6 })
            );
            beacon.position.set(x, y + 6, z);
            this.scene.add(beacon);

            this.checkpoints.push({
                index: index,
                pos: new THREE.Vector3(x, y + 2, z),
                pad: pad,
                beacon: beacon,
                activated: index === 0
            });
        };

        // Helper to add Super Jump Pad / Trampoline
        const addJumpPad = (x, y, z, powerY = 32, powerZ = 0) => {
            const padGroup = new THREE.Group();
            padGroup.position.set(x, y, z);

            // Dark metallic base
            const baseGeo = new THREE.BoxGeometry(4.4, 0.4, 4.4);
            const baseMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.4 });
            const base = new THREE.Mesh(baseGeo, baseMat);
            base.receiveShadow = true;
            padGroup.add(base);

            // Neon Yellow Launch Plate
            const plateGeo = new THREE.BoxGeometry(3.6, 0.25, 3.6);
            const plateMat = new THREE.MeshStandardMaterial({
                color: 0xFFEA00,
                emissive: 0xFFB300,
                emissiveIntensity: 0.6,
                roughness: 0.2
            });
            const plate = new THREE.Mesh(plateGeo, plateMat);
            plate.position.y = 0.25;
            padGroup.add(plate);

            // Neon glowing ring
            const ringGeo = new THREE.TorusGeometry(1.6, 0.1, 12, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xFF1493 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 0.4;
            padGroup.add(ring);

            // 3D Arrow pointing up
            const arrowGeo = new THREE.ConeGeometry(0.5, 0.9, 4);
            const arrowMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const arrow = new THREE.Mesh(arrowGeo, arrowMat);
            arrow.position.set(0, 1.1, 0);
            padGroup.add(arrow);

            this.scene.add(padGroup);
            this.platforms.push(base);

            const padData = {
                group: padGroup,
                plate: plate,
                arrow: arrow,
                pos: new THREE.Vector3(x, y + 0.3, z),
                powerY: powerY,
                powerZ: powerZ,
                lastTrigger: 0
            };
            this.jumpPads.push(padData);
            return padData;
        };

        // ==========================================
        // STAGE 0: SPAWN AREA
        // ==========================================
        addCheckpoint(0, 0, 0, 0); // Checkpoint 0
        // Spawn Baseplate
        addBlock(0, -0.5, 0, 16, 1, 16, 0x37474F);
        addCoin(0, 2.2, -4);

        // Spawn Super Jump Pad (Test Trampoline right at spawn!)
        addJumpPad(4.8, 0, -3.5, 27, 0);
        // Secret high floating bonus platform above spawn jump pad
        addBlock(4.8, 8.5, -3.5, 4, 0.6, 4, 0x00E5FF);
        addCoin(4.8, 10.5, -3.5);

        // ==========================================
        // STAGE 1: COLOR STEPPING BLOCKS
        // ==========================================
        const stepColors = [0xE53935, 0xFB8C00, 0xFDD835, 0x43A047, 0x1E88E5, 0x8E24AA];
        for (let i = 0; i < 6; i++) {
            const z = -14 - (i * 9);
            const x = (i % 2 === 0 ? 3 : -3);
            addBlock(x, 1 + i * 0.8, z, 4.5, 0.8, 4.5, stepColors[i]);
            if (i % 2 === 1) addCoin(x, 3.5 + i * 0.8, z);
        }

        // Lava floor underneath
        addBlock(0, -5, -35, 30, 1, 60, 0xFF1744, true);

        // ==========================================
        // STAGE 2: FIRST CHECKPOINT & LAVA JUMP
        // ==========================================
        const s2Z = -68;
        addCheckpoint(0, 6, s2Z, 1);
        addCoin(0, 8.5, s2Z);

        // Narrow bridge with red lava gaps
        addBlock(0, 6, s2Z - 8, 3.5, 0.8, 6, 0x546E7A);
        addBlock(0, 6.2, s2Z - 13, 3.5, 0.4, 4, 0xFF1744, true); // Lava brick!
        addBlock(0, 6, s2Z - 18, 3.5, 0.8, 6, 0x546E7A);
        addBlock(0, 6.2, s2Z - 23, 3.5, 0.4, 4, 0xFF1744, true); // Lava brick!
        addBlock(0, 6, s2Z - 28, 3.5, 0.8, 6, 0x546E7A);

        // ==========================================
        // STAGE 3: ROTATING HURDLE & SECOND CHECKPOINT
        // ==========================================
        const s3Z = -105;
        addCheckpoint(0, 7, s3Z, 2);

        // Circular platform with spinning bar
        const spinBase = addBlock(0, 7, s3Z - 12, 10, 0.8, 10, 0x2E7D32);
        
        // Spinning bar
        const spinBarGeo = new THREE.BoxGeometry(9, 1.2, 0.8);
        const spinBarMat = lavaMat;
        const spinBar = new THREE.Mesh(spinBarGeo, spinBarMat);
        spinBar.position.set(0, 8.2, s3Z - 12);
        this.scene.add(spinBar);
        this.lavaBricks.push(spinBar);
        this.spinningObstacles.push({ mesh: spinBar, speed: 0.03 });

        addCoin(0, 10.5, s3Z - 12);

        // Jump pad to next stage (Stage 3 -> Stage 4 Tower)
        addJumpPad(0, 7.3, s3Z - 22, 34, -22);
        addBlock(0, 7, s3Z - 22, 5, 0.6, 5, 0x37474F);

        // ==========================================
        // STAGE 4: HIGH TOWER & SPIRAL (CHECKPOINT 3)
        // ==========================================
        const s4Z = -145;
        addCheckpoint(0, 20, s4Z, 3);
        addCoin(0, 22.5, s4Z);

        // Spiral floating blocks
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const r = 7;
            const px = Math.sin(angle) * r;
            const pz = s4Z - 15 + Math.cos(angle) * r;
            const py = 20 + i * 1.5;
            addBlock(px, py, pz, 3.2, 0.6, 3.2, 0x00E5FF);
            if (i % 2 === 0) addCoin(px, py + 2, pz);
        }

        // ==========================================
        // STAGE 5: FINAL VICTORY PODIUM!
        // ==========================================
        const winZ = s4Z - 36;
        addBlock(0, 31, winZ, 18, 1, 18, 0xFFD700);

        // Golden Trophy
        const trophyGroup = new THREE.Group();
        trophyGroup.position.set(0, 33, winZ);
        const cupMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 0.8, 3, 16),
            goldMat
        );
        trophyGroup.add(cupMesh);
        const baseTrophy = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 2, 0.8, 16),
            goldMat
        );
        baseTrophy.position.y = -1.8;
        trophyGroup.add(baseTrophy);
        this.scene.add(trophyGroup);
        this.trophy = trophyGroup;

        // Big Winner Robux Coins
        for (let a = 0; a < 6; a++) {
            const rad = 5;
            const angle = (a / 6) * Math.PI * 2;
            addCoin(Math.sin(angle) * rad, 33.5, winZ + Math.cos(angle) * rad);
        }

        this.winArea = {
            center: new THREE.Vector3(0, 31, winZ),
            radius: 8,
            triggered: false
        };
    }

    jump() {
        if (this.isDead) return;
        if (this.isGrounded) {
            this.velocity.y = this.jumpPower;
            this.isGrounded = false;
            if (window.robloxAudio) window.robloxAudio.playJump();
        }
    }

    setupControls() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (this.isDead) return;
            switch(e.code) {
                case 'KeyW': case 'ArrowUp':
                    this.keys.forward = true;
                    e.preventDefault();
                    break;
                case 'KeyS': case 'ArrowDown':
                    this.keys.backward = true;
                    e.preventDefault();
                    break;
                case 'KeyA': case 'ArrowLeft':
                    this.keys.left = true;
                    e.preventDefault();
                    break;
                case 'KeyD': case 'ArrowRight':
                    this.keys.right = true;
                    e.preventDefault();
                    break;
                case 'Space':
                    e.preventDefault();
                    if (!this.keys.jump) {
                        this.jump();
                    }
                    this.keys.jump = true;
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.respawn();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW': case 'ArrowUp':
                    this.keys.forward = false;
                    e.preventDefault();
                    break;
                case 'KeyS': case 'ArrowDown':
                    this.keys.backward = false;
                    e.preventDefault();
                    break;
                case 'KeyA': case 'ArrowLeft':
                    this.keys.left = false;
                    e.preventDefault();
                    break;
                case 'KeyD': case 'ArrowRight':
                    this.keys.right = false;
                    e.preventDefault();
                    break;
                case 'Space':
                    this.keys.jump = false;
                    e.preventDefault();
                    break;
            }
        });

        // Mouse Drag Orbit
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDragging = true;
            this.prevMousePos = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isMouseDragging) return;
            const dx = e.clientX - this.prevMousePos.x;
            const dy = e.clientY - this.prevMousePos.y;
            this.prevMousePos = { x: e.clientX, y: e.clientY };

            this.cameraYaw -= dx * 0.006;
            this.cameraPitch = Math.max(0.05, Math.min(Math.PI / 2.3, this.cameraPitch + dy * 0.006));
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDragging = false;
        });

        // Mouse Wheel Zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cameraDistance = Math.max(4, Math.min(22, this.cameraDistance + e.deltaY * 0.01));
        }, { passive: false });
    }

    respawn() {
        if (!this.player) return;
        this.isDead = false;
        this.health = 100;
        if (this.onHealthChange) this.onHealthChange(100);

        this.velocity.set(0, 0, 0);
        this.player.position.copy(this.spawnPos);

        // Reset visibility / orientation
        this.player.rotation.set(0, 0, 0);
        this.player.scale.set(1, 1, 1);
        if (this.playerTorso) this.playerTorso.visible = true;
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.health = 0;
        if (this.onHealthChange) this.onHealthChange(0);

        // Classic OOF sound!
        if (window.robloxAudio) window.robloxAudio.playOof();

        if (this.onDeath) this.onDeath();

        // Spawn death particles / blocks
        this.createDeathBlocks();

        // Hide player mesh briefly
        if (this.playerTorso) this.playerTorso.visible = false;

        // Auto respawn after 1.2 seconds
        setTimeout(() => {
            this.respawn();
        }, 1200);
    }

    createDeathBlocks() {
        const colors = [0xF5CD2F, 0x0D69AC, 0x4B974B];
        for (let i = 0; i < 8; i++) {
            const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const mat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length] });
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(this.player.position);
            p.position.y += 1.5;
            p.userData = {
                vel: new THREE.Vector3(
                    (Math.random() - 0.5) * 12,
                    Math.random() * 8 + 4,
                    (Math.random() - 0.5) * 12
                ),
                rot: new THREE.Vector3(Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2),
                life: 1.0
            };
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    updatePhysics(delta) {
        if (this.isDead || !this.player) return;

        // Movement Direction calculated from Camera Yaw
        const moveDir = new THREE.Vector3();
        if (this.keys.forward) moveDir.z -= 1;
        if (this.keys.backward) moveDir.z += 1;
        if (this.keys.left) moveDir.x -= 1;
        if (this.keys.right) moveDir.x += 1;

        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
            // Rotate move direction according to camera yaw
            moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

            this.velocity.x = moveDir.x * this.moveSpeed;
            this.velocity.z = moveDir.z * this.moveSpeed;

            // Rotate player body towards movement direction
            const targetRot = Math.atan2(moveDir.x, moveDir.z);
            this.player.rotation.y = targetRot;

            // Walking limb swinging animation
            this.animTime += delta * 12;
            const swing = Math.sin(this.animTime) * 0.7;
            if (this.playerPivots.leftArm) this.playerPivots.leftArm.rotation.x = -swing;
            if (this.playerPivots.rightArm) this.playerPivots.rightArm.rotation.x = swing;
            if (this.playerPivots.leftLeg) this.playerPivots.leftLeg.rotation.x = swing;
            if (this.playerPivots.rightLeg) this.playerPivots.rightLeg.rotation.x = -swing;
        } else {
            // Decelerate
            this.velocity.x *= 0.7;
            this.velocity.z *= 0.7;
            // Return limbs to idle
            if (this.playerPivots.leftArm) this.playerPivots.leftArm.rotation.x *= 0.8;
            if (this.playerPivots.rightArm) this.playerPivots.rightArm.rotation.x *= 0.8;
            if (this.playerPivots.leftLeg) this.playerPivots.leftLeg.rotation.x *= 0.8;
            if (this.playerPivots.rightLeg) this.playerPivots.rightLeg.rotation.x *= 0.8;
        }

        // Apply Gravity
        this.velocity.y += this.gravity * delta;

        // Proposed new position
        const nextX = this.player.position.x + this.velocity.x * delta;
        const nextY = this.player.position.y + this.velocity.y * delta;
        const nextZ = this.player.position.z + this.velocity.z * delta;

        // Player Bounding Box (AABB)
        const playerWidth = 1.4;
        const playerHeight = 3.6;
        const playerBox = new THREE.Box3(
            new THREE.Vector3(nextX - playerWidth/2, nextY, nextZ - playerWidth/2),
            new THREE.Vector3(nextX + playerWidth/2, nextY + playerHeight, nextZ + playerWidth/2)
        );

        // Platform Collisions (Grounded check)
        this.isGrounded = false;
        for (let plat of this.platforms) {
            const pBox = new THREE.Box3().setFromObject(plat);
            if (playerBox.intersectsBox(pBox)) {
                // If player was falling and landed on top of platform
                if (this.player.position.y >= pBox.max.y - 0.8 && this.velocity.y <= 0) {
                    this.player.position.y = pBox.max.y;
                    this.velocity.y = 0;
                    this.isGrounded = true;
                    break;
                }
            }
        }

        // If not grounded on top, apply vertical movement
        if (!this.isGrounded) {
            this.player.position.y = nextY;
        }

        // Apply horizontal movement
        this.player.position.x = nextX;
        this.player.position.z = nextZ;

        // Void Fall death check
        if (this.player.position.y < -15) {
            this.die();
            return;
        }

        // Lava / Kill-brick Collisions
        const currentBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(this.player.position.x, this.player.position.y + 1.8, this.player.position.z),
            new THREE.Vector3(1.2, 3.2, 1.2)
        );

        for (let lava of this.lavaBricks) {
            const lavaBox = new THREE.Box3().setFromObject(lava);
            if (currentBox.intersectsBox(lavaBox)) {
                this.die();
                return;
            }
        }

        // Jump pad / Trampoline Boost Collision Check
        for (let jp of this.jumpPads) {
            const dx = this.player.position.x - jp.pos.x;
            const dz = this.player.position.z - jp.pos.z;
            const distXZ = Math.hypot(dx, dz);
            const dy = this.player.position.y - jp.pos.y;

            // Trigger when player is within 2.3 units horizontally and near pad surface (-0.6 to +3.0)
            if (distXZ < 2.3 && dy >= -0.6 && dy <= 3.0) {
                const now = Date.now();
                if (!jp.lastTrigger || now - jp.lastTrigger > 350) {
                    jp.lastTrigger = now;
                    this.velocity.y = jp.powerY;
                    if (jp.powerZ !== 0) {
                        this.velocity.z = jp.powerZ;
                    }
                    this.isGrounded = false;

                    // Play spring launch sound
                    if (window.robloxAudio) {
                        if (typeof window.robloxAudio.playSpring === 'function') {
                            window.robloxAudio.playSpring();
                        } else {
                            window.robloxAudio.playJump();
                        }
                    }

                    // Visual bounce squash animation
                    if (jp.plate) {
                        jp.plate.scale.set(1.25, 0.3, 1.25);
                        setTimeout(() => {
                            if (jp.plate) jp.plate.scale.set(1, 1, 1);
                        }, 160);
                    }

                    if (typeof showToast === 'function') {
                        showToast("⚡ SUPER SAKRASH (TRAMPOLIN)!", "gold");
                    }
                    break;
                }
            }
        }

        // Checkpoints collision
        for (let cp of this.checkpoints) {
            if (this.player.position.distanceTo(cp.pos) < 3.8) {
                if (!cp.activated) {
                    cp.activated = true;
                    this.spawnPos.copy(cp.pos);
                    this.currentCheckpoint = cp.index;
                    // Change beacon color to bright green
                    cp.beacon.material.color.setHex(0x00FF7F);
                    if (window.robloxAudio) window.robloxAudio.playCheckpoint();
                    if (this.onCheckpoint) this.onCheckpoint(cp.index);
                }
            }
        }

        // Coins collection
        for (let c of this.coins) {
            if (!c.collected && this.player.position.distanceTo(c.group.position) < 2.2) {
                c.collected = true;
                this.scene.remove(c.group);
                this.coinsCollected++;
                if (window.robloxAudio) window.robloxAudio.playCoin();
                if (this.onCoinCollect) this.onCoinCollect(this.coinsCollected);
            }
        }

        // Victory Area check
        if (this.winArea && !this.winArea.triggered) {
            if (this.player.position.distanceTo(this.winArea.center) < this.winArea.radius) {
                this.winArea.triggered = true;
                if (window.robloxAudio) window.robloxAudio.playWin();
                if (this.onWin) this.onWin();
            }
        }
    }

    updateCamera() {
        if (!this.player || !this.camera) return;

        // Smooth follow target (Player chest)
        const targetPos = this.player.position.clone();
        targetPos.y += 2.2;

        // Calculate camera position in spherical coordinates relative to target
        const cx = targetPos.x + this.cameraDistance * Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
        const cy = targetPos.y + this.cameraDistance * Math.sin(this.cameraPitch);
        const cz = targetPos.z + this.cameraDistance * Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);

        this.camera.position.set(cx, cy, cz);
        this.camera.lookAt(targetPos);
    }

    animate() {
        if (!this.isRunning) return;
        requestAnimationFrame(this.animate);

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // Update Physics
        this.updatePhysics(delta);

        // Update Camera
        this.updateCamera();

        // Update Spinning obstacles
        for (let item of this.spinningObstacles) {
            item.mesh.rotation.y += item.speed;
        }

        // Rotate & Bob Coins
        const time = this.clock.getElapsedTime();
        for (let c of this.coins) {
            if (!c.collected) {
                c.group.rotation.y += 0.04;
                c.group.position.y = c.baseY + Math.sin(time * 3) * 0.25;
            }
        }

        // Bob Jump Pad Arrows
        for (let jp of this.jumpPads) {
            if (jp.arrow) {
                jp.arrow.position.y = 1.0 + Math.sin(time * 6) * 0.2;
            }
        }

        // Rotate Trophy
        if (this.trophy) {
            this.trophy.rotation.y += 0.02;
        }

        // Update Death Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.userData.life -= delta * 1.5;
            p.position.addScaledVector(p.userData.vel, delta);
            p.userData.vel.y -= 25 * delta;
            p.rotation.x += p.userData.rot.x;
            p.rotation.y += p.userData.rot.y;
            p.scale.multiplyScalar(0.96);

            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
            }
        }

        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    handleResize() {
        if (!this.canvas || !this.camera || !this.renderer) return;
        const w = this.canvas.clientWidth || window.innerWidth;
        const h = this.canvas.clientHeight || window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    stop() {
        this.isRunning = false;
    }
}
