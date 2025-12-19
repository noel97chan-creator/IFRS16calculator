// Add this helper to animate the summary numbers
function animateCounter(id, endValue) {
    const obj = document.getElementById(id);
    let startValue = 0;
    let duration = 800;
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = progress * endValue;
        obj.innerHTML = formatMoney(current);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Inside your calculateSchedule() function, call these:
animateCounter('summary-liability', liability);
animateCounter('summary-rou', liability); // Assuming ROU = Liability initially
animateCounter('summary-interest', totalInterest);
