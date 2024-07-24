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
        return this.content ? parseInt(this.content.getAttribute("aria-level")) : 0;
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

    getAddress() {
        return this.address;
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
        return this.content ? this.content.children[0].innerText : null;
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
        return this.elements.length === 0 ? null : this.elements.shift();
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

            csvString += `${hierarchy} // ${content.replace("Press t to open table.", "").replace("1 value.", "").replace(" equals", ":")}\n`;
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

    /**
     * Generates a hierarchy key for a given tree item.
     * @param {TreeItem} treeItem - The tree item to generate the hierarchy key for.
     * @returns {string} - The hierarchy key.
     */
    getHierarchyKey(treeItem) {
        let key = "";
        let currentNode = treeItem;

        while (currentNode.parent !== null) {
            key = "." + (currentNode.parent.children.indexOf(currentNode) + 1) + key;
            currentNode = currentNode.parent;
        }

        return key.substring(1);
    }

    getOlliVis() {
        return this.olliVis;
    }

    getTreeItemArray() {
        return this.treeItemArray;
    }

    /**
     * Recursively sets the parent-child relationship for a tree item.
     * @param {TreeItem} currentTreeItem - The current tree item to be added.
     * @param {number} n - The index of the parent tree item in the tree item array.
     */
    recursionFunction(currentTreeItem, n) {
        if (currentTreeItem.getAriaLevel() > this.treeItemArray[n].getAriaLevel()) {
            this.treeItemArray[n].addChild(currentTreeItem);
            currentTreeItem.setParent(this.treeItemArray[n]);
        } else {
            this.recursionFunction(currentTreeItem, n - 1);
        }
    }

    /**
     * Populates the tree item array by parsing the Olli visualization tree.
     */
    populateTreeItemArray() {
        const treeItems = this.olliVis.querySelectorAll('[role="treeitem"]');
        treeItems.forEach((item, index) => {
            const treeItem = new TreeItem(item);
            this.recursionFunction(treeItem, index);
            this.treeItemArray.push(treeItem);
        });
    }

    /**
     * Retrieves a tree item by its address.
     * @param {string} address - The address of the tree item.
     * @returns {TreeItem} - The tree item corresponding to the address.
     */
    getNodeFromAddress(address) {
        return this.treeItemArray.find(obj => obj.getAddress() === address);
    }

    /**
     * Finds the shortest path between two tree items.
     * @param {TreeItem} startNode - The starting tree item.
     * @param {TreeItem} endNode - The ending tree item.
     * @returns {string} - The sequence of arrow key presses to navigate from start to end node.
     */
    getShortestPath(startNode, endNode) {
        const queue = new Queue();
        queue.enqueue({
            node: startNode,
            address: startNode.getAddress(),
            activeChildAddress: this.getActiveChildAddress(startNode),
            indexWithinParent: this.getIndexWithinParent(startNode)
        });

        const visited = [];

        while (queue.size() > 0) {
            const { node: currentNode, address: currentAddress, activeChildAddress, indexWithinParent } = queue.shift();

            if (currentAddress === endNode.getAddress()) break;

            this.enqueueAdjacentNodes(queue, currentNode, currentAddress, activeChildAddress, indexWithinParent, visited);
        }

        return this.constructPath(visited, startNode, endNode);
    }

    /**
     * Checks if a node has already been visited.
     * @param {Array} visited - The list of visited nodes.
     * @param {string} newAddress - The address of the new node.
     * @param {string} currentAddress - The address of the current node.
     * @returns {boolean} - Whether the node has been visited.
     */
    checkIfInVisited(visited, newAddress, currentAddress) {
        return visited.some(visit => visit[newAddress] && visit[newAddress][0] === currentAddress);
    }

    /**
     * Enqueues adjacent nodes (left, right, up, down) for BFS traversal.
     * @param {Queue} queue - The queue for BFS traversal.
     * @param {TreeItem} currentNode - The current tree item.
     * @param {string} currentAddress - The current address.
     * @param {string} activeChildAddress - The address of the active child.
     * @param {number} indexWithinParent - The index within the parent node.
     * @param {Array} visited - The list of visited nodes.
     */
    enqueueAdjacentNodes(queue, currentNode, currentAddress, activeChildAddress, indexWithinParent, visited) {
        const movements = [
            { direction: "left", condition: indexWithinParent > 0, newIndex: indexWithinParent - 1 },
            { direction: "right", condition: indexWithinParent < currentNode.getParent().getChildren().length - 1, newIndex: indexWithinParent + 1 },
            { direction: "up", condition: currentNode.getParent(), newIndex: -2 },
            { direction: "down", condition: currentNode.getChildren().length > 0, newIndex: activeChildAddress }
        ];

        movements.forEach(({ direction, condition, newIndex }) => {
            if (condition) {
                const newAddress = this.calculateNewAddress(currentAddress, direction, newIndex, activeChildAddress);
                if (newAddress && this.treeItemDictionary[newAddress]) {
                    const newNode = this.getNodeFromAddress(newAddress);
                    queue.enqueue({
                        node: newNode,
                        address: newAddress,
                        activeChildAddress: this.getActiveChildAddress(newNode),
                        indexWithinParent: this.getIndexWithinParent(newNode)
                    });
                    if (!this.checkIfInVisited(visited, newAddress, currentAddress)) {
                        visited.push({ [newAddress]: [currentAddress, direction] });
                    }
                }
            }
        });
    }

    /**
     * Calculates the new address based on the movement direction.
     * @param {string} currentAddress - The current address.
     * @param {string} direction - The movement direction.
     * @param {number|string} newIndex - The new index or address.
     * @param {string} activeChildAddress - The active child address.
     * @returns {string|null} - The new address.
     */
    calculateNewAddress(currentAddress, direction, newIndex, activeChildAddress) {
        switch (direction) {
            case "left":
            case "right":
                return currentAddress.slice(0, -1) + (newIndex + 1);
            case "up":
                return currentAddress.slice(0, newIndex);
            case "down":
                return activeChildAddress;
            default:
                return null;
        }
    }

    /**
     * Retrieves the index of a node within its parent.
     * @param {TreeItem} node - The tree item.
     * @returns {number} - The index within the parent.
     */
    getIndexWithinParent(node) {
        const parent = node.getParent();
        return parent ? parent.getChildren().indexOf(node) : -1;
    }

    /**
     * Retrieves the active child address of a node.
     * @param {TreeItem} node - The tree item.
     * @returns {string|null} - The active child address.
     */
    getActiveChildAddress(node) {
        const activeChild = node.getChildren().find(child => child.getIsActiveChild());
        return activeChild ? activeChild.getAddress() : null;
    }

    /**
     * Constructs the path from start to end node.
     * @param {Array} visited - The list of visited nodes.
     * @param {TreeItem} startNode - The starting tree item.
     * @param {TreeItem} endNode - The ending tree item.
     * @returns {string} - The sequence of arrow key presses to navigate from start to end node.
     */
    constructPath(visited, startNode, endNode) {
        let endingNodeInVisited = visited.find(visit => Object.keys(visit)[0] === endNode.getAddress());
        let path = [];
        path.push(Object.values(endingNodeInVisited)[0]);
        const visitedQueue = new Queue();
        visitedQueue.enqueue(path);

        while (visitedQueue.size() > 0) {
            path = visitedQueue.dequeue();

            if (path[path.length - 1][0] === startNode.getAddress()) break;

            visited.forEach(visit => {
                if (Object.keys(visit)[0] === path[path.length - 1][0]) {
                    let newPath = [...path, Object.values(visit)[0]];
                    visitedQueue.enqueue(newPath);
                }
            });
        }

        return path.reverse().map(step => `Press the ${step[1]} arrow key.`).join(" ");
    }
}
