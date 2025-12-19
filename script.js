document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the calculator page
    const calcBtn = document.getElementById('calculateBtn');
    if (calcBtn) {
        // Add Enter key support
        document.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') calculateSchedule();
        });
    }

    // Email Gate Listener
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('userEmail').value;
            if(email && email.includes('@')) {
                document.getElementById('gate-container').style.display = 'none';
                document.getElementById('downloadBtn').classList.remove('hidden');
            } else {
                alert("Please enter a valid email.");
            }
        });
    }

    // Download Listener
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', exportToCSV);
    }
});

let scheduleData = [];

function calculateSchedule() {
    const payment = parseFloat(document.getElementById('payment').value);
    const term = parseInt(document.getElementById('term').value);
    const rateAnnual = parseFloat(document.getElementById('rate').value);
    const timing = document.getElementById('timing').value;

    if (isNaN(payment) || isNaN(term) || isNaN(rateAnnual) || term <= 0) {
        alert("Please enter valid positive numbers.");
        return;
    }

    const rateMonthly = (rateAnnual / 100) / 12;
    let liability = 0;

    // PV Calculation
    if (rateMonthly === 0) {
        liability = payment * term;
    } else {
        liability = payment * ((1 - Math.pow(1 + rateMonthly, -term)) / rateMonthly);
        if (timing === 'start') liability *= (1 + rateMonthly);
    }

    // Update Summary
    document.getElementById('sum-liability').innerText = liability.toLocaleString('en-US', {style:'currency', currency:'USD'});
    document.getElementById('sum-asset').innerText = liability.toLocaleString('en-US', {style:'currency', currency:'USD'});
    document.getElementById('summary-panel').classList.remove('hidden');

    // Generate Table
    const tbody = document.querySelector('#schedule-table tbody');
    tbody.innerHTML = "";
    scheduleData = [["Period", "Opening", "Payment", "Interest", "Closing", "Depreciation"]];
    
    let balance = liability;
    const dep = liability / term;

    for (let i = 1; i <= term; i++) {
        let interest = 0;
        let closing = 0;
        
        if (timing === 'end') {
            interest = balance * rateMonthly;
            closing = balance + interest - payment;
        } else {
            interest = (balance - payment) * rateMonthly;
            closing = (balance - payment) + interest;
        }

        if (i === term && Math.abs(closing) < 1) closing = 0;

        const row = `<tr>
            <td>${i}</td>
            <td>${format(balance)}</td>
            <td>${format(payment)}</td>
            <td class="highlight-col">${format(interest)}</td>
            <td>${format(closing)}</td>
            <td>${format(dep)}</td>
        </tr>`;
        tbody.innerHTML += row;

        scheduleData.push([i, balance.toFixed(2), payment.toFixed(2), interest.toFixed(2), closing.toFixed(2), dep.toFixed(2)]);
        balance = closing;
    }

    document.getElementById('results-section').classList.remove('hidden');
}

function format(num) {
    return num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8," 
        + scheduleData.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "IFRS16_Schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
