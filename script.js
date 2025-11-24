"use strict";

// Global variable to hold table data for export
let scheduleData = []; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Assign Event Listeners
    const calcBtn = document.getElementById('calculateBtn');
    if(calcBtn) calcBtn.addEventListener('click', calculateSchedule);
    
    const emailForm = document.getElementById('emailForm');
    if(emailForm) emailForm.addEventListener('submit', unlockDownload); 
    
    const downloadBtn = document.getElementById('downloadBtn');
    if(downloadBtn) downloadBtn.addEventListener('click', exportToCSV);
});

function calculateSchedule() {
    // 1. Get Input Values
    const paymentInput = document.getElementById('payment');
    const termInput = document.getElementById('term');
    const rateInput = document.getElementById('rate');
    const timingInput = document.getElementById('timing');

    const payment = parseFloat(paymentInput.value);
    const termPeriods = parseInt(termInput.value); // Renamed from termMonths
    const rateAnnual = parseFloat(rateInput.value);
    const timing = timingInput.value;

    // 2. Validation with visual feedback
    if (isNaN(payment) || payment <= 0) {
        alert("Please enter a valid periodic payment amount."); // Alert text updated
        paymentInput.focus();
        return;
    }
    if (isNaN(termPeriods) || termPeriods <= 0) {
        alert("Please enter a valid lease/loan term in periods."); // Alert text updated
        termInput.focus();
        return;
    }
    if (isNaN(rateAnnual) || rateAnnual < 0) {
        alert("Please enter a valid annual interest rate."); // Alert text updated
        rateInput.focus();
        return;
    }

    // 3. Core Calculation Logic
    const ratePeriodic = (rateAnnual / 100) / 12; // Renamed from rateMonthly
    let presentValue = 0; // Renamed from liability

    // Present Value Calculation (Standard Annuity Formula)
    if (ratePeriodic === 0) {
        presentValue = payment * termPeriods;
    } else {
        // PV of Annuity formula
        presentValue = payment * ( (1 - Math.pow(1 + ratePeriodic, -termPeriods)) / ratePeriodic );
        
        // Adjustment for Annuity Due (Payment at start)
        if (timing === 'start') {
            presentValue = presentValue * (1 + ratePeriodic);
        }
    }

    const initialAssetValue = presentValue; // Renamed from rouAsset
    // Straight-line Amortization/Depreciation
    const periodicAmortization = initialAssetValue / termPeriods; // Renamed from monthlyDepreciation

    // 4. Render Summary Metrics
    animateValue(document.getElementById('sum-liability'), presentValue);
    animateValue(document.getElementById('sum-asset'), initialAssetValue);
    animateValue(document.getElementById('sum-dep'), periodicAmortization);
    
    document.getElementById('summary-panel').classList.remove('hidden');

    // 5. Generate Schedule Table
    const tbody = document.querySelector('#schedule-table tbody');
    tbody.innerHTML = "";
    scheduleData = []; // Reset global data
    
    // Add Header row to CSV data - Updated column name
    scheduleData.push(["Period", "Opening Balance", "Payment", "Interest Expense", "Closing Balance", "Amortization/Depreciation"]);

    let openingBalance = presentValue;

    for (let i = 1; i <= termPeriods; i++) {
        let interestExpense = 0;
        let closingBalance = 0;
        let currentPayment = payment;

        if (timing === 'end') {
            // Ordinary Annuity (Arrears): Interest on opening balance, then deduct payment
            interestExpense = openingBalance * ratePeriodic;
            closingBalance = openingBalance + interestExpense - currentPayment;
        } else {
            // Annuity Due (Advance): Deduct payment first, then interest on remainder
            interestExpense = (openingBalance - currentPayment) * ratePeriodic;
            closingBalance = (openingBalance - currentPayment) + interestExpense;
        }

        // Clean up tiny floating point errors at end of lease/loan
        if (i === termPeriods && Math.abs(closingBalance) < 1.0) {
            closingBalance = 0;
        }

        const row = `
            <tr>
                <td>${i}</td>
                <td>${formatMoney(openingBalance)}</td>
                <td>${formatMoney(currentPayment)}</td>
                <td class="highlight-col">${formatMoney(interestExpense)}</td>
                <td>${formatMoney(closingBalance)}</td>
                <td>${formatMoney(periodicAmortization)}</td>
            </tr>
        `;
        tbody.innerHTML += row;

        // Add to Export Array (Clean numbers for Excel)
        scheduleData.push([
            i,
            openingBalance.toFixed(2),
            currentPayment.toFixed(2),
            interestExpense.toFixed(2),
            closingBalance.toFixed(2),
            periodicAmortization.toFixed(2)
        ]);

        openingBalance = closingBalance;
    }

    // 6. UI Transitions
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');
    
    // Reset the download gate if it was previously unlocked, or keep unlocked?
    if(document.getElementById('downloadBtn').classList.contains('hidden')) {
        document.getElementById('gate-container').classList.remove('hidden');
    }
    
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- MARKETING / SUBMISSION LOGIC ---

function unlockDownload(e) {
    e.preventDefault(); 

    const form = e.target;
    const submitButton = form.querySelector('button');
    const formData = new FormData(form);
    const originalBtnText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    })
    .then(response => {
        if (response.ok) {
            // SUCCESS
            document.getElementById('gate-container').classList.add('hidden');
            document.getElementById('downloadBtn').classList.remove('hidden');
            // Trigger confettis or small delight here if possible
        } else {
            throw new Error('Submission failed');
        }
    })
    .catch(error => {
        submitButton.disabled = false;
        submitButton.innerHTML = originalBtnText;
        alert("Please check your connection or try again later.");
    });
}

// --- Export Function ---

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    scheduleData.forEach(row => {
        csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Lease_Amortization_Schedule.csv"); // Filename updated
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper: Format Number to Currency ($)
function formatMoney(num) {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper: Simple number animation
function animateValue(obj, end) {
    let startTimestamp = null;
    const duration = 1000;
    const start = 0;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = progress * (end - start) + start;
        obj.innerHTML = formatMoney(value);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
