class TreeItem {
    constructor(content, parent = null, children = []) {
        this.content = content;
        this.ariaLevel = this.setAriaLevel();
        this.parent = parent;
        this.children = children;
        this.address = "";
        this.isActiveChild = false;
    }

    setAriaLevel() {
        if (this.content) {
            return parseInt(this.content.getAttribute("aria-level"));
        }
        // Since the content of head is null, its aria-level is 0
        return 0;
    }

    setIsActiveChild(isActiveChild) {
        this.isActiveChild = isActiveChild;
    }

    getIsActiveChild() {
        return this.isActiveChild;
    }

    setAddress(address) {
        this.address = address;
    }

    getAddress() { return this.address; }

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

class Queue {
    constructor() {
        this.elements = [];
    }
    
    enqueue(element) {
        this.elements.push(element);
    }
    
    dequeue() {
        return this.elements.shift();
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    size() {
        return this.elements.length;
    }
    
    shift() {
        if (this.elements.length === 0) {
            return null;
        }
        const shiftedElement = this.elements[0];
        this.elements.splice(0, 1);
        return shiftedElement;
    }
}

export class CondensedOlliRender {
    constructor(olliVis) {
        this.olliVis = olliVis;
        this.head = new TreeItem(null);
        this.condensedString = "";
        this.treeItemArray = [this.head];
        this.treeItemDictionary = {};
        this.addressArray = [];
        this.initialize();
    }

