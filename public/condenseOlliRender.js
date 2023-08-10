class TreeItem {
    constructor(content, parent = null, children = []) {
        this.content = content;
        this.ariaLevel = this.setAriaLevel();
        this.parent = parent;
        this.children = children;
        this.address = "";
    }

    setAriaLevel() {
        if (this.content) {
            return parseInt(this.content.getAttribute("aria-level"));
        }
        // Since the content of head is null, its aria-level is 0
        return 0;
    }
    setAddress(address) {
        this.address = address;
    }

    getAriaLevel() {
        return this.ariaLevel;
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
        this.addressArray = [];
        this.initialize();
    }

    initialize() {
        this.populateTreeItemArray();
        // console.log(this.treeItemArray);
        const treeItemDictionary = this.convertToDictionary();
        // console.log(treeItemDictionary);
        this.condensedString = this.convertToCSV(treeItemDictionary);
        console.log(this.addressArray);
        console.log(this.condensedString);
    }

    getCondensedString() {
        return this.condensedString;
    }

    convertToCSV(treeItemDictionary) {
        let csvString = "Hierarchy,Content\n";

        for (let [hierarchy, content] of Object.entries(treeItemDictionary)) {
            let firstPeriodIndex = content.getInnerText().indexOf(".");
            let ofIndex = content.getInnerText().indexOf(" of ");

            if (ofIndex !== -1 && firstPeriodIndex !== -1 && ofIndex < firstPeriodIndex) {
                content = content.getInnerText().slice(firstPeriodIndex + 2);
            } else {
                content = content.getInnerText();
            }

            csvString += `${hierarchy} // ${content.replace("Press t to open table.", "")}\n`;
        }

        return csvString;
    }


    convertToDictionary() {
        const treeDictionary = {};

        for (let i = 1; i < this.treeItemArray.length; i++) {
            const treeItem = this.treeItemArray[i];
            // console.log(treeItem);
            const hierarchyKey = i === 1 ? "1" : this.getHierarchyKey(treeItem);
            // console.log(hierarchyKey);

            treeItem.setAddress(hierarchyKey);
            this.addressArray.push(hierarchyKey);
            treeDictionary[hierarchyKey] = treeItem;
        }

        return treeDictionary;
    }

    // Helper Method to convertToDictionary()
    getHierarchyKey(treeItem) {
        let key = "";

        let currentNode = treeItem;
        while (currentNode.parent !== null) {
            key = "." + (currentNode.parent.children.indexOf(currentNode) + 1) + key;
            // console.log("Key: " + key);
            currentNode = currentNode.parent;
        }

        return key.substring(1, key.length);
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