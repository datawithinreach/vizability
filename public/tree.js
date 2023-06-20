// class for the individual nodes that comprise the olli render tree
class TreeItem {
    constructor(content, parent=null, children=[]) {
      this.content = content;
      this.ariaLevel = this.setAriaLevel();
      this.parent = parent;
      this.children = children;
    }
  
    getInnerText() {
      return this.content.children[0].innerText;
    }
  
    setAriaLevel() {
      if (this.content) {
        return parseInt(this.content.getAttribute("aria-level"));
      }
      // Since the content of head is null, its aria-level is 0
      return 0;
    }
  
    getAriaLevel() {
      return this.ariaLevel;
    }
  
    getContent() {
      return this.content;
    }
  
    addChild(treeItem) {
      this.children.push(treeItem);
    }
  
    getChildren() {
      return this.children;
    }
  
    setParent(treeItem) {
      this.parent = treeItem;
    }
  
    getParent() {
      return this.parent;
    }
  }
  
  // class that creates a tree data structure
  // houses all the elements of the olli render in a hierarchy format
  export const tree = class Tree {
    constructor(parentElement) {
      this.head = new TreeItem(null);
      this.parentElement = parentElement;
      this.treeItemArray = [this.head];
      this.alphabet = "abcdefghijklmnopqrstuvwxyz";
      // this.hierarchy condense the olliRender elements in string format
      this.hierarchy = "";
      this.initializeCallbacks = [];
      // Create a new mutation observer instance
      this.observer = new MutationObserver((mutationsList, observer) => {
        // Check if the element with class "olli-vis" is added
        // var parentElement = document.querySelector('.olli-vis');
        mutationsList.forEach( (mutation) => {
          if (mutation.addedNodes.length != 0) {
            this.initialize(mutation.addedNodes[0]);
  
            // Disconnect the observer as it is no longer needed
            observer.disconnect();
          }
        });
      });
  
      // Start observing mutations in the document
      this.observer.observe(document.getElementById("olli-container"), { childList: true, subtree: true });
    }
  
    // returns the text elements of the olli render in hierarchical string format
    getHierarchy(callback) {
      if (this.hierarchy !== "") {
        // The hierarchy is already populated, invoke the callback immediately
        callback(this.hierarchy);
      } else {
        // The hierarchy is not yet populated, register the callback to be executed after initialization
        const initializeCallback = () => {
          callback(this.hierarchy);
        };
        this.initializeCallbacks.push(initializeCallback);
      }
    }
  
    // main method for populating olli render tree
    // generates this.hierarchy based on populated olli render tree
    initialize = (element) => {
      this.populateTree(element);
      this.hierarchy = this.convertArrayToString(this.outputArray());
      // Invoke any registered callbacks with the populated hierarchy
      this.initializeCallbacks.forEach((callback) => {
        callback(this.hierarchy);
      });
      this.initializeCallbacks = [];
    }
  
    // helper method for the populateTree() method
    recursionFunction(currentTreeItem, n) {
      if (currentTreeItem.getAriaLevel() > this.treeItemArray[n].getAriaLevel()) {
        this.treeItemArray[n].addChild(currentTreeItem);
        currentTreeItem.setParent(this.treeItemArray[n]);
      }
      else {
        this.recursionFunction(currentTreeItem, (n-1));
      }
    }
  
    populateTree = (element) => {
      var tree = element.querySelectorAll('[role="tree"]');
      var treeItems = tree[0].querySelectorAll('[role="treeitem"]');
      for (var n = 0; n < treeItems.length; n++) {
        var treeItem = new TreeItem(treeItems[n]);
        this.recursionFunction(treeItem, n)
        this.treeItemArray.push(treeItem);
      }
    }
  
    // converts output array to String
    convertArrayToString = (arrayList) => {
      var output = ""
      arrayList.forEach((element) => {
        for (const [key, value] of Object.entries(element)) {
          output += `${key}: ${value}\n`;
        }
      })
      return output;
    }
  
    // helper method for the outputArray() method
    outputArrayRecursive = (treeItem, output, n) => {
      if (treeItem.getChildren().length == 0) {
        var treeItemObj = new Object();
        treeItemObj["" + treeItem.getAriaLevel() + n] = treeItem.getInnerText();
        output.push(treeItemObj);
        return output;
      }
      var treeItemObj = new Object();
      treeItemObj["" + treeItem.getAriaLevel() + n] = treeItem.getInnerText();
      output.push(treeItemObj);
      for (var a = 0; a < treeItem.getChildren().length; a++) {
        this.outputArrayRecursive(treeItem.getChildren()[a], output, this.alphabet.substring(a, a + 1));
      }
      return output;
    }
  
    outputArray = () => {
      var output = [];
      return this.outputArrayRecursive(this.head.getChildren()[0], output, this.alphabet.substring(0, 1));
    }
  }
  
  export default tree;