    initialize() {
        this.populateTreeItemArray();
        this.treeItemDictionary = this.convertToDictionary();
        this.condensedString = this.convertToCSV(this.treeItemDictionary);
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
            const hierarchyKey = i === 1 ? "1" : this.getHierarchyKey(treeItem);

            treeItem.setAddress(hierarchyKey);
            if (hierarchyKey.endsWith("1")) {
                treeItem.setIsActiveChild(true);
            }
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

    printIsActiveChildNodes() {
        this.treeItemArray.forEach(node => {
            if (node.getIsActiveChild()) {
            }
        })
    }

    getNodeFromAddress(address) {
        const index = this.treeItemArray.findIndex(obj => obj.getAddress() == address);
        return this.treeItemArray[index];
    }

    getShortestPath(startNode, endNode) {

        function checkIfInVisited(visited, newAdress, currentAddress) {
            for (let i = 0; i < visited.length; i++) {
                if (visited[i][[newAdress]] && visited[i][[newAdress]][0] == currentAddress) {
                    return true;
                }
            }
            return false;
        }

        function getIndexWithinParent(node) {
            const parent = node.getParent();
            if (parent) {
                const children = parent.getChildren();
                const index = children.findIndex(obj => obj.getAddress() === node.getAddress());
                return index;
            }
            return -1;
        }

        // ERROR CHECK LATER
        function getActiveChildAddress(node) {
            const children = node.getChildren();
            for (let i = 0; i < children.length; i++) {
                if (children[i].getIsActiveChild()) {
                    return children[i].getAddress();
                }
            }
            return null;
        }

        const queue = new Queue();
        queue.enqueue({ node: startNode, address: startNode.getAddress(), activeChildAddress: getActiveChildAddress(startNode), indexWithinParent: getIndexWithinParent(startNode)});
        // const visited = { [startNode.getAddress()]: [] };
        const visited = [];
        
        while (queue.size() > 0) {
            const { node: currentNode, address: currentAddress, activeChildAddress: activeChildAddress, indexWithinParent: indexWithinParent } = queue.shift();
            
            if (currentAddress === endNode.getAddress()) {
                break;
            }
            
            // Movement: Move left
            if (indexWithinParent > 0) {
                const newAddress = currentAddress.slice(0, -1) + indexWithinParent;
                if (this.treeItemDictionary[newAddress]) {
                    const newNode = this.getNodeFromAddress(newAddress);
                    queue.enqueue({ node: newNode, address: newAddress, activeChildAddress: getActiveChildAddress(newNode), indexWithinParent: indexWithinParent - 1});
                    if (!checkIfInVisited(visited, newAddress, currentAddress)) {
                        visited.push({ [newAddress]: [currentAddress, "left"] });
                    }
                }
            }
            
            // Movement: Move right
            if (indexWithinParent < (currentNode.getParent().getChildren().length - 1)) {
                const newAddress = currentAddress.slice(0, -1) + (indexWithinParent + 2);
                if (this.treeItemDictionary[newAddress]) {
                    const newNode = this.getNodeFromAddress(newAddress);
                    queue.enqueue({ node: newNode, address: newAddress, activeChildAddress: getActiveChildAddress(newNode), indexWithinParent: indexWithinParent + 1});
                    // if (!visited[currentAddress]) {
                    //     visited[currentAddress] = [];
                    // }
                    // visited[currentAddress].push(newAddress);
                    if (!checkIfInVisited(visited, newAddress, currentAddress)) {
                        visited.push({ [newAddress]: [currentAddress, "right"] });
                    }
                } 
            }
            
            // Movement: Move up (without changing active child)
            if (currentNode.getParent()) {
                const newAddress = currentAddress.slice(0, -2);
                if (this.treeItemDictionary[newAddress]) {
                    const newNode = this.getNodeFromAddress(newAddress);
                    queue.enqueue({ node: newNode, address: newAddress, activeChildAddress: getActiveChildAddress(newNode), indexWithinParent: getIndexWithinParent(newNode)});
                    // if (!visited[currentAddress]) {
                    //     visited[currentAddress] = [];
                    // }
                    // visited[currentAddress].push(newAddress);
                    if (!checkIfInVisited(visited, newAddress, currentAddress)) {
                        visited.push({ [newAddress]: [currentAddress, "up"] });
                    }
                }
            }
            
            // Movement: Move down TO DO
            // set all addresses ending in one initially to activeChildAddress
            if (currentNode.getChildren().length != 0) {
                const newAddress = activeChildAddress;
                if (activeChildAddress) {
                    const newNode = this.getNodeFromAddress(activeChildAddress);
                    queue.enqueue({ node: newNode, address: newAddress, activeChildAddress: getActiveChildAddress(newNode), indexWithinParent: getIndexWithinParent(newNode)});
                    // if (!visited[currentAddress]) {
                    //     visited[currentAddress] = [];
                    // }
                    // visited[currentAddress].push(newAddress);
                    if (!checkIfInVisited(visited, newAddress, currentAddress)) {
                        visited.push({ [newAddress]: [currentAddress, "down"] });
                    }
                }
            }
        }
        
        // Find End Node
        let endingNodeInVisited = null;
        for (let i = 0; i < visited.length; i++) {
            const key = Object.keys(visited[i]);
            if (key[0] == endNode.getAddress()) {
                endingNodeInVisited = visited[i];
            }
        }

        let path = [];
        path.push(Object.values(endingNodeInVisited)[0]);
        const visitedQueue = new Queue();
        visitedQueue.enqueue(path);
        while (visitedQueue.size() > 0) {
            path = visitedQueue.dequeue();

            if (path[path.length - 1][0] == startNode.getAddress()) {
                break;
            }

            for (let i = 0; i < visited.length; i++) {
                
                if (Object.keys(visited[i])[0] == path[path.length - 1][0]) {
                    let copyOfPath = [];
                    for (let i = 0; i < path.length; i++) {
                        copyOfPath.push(path[i]);
                    }
                    copyOfPath.push(Object.values(visited[i])[0]);
                    visitedQueue.enqueue(copyOfPath);
                    // path.pop();
                }
            }
        }
        let stringOutput = "";
        for (let i = (path.length - 1); i >= 0; i--) {
            stringOutput += "Press the " + path[i][1] + " arrow key. ";
        }
        return stringOutput;
        // let currentNodeInVisited = endingNodeInVisited;
        // while (Object.values(currentNodeInVisited)[0] != startNode.getAddress()) {

        // }

        // Reconstruct path
        // const path = [endNode.address];
        // let parentAddress = visited[endNode.address];
        // while (parentAddress) {
        //     path.unshift(parentAddress);
        //     parentAddress = visited[parentAddress];
        // }
        
        // return path;
    }

}