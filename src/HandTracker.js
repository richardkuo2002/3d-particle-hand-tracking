import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export class HandTracker {
    constructor(videoElement, onResults) {
        this.videoElement = videoElement;
        this.onResultsCallback = onResults;
        this.hands = null;
        this.camera = null;
        this.interactionValue = 0; // 0 to 1

        this.init();
    }

    init() {
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.onResults.bind(this));

        this.camera = new Camera(this.videoElement, {
            onFrame: async () => {
                if (this.hands) {
                    await this.hands.send({ image: this.videoElement });
                }
            },
            width: 1280,
            height: 720
        });

        this.camera.start()
            .then(() => {
                console.log("Camera started successfully");
            })
            .catch(err => {
                console.error("Camera failed to start:", err);
                if (this.onResultsCallback) {
                    // Signal error via callback or UI
                    // We'll handle this by updating the status in UI if possible, 
                    // but here we just log. The UI class handles the text.
                    const statusParams = { error: "Camera Error: " + err.message };
                    // We can't pass object to the simple callback expecting float.
                    // Let's rely on the UI checking for updates or main.js handling it.
                    // Better: dispatch a custom event or just alert for now as a fallback.
                    alert("Camera access failed. Please allow camera access and reload.");
                }
            });
    }

    onResults(results) {
        let totalTension = 0;
        let handCount = 0;

        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                handCount++;
                totalTension += this.calculateHandTension(landmarks);
            }
        }

        // Average tension if multiple hands
        this.interactionValue = handCount > 0 ? totalTension / handCount : 0;

        // Smooth the value? Maybe later. For now raw is fine or simple lerp in main loop.

        if (this.onResultsCallback) {
            this.onResultsCallback(this.interactionValue);
        }
    }

    calculateHandTension(landmarks) {
        // Calculate "closed-ness" of hand
        // Measure distance from finger tips to wrist (landmark 0)
        // Normalized by hand size (distance from wrist to middle finger mcp (landmark 9))

        const wrist = landmarks[0];
        const middleMcp = landmarks[9];

        // Hand scale reference
        const handSize = this.distance(wrist, middleMcp);

        // Finger tips: 4 (Thumb), 8 (Index), 12 (Middle), 16 (Ring), 20 (Pinky)
        const tips = [4, 8, 12, 16, 20];
        let totalTipDist = 0;

        for (const tipIdx of tips) {
            totalTipDist += this.distance(landmarks[tipIdx], wrist);
        }

        const avgTipDist = totalTipDist / 5;

        // Heuristic: 
        // Open hand: avgTipDist is large (approx > 2 * handSize)
        // Closed fist: avgTipDist is small (approx < 1.0 * handSize)

        // Normalize
        // These ratios are approximate and need tuning
        const openRatio = 2.2;
        const closedRatio = 0.9;

        const currentRatio = avgTipDist / handSize;

        // Map to 0..1 (0 = open, 1 = closed)
        // Note: The prompt asks for "tension and closing" to control scaling/expansion.
        // Usually closing a fist -> tension -> expansion? Or closing -> contraction?
        // Let's assume: Closing (High Tension) -> Expansion/Explosion effect.

        let tension = (openRatio - currentRatio) / (openRatio - closedRatio);
        tension = Math.max(0, Math.min(1, tension));

        return tension;
    }

    distance(p1, p2) {
        return Math.sqrt(
            Math.pow(p1.x - p2.x, 2) +
            Math.pow(p1.y - p2.y, 2) +
            Math.pow(p1.z - p2.z, 2)
        );
    }
}
