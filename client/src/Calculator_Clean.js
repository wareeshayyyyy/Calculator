import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function CalculatorClean() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  return (
    <div className="calculator-container">
      <div className="calculator max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6">
          <div className="text-right">
            <div className="text-white text-3xl font-light mb-2 h-10 overflow-hidden">
              {display}
            </div>
            <div className="text-gray-400 text-sm">
              {operation && previousValue !== null 
                ? `${previousValue} ${operation}` 
                : 'Calculator'
              }
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <button
              onClick={clear}
              className="col-span-2 bg-red-500 hover:bg-red-600 text-white rounded-xl p-4 font-semibold transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={() => performOperation('÷')}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              ÷
            </button>
            <button
              onClick={() => performOperation('×')}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              ×
            </button>

            {/* Row 2 */}
            <button
              onClick={() => inputNumber(7)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              7
            </button>
            <button
              onClick={() => inputNumber(8)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              8
            </button>
            <button
              onClick={() => inputNumber(9)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              9
            </button>
            <button
              onClick={() => performOperation('-')}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              -
            </button>

            {/* Row 3 */}
            <button
              onClick={() => inputNumber(4)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              4
            </button>
            <button
              onClick={() => inputNumber(5)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              5
            </button>
            <button
              onClick={() => inputNumber(6)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              6
            </button>
            <button
              onClick={() => performOperation('+')}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              +
            </button>

            {/* Row 4 */}
            <button
              onClick={() => inputNumber(1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              1
            </button>
            <button
              onClick={() => inputNumber(2)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              2
            </button>
            <button
              onClick={() => inputNumber(3)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              3
            </button>
            <button
              onClick={handleEquals}
              className="row-span-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-4 font-semibold transition-all transform active:scale-95 flex items-center justify-center text-2xl"
            >
              =
            </button>

            {/* Row 5 */}
            <button
              onClick={() => inputNumber(0)}
              className="col-span-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              0
            </button>
            <button
              onClick={inputDecimal}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl p-4 font-semibold transition-all transform active:scale-95"
            >
              .
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
