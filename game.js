(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const center = { x: width / 2, y: height / 2 };
    const maxAngle = 2 * Math.PI;
    const initialSpeed = 0.01;
    const initialLength = maxAngle * 0.05;
    let pathRadius = Math.min(width, height) * 0.25;
    if (pathRadius > 120) { pathRadius = 120; }
    const growthRate = 0.2; // Fine-tuned for ~5 clicks/sec
    const decayRate = 0.9991; // Fine-tuned
    const difficultyFactorGrowth = 0.995;
    let minSpeedTime = null;

    let level = 0;
    let timeAtMinSpeed = 0;

    let timeBetweenTabs; // dynamically calculated

    let state = {
        level: 0,
        speed: initialSpeed,
        angle: 0,
        length: initialLength,
        currentColor: getRandomNeonColor(),
        difficultyFactor: 1.0,
    };
    


    function getRandomNeonColor() {
        // Neon colors are typically fully saturated and bright, so we set these values high
        const saturation = 100;
        const brightness = 100;

        // Hue is what we will randomize. There are 360 degrees of hue.
        const hue = Math.floor(Math.random() * 360);

        // Convert the HSV color to RGB using the formula
        const c = (brightness / 100) * (saturation / 100);
        const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
        const m = (brightness / 100) - c;

        let r, g, b;
        if (hue < 60) {
            [r, g, b] = [c, x, 0];
        } else if (hue < 120) {
            [r, g, b] = [x, c, 0];
        } else if (hue < 180) {
            [r, g, b] = [0, c, x];
        } else if (hue < 240) {
            [r, g, b] = [0, x, c];
        } else if (hue < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }

        // Convert RGB values from [0, 1] to [0, 255] and round them
        // Then convert to hexadecimal and pad with zeros if necessary
        r = Math.floor((r + m) * 255).toString(16).padStart(2, '0');
        g = Math.floor((g + m) * 255).toString(16).padStart(2, '0');
        b = Math.floor((b + m) * 255).toString(16).padStart(2, '0');

        // Return the RGB color as a hex string
        return `#${r}${g}${b}`;
    }

    function handleIncreaseSpeed(e) {
        state.speed += growthRate;
        state.length += maxAngle * growthRate;
        minSpeedTime = null; // Reset the minimum speed timer
        if (e && e.preventDefault) { e.preventDefault(); }
    }

    function resetGame(isWin) {
        console.log(isWin ? "won" : "lost");
        if (isWin) {
            state.level++;
            state.difficultyFactor *= difficultyFactorGrowth;
        } else if (state.level > 0) {
            state.level--;
            state.difficultyFactor /= difficultyFactorGrowth;  // Decrease difficulty
        }
        console.log(state.level);
        state.speed = initialSpeed;
        state.length = initialLength;
        state.currentColor = getRandomNeonColor();
        minSpeedTime = null; // Reset the minimum speed timer
    }
    
      

    function drawSpinner() {
    
        const gradientStartPoint = { x: center.x + pathRadius * Math.cos(state.angle), y: center.y + pathRadius * Math.sin(state.angle) };
        const gradientEndPoint = { x: center.x + pathRadius * Math.cos(state.angle + state.length), y: center.y + pathRadius * Math.sin(state.angle + state.length) };
    
        const gradient = ctx.createLinearGradient(gradientEndPoint.x, gradientEndPoint.y, gradientStartPoint.x, gradientStartPoint.y);        
        gradient.addColorStop(0, state.currentColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');  // Fade to transparent
    
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(center.x, center.y, pathRadius, state.angle, state.angle + state.length, false);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 25;
        ctx.stroke();
        ctx.closePath();
    }
    


    function update() {
        ctx.clearRect(0, 0, width, height);
        drawSpinner();
        state.angle += state.speed;

        

        // Apply decay
        state.speed *= (decayRate * state.difficultyFactor);
        state.length *= (decayRate * state.difficultyFactor);

        if (state.speed <= initialSpeed*1.5) {
            if (!minSpeedTime) {
                minSpeedTime = Date.now();
            } else if ((Date.now() - minSpeedTime >= 1000)&& (state.level > 0)) {
                resetGame(false); // Lost
            }
        } else {
            minSpeedTime = null;
        }

           // Check if speed has fallen below initial speed
    if (state.speed < initialSpeed) {
        state.speed = initialSpeed;
    }

        if (state.length < initialLength) state.length = initialLength;

        if (state.angle < 0) state.angle += maxAngle;

        if (state.length >= maxAngle) {
            resetGame(true); // Won
        }

        requestAnimationFrame(update);
    }

    

    document.addEventListener('keydown', handleIncreaseSpeed);
document.addEventListener('touchstart', handleIncreaseSpeed, { passive: false });
    document.addEventListener('mousedown', handleIncreaseSpeed);
    
    update();
})();
