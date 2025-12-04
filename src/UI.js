export class UI {
    constructor(particleSystem) {
        this.particleSystem = particleSystem;
        this.tensionBar = document.getElementById('tension-bar');
        this.trackingStatus = document.getElementById('tracking-status');

        this.initListeners();
    }

    initListeners() {
        // Template Buttons
        const buttons = document.querySelectorAll('.button-group button');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shape = e.target.dataset.shape;
                this.particleSystem.setShape(shape);

                // Active state styling
                buttons.forEach(b => b.style.background = 'rgba(255, 255, 255, 0.1)');
                e.target.style.background = 'rgba(255, 255, 255, 0.4)';
            });
        });

        // Color Picker
        const colorPicker = document.getElementById('color-picker');
        colorPicker.addEventListener('input', (e) => {
            this.particleSystem.setColor(e.target.value);
        });
    }

    updateTension(value) {
        // value is 0 to 1
        const percent = Math.min(100, Math.max(0, value * 100));
        this.tensionBar.style.width = `${percent}%`;

        // Update color of bar based on tension
        if (value < 0.3) {
            this.tensionBar.style.background = '#00ff88'; // Green
        } else if (value < 0.7) {
            this.tensionBar.style.background = '#ffaa00'; // Orange
        } else {
            this.tensionBar.style.background = '#ff0055'; // Red
        }
    }

    setTrackingStatus(status) {
        this.trackingStatus.textContent = status;
    }
}
