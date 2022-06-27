import { getVerticalAndHorizontal, verticalAndHorizontalToID } from "./utils.js"

export function noPiece({board, to}){
    if (board == undefined || to == undefined){
        console.log("incorrect args provided to noPiece")
    }
    if (board[to] != undefined){
        console.log("piece on", to)
    }
    return (board[to] == undefined)
}

export function noDiagonalBlocking({board, from, to}){
    if (board == undefined || from == undefined || to == undefined){
        console.log("incorrect args provided to noPiece")
    }
    
    let fromCoords = getVerticalAndHorizontal(from)
    let fromVertical = fromCoords.vertical
    let fromHorizontal = fromCoords.horizontal

    let toCoords = getVerticalAndHorizontal(to)
    let toVertical = toCoords.vertical
    let toHorizontal = toCoords.horizontal

    if (toHorizontal > fromHorizontal){
        if (toVertical > fromVertical){
            for (let i = 1; i < (toHorizontal-fromHorizontal); i++){
                if (
                    board[verticalAndHorizontalToID(
                        fromVertical+i, fromHorizontal+i
                    )] != undefined
                ) {
                    console.log("checking", fromVertical+i, fromHorizontal+i)
                    return false;
                }
            }
        } else {
            for (let i = 1; i < (toHorizontal-fromHorizontal); i++){
                if (
                    board[verticalAndHorizontalToID(
                        fromVertical-i, fromHorizontal+i
                    )] != undefined
                ) {
                    console.log("checking", fromVertical-i, fromHorizontal+i)
                    return false
                }
            }
        }
    } else {
        if (toVertical > fromVertical){
            for (let i = 1; i < (fromHorizontal-toHorizontal); i++){
                if (
                    board[verticalAndHorizontalToID(
                        fromVertical+i, fromHorizontal-i
                    )] != undefined
                ) {
                    console.log("checking", fromVertical+i, fromHorizontal-i)
                    return false
                }
            }
        } else {
            for (let i = 1; i < (fromHorizontal-toHorizontal); i++){
                if (
                    board[verticalAndHorizontalToID(
                        fromVertical-i, fromHorizontal-i
                    )] != undefined
                ) {
                    console.log("checking", fromVertical-i, fromHorizontal-i)
                    return false
                }
            }
        }
    }
    return true;
}

export function noStraightBlocking({board, from, to}){
    if (board == undefined || from == undefined || to == undefined){
        console.log("incorrect args provided to noPiece")
    }

    let fromCoords = getVerticalAndHorizontal(from)
    let fromVertical = fromCoords.vertical
    let fromHorizontal = fromCoords.horizontal

    let toCoords = getVerticalAndHorizontal(to)
    let toVertical = toCoords.vertical
    let toHorizontal = toCoords.horizontal

    if (toVertical > fromVertical){
        // straight up
        for (let i = 1; i <= (toVertical-fromVertical); i++){
            if (board[verticalAndHorizontalToID(
                fromVertical+i, fromHorizontal
            )] != undefined){
                return false
            }
        }
    } else if (toVertical < fromVertical){
        // straight down
        for (let i = 1; i <= (fromVertical-toVertical); i++){
            if (board[verticalAndHorizontalToID(
                fromVertical-i, fromHorizontal
            )] != undefined){
                return false
            }
        }
    } else if (toHorizontal > fromHorizontal){
        for (let i = 1; i <= (toHorizontal - fromHorizontal); i++){
            if (board[verticalAndHorizontalToID(
                fromVertical, fromHorizontal+i
            )] != undefined){
                return false
            }
        }
    } else if (toHorizontal < fromHorizontal){
        for (let i = 1; i <= (fromHorizontal - toHorizontal); i++){
            if (board[verticalAndHorizontalToID(
                fromVertical, fromHorizontal-i
            )] != undefined){
                return false
            }
        }
    }

    return true;
}

export function notSameType({board, from, to}){
    if (board == undefined || from == undefined || to == undefined){
        console.log("incorrect args provided to noPiece")
    }
    return (board[to] == undefined || board[from].isWhite != board[to].isWhite)
}

export function rookActive({board, rookActiveWhite, rookActiveBlack, from}){
    if (board == undefined || from == undefined || rookActiveWhite == undefined || 
        rookActiveBlack == undefined
    ){
        console.log("incorrect args provided to noPiece")
    }
    return (board[from].isWhite && rookActiveWhite) || (!board[from].isWhite && rookActiveBlack)
}

