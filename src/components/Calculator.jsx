import { useState, useCallback, useEffect } from "react";
export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  };

  // storing history
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("calcHistory");
    return savedHistory ? JSON.parse(savedHistory) : ["0"];
  });

  const [historyIndex, setHistoryIndex] = useState(history.length - 1);

  // Numbers and operators
  const [numberButtons, setNumberButtons] = useState(["7", "8", "9", "4", "5", "6", "1", "2", "3"]);
  const [operatorButtons, setOperatorButtons] = useState(["/", "*", "-", "+", "."]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("calcHistory", JSON.stringify(history));
  }, [history]);

  // Handle input for numbers and operators
  const handleInput = (value) => {
    setDisplay((prev) => (prev === "0" && !isNaN(value) ? value : prev + value));
  };

  // Perform calculation
  const calculateResult = useCallback(() => {
    try {
      if (!/^[0-9+\-*/.]+$/.test(display)) {
        throw new Error("Invalid expression");
      }
      const result = Function(`"use strict"; return (${display})`)();
      setDisplay(result.toString());
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, result.toString()]);
      setHistoryIndex(newHistory.length);
    } catch {
      setDisplay("Error");
    }
  }, [display, history, historyIndex]);

  // Undo and Redo functionality
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDisplay(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDisplay(history[historyIndex + 1]);
    }
  };

  // Clear display and history
  const clearDisplay = () => {
    setDisplay("0");
    setHistory(["0"]);
    setHistoryIndex(0);
  };

  // Remove last digit from display
  const deleteLastDigit = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  // Drag-and-drop functionality for buttons
  const moveButton = (fromIndex, toIndex, type) => {
    if (type === "number") {
      setNumberButtons((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    } else if (type === "operator") {
      setOperatorButtons((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    }
  };

  // Add a new number
  const addNewNumber = () => {
    const newNumber = prompt("Enter a new number:");
    if (newNumber && /^[0-9]$/.test(newNumber) && !numberButtons.includes(newNumber)) {
      setNumberButtons([...numberButtons, newNumber]);
    }
  };

  // Remove last number
  const removeLastNumber = () => {
    setNumberButtons(numberButtons.slice(0, -1));
  };

  // Add a new operator
  const addNewOperator = () => {
    const newOperator = prompt("Enter a new operator:");
    if (newOperator && /^[+\-*/.]$/.test(newOperator)) {
      setOperatorButtons([...operatorButtons, newOperator]);
    }
  };

  // Remove last operator
  const removeLastOperator = () => {
    setOperatorButtons(operatorButtons.slice(0, -1));
  };

  return (
    <div className="h-3/5 w-3/5 justify-items-center">
      <div className="page-section">
        <div className="header-section flex justify-center items-center mb-4">
          <h1 className="text-4xl text-white font-bold text-center">CALCULATOR</h1>
          <button onClick={toggleDarkMode} className="dark-mode-toggle">
            {isDarkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
          </button>
        </div>

        <div className="expression-area">{display}</div>

        <div className="calculator-grid">
          <div className="grid grid-rows-4 gap-2">
            {operatorButtons.map((op, index) => (
              <button
                key={index}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ index, type: "operator" }))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const { index: fromIndex, type } = JSON.parse(e.dataTransfer.getData("text/plain"));
                  moveButton(parseInt(fromIndex), index, type);
                }}
                onClick={() => handleInput(op)}
                className="common-btn operator-btn"
              >
                {op}
              </button>
            ))}
          </div>

          <div className="calculator-number-grid">
            {numberButtons.map((num, index) => (
              <button
                key={index}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ index, type: "number" }))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const { index: fromIndex, type } = JSON.parse(e.dataTransfer.getData("text/plain"));
                  moveButton(parseInt(fromIndex), index, type);
                }}
                onClick={() => handleInput(num)}
                className="common-btn number-btn"
              >
                {num}
              </button>
            ))}
            <button onClick={() => handleInput("0")} className="common-btn zero-btn">0</button>
            <button onClick={clearDisplay} className="common-btn clear-btn">Clear</button>
            <button onClick={deleteLastDigit} className="common-btn backspace-btn">⌫</button>
          </div>
        </div>

        <div className="calculator-grid mt-2">
          <button onClick={undo} className="common-btn undo-btn">Undo</button>
          <button onClick={redo} className="common-btn redo-btn">Redo</button>
          <button onClick={calculateResult} className="common-btn enter-btn">Enter</button>
        </div>

        <div className="calculator-grid mt-2">
          <button onClick={addNewNumber} className="common-btn add-num-op-btn">+Num</button>
          <button onClick={removeLastNumber} className="common-btn remove-num-op-btn">-Num</button>
          <button onClick={addNewOperator} className="common-btn add-num-op-btn">+Op</button>
          <button onClick={removeLastOperator} className="common-btn remove-num-op-btn">-Op</button>
        </div>
      </div>
    </div>
  );
}
