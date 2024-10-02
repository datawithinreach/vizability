/**
 * A general-purpose stack data structure.
 */
export class Stack {
  /**
   * Creates an instance of the Stack.
   * Initializes an empty stack.
   */
  constructor() {
    this.items = [];
  }

  /**
   * Adds an element to the top of the stack.
   * @param {*} item - The element to be added to the stack.
   */
  push(item) {
    this.items.push(item);
  }

  /**
   * Removes and returns the top element from the stack.
   * @returns {*} The top element of the stack.
   * @throws {Error} If the stack is empty.
   */
  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.items.pop();
  }

  /**
   * Returns the top element of the stack without removing it.
   * @returns {*} The top element of the stack.
   * @throws {Error} If the stack is empty.
   */
  peek() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.items[this.items.length - 1];
  }

  /**
   * Checks if the stack is empty.
   * @returns {boolean} True if the stack is empty, otherwise false.
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Returns the number of elements in the stack.
   * @returns {number} The number of elements in the stack.
   */
  size() {
    return this.items.length;
  }

  /**
   * Clears all elements from the stack.
   */
  clear() {
    this.items = [];
  }
}
