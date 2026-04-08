class Calculator {
  constructor() {
    this.resultEl = document.getElementById('result');
    this.expressionEl = document.getElementById('expression');
    this.memoryIndicator = document.getElementById('memory-indicator');
    this.currentValue = '0';
    this.expression = '';
    this.memory = 0;
    this.lastWasResult = false;
    this.setupButtons();
  }

  setupButtons() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        const action = btn.dataset.action;
        
        if (value !== undefined) {
          this.inputValue(value);
        } else if (action) {
          this.handleAction(action);
        }
      });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      const key = e.key;
      if (/[0-9.]/.test(key)) this.inputValue(key);
      else if (key === '+') this.handleAction('add');
      else if (key === '-') this.handleAction('subtract');
      else if (key === '*') this.handleAction('multiply');
      else if (key === '/') this.handleAction('divide');
      else if (key === 'Enter' || key === '=') this.handleAction('equals');
      else if (key === 'Escape') this.handleAction('allclear');
      else if (key === 'Backspace') this.handleAction('clear');
      else if (key === '%') this.handleAction('percent');
      else if (key === '(') this.inputValue('(');
      else if (key === ')') this.inputValue(')');
    });
  }

  inputValue(val) {
    if (this.lastWasResult && !isOperator(val)) {
      this.currentValue = '';
      this.expression = '';
      this.lastWasResult = false;
    }

    if (val === '.') {
      if (!this.currentValue.includes('.')) {
        this.currentValue += val;
      }
    } else if (isOperator(val)) {
      if (this.currentValue !== '0' || val === '-') {
        if (this.currentValue === '' && this.expression.slice(-1) === '-') return;
        if (this.currentValue === '' && this.expression !== '') {
          this.currentValue = val;
        } else {
          this.currentValue = this.currentValue === '-' ? val : this.currentValue;
          if (this.currentValue !== val) {
            this.expression += this.currentValue;
          }
          this.currentValue = '';
        }
      }
    } else {
      if (this.currentValue === '0' && val !== '.') {
        this.currentValue = val;
      } else {
        this.currentValue += val;
      }
    }

    this.updateDisplay();
  }

  handleAction(action) {
    switch(action) {
      case 'clear':
        this.currentValue = '0';
        this.updateDisplay();
        break;
      case 'allclear':
        this.currentValue = '0';
        this.expression = '';
        this.lastWasResult = false;
        this.updateDisplay();
        break;
      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
        if (this.currentValue !== '') {
          if (this.currentValue !== '-' ) {
            this.expression += this.currentValue;
          }
          this.currentValue = '';
        }
        const op = { add: '+', subtract: '-', multiply: '×', divide: '÷' }[action];
        this.expression += op;
        this.lastWasResult = false;
        this.updateDisplay();
        break;
      case 'equals':
        this.calculate();
        break;
      case 'sin':
        this.applyFunction('sin');
        break;
      case 'cos':
        this.applyFunction('cos');
        break;
      case 'tan':
        this.applyFunction('tan');
        break;
      case 'log':
        this.applyFunction('log');
        break;
      case 'ln':
        this.applyFunction('ln');
        break;
      case 'sqrt':
        this.applyFunction('sqrt');
        break;
      case 'pow2':
        this.applyFunction('pow2');
        break;
      case 'pow':
        this.inputValue('^');
        break;
      case 'percent':
        this.applyFunction('percent');
        break;
      case 'inv':
        this.applyFunction('inv');
        break;
      case 'mc':
        this.memory = 0;
        this.updateMemoryIndicator();
        break;
      case 'mr':
        if (this.memory !== 0) {
          this.currentValue = this.memory.toString();
          this.lastWasResult = true;
          this.updateDisplay();
        }
        break;
      case 'm+':
        this.memory += parseFloat(this.currentValue) || 0;
        this.updateMemoryIndicator();
        break;
      case 'm-':
        this.memory -= parseFloat(this.currentValue) || 0;
        this.updateMemoryIndicator();
        break;
    }
  }

  applyFunction(fn) {
    let val = parseFloat(this.currentValue);
    if (isNaN(val)) val = 0;
    let result;

    switch(fn) {
      case 'sin': result = Math.sin(toRadians(val)); break;
      case 'cos': result = Math.cos(toRadians(val)); break;
      case 'tan': result = Math.tan(toRadians(val)); break;
      case 'log': result = Math.log10(val); break;
      case 'ln': result = Math.log(val); break;
      case 'sqrt': result = Math.sqrt(val); break;
      case 'pow2': result = val * val; break;
      case 'percent': result = val / 100; break;
      case 'inv': result = 1 / val; break;
    }

    if (!isFinite(result) || isNaN(result)) {
      this.currentValue = 'Error';
    } else {
      this.currentValue = formatNumber(result);
    }
    this.lastWasResult = true;
    this.updateDisplay();
    this.animateResult();
  }

  calculate() {
    if (!this.expression || !this.currentValue) return;
    
    let expr = this.expression + this.currentValue;
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    expr = expr.replace(/π/g, `*${Math.PI}`).replace(/(?<=[0-9])π/g, `*${Math.PI}`);
    expr = expr.replace(/(?<![0-9])e(?![0-9])/g, `${Math.E}`).replace(/(?<=[0-9])e(?!=)/g, `*${Math.E}`);
    expr = expr.replace(/\^/g, '**');
    
    // Handle implicit multiplication: 2(3) = 6, (2)(3) = 6, 2π = 2π
    expr = expr.replace(/(\d)\(/g, '$1*(');
    expr = expr.replace(/\)(\d)/g, ')*$1');
    expr = expr.replace(/\)\(/g, ')*(');

    try {
      const result = eval(expr);
      if (!isFinite(result) || isNaN(result)) {
        this.currentValue = 'Error';
      } else {
        this.expression = this.currentValue + ' = ';
        this.currentValue = formatNumber(result);
        this.lastWasResult = true;
      }
    } catch (e) {
      this.currentValue = 'Error';
    }
    
    this.updateDisplay();
    this.animateResult();
  }

  updateDisplay() {
    this.resultEl.textContent = this.currentValue || '0';
    this.expressionEl.textContent = this.expression;
  }

  animateResult() {
    this.resultEl.classList.remove('animate');
    void this.resultEl.offsetWidth;
    this.resultEl.classList.add('animate');
  }

  updateMemoryIndicator() {
    if (this.memory !== 0) {
      this.memoryIndicator.textContent = 'M';
      this.memoryIndicator.classList.add('show');
    } else {
      this.memoryIndicator.classList.remove('show');
    }
  }
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function formatNumber(num) {
  if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
    return num.toExponential(8);
  }
  const result = parseFloat(num.toPrecision(12));
  return result.toString();
}

function isOperator(val) {
  return ['+', '−', '-', '×', '*', '÷', '/'].includes(val);
}

new Calculator();
