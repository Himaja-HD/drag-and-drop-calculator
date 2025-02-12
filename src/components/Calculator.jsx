import { useState, useCallback, useEffect } from "react";

export default function Calculator() {

  const [expression, setExpression] = useState("0");

  // State localStorage
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("calcHistory");
    return savedHistory ? JSON.parse(savedHistory) : ["0"];
  });

  // Index for undo/redo
  const [index, setIndex] = useState(history.length - 1);

  // Numbers and operators for the calculator
  const [numbers, setNumbers] = useState(["7", "8", "9", "4", "5", "6", "1", "2", "3"]);
  const [operators, setOperators] = useState(["/", "*", "-", "+", "."]);

  // Save history to localStorage on change
  useEffect(() => {
    localStorage.setItem("calcHistory", JSON.stringify(history));
  }, [history]);

  // Handle number and operator input
  const handleInput = (value) => {
    setExpression((prev) => (prev === "0" && !isNaN(value) ? value : prev + value));
  };

  // Calculate result and update history
  const calculateResult = useCallback(() => {
    try {
      if (!/^[0-9+\-*/.]+$/.test(expression)) {
        throw new Error("Invalid expression");
      }
      const result = Function(`"use strict"; return (${expression})`)();
      setExpression(result.toString());
      const newHistory = history.slice(0, index + 1);
      setHistory([...newHistory, result.toString()]);
      setIndex(newHistory.length);
    } catch {
      setExpression("Error");
    }
  }, [expression, history, index]);

  // Undo 
  const undo = () => {
    if (index > 0) {
      setIndex(index - 1);
      setExpression(history[index - 1]);
    }
  };

  // Redo 
  const redo = () => {
    if (index < history.length - 1) {
      setIndex(index + 1);
      setExpression(history[index + 1]);
    }
  };

  // Clear history
  const clearExpression = () => {
    setExpression("0");
    setHistory(["0"]);
    setIndex(0);
  };

  // Clear last digit
  const clearLastDigit = () => {
    setExpression((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  // drag-and-drop
  const moveButton = (fromIndex, toIndex, type) => {
    if (type === "number") {
      setNumbers((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    } else if (type === "operator") {
      setOperators((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    }
  };

  // Add new number
  const addNumber = () => {
    const newNumber = prompt("Enter a new number:");
    if (newNumber && /^[0-9]$/.test(newNumber) && !numbers.includes(newNumber)) {
      setNumbers([...numbers, newNumber]);
    }
  };

  // Remove last number
  const removeNumber = () => {
    setNumbers(numbers.slice(0, -1));
  };

  // Add new operator
  const addOperator = () => {
    const newOperator = prompt("Enter a new operator:");
    if (newOperator && /^[+\-*/.]$/.test(newOperator)) {
      setOperators([...operators, newOperator]);
    }
  };

  // Remove last operator button
  const removeOperator = () => {
    setOperators(operators.slice(0, -1));
  };

  return (
    <div className="bg-cyan-800 border-gray-100 border-4">
    <div className=" p-4 ml-40 bg-cyan-500 rounded-lg shadow-md">
      <h1 className="text-4xl text-white font-bold text-center mb-4">Calculator</h1>
      <div className="text-2xl p-3 bg-white rounded mb-2 text-right">{expression}</div>

      {/* Calculator buttons */}
      <div className="grid grid-cols-4 gap-2">
        {/* Operator buttons */}
        <div className="grid grid-rows-4 gap-2">
          {operators.map((op, index) => (
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
              className="p-4 text-black bg-gray-200 rounded cursor-pointer hover:bg-gray-400 transition w-full"
            >
              {op}
            </button>
          ))}
        </div>

        {/* Number buttons */}
        <div className="col-span-3 grid grid-cols-3 gap-2">
          {numbers.map((num, index) => (
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
              className="p-4 text-black bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition w-full"
            >
              {num}
            </button>
          ))}
          {/* Zero button */}
          <button onClick={() => handleInput("0")} className="p-4 text-black bg-gray-300 rounded cursor-pointer hover:bg-gray-400 transition w-full">0</button>
          {/* Clear */}
          <button onClick={clearExpression} className="p-4 text-white bg-red-500 rounded transition w-full">Clear</button>
          {/* Backspace */}
          <button onClick={clearLastDigit} className="p-4 text-black bg-gray-500 rounded hover:bg-gray-600 transition w-full">⌫</button>
        </div>
      </div>

      {/* Undo, Redo, and Enter */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        <button onClick={undo} className="p-4 text-white bg-blue-500 rounded hover:bg-blue-600 transition w-full">Undo</button>
        <button onClick={redo} className="p-4 text-white bg-green-500 rounded hover:bg-green-600 transition w-full">Redo</button>
        <button onClick={calculateResult} className="p-4 text-white bg-yellow-500 rounded  hover:text-2xl transition w-full col-span-2">Enter</button>
      </div>

      {/* Add/Remove number and operator */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        <button onClick={addNumber} className="p-4 bg-gray-100 text-black rounded hover:text-cyan-600 w-full">+Num</button>
        <button onClick={removeNumber} className="p-4  bg-gray-100 text-black rounded hover:text-red-600 w-full">-Num</button>
        <button onClick={addOperator} className="p-4  bg-gray-100 text-black rounded hover:text-cyan-600 w-full">+Op</button>
        <button onClick={removeOperator} className="p-4  bg-gray-100 text-black rounded hover:text-red-600 w-full">-Op</button>
      </div>
    </div>
    </div>
  );
}
