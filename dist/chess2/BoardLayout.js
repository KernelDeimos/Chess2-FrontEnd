import { SubEmitter } from "../game/Emitter";
import { Event } from "../game/Events";
import { Turn } from "../game/model/Turn";
import { Position } from "../helper-js/board";
import { PowerClass } from "../helper-js/PowerClass";
import { And, Not, Either } from "../helper-js/Predicate";
import { JAIL, JUMPING, NORMAL, RESCUE } from "../helper-js/TurnUtil";
import { nextToJail } from "../helper-js/utils";
import { Fish } from "../pieces-js/Fish";
import { FishQueen } from "../pieces-js/FishQueen";
import { Monkey } from "../pieces-js/Monkey";
import { Pieces } from "../pieces-js/pieces";

export class BoardLayout extends PowerClass {

    // Same as: constructor (layout) { this.data = layout; }
    static initializer = PowerClass.DATA_PROPERTY_INITIALIZER;

    static TOPIC_SET = Event.create('set')
    static TOPIC_DEL = Event.create('del')

    // Handler turns "a1", "b2" etc into properties of 'this'
    static handler = {
        get ( target, key ) {
            if ( key in target.data ) return target.data[key];
            
            // Default behaviour
            return Reflect.get(...arguments)
        },
        set ( target, key, val ) {
            target.setData(key, val);
            return true;
        },
        deleteProperty ( target, key ) {
            if ( key in target.data ) {
                target.delData(key);
                return true;
            }

            return Reflect.deleteProperty(...arguments);
        }
    };

    installEmitter (emitter) {
        // Being able to use BoardLayout as a drop-in replacement for a data
        //   object had the consequence that "._unproxied" is needed to set
        //   properties on the "real" this.
        this._unproxied.emitter = emitter;
        console.log('uhhh??', this.data.emitter);
    }

    delData(posID) {
        this.emitter.emit(BoardLayout.TOPIC_DEL, posID);
        delete this.data[posID];
    }
    setData(posID, piece) {
        this.emitter.emit(BoardLayout.TOPIC_SET, posID, piece);
        this.data[posID] = piece;
    }

    get boardLayout () {
        return this.data;
    }

    isEmpty(pos) {
        pos = Position.adapt(pos);
        return this.data[pos.id] == undefined;
    }

    clone() {
        return BoardLayout.create({ ...this.data });
    }

    filterImpossibleMoves (game, moves, currentPos) {
        return moves.filter((elem, index)=>{
            for (let i = 0; i < elem.conditions.length; i++){
                if (
                    !elem.conditions[i](
                        { 
                            board: this,
                            from: currentPos, 
                            to: elem.pos,
                            rookActiveWhite: game.get('rookActiveWhite'),
                            rookActiveBlack: game.get('rookActiveBlack'),
                            thisTurn: this.currentTurn
                        }
                    ) 
                ) {
                    return false
                }
            }
            return true

        })
    }

    validateMove (game, currentTurn, moveInfo) {
        // Note: nothing else uses CurrentTurn class yet, so this is always true
        currentTurn = Turn.adapt(currentTurn);
        let newTurn = Turn.adapt(moveInfo.newTurn);

        const samePlayer = currentTurn.player == newTurn.player;

        const monkeyJumpingStart =
            currentTurn.is(NORMAL) && newTurn.is(JUMPING) && samePlayer;
        
        const monkeyJumpingContinue =
            currentTurn.is(JUMPING) && newTurn.is(JUMPING) && samePlayer;

        const monkeyJumpingStop =
            currentTurn.is(JUMPING) && newTurn.is(NORMAL) && ! samePlayer;

        const monkeyJumpingNonRescue = monkeyJumpingContinue || monkeyJumpingStop;

        const tookRoyalty =
            currentTurn.is(Either(NORMAL, JUMPING)) && newTurn.is(JAIL) && samePlayer;
        
        const didKingRescue =
            currentTurn.is(Either(NORMAL, JUMPING)) && newTurn.is(RESCUE) && samePlayer;
        
        if ( ! (
            (
                currentTurn.is(Either(NORMAL, JAIL, RESCUE)) && 
                newTurn.is(NORMAL) && ! samePlayer 
            ) ||
            tookRoyalty ||
            didKingRescue ||
            monkeyJumpingStart ||
            monkeyJumpingNonRescue
        ) ) {
            return false;
        }

        const jailMoves = currentTurn.is(JAIL);
        const rescueMoves = currentTurn.is(RESCUE);

        if ( jailMoves ) {
            return moveInfo.fromPos?.isTemp() &&
                this.isEmpty(moveInfo.toPos) &&
                moveInfo.toPos.isJailControlledBy(currentTurn.player)
        }

        if ( rescueMoves ) {
            let monkey = this.data['TEMP'];

            const testBoard = this.clone();
            testBoard[monkey.position] = monkey;
            const legalMoves = testBoard.filterImpossibleMoves(
                game, monkey.getJumpingMoves(), monkey.position);
            
            for ( const move of legalMoves ) {
                if ( moveInfo.toPos.equals(move.pos) ) return true;
            }
            
            return false;
        }

        const thisPiece = this.data[moveInfo.fromPos];
        const legalMoves = this.filterImpossibleMoves(
            game, thisPiece.getMoves(), thisPiece.position)
        
        if ( monkeyJumpingStart ) {
            this.data['MONKEY_START'] = new Monkey(
                moveInfo.fromPos, this.data[moveInfo.fromPos].isWhite);
        }

        for ( const move of legalMoves ) {
            if ( moveInfo.toPos.equals(move.pos) ) return true;
        }

        if ( monkeyJumpingNonRescue && moveInfo.fromPos.equals(moveInfo.toPos) ) {
            delete this.data['MONKEY_START'];
            return true;
        }

        return false;
    }
}

export class BoardFactory {
    static create (layoutSpec) {
        const layout = {};

        for ( const [cellID, classID, isWhite] of layoutSpec ) {
            const cls = Pieces.getClassFromID(classID);
            layout[cellID] = new cls(cellID, isWhite);
        }

        return BoardLayout.create(layout);
    }
}

export class BoardLayouts {
    // TODO: move to JSON file now that this is pure data
    static DEFAULT = [
        ["a8", 'Rook', false],
        ["b8", 'Monkey', false],
        ["c8", 'Fish', false],
        ["d8", 'Queen', false],
        ["e8", 'King', false],
        ["f8", 'Fish', false],
        ["g8", 'Monkey', false],
        ["h8", 'Rook', false],

        ["a7", 'Fish', false],
        ["b7", 'Fish', false],
        ["c7", 'Elephant', false],
        ["d7", 'Fish', false],
        ["e7", 'Fish', false],
        ["f7", 'Elephant', false],
        ["g7", 'Fish', false],
        ["h7", 'Fish', false],

        
        ["a1", 'Rook', true],
        ["b1", 'Monkey', true],
        ["c1", 'Fish', true],
        ["d1", 'Queen', true],
        ["e1", 'King', true],
        ["f1", 'Fish', true],
        ["g1", 'Monkey', true],
        ["h1", 'Rook', true],

        ["a2", 'Fish', true],
        ["b2", 'Fish', true],
        ["c2", 'Elephant', true],
        ["d2", 'Fish', true],
        ["e2", 'Fish', true],
        ["f2", 'Elephant', true],
        ["g2", 'Fish', true],
        ["h2", 'Fish', true],

        ["z1", 'Bear'],
    ]
}
