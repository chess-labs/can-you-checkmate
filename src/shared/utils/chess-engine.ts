export interface Position {
  file: number; // 0-7 (a-h)
  rank: number; // 0-7 (1-8)
}

export interface PiecePosition {
  position: Position;
  piece: 'wK' | 'bK' | 'bN';
}

export interface BoardState {
  whiteKing: Position | null;
  blackKing: Position | null;
  knight1: Position | null;
  knight2: Position | null;
  currentTurn: 'white' | 'black';
}

export interface AnalysisResult {
  canCheckmate: boolean;
  attackedSquares: Position[];
  escapeSquares: Position[];
  blockedEscapes: Position[];
  reason: string;
  isInCheck: boolean;
  currentTurn: 'white' | 'black';
}

export const chessEngine = {
  // Convert chess notation to position
  positionFromSquare: (square: string): Position => {
    const file = square.charCodeAt(0) - 97; // a=0, b=1, ...
    const rank = parseInt(square[1]) - 1; // 1=0, 2=1, ...
    return { file, rank };
  },

  // Convert position to chess notation
  squareFromPosition: (pos: Position): string => {
    const file = String.fromCharCode(97 + pos.file);
    const rank = (pos.rank + 1).toString();
    return file + rank;
  },

  // Check if position is valid on board
  isValidPosition: (pos: Position): boolean => {
    return pos.file >= 0 && pos.file <= 7 && pos.rank >= 0 && pos.rank <= 7;
  },

  // Check if a square is light or dark
  isLightSquare: (pos: Position): boolean => {
    return (pos.file + pos.rank) % 2 === 0;
  },

  // Calculate knight moves from a position
  calculateKnightMoves: (pos: Position): Position[] => {
    const moves = [
      { file: pos.file + 2, rank: pos.rank + 1 },
      { file: pos.file + 2, rank: pos.rank - 1 },
      { file: pos.file - 2, rank: pos.rank + 1 },
      { file: pos.file - 2, rank: pos.rank - 1 },
      { file: pos.file + 1, rank: pos.rank + 2 },
      { file: pos.file + 1, rank: pos.rank - 2 },
      { file: pos.file - 1, rank: pos.rank + 2 },
      { file: pos.file - 1, rank: pos.rank - 2 },
    ];

    return moves.filter(chessEngine.isValidPosition);
  },

  // Calculate king moves from a position
  calculateKingMoves: (pos: Position): Position[] => {
    const moves = [
      { file: pos.file + 1, rank: pos.rank },
      { file: pos.file - 1, rank: pos.rank },
      { file: pos.file, rank: pos.rank + 1 },
      { file: pos.file, rank: pos.rank - 1 },
      { file: pos.file + 1, rank: pos.rank + 1 },
      { file: pos.file + 1, rank: pos.rank - 1 },
      { file: pos.file - 1, rank: pos.rank + 1 },
      { file: pos.file - 1, rank: pos.rank - 1 },
    ];

    return moves.filter(chessEngine.isValidPosition);
  },

  // Get all squares attacked by knights
  getAttackedSquares: (knight1: Position | null, knight2: Position | null): Position[] => {
    const attacked: Position[] = [];

    if (knight1) {
      attacked.push(...chessEngine.calculateKnightMoves(knight1));
    }

    if (knight2) {
      attacked.push(...chessEngine.calculateKnightMoves(knight2));
    }

    // Remove duplicates
    return attacked.filter(
      (pos, index, self) => index === self.findIndex((p) => p.file === pos.file && p.rank === pos.rank)
    );
  },

  // Get all squares attacked by black pieces (knights + black king)
  getAllAttackedSquares: (
    knight1: Position | null,
    knight2: Position | null,
    blackKing: Position | null
  ): Position[] => {
    const attacked: Position[] = [];

    // Add knight attacks
    if (knight1) {
      attacked.push(...chessEngine.calculateKnightMoves(knight1));
    }

    if (knight2) {
      attacked.push(...chessEngine.calculateKnightMoves(knight2));
    }

    // Add black king attacks
    if (blackKing) {
      attacked.push(...chessEngine.calculateKingMoves(blackKing));
    }

    // Remove duplicates
    return attacked.filter(
      (pos, index, self) => index === self.findIndex((p) => p.file === pos.file && p.rank === pos.rank)
    );
  },

  // Check if two positions are equal
  positionsEqual: (pos1: Position, pos2: Position): boolean => {
    return pos1.file === pos2.file && pos1.rank === pos2.rank;
  },

  // Check if two kings are adjacent (invalid in chess)
  areKingsAdjacent: (king1: Position, king2: Position): boolean => {
    const fileDiff = Math.abs(king1.file - king2.file);
    const rankDiff = Math.abs(king1.rank - king2.rank);
    // Kings are adjacent if they are within 1 square of each other
    return fileDiff <= 1 && rankDiff <= 1 && !(fileDiff === 0 && rankDiff === 0);
  },

  // Check if a knight move is valid
  isValidKnightMove: (from: Position, to: Position): boolean => {
    const validMoves = chessEngine.calculateKnightMoves(from);
    return validMoves.some((move) => chessEngine.positionsEqual(move, to));
  },

  // Check if a king move is valid
  isValidKingMove: (from: Position, to: Position): boolean => {
    const validMoves = chessEngine.calculateKingMoves(from);
    return validMoves.some((move) => chessEngine.positionsEqual(move, to));
  },

  // Check if a piece move is valid based on piece type
  isValidPieceMove: (pieceType: string, from: Position, to: Position): boolean => {
    if (pieceType === 'wK' || pieceType === 'bK') {
      return chessEngine.isValidKingMove(from, to);
    } else if (pieceType === 'bN') {
      return chessEngine.isValidKnightMove(from, to);
    }
    return false;
  },

  // Analyze checkmate possibility
  analyzeCheckmate: (board: BoardState): AnalysisResult => {
    if (!board.whiteKing || !board.blackKing || !board.knight1 || !board.knight2) {
      return {
        canCheckmate: false,
        attackedSquares: [],
        escapeSquares: [],
        blockedEscapes: [],
        reason: '모든 기물이 배치되어야 합니다.',
        isInCheck: false,
        currentTurn: board.currentTurn,
      };
    }

    // Get all attacked squares including both knights and black king
    const attackedSquares = chessEngine.getAllAttackedSquares(board.knight1, board.knight2, board.blackKing);
    const kingMoves = chessEngine.calculateKingMoves(board.whiteKing);

    // Check if king is in check (only knights can give check, not the black king)
    const knightAttackedSquares = chessEngine.getAttackedSquares(board.knight1, board.knight2);
    const isInCheck = knightAttackedSquares.some((pos) => chessEngine.positionsEqual(pos, board.whiteKing!));

    // Find escape squares (king moves that are not attacked)
    const escapeSquares = kingMoves.filter(
      (move) => !attackedSquares.some((attacked) => chessEngine.positionsEqual(move, attacked))
    );

    // Find blocked escapes
    const blockedEscapes = kingMoves.filter((move) =>
      attackedSquares.some((attacked) => chessEngine.positionsEqual(move, attacked))
    );

    // Analyze bipartite graph constraint
    const knight1OnLight = chessEngine.isLightSquare(board.knight1);
    const knight2OnLight = chessEngine.isLightSquare(board.knight2);

    // Knights on same color squares can't attack all escape squares
    if (knight1OnLight === knight2OnLight) {
      const lightEscapes = escapeSquares.filter(chessEngine.isLightSquare);
      const darkEscapes = escapeSquares.filter((pos) => !chessEngine.isLightSquare(pos));

      const unattackableEscapes = knight1OnLight ? lightEscapes : darkEscapes;

      if (unattackableEscapes.length > 0) {
        return {
          canCheckmate: false,
          attackedSquares: knightAttackedSquares, // Show only knight attacks for bipartite graph visualization
          escapeSquares,
          blockedEscapes,
          reason: `이분 그래프 제약: 같은 색 칸의 나이트들은 ${
            knight1OnLight ? '어두운' : '밝은'
          } 칸으로의 탈출을 막을 수 없습니다.`,
          isInCheck,
          currentTurn: board.currentTurn,
        };
      }
    }

    // Check if it's checkmate
    const canCheckmate = isInCheck && escapeSquares.length === 0;

    return {
      canCheckmate,
      attackedSquares: knightAttackedSquares, // Show only knight attacks for clarity
      escapeSquares,
      blockedEscapes,
      reason: canCheckmate
        ? '체크메이트 가능!'
        : escapeSquares.length > 0
        ? `왕이 ${escapeSquares.length}개의 탈출 경로를 가지고 있습니다.`
        : '왕이 체크 상태가 아닙니다.',
      isInCheck,
      currentTurn: board.currentTurn,
    };
  },

  // Generate random board positions
  generateRandomScenario: (): BoardState => {
    const randomPos = (): Position => ({
      file: Math.floor(Math.random() * 8),
      rank: Math.floor(Math.random() * 8),
    });

    // Step 1: Place kings first, ensuring they're not adjacent
    let whiteKing: Position;
    let blackKing: Position;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      whiteKing = randomPos();
      blackKing = randomPos();
      attempts++;

      if (attempts > maxAttempts) {
        // Fallback to safe king positions
        whiteKing = { file: 3, rank: 3 };
        blackKing = { file: 7, rank: 7 };
        break;
      }
    } while (chessEngine.positionsEqual(whiteKing, blackKing) || chessEngine.areKingsAdjacent(whiteKing, blackKing));

    // Step 2: Place knights, avoiding king positions
    let knight1: Position;
    let knight2: Position;
    attempts = 0;

    do {
      knight1 = randomPos();
      knight2 = randomPos();
      attempts++;

      if (attempts > maxAttempts) {
        // Fallback knight positions
        knight1 = { file: 1, rank: 1 };
        knight2 = { file: 5, rank: 5 };
        break;
      }
    } while (
      chessEngine.positionsEqual(knight1, knight2) ||
      chessEngine.positionsEqual(knight1, whiteKing) ||
      chessEngine.positionsEqual(knight1, blackKing) ||
      chessEngine.positionsEqual(knight2, whiteKing) ||
      chessEngine.positionsEqual(knight2, blackKing)
    );

    return { whiteKing, blackKing, knight1, knight2, currentTurn: 'white' };
  },

  // Generate scenarios that attempt optimal attack
  generateOptimalAttackScenario: (): BoardState => {
    // Place kings safely apart
    const whiteKing = { file: 3, rank: 3 };
    const blackKing = { file: 0, rank: 7 };

    // Place knights to attack maximum squares around white king
    const knight1 = { file: 1, rank: 2 };
    const knight2 = { file: 5, rank: 2 };

    return { whiteKing, blackKing, knight1, knight2, currentTurn: 'white' };
  },

  // Find counterexample scenarios
  generateCounterexample: (): BoardState => {
    // Classic counterexample: knights on same color squares
    const whiteKing = { file: 3, rank: 3 };
    const blackKing = { file: 7, rank: 0 };
    const knight1 = { file: 1, rank: 1 }; // Light square
    const knight2 = { file: 5, rank: 5 }; // Light square

    return { whiteKing, blackKing, knight1, knight2, currentTurn: 'white' };
  },

  // Check if a piece belongs to the current turn
  isPieceForCurrentTurn: (pieceType: string, currentTurn: 'white' | 'black'): boolean => {
    if (currentTurn === 'white') {
      return pieceType.startsWith('w'); // wK
    } else {
      return pieceType.startsWith('b'); // bK, bN
    }
  },

  // Switch turn
  switchTurn: (currentTurn: 'white' | 'black'): 'white' | 'black' => {
    return currentTurn === 'white' ? 'black' : 'white';
  },

  // Check if current turn's king is in check
  isCurrentPlayerInCheck: (board: BoardState): boolean => {
    if (board.currentTurn === 'white') {
      // Check if white king is in check from black pieces
      if (!board.whiteKing) return false;

      // Check attacks from knights
      if (board.knight1) {
        const knight1Attacks = chessEngine.calculateKnightMoves(board.knight1);
        if (knight1Attacks.some((pos) => chessEngine.positionsEqual(pos, board.whiteKing!))) {
          return true;
        }
      }

      if (board.knight2) {
        const knight2Attacks = chessEngine.calculateKnightMoves(board.knight2);
        if (knight2Attacks.some((pos) => chessEngine.positionsEqual(pos, board.whiteKing!))) {
          return true;
        }
      }

      // Check attack from black king
      if (board.blackKing) {
        const blackKingAttacks = chessEngine.calculateKingMoves(board.blackKing);
        if (blackKingAttacks.some((pos) => chessEngine.positionsEqual(pos, board.whiteKing!))) {
          return true;
        }
      }

      return false;
    } else {
      // Check if black king is in check from white pieces (only white king in this scenario)
      if (!board.blackKing || !board.whiteKing) return false;

      const whiteKingAttacks = chessEngine.calculateKingMoves(board.whiteKing);
      return whiteKingAttacks.some((pos) => chessEngine.positionsEqual(pos, board.blackKing!));
    }
  },

  // Get turn display name
  getTurnDisplayName: (turn: 'white' | 'black'): string => {
    return turn === 'white' ? '백' : '흑';
  },

  // Get all possible moves for a piece
  getPossibleMoves: (pieceType: string, position: Position, board: BoardState): Position[] => {
    let possibleMoves: Position[] = [];

    if (pieceType === 'wK' || pieceType === 'bK') {
      possibleMoves = chessEngine.calculateKingMoves(position);
    } else if (pieceType === 'bN') {
      possibleMoves = chessEngine.calculateKnightMoves(position);
    }

    // Filter out moves that would result in invalid positions
    return possibleMoves.filter((targetPos) => {
      // Can't move to a square occupied by another piece
      const isOccupied =
        (board.whiteKing && chessEngine.positionsEqual(board.whiteKing, targetPos)) ||
        (board.blackKing && chessEngine.positionsEqual(board.blackKing, targetPos)) ||
        (board.knight1 && chessEngine.positionsEqual(board.knight1, targetPos)) ||
        (board.knight2 && chessEngine.positionsEqual(board.knight2, targetPos));

      if (isOccupied) return false;

      // Kings can't be adjacent to each other
      if (pieceType === 'wK' || pieceType === 'bK') {
        const otherKing = pieceType === 'wK' ? board.blackKing : board.whiteKing;
        if (otherKing && chessEngine.areKingsAdjacent(targetPos, otherKing)) {
          return false;
        }
      }

      return true;
    });
  },

  // Get all possible moves for the current turn
  getAllPossibleMovesForTurn: (board: BoardState): { piece: string; from: Position; to: Position[] }[] => {
    const moves: { piece: string; from: Position; to: Position[] }[] = [];

    if (board.currentTurn === 'white') {
      // White king moves
      if (board.whiteKing) {
        const possibleMoves = chessEngine.getPossibleMoves('wK', board.whiteKing, board);
        if (possibleMoves.length > 0) {
          moves.push({ piece: 'wK', from: board.whiteKing, to: possibleMoves });
        }
      }
    } else {
      // Black pieces moves
      if (board.blackKing) {
        const possibleMoves = chessEngine.getPossibleMoves('bK', board.blackKing, board);
        if (possibleMoves.length > 0) {
          moves.push({ piece: 'bK', from: board.blackKing, to: possibleMoves });
        }
      }

      if (board.knight1) {
        const possibleMoves = chessEngine.getPossibleMoves('bN', board.knight1, board);
        if (possibleMoves.length > 0) {
          moves.push({ piece: 'bN', from: board.knight1, to: possibleMoves });
        }
      }

      if (board.knight2) {
        const possibleMoves = chessEngine.getPossibleMoves('bN', board.knight2, board);
        if (possibleMoves.length > 0) {
          moves.push({ piece: 'bN', from: board.knight2, to: possibleMoves });
        }
      }
    }

    return moves;
  },
};
