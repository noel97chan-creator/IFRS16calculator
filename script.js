"use strict";

// ============================================
// IFRS16 Calculator - Enhanced JavaScript
// ============================================

// Global variable to hold table data for export
let scheduleData = []; 

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Calculate Button
    const calcBtn = document.getElementById('calculateBtn');
    if (calcBtn) calcBtn.addEventListener('click', calculateSchedule);
    
    // Load Example Button
    const exampleBtn = document.getElementById('loadExampleBtn');
    if (exampleBtn) exampleBtn.addEventListener('click', loadExampleValues);
    
    // Email Gate Form
    const emailForm = document.getElementById('emailForm');
    if (emailForm) emailForm.addEventListener('submit', unlockDownload);
    
    // Download CSV Button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', exportToCSV);
    
    // Print Button
    const printBtn = document.getElementById('printBtn');
    if (printBtn) printBtn.addEventListener('click', () => window.print());
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
        });
    }
    
    // Real-time input validation
    const inputs = ['payment', 'term', 'rate'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => clearError(id));
            input.addEventListener('blur', () => validateField(id));
        }
    });
    
    // Enter key support
    document.querySelectorAll('.input-card input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateSchedule();
            }
        });
    });
}

// ============================================
// Example Values Loader
// ============================================

function loadExampleValues() {
    document.getElementById('payment').value = '5000';
    document.getElementById('term').value = '36';
    document.getElementById('rate').value = '4.5';
    document.getElementById('timing').value = 'end';
    
    clearAllErrors();
    
    // Visual feedback
    const btn = document.getElementById('loadExampleBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Loaded!';
    btn.style.color = 'var(--success)';
    btn.style.borderColor = 'var(--success)';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.color = '';
        btn.style.borderColor = '';
    }, 1500);
}

// ============================================
// Validation Functions
// ============================================

function validateField(fieldId) {
    const input = document.getElementById(fieldId);
    const value = parseFloat(input.value);
    const errorEl = document.getElementById(`${fieldId}-error`);
    const group = input.closest('.input-group');
    
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldId) {
        case 'payment':
            if (isNaN(value) || value <= 0) {
                isValid = false;
                errorMessage = 'Please enter a positive payment amount';
            }
            break;
        case 'term':
            if (isNaN(value) || value <= 0 || !Number.isInteger(value)) {
                isValid = false;
                errorMessage = 'Please enter a positive whole number';
            } else if (value > 600) {
                isValid = false;
                errorMessage = 'Maximum 600 periods allowed';
            }
            break;
        case 'rate':
            if (isNaN(value) || value < 0) {
                isValid = false;
                errorMessage = 'Please enter a valid rate (0 or higher)';
            } else if (value > 100) {
                isValid = false;
                errorMessage = 'Rate cannot exceed 100%';
            }
            break;
    }
    
    if (!isValid) {
        group.classList.add('error');
        if (errorEl) errorEl.textContent = errorMessage;
    } else {
        group.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
    }
    
    return isValid;
}

function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    const group = input.closest('.input-group');
    
    group.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
}

function clearAllErrors() {
    ['payment', 'term', 'rate'].forEach(id => clearError(id));
}

function validateAllFields() {
    const fields = ['payment', 'term', 'rate'];
    let allValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            allValid = false;
        }
    });
    
    return allValid;
}

// ============================================
// Main Calculation Logic
// ============================================

