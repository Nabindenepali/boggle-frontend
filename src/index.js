import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={'square' + (props.occupied ? ' occupied' : '')}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        const board = [
            [
                {letter: 'D', occupied: false},
                {letter: 'E', occupied: false},
                {letter: 'H', occupied: false},
                {letter: 'N', occupied: false}
            ],
            [
                {letter: 'K', occupied: false},
                {letter: 'T', occupied: false},
                {letter: 'M', occupied: false},
                {letter: 'B', occupied: false}
            ],
            [
                {letter: 'C', occupied: false},
                {letter: 'R', occupied: false},
                {letter: 'E', occupied: false},
                {letter: 'N', occupied: false}
            ],
            [
                {letter: 'F', occupied: false},
                {letter: 'A', occupied: false},
                {letter: 'D', occupied: false},
                {letter: 'T', occupied: false}
            ]
        ];
        this.state = {
            board: board
        };
    }

    componentDidUpdate(prevProps) {
        if(prevProps.submission !== this.props.submission) {
            const board = this.resetBoard();
            this.setState({
                board: board
            }, () => {
                this.highlightWordOnBoard(this.props.submission)
            });
        }
    }

    resetBoard() {
        let board = JSON.parse(JSON.stringify(this.state.board));
        for (const row of board) {
            for (const dice of row) {
                dice.occupied = false;
            }
        }
        return board;
    }

    highlightWordOnBoard(word) {
        // console.log(this.state.board);
        const letters = word.split('');
        for (let i = 0; i < this.state.board.length; i++) {
            for (let j = 0; j < this.state.board[0].length; j++) {
                if (this.state.board[i][j].letter === letters[0]) {
                    if (this.selectActiveDices(letters, i, j)) {
                        return;
                    }
                }
            }
        }
    }

    selectActiveDices(letters, i, j) {
        const matchedDices = [];
        const unmatchedDices = [];
        const board = JSON.parse(JSON.stringify(this.state.board));
        board[i][j].occupied = true;
        matchedDices.push([i, j]);
        let p = 1;
        /**
         * Check all the remaining letters from index 1
         */
        while (p < letters.length) {
            let letterMatched = false;
            for (let m = i-1; m <= i+1; m++) {
                /**
                 * Skip if the window is outside the board
                 */
                if (m === -1 || m === board.length) {
                    continue;
                }
                for (let n = j-1; n <= j+1; n++) {
                    /**
                     * Skip if the window is outside the board
                     */
                    if (n === -1 || n === board[0].length) {
                        continue;
                    }
                    /**
                     * Skip if the dice is the centre of the current window
                     */
                    if (m === i && n === j) {
                        continue;
                    }
                    /**
                     * Skip if the dice is already occupied
                     */
                    if (board[m][n].occupied) {
                        // continue;
                    }
                    /**
                     * Skip if the dice is already unmatched
                     */
                    if (unmatchedDices.find((dice) => dice[0] === m && dice[1] === n)) {
                        continue;
                    }
                    if (board[m][n].letter === letters[p]) {
                        i = m;
                        j = n;
                        board[i][j].occupied = true;
                        letterMatched = true;
                        matchedDices.push([i, j]);
                        break;
                    }
                }
                if (letterMatched) {
                    p++;
                    break;
                }
            }
            if (!letterMatched) {
                if (p === 1) {
                    return false;
                }
                [i, j] = matchedDices.pop();
                board[i][j].occupied = false;
                unmatchedDices.push([i, j]);
                p--;
            }
        }
        this.setState({
            board: board
        });
        return true;
    }

    renderSquare(i, j) {
        return <Square
            value={this.state.board[i][j].letter}
            occupied={this.state.board[i][j].occupied}
        />;
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0, 0)}
                    {this.renderSquare(0, 1)}
                    {this.renderSquare(0, 2)}
                    {this.renderSquare(0, 3)}
                </div>
                <div className="board-row">
                    {this.renderSquare(1, 0)}
                    {this.renderSquare(1, 1)}
                    {this.renderSquare(1, 2)}
                    {this.renderSquare(1, 3)}
                </div>
                <div className="board-row">
                    {this.renderSquare(2, 0)}
                    {this.renderSquare(2, 1)}
                    {this.renderSquare(2, 2)}
                    {this.renderSquare(2, 3)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3, 0)}
                    {this.renderSquare(3, 1)}
                    {this.renderSquare(3, 2)}
                    {this.renderSquare(3, 3)}
                </div>
            </div>
        );
    }
}

class Submission extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            submission: ''
        };
        this.handleChange= this.handleChange.bind(this);
    }

    handleChange({target}) {
        const transformedWord = target.value.toUpperCase();
        this.setState({
            submission: transformedWord
        });
        this.props.onWordChange(transformedWord);
    }

    render() {
        return (
            <div className="word-submission">
                <input className="input-word"
                       value={this.state.submission}
                       type="text" name="submission" placeholder="Enter word here"
                       onChange={this.handleChange}/>
                <button type="submit" onClick={this.props.onWordSubmission}>Submit</button>
            </div>
        );
    }
}

function Scorecard(props) {
    return (
        <div className="score-card">
            <p>Total score: {props.score}</p>
        </div>
    );
}

function SubmissionList(props) {
    return (
        <div className="submitted-words">
            {props.words.map((word) =>
                <p>{word}</p>
            )}
        </div>
    );
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            submission: '',
            submittedWords: []
        };
        this.handleWordChange= this.handleWordChange.bind(this);
        this.handleWordSubmission= this.handleWordSubmission.bind(this);
    }

    handleWordChange(word) {
        this.setState({
            submission: word
        });
    }

    handleWordSubmission() {
        const word = this.state.submission;
        const submittedWords = this.state.submittedWords.slice(0);
        if (!submittedWords.find(submittedword => submittedword === word)) {
            if (this.isValidWord(word)) {
                submittedWords.push(word);
            } else {
                this.setState({
                    submission: ''
                });
            }
        }
        this.setState({
            submission: '',
            submittedWords: submittedWords
        });
    }

    isValidWord(word) {
        const words = ['FARE', 'FADE', 'FRET', 'FACT'];
        return words.findIndex(wrd => wrd === word) > -1;
    }

    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board submission={this.state.submission}/>
                    <Submission
                        onWordChange={this.handleWordChange}
                        onWordSubmission={this.handleWordSubmission}
                    />
                    <Scorecard score={10}/>
                    <SubmissionList words={this.state.submittedWords}/>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
