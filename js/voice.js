class VoiceControl {
    constructor() {
        this.recognition = null;
        this.isSupported = false;

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.isSupported = true;
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;
        } else {
            console.warn("Web Speech API not supported in this browser.");
        }
    }

    startListening(onResult, onError) {
        if (!navigator.onLine) {
            if (onError) onError("offline");
            return;
        }

        if (!this.isSupported) {
            alert("Voice control is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        // Stop any previous instance to prevent conflicts
        this.stop();

        this.recognition.onstart = () => {
            console.log("Voice listening started...");
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Voice Result:", transcript);
            if (onResult) onResult(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error("Voice Error:", event.error);
            let msg = "Unknown voice error";

            if (event.error === 'not-allowed') {
                msg = "Microphone blocked. Click 'Allow' in URL bar permission settings.";
            } else if (event.error === 'network') {
                msg = "No Internet. Voice needs online access.";
            } else if (event.error === 'no-speech') {
                msg = "Didn't hear anything. Try closer to mic.";
            } else if (event.error === 'aborted') {
                return; // Ignore aborted
            }

            if (onError) onError(msg);
        };

        this.recognition.onend = () => {
            console.log("Voice listening ended.");
        };

        // Small delay to ensure stop completes
        setTimeout(() => {
            try {
                this.recognition.start();
            } catch (e) {
                console.error("Start error:", e);
                if (onError) onError("Could not start microphone.");
            }
        }, 100);
    }

    stop() {
        if (this.recognition) this.recognition.stop();
    }
}

const voice = new VoiceControl();
