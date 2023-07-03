class TreeItem {
    constructor(content, parent = null, children = []) {
        this.content = content;
        this.ariaLevel = this.setAriaLevel();
        this.parent = parent;
        this.children = children;
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

    addChild(treeItem) {
        this.children.push(treeItem);
    }

    setParent(treeItem) {
        this.parent = treeItem;
    }

    getContent() {
        return this.content;
    }

    getInnerText() {
        if (this.content) {
            return this.content.children[0].innerText;
        }
        return null;
    }
}

export class CondensedOlliRender {
    constructor(olliVis) {
        this.olliVis = olliVis;
        this.head = new TreeItem(null);
        this.condensedString = "";
        this.treeItemArray = [this.head];
        this.initialize();
    }

    initialize() {
        this.populateTreeItemArray();
        const treeItemDictionary = this.convertToDictionary();
        this.condensedString = this.convertToCSV(treeItemDictionary);
    }

    getCondensedString() {
        return this.condensedString;
    }

    convertToCSV(treeItemDictionary) {
        let csvString = "Hierarchy,Content\n";
      
        for (const [hierarchy, content] of Object.entries(treeItemDictionary)) {
          csvString += `${hierarchy} // ${content}\n`;
        }
      
        return csvString;
      }
      

    convertToDictionary() {
        const treeDictionary = {};

        for (let i = 1; i < this.treeItemArray.length; i++) {
            const treeItem = this.treeItemArray[i];
            // console.log(treeItem);
            const hierarchyKey = i === 1 ? 0 : this.getHierarchyKey(treeItem);
            // console.log(hierarchyKey);

            treeDictionary[hierarchyKey] = treeItem.getInnerText();
        }

        return treeDictionary;
    }

    // Helper Method to convertToDictionary()
    getHierarchyKey(treeItem) {
        let key = "";

        let currentNode = treeItem;
        while (currentNode.parent !== null) {
            key = "." + currentNode.parent.children.indexOf(currentNode) + key;
            // console.log("Key: " + key);
            currentNode = currentNode.parent;
        }

        return key;
    }


    getOlliVis() {
        return this.olliVis;
    }

    getTreeItemArray() {
        return this.treeItemArray;
    }

    recursionFunction(currentTreeItem, n) {
        if (currentTreeItem.getAriaLevel() > this.treeItemArray[n].getAriaLevel()) {
            this.treeItemArray[n].addChild(currentTreeItem);
            currentTreeItem.setParent(this.treeItemArray[n]);
        }
        else {
            this.recursionFunction(currentTreeItem, (n - 1));
        }
    }

    populateTreeItemArray() {
        const tree = this.olliVis.querySelectorAll('[role="tree"]');
        const treeItems = tree[0].querySelectorAll('[role="treeitem"]');
        for (var n = 0; n < treeItems.length; n++) {
            var treeItem = new TreeItem(treeItems[n]);
            this.recursionFunction(treeItem, n)
            this.treeItemArray.push(treeItem);
        }
    }


}