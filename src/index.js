import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const apiUrl = 'http://localhost:3001/';

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            remaining: props.duration
        };
        this.countDownTimer();
    }

    countDownTimer() {
        const that = this;
        /**
         * Countdown timer every second
         */
        const countDownFunction = setInterval(function() {
            const remaining = that.state.remaining;
            if (remaining === 1) {
                clearInterval(countDownFunction);
                that.props.onTimeOut();
            }
            that.setState({
                remaining: remaining - 1
            })
        }, 1000)
    }

    static formatDuration(duration) {
        let result = '';
        const hours = Math.floor(duration / (60*60));
        const minutes = Math.floor((duration - hours*60*60) / 60);
        const seconds = duration % 60;
        if (hours > 0) {
            result += hours + ':'
        }
        if (minutes < 10) {
            result += '0' + minutes + ':';
        } else {
            result += minutes + ':';
        }
        if (seconds < 10) {
            result += '0' + seconds;
        } else {
            result += seconds;
        }
        return result;
    }

    render() {
        return (
            <div className="timer">
                {Timer.formatDuration(this.state.remaining)}
            </div>
        )
    }
}

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
        const board = Board.prepareBoard(props.board);
        this.state = {
            board: board
        };
    }

    static prepareBoard(boardLetters) {
        return boardLetters.map(function (row) {
            return row.map(function (letter) {
                return {
                    letter: letter,
                    occupied: false
                }
            })
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.submission !== this.props.submission) {
            const board = this.resetBoard();
            this.setState({
                board: board
            }, () => {
                const valid = this.highlightWordOnBoard(this.props.submission);
                if (this.props.submission.length < 3) {
                    this.props.onValidityUpdate(false);
                } else {
                    this.props.onValidityUpdate(valid)
                }
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
        const letters = word.split('');
        for (let i = 0; i < this.state.board.length; i++) {
            for (let j = 0; j < this.state.board[0].length; j++) {
                if (this.state.board[i][j].letter === letters[0]) {
                    if (this.selectActiveDices(letters, i, j)) {
                        return true;
                    }
                }
            }
        }
        return false;
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
            for (let m = i - 1; m <= i + 1; m++) {
                /**
                 * Skip if the window is outside the board
                 */
                if (m === -1 || m === board.length) {
                    continue;
                }
                for (let n = j - 1; n <= j + 1; n++) {
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
                        continue;
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
                /**
                 * Return false if there's single letter match
                 */
                if (p === 1) {
                    return false;
                }
                p--;
                /**
                 * Get last matched dice
                 */
                [i, j] = matchedDices.pop();
                board[i][j].occupied = false;
                unmatchedDices.push([i, j]);
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
            <div className="game-board">
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
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.submitWord = this.submitWord.bind(this);
    }

    handleChange({target}) {
        const transformedWord = target.value.toUpperCase();
        this.setState({
            submission: transformedWord
        });
        this.props.onWordChange(transformedWord);
    }

    handleKeyDown(event) {
        if (this.props.disabled) {
            return;
        }
        if (event.key === 'Enter') {
            this.submitWord();
        }
    }

    submitWord() {
        if (this.props.disabled) {
            return;
        }
        this.props.onWordSubmission();
        this.setState({
            submission: ''
        });
    }

    render() {
        return (
            <div className="word-submission">
                <div className="row">
                    <div className="col-md-12">
                        <input className="input-word"
                               value={this.state.submission}
                               type="text" name="submission" placeholder="Enter word here"
                               onKeyDown={this.handleKeyDown}
                               onChange={this.handleChange}/>
                        <button className="btn btn-sm btn-success"
                                type="submit"
                                onClick={this.submitWord}
                                disabled={this.props.disabled}>
                            Submit
                        </button>
                    </div>
                    {this.props.error && (
                        <div className="col-md-12">
                            <div className="error">
                                {this.props.error}
                            </div>
                        </div>
                    )}

                </div>
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
            <div>
                <b>List of submitted words</b>
            </div>
            {props.words.map((word, i) =>
                <div className="word" key={i}>{word}</div>
            )}
        </div>
    );
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = Game.getInitialState();
        this.fetchBoard();
        this.handleWordChange = this.handleWordChange.bind(this);
        this.handleWordSubmission = this.handleWordSubmission.bind(this);
        this.updateSubmissionValidity = this.updateSubmissionValidity.bind(this);
        this.handleTimeOut = this.handleTimeOut.bind(this);
        this.restart = this.restart.bind(this);
    }

    static getInitialState() {
        return {
            board_id: null,
            board: [],
            submission: '',
            error: '',
            submittedWords: [],
            disabled: true,
            score: 0,
            ended: false
        };
    }

    restart() {
        this.setState(Game.getInitialState());
        this.fetchBoard();
    }

    fetchBoard() {
        fetch(apiUrl + 'boggle/new-game')
            .then(res => res.json())
            .then(data => {
                this.setState({
                    board_id: data.board_id,
                    board: JSON.parse(data.board)
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    handleWordChange(word) {
        this.setState({
            submission: word,
            error: ''
        });
    }

    handleWordSubmission() {
        const word = this.state.submission;
        const submittedWords = this.state.submittedWords.slice(0);
        let score = this.state.score;
        if (!submittedWords.find(submittedword => submittedword === word)) {
            fetch(apiUrl + 'boggle/' + this.state.board_id + '/submit-word/' + word)
                .then(res => res.json())
                .then(data => {
                    if (data.score) {
                        submittedWords.push(word);
                        score += data.score;
                        this.setState({
                            submittedWords: submittedWords,
                            score: score
                        });
                    } else {
                        this.setState({
                            error: data.message
                        })
                    }
                });
        }
        this.setState({
            submission: '',
            disabled: true
        })
    }

    updateSubmissionValidity(valid) {
        this.setState({
            disabled: !valid
        })
    }

    handleTimeOut() {
        this.setState({
            ended: true
        })
    }

    render() {
        return (
            <div className="container">
                <div className="game">
                    <div className="row">
                        <div className="offset-md-4 col-md-4 text-center">
                            <h5>Play Boggle</h5>
                            <h6>Enter valid words of length more than 3 in the input box below.
                                The words need to be formed using the adjacent dices.
                            </h6>
                            {!this.state.ended && (
                                <Timer
                                    duration={180}
                                    onTimeOut={this.handleTimeOut}
                                />
                            )}
                            {this.state.board.length > 0 && (
                                <Board
                                    board={this.state.board}
                                    submission={this.state.submission}
                                    onValidityUpdate={this.updateSubmissionValidity}
                                />
                            )}
                            {!this.state.ended && (
                                <Submission
                                    error={this.state.error}
                                    disabled={this.state.disabled}
                                    onWordChange={this.handleWordChange}
                                    onWordSubmission={this.handleWordSubmission}
                                />
                            )}
                            {this.state.ended && (
                                <div className="timeout">
                                    <div className="message">
                                        Your time is up. You can no longer submit words now.
                                    </div>
                                    <button className="btn btn-sm btn-success restart"
                                            type="submit"
                                            onClick={this.restart}
                                    >
                                        Play New Game
                                    </button>
                                </div>
                            )}
                            <Scorecard score={this.state.score}/>
                            {this.state.submittedWords.length > 0 && (
                                <SubmissionList words={this.state.submittedWords}/>
                            )}
                        </div>
                    </div>
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
