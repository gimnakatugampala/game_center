// pages/snake-ladder.js
'use client';

import React , { Component }  from "react";
import styles from "../../../../styles/SnakeLadder.module.css"; // අපි මේ CSS file එක ඊළඟට හදමු
import GameBoard from "../../components/snake-ladder/GameBoard";

// Helper function: Array එකක් shuffle කරන්න (Choices 3 randomize කරන්න)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// අපේ Class Component එක
class SnakeLadderGame extends Component {
  // 1. Constructor: Component එක පටන් ගනිද්දී State එක හදාගැනීම
  constructor(props) {
    super(props);

    // 'this.state' තමයි මේ component එකේ මතකය (memory)
    this.state = {
      n: 6, // Board size (default 6)
      playerName: "", // ක්‍රීඩකයාගේ නම
      isLoading: false, // API එකෙන් data එනකල් loading... පෙන්නන්න
      error: null, // Error එකක් ආවොත් පෙන්නන්න
      gameData: null, // API එකෙන් එන game data (snakes, ladders, minThrows...)
      correctAnswer: 0, // API එකෙන් එන නියම උත්තරේ
      choices: [], // User ට දෙන choices 3
      playerGuess: null, // User තෝරගත්ත choice එක
      gameResult: null, // 'win' or 'lose'
    };

    // Class component වලදී function গুলি bind කරන්න ඕන
    this.handleNChange = this.handleNChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleStartGame = this.handleStartGame.bind(this);
    this.handleGuessChange = this.handleGuessChange.bind(this);
    this.handleSubmitAnswer = this.handleSubmitAnswer.bind(this);
    this.handlePlayAgain = this.handlePlayAgain.bind(this);
  }

  // 2. Event Handlers (User කරන දේවල් වලට- Input, Button Click)

  // Board size input එක වෙනස් කරද්දී
  handleNChange(event) {
    this.setState({ n: event.target.value });
  }

  // Player name input එක වෙනස් කරද්දී
  handleNameChange(event) {
    this.setState({ playerName: event.target.value });
  }

  // User තමන්ගේ guess එක select කරද්දී
  handleGuessChange(event) {
    this.setState({ playerGuess: parseInt(event.target.value, 10) });
  }

