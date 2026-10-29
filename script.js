
const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");

let expression = "";
let resultShown = false;

function updateDisplay() {
    display.value = expression;
}

function calculate() {
    if (!expression || !/[0-9]/.test(expression)) return;

    try {
        // Accept only calculator characters.
        if (!/^[0-9+\-*/.()\s]+$/.test(expression)) {
            throw new Error("Invalid input");
        }

        const result = Function(
            '"use strict"; return (' + expression + ')'
        )();

        if (!Number.isFinite(result)) {
            display.value = "Cannot divide by zero";
            expression = "";
            resultShown = true;
            return;
        }

        expression = String(
            Number(result.toPrecision(12))
        );
        updateDisplay();
        resultShown = true;
    } catch {
        display.value = "Invalid expression";
        expression = "";
        resultShown = true;
    }
}

function addValue(value) {
    if (resultShown) {
        if (/[0-9.]/.test(value)) {
            expression = "";
        }
        resultShown = false;
    }

    if (/[+\-*/]/.test(value)) {
        if (!expression && value !== "-") return;

        if (/[+\-*/]$/.test(expression)) {
            expression = expression.slice(0, -1);
        }
    }

    if (value === ".") {
        const currentNumber = expression.split(/[+\-*/]/).pop();
        if (currentNumber.includes(".")) return;
        if (!currentNumber) expression += "0";
    }

    expression += value;
    updateDisplay();

    // Show a live preview when the expression is complete.
    if (/[0-9]$/.test(expression)) {
        try {
            if (/^[0-9+\-*/.()\s]+$/.test(expression)) {
                const preview = Function(
                    '"use strict"; return (' + expression + ')'
                )();

                if (Number.isFinite(preview)) {
                    display.value =
                        expression + " = " +
                        Number(preview.toPrecision(12));
                }
            }
        } catch {
            // Incomplete expressions are allowed.
        }
    }
}

buttons.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === "clear") {
        expression = "";
        display.value = "";
        resultShown = false;
    } else if (action === "delete") {
        if (resultShown) {
            expression = "";
            resultShown = false;
        } else {
            expression = expression.slice(0, -1);
        }
        updateDisplay();
    } else if (action === "calculate") {
        calculate();
    } else if (value !== undefined) {
        addValue(value);
    }
});

// Keyboard support: numbers, operators, Enter, Backspace and Escape.
document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);
    } else if (["+", "-", "*", "/"].includes(key)) {
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        expression = expression.slice(0, -1);
        resultShown = false;
        updateDisplay();
    } else if (key === "Escape" || key === "Delete") {
        expression = "";
        display.value = "";
        resultShown = false;
    }
});