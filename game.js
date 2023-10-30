(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let width = document.documentElement.clientWidth || window.innerWidth;
    let height = document.documentElement.clientHeight || window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    

    const center = { x: width / 2, y: height / 2 };
    const maxAngle = 2 * Math.PI;
    const initialSpeed = 0.01;
    const initialLength = maxAngle * 0.05;
    let pathRadius = Math.min(width, height) * 0.25;
    if (pathRadius > 170) { pathRadius = 170; }
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
        currentColor: "white",
        difficultyFactor: 1.0,
        hue: 0
    };
    
    let levelDisplayTimeout = null;

    


    function removeLevelDisplayElements() {
        let elements = document.getElementsByClassName('level-display');
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

function displayLevel() {
    // Clear any existing timeout
    if (levelDisplayTimeout) {
        clearTimeout(levelDisplayTimeout);
    }

    // Create a div to display the level
    const levelDisplay = document.createElement('div');
    levelDisplay.className = 'level-display';
    levelDisplay.style.position = 'fixed';
    levelDisplay.style.top = '14%';
    levelDisplay.style.left = '50%';
    levelDisplay.style.transform = 'translate(-50%, -50%)';
    levelDisplay.style.fontSize = '3em';
    levelDisplay.style.color = state.currentColor;
    levelDisplay.style.fontFamily = "'Roboto', sans-serif"; // Use the 'Roboto' font
    levelDisplay.style.opacity = '0';
    levelDisplay.style.transition = 'opacity 0.5s'; // Add a transition for the opacity
    levelDisplay.textContent = `${state.level}`;

    // Add the div to the body
    removeLevelDisplayElements();
    document.body.appendChild(levelDisplay);

    // Fade in the div
    setTimeout(() => {
        levelDisplay.style.opacity = '1';
    }, 0);

    // Fade out and remove the div after a short period of time
    levelDisplayTimeout = setTimeout(() => {
        levelDisplay.style.opacity = '0';
        setTimeout(() => {
            removeLevelDisplayElements();
        }, 200); // Wait for the fade out transition to finish before removing the div
    }, 300); // Display for 1.5 seconds before starting the fade out
}


    function getRandomNeonColor() {
        let newColor;
        let newHue;
        do {
            // Neon colors are typically fully saturated and bright, so we set these values high
            const saturation = 100;
            const brightness = 100;

            // Hue is what we will randomize. There are 360 degrees of hue.
            newHue = Math.floor(Math.random() * 360);

            // Convert the HSV color to RGB using the formula
            const c = (brightness / 100) * (saturation / 100);
            const x = c * (1 - Math.abs(((newHue / 60) % 2) - 1));
            const m = (brightness / 100) - c;

            let r, g, b;
            if (newHue < 60) {
                [r, g, b] = [c, x, 0];
            } else if (newHue < 120) {
                [r, g, b] = [x, c, 0];
            } else if (newHue < 180) {
                [r, g, b] = [0, c, x];
            } else if (newHue < 240) {
                [r, g, b] = [0, x, c];
            } else if (newHue < 300) {
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
            newColor = `#${r}${g}${b}`;
        } while (Math.abs(newHue - state.hue) < 60); // Ensure the new hue is at least 60 degrees away from the current hue

        state.hue = newHue; // Update the current hue
        return newColor;
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
            state.speed = state.speed*0.75;
            state.length = state.length*0.75;
        } else if (state.level > 0) {
            state.level--;
            state.difficultyFactor /= difficultyFactorGrowth;  // Decrease difficulty
        }
        console.log(state.level);
       
        state.currentColor = getRandomNeonColor();
        minSpeedTime = null; // Reset the minimum speed timer
        displayLevel();
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

    

    document.addEventListener('keyup', handleIncreaseSpeed);
document.addEventListener('touchstart', handleIncreaseSpeed, { passive: false });
    document.addEventListener('mousedown', handleIncreaseSpeed);
    
    update();
})();
