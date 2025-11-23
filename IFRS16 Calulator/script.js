// Enforce strict code quality
"use strict";

// Global variable to hold table data for export
let scheduleData = []; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Assign Event Listeners
    document.getElementById('calculateBtn').addEventListener('click', calculateSchedule);
    
    // Use the event listener for the form submission
    document.getElementById('emailForm').addEventListener('submit', unlockDownload); 
    
    document.getElementById('downloadBtn').addEventListener('click', exportToCSV);
});

function calculateSchedule() {
    // [CODE REMAINS IDENTICAL TO THE PREVIOUS REFINED VERSION]
    // ... (All calculation and rendering logic) ...

    const payment = parseFloat(document.getElementById('payment').value);
    const termMonths = parseInt(document.getElementById('term').value);
    const rateAnnual = parseFloat(document.getElementById('rate').value);
    const timing = document.getElementById('timing').value;

    if (isNaN(payment) || isNaN(termMonths) || isNaN(rateAnnual)) {
        alert("Please enter valid numbers for all parameters.");
        return;
    }

    const rateMonthly = (rateAnnual / 100) / 12;
    let liability = 0;

    if (rateMonthly === 0) {
        liability = payment * termMonths;
    } else {
        liability = payment * ( (1 - Math.pow(1 + rateMonthly, -termMonths)) / rateMonthly );
        if (timing === 'start') {
            liability = liability * (1 + rateMonthly);
        }
    }

    const rouAsset = liability;
    const monthlyDepreciation = rouAsset / termMonths;

    document.getElementById('sum-liability').innerText = formatMoney(liability);
    document.getElementById('sum-asset').innerText = formatMoney(rouAsset);
    document.getElementById('sum-dep').innerText = formatMoney(monthlyDepreciation);
    document.getElementById('summary-panel').classList.remove('hidden');

    const tbody = document.querySelector('#schedule-table tbody');
    tbody.innerHTML = "";
    scheduleData = [];
    
    scheduleData.push(["Period", "Opening Balance", "Payment", "Interest Expense", "Closing Balance", "Depreciation"]);

    let openingBalance = liability;

    for (let i = 1; i <= termMonths; i++) {
        let interestExpense = 0;
        let closingBalance = 0;

        if (timing === 'end') {
            interestExpense = openingBalance * rateMonthly;
            closingBalance = openingBalance + interestExpense - payment;
        } else {
            interestExpense = (openingBalance - payment) * rateMonthly;
            closingBalance = (openingBalance - payment) + interestExpense;
        }

        if (i === termMonths && Math.abs(closingBalance) < 0.01) {
            closingBalance = 0;
        }

        const row = `
            <tr>
                <td>${i}</td>
                <td>${formatMoney(openingBalance)}</td>
                <td>${formatMoney(payment)}</td>
                <td class="highlight-col">${formatMoney(interestExpense)}</td>
                <td>${formatMoney(closingBalance)}</td>
                <td>${formatMoney(monthlyDepreciation)}</td>
            </tr>
        `;
        tbody.innerHTML += row;

        scheduleData.push([
            i,
            openingBalance.toFixed(2),
            payment.toFixed(2),
            interestExpense.toFixed(2),
            closingBalance.toFixed(2),
            monthlyDepreciation.toFixed(2)
        ]);

        openingBalance = closingBalance;
    }

    document.getElementById('results-section').classList.remove('hidden');
    document.getElementById('gate-container').classList.remove('hidden');
    document.getElementById('downloadBtn').classList.add('hidden');
    
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

// --- NEW BACKEND/SUBMISSION LOGIC ---

function unlockDownload(e) {
    e.preventDefault(); // crucial: Stops the page from refreshing on form submission

    const form = e.target;
    const submitButton = form.querySelector('button');
    const formData = new FormData(form);

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> Sending...';

    // Use the native fetch API to send data to the Formspree endpoint
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // SUCCESS: Formspree accepted the email
            
            // 1. Hide the form
            form.classList.add('hidden');
            
            // 2. Show the download button
            document.getElementById('downloadBtn').classList.remove('hidden');
            
            console.log("Email successfully captured by Formspree!");
        } else {
            // FAILURE
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fa-solid fa-lock-open"></i> Unlock';
            alert("Submission failed. Check your Formspree endpoint or network.");
        }
    })
    .catch(error => {
        // Network or fetch error
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-solid fa-lock-open"></i> Unlock';
        alert("Network error: Could not connect to the submission service.");
    });
}

// --- Export Function (remains the same) ---

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    scheduleData.forEach(row => {
        csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "IFRS16_Amortization_Schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper Function: Format Number to Currency ($)
function formatMoney(num) {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}