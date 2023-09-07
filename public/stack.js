// General Purpose Stack Data Structure
export class Stack {
  constructor() {
    this.items = [];
  }

  // Add an element to the top of the stack
  push(item) {
    this.items.push(item);
  }

  // Remove and return the top element from the stack
  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.items.pop();
  }

  // Return the top element of the stack without removing it
  peek() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.items[this.items.length - 1];
  }

  // Check if the stack is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // Return the number of elements in the stack
  size() {
    return this.items.length;
  }

  // Clear all elements from the stack
  clear() {
    this.items = [];
  }
}