function calculateSchedule() {
    if (!validateAllFields()) {
        const firstError = document.querySelector('.input-group.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    const payment = parseFloat(document.getElementById('payment').value);
    const termPeriods = parseInt(document.getElementById('term').value);
    const rateAnnual = parseFloat(document.getElementById('rate').value);
    const timing = document.getElementById('timing').value;

    // Core Calculation Logic
    const ratePeriodic = (rateAnnual / 100) / 12;
    let presentValue = 0;

    // Present Value Calculation
    if (ratePeriodic === 0) {
        presentValue = payment * termPeriods;
    } else {
        presentValue = payment * ((1 - Math.pow(1 + ratePeriodic, -termPeriods)) / ratePeriodic);
        if (timing === 'start') {
            presentValue = presentValue * (1 + ratePeriodic);
        }
    }

    const initialAssetValue = presentValue;
    const periodicAmortization = initialAssetValue / termPeriods;

    // Generate Schedule
    const tbody = document.querySelector('#schedule-table tbody');
    tbody.innerHTML = "";
    scheduleData = [];
    
    scheduleData.push([
        "Period", "Opening Balance", "Payment", "Interest Expense", 
        "Principal Reduction", "Closing Balance", "ROU Depreciation"
    ]);

    let openingBalance = presentValue;
    let totalInterest = 0;
    let totalPayment = 0;
    let totalPrincipal = 0;
    let totalDepreciation = 0;

    for (let i = 1; i <= termPeriods; i++) {
        let interestExpense = 0;
        let principalReduction = 0;
        let closingBalance = 0;
        let currentPayment = payment;

        if (timing === 'end') {
            interestExpense = openingBalance * ratePeriodic;
            principalReduction = currentPayment - interestExpense;
            closingBalance = openingBalance - principalReduction;
        } else {
            // Annuity Due
            interestExpense = (openingBalance - currentPayment) * ratePeriodic;
            if (interestExpense < 0) interestExpense = 0;
            principalReduction = currentPayment - interestExpense;
            closingBalance = openingBalance - principalReduction;
        }

        if (i === termPeriods && Math.abs(closingBalance) < 1.0) {
            closingBalance = 0;
        }

        totalInterest += interestExpense;
        totalPayment += currentPayment;
        totalPrincipal += principalReduction;
        totalDepreciation += periodicAmortization;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td>${formatMoney(openingBalance)}</td>
            <td>${formatMoney(currentPayment)}</td>
            <td class="highlight-col">${formatMoney(interestExpense)}</td>
            <td>${formatMoney(principalReduction)}</td>
            <td>${formatMoney(closingBalance)}</td>
            <td>${formatMoney(periodicAmortization)}</td>
        `;
        tbody.appendChild(row);

        scheduleData.push([
            i, openingBalance.toFixed(2), currentPayment.toFixed(2),
            interestExpense.toFixed(2), principalReduction.toFixed(2),
            closingBalance.toFixed(2), periodicAmortization.toFixed(2)
        ]);

        openingBalance = closingBalance;
    }

    scheduleData.push([
        "TOTAL", "", totalPayment.toFixed(2), totalInterest.toFixed(2),
        totalPrincipal.toFixed(2), "", totalDepreciation.toFixed(2)
    ]);

    // Update Summary
    const summaryPanel = document.getElementById('summary-panel');
    const placeholder = document.getElementById('summary-placeholder');
    
    if (placeholder) placeholder.classList.add('hidden');
    summaryPanel.classList.remove('hidden');
    
    animateValue(document.getElementById('sum-liability'), presentValue);
    animateValue(document.getElementById('sum-asset'), initialAssetValue);
    animateValue(document.getElementById('sum-dep'), periodicAmortization);
    animateValue(document.getElementById('sum-interest'), totalInterest);

    // Update totals
    document.getElementById('total-payment').innerHTML = `<strong>${formatMoney(totalPayment)}</strong>`;
    document.getElementById('total-interest').innerHTML = `<strong>${formatMoney(totalInterest)}</strong>`;
    document.getElementById('total-principal').innerHTML = `<strong>${formatMoney(totalPrincipal)}</strong>`;
    document.getElementById('total-depreciation').innerHTML = `<strong>${formatMoney(totalDepreciation)}</strong>`;
    document.getElementById('schedule-totals').classList.remove('hidden');

    // Show Results
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');
    
    const downloadBtn = document.getElementById('downloadBtn');
    const printBtn = document.getElementById('printBtn');
    
    if (downloadBtn.classList.contains('hidden')) {
        document.getElementById('gate-container').classList.remove('hidden');
    }
    if (printBtn) printBtn.classList.remove('hidden');
    
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ============================================
// Email Gate / Download Unlock
// ============================================

function unlockDownload(e) {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector('button');
    const formData = new FormData(form);
    const originalBtnText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    })
    .then(response => {
        if (response.ok) {
            document.getElementById('gate-container').classList.add('hidden');
            document.getElementById('downloadBtn').classList.remove('hidden');
            setTimeout(exportToCSV, 500);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'generate_lead', {
                    'event_category': 'engagement',
                    'event_label': 'csv_unlock'
                });
            }
        } else {
            throw new Error('Submission failed');
        }
    })
    .catch(error => {
        console.error('Form submission error:', error);
        submitButton.disabled = false;
        submitButton.innerHTML = originalBtnText;
        showToast('Something went wrong. Please try again.', 'error');
    });
}

// ============================================
// CSV Export
// ============================================

function exportToCSV() {
    if (scheduleData.length === 0) {
        showToast('Please generate a schedule first.', 'warning');
        return;
    }
    
    let csvContent = "";
    
    scheduleData.forEach(row => {
        const escapedRow = row.map(cell => {
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return '"' + cellStr.replace(/"/g, '""') + '"';
            }
            return cellStr;
        });
        csvContent += escapedRow.join(",") + "\r\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `IFRS16_Amortization_Schedule_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'file_download', {
            'event_category': 'engagement',
            'event_label': 'csv_download'
        });
    }
    
    showToast('Schedule downloaded successfully!', 'success');
}

// ============================================
// Helper Functions
// ============================================

function formatMoney(num) {
    return num.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

function animateValue(element, endValue, duration = 800) {
    if (!element) return;
    
    const startTime = performance.now();
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = endValue * easeProgress;
        
        element.textContent = formatMoney(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = formatMoney(endValue);
        }
    };
    
    requestAnimationFrame(animate);
}

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `<i class="fa-solid ${iconMap[type]}"></i><span>${message}</span>`;
    
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                font-size: 0.9rem;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: toastSlideIn 0.3s ease, toastSlideOut 0.3s ease 2.7s forwards;
            }
            .toast-success { background: #059669; }
            .toast-error { background: #dc2626; }
            .toast-warning { background: #d97706; }
            .toast-info { background: #0891b2; }
            @keyframes toastSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes toastSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Mobile menu styles
const mobileMenuStyles = document.createElement('style');
mobileMenuStyles.textContent = `
    @media (max-width: 768px) {
        .nav-links.mobile-open {
            display: flex !important;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            background: var(--primary);
            padding: 1rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .nav-links.mobile-open a {
            padding: 0.75rem 1rem;
            margin-left: 0;
        }
    }
`;
document.head.appendChild(mobileMenuStyles);