function containsObject(obj, list) {
    for (let i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

export function canMonkeyJump({board, from, to}){
    if (board == undefined || from == undefined || to == undefined){
        console.log("incorrect args provided to noPiece")
    }

    console.log("can monkey jump?", from, to)

    let fromCoords = getVerticalAndHorizontal(from)
    let fromVertical = fromCoords.vertical
    let fromHorizontal = fromCoords.horizontal

    let toCoords = getVerticalAndHorizontal(to)
    let toVertical = toCoords.vertical
    let toHorizontal = toCoords.horizontal

    console.log(fromVertical, fromHorizontal)

    // construct a graph of current neighbors that the monkey can jump to
    let toCheck = []

    // make a list of all nodes we've checked
    let hasChecked = []

    let addToLists = (inputVertical, inputHorizontal) => {

        // REMINDER: make sure you can't move to tile with same color piece as you

        let tempID = verticalAndHorizontalToID(inputVertical+1, inputHorizontal)
        if ((inputVertical + 2) < 9 && board[tempID] != undefined) {
            let insertElement = {vert: inputVertical+2, hor: inputHorizontal}
            if (!containsObject(insertElement, hasChecked)){
                if (insertElement.vert == toVertical && insertElement.hor == toHorizontal) 
                    return true
                toCheck.push(insertElement);
                hasChecked.push(insertElement);
            }
        }

        tempID = verticalAndHorizontalToID(inputVertical-1, inputHorizontal)
        if ((inputVertical - 2) > 0 && board[tempID] != undefined){
            let insertElement = {vert: inputVertical-2, hor: inputHorizontal}
            if (!containsObject(insertElement, hasChecked)){
                if (insertElement.vert == toVertical && insertElement.hor == toHorizontal) 
                    return true
                toCheck.push(insertElement);
                hasChecked.push(insertElement);
            }
        }
        tempID = verticalAndHorizontalToID(inputVertical, inputHorizontal+1)
        if ((inputHorizontal + 2) < 9 && board[tempID] != undefined) {
            let insertElement = {vert: inputVertical, hor: inputHorizontal+2}
            if (!containsObject(insertElement, hasChecked)){
                if (insertElement.vert == toVertical && insertElement.hor == toHorizontal) 
                    return true
                toCheck.push(insertElement);
                hasChecked.push(insertElement);
            }
        }
        tempID = verticalAndHorizontalToID(inputVertical, inputHorizontal-1)
        if ((inputHorizontal - 2) > 0 && board[tempID] != undefined) {
            let insertElement = {vert: inputVertical, hor: inputHorizontal-2}
            if (!containsObject(insertElement, hasChecked)){
                if (insertElement.vert == toVertical && insertElement.hor == toHorizontal) 
                    return true
                toCheck.push(insertElement);
                hasChecked.push(insertElement);
            }
        }
        
        tempID = verticalAndHorizontalToID(inputVertical+1, inputHorizontal+1)
        if ((inputVertical + 2) < 9 && (inputHorizontal+2) < 9 && board[tempID] != undefined) {
            let insertElement = {vert: inputVertical+2, hor: inputHorizontal+2}
            if (!containsObject(insertElement, hasChecked)){
                if (insertElement.vert == toVertical && insertElement.hor == toHorizontal) 
                    return true
                toCheck.push(insertElement);
                hasChecked.push(insertElement);
            }
        }

        tempID = verticalAndHorizontalToID(inputVertical-1, inputHorizontal+1)
        if ((inputVertical - 2) > 0 && (inputHorizontal+2) < 9 && board[tempID] != undefined){
            let insertElement = {vert: inputVertical-2, hor: inputHorizontal+2}
            if (!containsObject(insertElement, hasChecked)){
                if (insertElement.vert == toVertical && insertElement.hor == toHorizontal) 
                    return true
                toCheck.push(insertElement);
                hasChecked.push(insertElement);
            }
        }
        tempID = verticalAndHorizontalToID(inputVertical+1, inputHorizontal-1)
        if ((inputHorizontal - 2) > 0 && (inputVertical+2) < 9 && board[tempID] != undefined) {
            let insertElement = {vert: inputVertical+2, hor: inputHorizontal-2}
            if (!containsObject(insertElement, hasChecked)){
                if (insertElement.vert == toVertical && insertElement.hor == toHorizontal) 
                    return true
                toCheck.push(insertElement);
                hasChecked.push(insertElement);
            }
        }

        tempID = verticalAndHorizontalToID(inputVertical-1, inputHorizontal-1)
        if ((inputHorizontal - 2) > 0 && (inputVertical - 2) > 0 && board[tempID] != undefined) {
            let insertElement = {vert: inputVertical-2, hor: inputHorizontal-2}
            if (!containsObject(insertElement, hasChecked)){
                if (insertElement.vert == toVertical && insertElement.hor == toHorizontal) 
                    return true
                toCheck.push(insertElement);
                hasChecked.push(insertElement);
            }
        }
        return false
    }

    console.log("initial addToLists", addToLists(fromVertical, fromHorizontal));

    console.log("toCheck start", JSON.stringify(toCheck))

    // on each neighbor, check other neighbors
    while (toCheck.length > 0){
        let checkingNode = toCheck.shift()
        console.log("checkingNode",JSON.stringify(checkingNode))
        if (addToLists(checkingNode.vert, checkingNode.hor)) return true
    }
    return false

}