  // "Start Game" button එක click කරද්දී
  async handleStartGame(event) {
    event.preventDefault(); // Form එක submit වෙන එක නවත්තන්න

    // Validation
    if (!this.state.playerName) {
      this.setState({ error: "Enter your Name." });
      return;
    }
    const n = parseInt(this.state.n, 10);
    if (n < 6 || n > 12) {
      this.setState({ error: "Board size between 6-12." });
      return;
    }

    this.setState({ isLoading: true, error: null, gameResult: null });

    try {
      // අපි හදපු API එකට POST request එක යවනවා
      const res = await fetch("/api/game/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ N: this.state.n }),
      });

      const jsonResponse = await res.json();

      if (!res.ok) {
        // API එකෙන් error එකක් ආවොත්
        throw new Error(jsonResponse.message || "Error! loarding the game.");
      }

      // API එකෙන් Data ආවා!
      const gameData = jsonResponse.data;
      const correctAnswer = gameData.minThrows;

      // User ට choices 3ක් හදමු
      // (උදා: [answer-1, answer, answer+2])
      // 1 ට වඩා අඩු උත්තර එන එක වලක්වමු
      const choice1 = correctAnswer <= 1 ? 1 : correctAnswer - 1;
      const choice2 = correctAnswer;
      const choice3 = correctAnswer + (Math.random() < 0.5 ? 1 : 2); // 1ක් හෝ 2ක් එකතු කරමු

      const choices = shuffleArray([choice1, choice2, choice3]);

      // State එක update කරමු
      this.setState({
        gameData: gameData,
        correctAnswer: correctAnswer,
        choices: choices,
        isLoading: false,
      });
    } catch (err) {
      // Error එකක් ආවොත් state එකේ save කරමු
      this.setState({
        isLoading: false,
        error: err.message,
      });
    }
  }

  // "Submit Answer" button එක click කරද්දී
  async handleSubmitAnswer(event) {
    // <-- මෙතන "async" එකතු කළා
    event.preventDefault();

    if (this.state.playerGuess === null) {
      this.setState({ error: "Select one answer." });
      return;
    }

    // උත්තරේ හරිද බලමු
    if (this.state.playerGuess === this.state.correctAnswer) {
      // ***** WIN (දිනුම්) *****
      try {
        // 1. මුලින්ම UI එක "Win" කියලා පෙන්නමු
        this.setState({ gameResult: "win", error: null, isLoading: true });

        // 2. Database එකේ save කරන්න API එකට data යවමු
        const res = await fetch("/api/game/save-result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerName: this.state.playerName,
            correctAnswer: this.state.correctAnswer,
            boardSize: this.state.gameData.boardSize,
            timeTaken: this.state.gameData.timeTaken, // Algorithms දෙකේම වෙලාව
          }),
        });

        if (!res.ok) {
          // API එකෙන් error එකක් ආවොත්
          const errData = await res.json();
          throw new Error(errData.message || "Data save කිරීමේ දෝෂයක්.");
        }

        // 3. Data save කරලා ඉවරයි.
        this.setState({ isLoading: false }); // Loading එක අයින් කරමු
      } catch (err) {
        // API error එකක් ආවොත් UI එකේ පෙන්නමු
        this.setState({
          isLoading: false,
          // Win උනා, ඒත් error එකක් ආවා කියලා පෙන්නන්න
          // (අපි error එක win message එක යටින් පෙන්නමු)
          error: `Error : ${err.message}`,
        });
      }
    } else {
      // ***** LOSE (පැරදුම්) *****
      this.setState({ gameResult: "lose", error: null });
    }
  }

  // "Play Again" button එක click කරද්දී
  handlePlayAgain() {
    // හැමදේම මුලට reset කරමු (player name එක ඇර)
    this.setState({
      n: 6,
      isLoading: false,
      error: null,
      gameData: null,
      correctAnswer: 0,
      choices: [],
      playerGuess: null,
      gameResult: null,
    });
  }

  // 3. Render Method: UI එක පෙන්නන function එක
  render() {
    const { n, playerName, isLoading, error, gameData, gameResult, choices } =
      this.state;

    // --- Part 1: Game එක පටන් ගෙන නැත්නම් (Start Form එක) ---
    if (!gameData && !isLoading) {
      return (
        <div className={styles.container}>
          <h1>Snake & Ladder - Minimum Number of Term?</h1>
          <form onSubmit={this.handleStartGame} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="playerName">Your Name:</label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={this.handleNameChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="n-size">Board Size (N x N) - (6 - 12):</label>
              <input
                type="number"
                id="n-size"
                value={n}
                onChange={this.handleNChange}
                min="6"
                max="12"
              />
            </div>
            <button type="submit" className={styles.btn}>
              Start the game!
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </div>
      );
    }

    // --- Part 2: Loading... ---
    if (isLoading) {
      return (
        <div className={styles.container}>
          <p>Processing the game...</p>
        </div>
      );
    }

    // --- Part 3: Error එකක් ආවොත් ---
    if (error && !gameData) {
      return (
        <div className={styles.container}>
          <p className={styles.error}>Error: {error}</p>
          <button onClick={this.handlePlayAgain} className={styles.btn}>
            Try again
          </button>
        </div>
      );
    }

    // --- Part 4: Game එක Play කරන තැන ---
    if (gameData && !gameResult) {
      return (
        <div className={styles.container}>
          <h2>{playerName}, Started the game!</h2>
          <p>
            Board Size:{" "}
            <strong>
              {gameData.boardSize} x {gameData.boardSize}
            </strong>
          </p>
          <p>
            Number of Snakes:{" "}
            {gameData.snakesAndLadders.filter((m) => m.type === "snake").length}
          </p>
          <p>
            Number of Ladders:{" "}
            {
              gameData.snakesAndLadders.filter((m) => m.type === "ladder")
                .length
            }
          </p>

          <GameBoard
            size={gameData.boardSize}
            moves={gameData.snakesAndLadders}
          />

          <form onSubmit={this.handleSubmitAnswer}>
            <h3>Question:</h3>
            <p>
              This is the last Box in the game (
              {gameData.boardSize * gameData.boardSize}) What is the minimum number of dice rolls required to go?
        
            </p>

            <div className={styles.choices}>
              {choices.map((choice) => (
                <label key={choice} className={styles.choiceLabel}>
                  <input
                    type="radio"
                    name="guess"
                    value={choice}
                    onChange={this.handleGuessChange}
                  />
                  {choice}
                </label>
              ))}
            </div>

            <button type="submit" className={styles.btn}>
              Confirm the Answer
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </div>
      );
    }

    // ...
    // --- Part 5: Game එක ඉවර උනාම (Result එක) ---
    if (gameResult) {
      return (
        <div className={styles.container}>
          {gameResult === "win" ? (
            <div className={styles.resultWin}>
              <h2>Congratulation Required number of term:{" "}
                {this.state.correctAnswer}
              </h2>
            </div>
          ) : (
            <div className={styles.resultLose}>
              <h2>You loss the game.</h2>
              <p>Correct Answer: {this.state.correctAnswer}</p>
              <p>You selected: {this.state.playerGuess}</p>
            </div>
          )}

          {/* ----- අලුතින් එකතු කළා ----- */}
          {isLoading && <p>Data Processig...</p>}
          {error && <p className={styles.error}>{error}</p>}
          {/* ----------------------------- */}

          <button onClick={this.handlePlayAgain} className={styles.btn}>
            Lets play again
          </button>
        </div>
      );
    }
    // ...

    // Default (මේක වෙන්න බෑ, ඒත් දානවා)
    return <div className={styles.container}>Loading...</div>;
  }
}

export default SnakeLadderGame;
