import { useCallback, useMemo, useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { chessEngine, type BoardState, type Position } from '~/shared/utils/chess-engine';

const PROOF_STEPS = [
  {
    id: 'bipartite-intro',
    title: '이분 그래프 이론 소개',
    content:
      '체스판은 흰색과 검은색 칸으로 나뉜 이분 그래프입니다. 나이트는 항상 다른 색깔의 칸으로만 이동할 수 있습니다.',
    highlightType: 'bipartite' as const,
    algorithmExplanation: '체스판을 그래프 G = (V₁ ∪ V₂, E)로 모델링합니다. V₁은 밝은 칸, V₂는 어두운 칸을 나타냅니다.',
  },
  {
    id: 'color-constraint',
    title: '색깔 제약 조건',
    content: '밝은 칸의 나이트는 어두운 칸만 공격 가능하고, 어두운 칸의 나이트는 밝은 칸만 공격 가능합니다.',
    highlightType: 'knight-attacks' as const,
    algorithmExplanation: '현재 나이트들의 공격 패턴을 분석합니다.',
  },
  {
    id: 'escape-analysis',
    title: '탈출 경로 분석',
    content:
      '왕 주변 8칸 중 절반은 밝은 칸, 절반은 어두운 칸입니다. 같은 색 칸의 나이트들은 한 색깔의 탈출 경로를 막을 수 없습니다.',
    highlightType: 'escape-routes' as const,
    algorithmExplanation: '왕 주변의 탈출 가능한 칸들을 분석합니다.',
  },
  {
    id: 'mathematical-conclusion',
    title: '수학적 결론',
    content:
      '두 나이트가 같은 색 칸에 있으면 완전한 지배 집합(dominating set)을 형성할 수 없어 체크메이트가 불가능합니다.',
    highlightType: 'conclusion' as const,
    algorithmExplanation: '집합론적 증명: |공격가능칸| < |전체탈출칸| ⟹ ∃ 안전한 탈출 경로',
  },
];

export const HomePage = () => {
  const [boardState, setBoardState] = useState<BoardState>(chessEngine.generateRandomScenario());
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3); // 3초 타이머
  const [showProofSteps, setShowProofSteps] = useState(true); // 단계별 증명 표시 여부

  // Auto-play functionality with timer
  useEffect(() => {
    if (!isAutoPlaying) {
      setTimeRemaining(3); // 자동재생이 꺼지면 타이머 리셋
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          // 타이머가 0 이하가 되면 다음 단계로 넘어가고 타이머 리셋
          setCurrentStep((prevStep) => (prevStep + 1) % PROOF_STEPS.length);
          return 3; // 3초로 리셋
        }
        return newValue; // 1초씩 감소
      });
    }, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Convert board state to react-chessboard format
  const boardPosition = useMemo(() => {
    const position: { [square: string]: { pieceType: string } } = {};

    if (boardState.whiteKing) {
      position[chessEngine.squareFromPosition(boardState.whiteKing)] = { pieceType: 'wK' };
    }
    if (boardState.blackKing) {
      position[chessEngine.squareFromPosition(boardState.blackKing)] = { pieceType: 'bK' };
    }
    if (boardState.knight1) {
      position[chessEngine.squareFromPosition(boardState.knight1)] = { pieceType: 'bN' };
    }
    if (boardState.knight2) {
      position[chessEngine.squareFromPosition(boardState.knight2)] = { pieceType: 'bN' };
    }

    return position;
  }, [boardState]);

  // Calculate analysis result
  const analysisResult = useMemo(() => chessEngine.analyzeCheckmate(boardState), [boardState]);

  // Calculate detailed mathematical proof data
  const proofData = useMemo(() => {
    const knight1Pos = boardState.knight1;
    const knight2Pos = boardState.knight2;
    const whiteKingPos = boardState.whiteKing;

    if (!knight1Pos || !knight2Pos || !whiteKingPos) return null;

    const knight1IsLight = chessEngine.isLightSquare(knight1Pos);
    const knight2IsLight = chessEngine.isLightSquare(knight2Pos);
    const sameColorKnights = knight1IsLight === knight2IsLight;

    // Get all squares around the king
    const kingAdjacentSquares: Position[] = [];
    for (let deltaFile = -1; deltaFile <= 1; deltaFile++) {
      for (let deltaRank = -1; deltaRank <= 1; deltaRank++) {
        if (deltaFile === 0 && deltaRank === 0) continue;
        const pos = {
          file: whiteKingPos.file + deltaFile,
          rank: whiteKingPos.rank + deltaRank,
        };
        if (chessEngine.isValidPosition(pos)) {
          kingAdjacentSquares.push(pos);
        }
      }
    }

    const lightSquares = kingAdjacentSquares.filter(chessEngine.isLightSquare);
    const darkSquares = kingAdjacentSquares.filter((pos) => !chessEngine.isLightSquare(pos));

    // Calculate knight attack coverage
    const knight1Attacks = chessEngine.calculateKnightMoves(knight1Pos);
    const knight2Attacks = chessEngine.calculateKnightMoves(knight2Pos);
    const totalKnightAttacks = [...knight1Attacks, ...knight2Attacks];

    const attackedLightSquares = totalKnightAttacks.filter(chessEngine.isLightSquare);
    const attackedDarkSquares = totalKnightAttacks.filter((pos) => !chessEngine.isLightSquare(pos));

    return {
      sameColorKnights,
      knight1IsLight,
      knight2IsLight,
      totalSquares: kingAdjacentSquares.length,
      lightSquares: lightSquares.length,
      darkSquares: darkSquares.length,
      attackedLightSquares: attackedLightSquares.length,
      attackedDarkSquares: attackedDarkSquares.length,
      lightSquarePositions: lightSquares,
      darkSquarePositions: darkSquares,
      unattackableSquares: sameColorKnights ? (knight1IsLight ? darkSquares : lightSquares) : [],
    };
  }, [boardState]);

  // Handle piece drops
  const onDrop = useCallback(
    ({
      piece,
      sourceSquare,
      targetSquare,
    }: {
      piece: { isSparePiece: boolean; pieceType: string; position: string };
      sourceSquare: string;
      targetSquare: string | null;
    }) => {
      if (!targetSquare || !piece.pieceType || !sourceSquare) return false;

      // Check if it's the correct turn to move this piece
      if (!chessEngine.isPieceForCurrentTurn(piece.pieceType, boardState.currentTurn)) {
        return false; // Can't move opponent's pieces
      }

      const sourcePos = chessEngine.positionFromSquare(sourceSquare);
      const targetPos = chessEngine.positionFromSquare(targetSquare);

      // Validate the move is legal for this piece type
      if (!chessEngine.isValidPieceMove(piece.pieceType, sourcePos, targetPos)) {
        return false;
      }

      // Check if target square is occupied by another piece
      const isTargetOccupied = (pos: Position) => {
        return (
          (boardState.whiteKing && chessEngine.positionsEqual(boardState.whiteKing, pos)) ||
          (boardState.blackKing && chessEngine.positionsEqual(boardState.blackKing, pos)) ||
          (boardState.knight1 && chessEngine.positionsEqual(boardState.knight1, pos)) ||
          (boardState.knight2 && chessEngine.positionsEqual(boardState.knight2, pos))
        );
      };

      if (isTargetOccupied(targetPos)) {
        // Don't allow moving to a square occupied by another piece
        return false;
      }

      // Check if kings would be adjacent after the move (invalid in chess)
      const isKingMove = piece.pieceType === 'wK' || piece.pieceType === 'bK';
      if (isKingMove) {
        const otherKing = piece.pieceType === 'wK' ? boardState.blackKing : boardState.whiteKing;
        if (otherKing) {
          if (chessEngine.areKingsAdjacent(targetPos, otherKing)) {
            // Don't allow kings to be adjacent - this is illegal in chess
            return false;
          }
        }
      }

      setBoardState((prev) => {
        const newState = { ...prev };

        // Update piece position
        if (piece.pieceType === 'wK') {
          newState.whiteKing = targetPos;
        } else if (piece.pieceType === 'bK') {
          newState.blackKing = targetPos;
        } else if (piece.pieceType === 'bN') {
          // Determine which knight is being moved by checking source position
          if (boardState.knight1 && chessEngine.positionsEqual(boardState.knight1, sourcePos)) {
            newState.knight1 = targetPos;
          } else if (boardState.knight2 && chessEngine.positionsEqual(boardState.knight2, sourcePos)) {
            newState.knight2 = targetPos;
          }
        }

        // Switch turn after successful move
        newState.currentTurn = chessEngine.switchTurn(prev.currentTurn);

        return newState;
      });

      return true;
    },
    [boardState]
  );

  // Custom square styles for highlighting based on current proof step or move highlights
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Check highlighting - always applies regardless of proof steps
    if (chessEngine.isCurrentPlayerInCheck(boardState) && boardState.whiteKing) {
      const whiteKingSquare = chessEngine.squareFromPosition(boardState.whiteKing);
      styles[whiteKingSquare] = {
        backgroundColor: 'rgba(239, 68, 68, 0.8)', // bright red
        border: '3px solid #dc2626',
        boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
      };
    }

    if (!showProofSteps) {
      // Show possible moves when proof steps are off
      const allPossibleMoves = chessEngine.getAllPossibleMovesForTurn(boardState);

      allPossibleMoves.forEach(({ piece, to }) => {
        to.forEach((pos) => {
          const square = chessEngine.squareFromPosition(pos);

          // Don't override check highlighting
          if (styles[square]) return;

          if (piece === 'wK') {
            // White king moves in light blue
            styles[square] = {
              backgroundColor: 'rgba(147, 197, 253, 0.7)', // light blue
              border: '2px solid #3b82f6',
            };
          } else if (piece === 'bK') {
            // Black king moves in dark purple
            styles[square] = {
              backgroundColor: 'rgba(139, 92, 246, 0.7)', // purple
              border: '2px solid #7c3aed',
            };
          } else if (piece === 'bN') {
            // Knight moves in orange
            styles[square] = {
              backgroundColor: 'rgba(251, 146, 60, 0.7)', // orange
              border: '2px solid #ea580c',
            };
          }
        });
      });

      return styles;
    }

    // Proof step highlighting logic
    const currentProofStep = PROOF_STEPS[currentStep];

    switch (currentProofStep.highlightType) {
      case 'bipartite':
        // Show bipartite coloring more clearly
        for (let file = 0; file < 8; file++) {
          for (let rank = 0; rank < 8; rank++) {
            const pos = { file, rank };
            const square = chessEngine.squareFromPosition(pos);
            const isLight = chessEngine.isLightSquare(pos);

            // Don't override check highlighting
            if (styles[square]) continue;

            styles[square] = {
              backgroundColor: isLight ? 'rgba(255, 193, 7, 0.3)' : 'rgba(108, 117, 125, 0.3)',
            };
          }
        }
        break;

      case 'knight-attacks':
        // Highlight all squares attacked by knights
        analysisResult.attackedSquares.forEach((pos) => {
          const square = chessEngine.squareFromPosition(pos);
          const isLight = chessEngine.isLightSquare(pos);

          // Don't override check highlighting
          if (styles[square]) return;

          styles[square] = {
            backgroundColor: isLight ? 'rgba(255, 193, 7, 0.7)' : 'rgba(108, 117, 125, 0.7)',
            border: '2px solid #dc3545',
          };
        });
        break;

      case 'escape-routes':
        // Highlight king adjacent squares and escape routes
        if (boardState.whiteKing && proofData) {
          // Show all adjacent squares to king
          for (let deltaFile = -1; deltaFile <= 1; deltaFile++) {
            for (let deltaRank = -1; deltaRank <= 1; deltaRank++) {
              if (deltaFile === 0 && deltaRank === 0) continue;
              const pos = {
                file: boardState.whiteKing.file + deltaFile,
                rank: boardState.whiteKing.rank + deltaRank,
              };
              if (chessEngine.isValidPosition(pos)) {
                const square = chessEngine.squareFromPosition(pos);
                const isLight = chessEngine.isLightSquare(pos);
                const isUnattackable = proofData.unattackableSquares.some((unattackablePos) =>
                  chessEngine.positionsEqual(pos, unattackablePos)
                );

                // Don't override check highlighting
                if (styles[square]) continue;

                styles[square] = {
                  backgroundColor: isUnattackable
                    ? 'rgba(40, 167, 69, 0.7)' // Green for safe squares
                    : isLight
                    ? 'rgba(255, 193, 7, 0.5)'
                    : 'rgba(108, 117, 125, 0.5)',
                  border: isUnattackable ? '3px solid #28a745' : '1px solid #6c757d',
                };
              }
            }
          }
        }
        break;

      case 'conclusion':
        // Show final result highlighting
        analysisResult.escapeSquares.forEach((pos) => {
          const square = chessEngine.squareFromPosition(pos);

          // Don't override check highlighting
          if (styles[square]) return;

          styles[square] = {
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
            border: '3px solid #28a745',
          };
        });
        break;

      default:
        // Default highlighting
        analysisResult.attackedSquares.forEach((pos) => {
          const square = chessEngine.squareFromPosition(pos);
          const isLight = chessEngine.isLightSquare(pos);

          // Don't override check highlighting
          if (styles[square]) return;

          styles[square] = {
            backgroundColor: isLight ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.5)',
          };
        });

        analysisResult.escapeSquares.forEach((pos) => {
          const square = chessEngine.squareFromPosition(pos);

          // Don't override check highlighting
          if (styles[square]) return;

          styles[square] = {
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
          };
        });
    }

    return styles;
  }, [analysisResult, currentStep, boardState, proofData, showProofSteps]);

  // Scenario handlers
  const handleRandomScenario = () => {
    setBoardState(chessEngine.generateRandomScenario());
  };

  const handleOptimalAttack = () => {
    setBoardState(chessEngine.generateOptimalAttackScenario());
  };

  const handleCounterexample = () => {
    setBoardState(chessEngine.generateCounterexample());
  };

  // Turn control handlers
  const handleSwitchTurn = () => {
    setBoardState((prev) => ({
      ...prev,
      currentTurn: chessEngine.switchTurn(prev.currentTurn),
    }));
  };

  const handleResetToWhiteTurn = () => {
    setBoardState((prev) => ({
      ...prev,
      currentTurn: 'white',
    }));
  };

  const handleStepNavigation = (direction: 'prev' | 'next') => {
    setIsAutoPlaying(false);
    setTimeRemaining(3); // 수동 네비게이션 시 타이머 리셋
    setCurrentStep((prev) => {
      if (direction === 'prev') {
        return prev === 0 ? PROOF_STEPS.length - 1 : prev - 1;
      } else {
        return (prev + 1) % PROOF_STEPS.length;
      }
    });
  };

  const toggleAutoPlay = () => {
    if (!showProofSteps) return; // 증명 과정이 off일 때는 자동재생 불가

    setIsAutoPlaying((prev) => {
      const newValue = !prev;
      if (newValue) {
        setTimeRemaining(3); // 자동재생 시작 시 타이머 리셋
      }
      return newValue;
    });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <h1 className='text-3xl font-bold text-gray-900'>같은 색 나이트 2개로는 체크메이트 불가능</h1>
          <p className='text-lg text-gray-600 mt-2'>이분 그래프 이론과 알고리즘적 접근</p>
          <p className='text-sm text-gray-500 mt-1'>체스판의 수학적 구조를 통한 엄밀한 증명</p>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Panel: Interactive Chessboard */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <h2 className='text-xl font-semibold mb-4'>인터랙티브 체스판</h2>

              <div className='mb-4'>
                <Chessboard
                  options={{
                    position: boardPosition,
                    onPieceDrop: onDrop,
                    squareStyles: customSquareStyles,
                  }}
                />
              </div>

              {/* Turn and Check Status */}
              <div className='mb-4 p-3 bg-gray-50 rounded-lg border'>
                <div className='flex items-center justify-between'>
                  <div>
                    <span className='font-medium text-sm'>현재 턴:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-sm font-bold ${
                        boardState.currentTurn === 'white' ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-white'
                      }`}
                    >
                      {chessEngine.getTurnDisplayName(boardState.currentTurn)}
                    </span>
                  </div>
                  <div>
                    {chessEngine.isCurrentPlayerInCheck(boardState) && (
                      <span className='px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-bold'>체크!</span>
                    )}
                  </div>
                </div>
                <div className='mt-2 text-xs text-gray-600'>
                  {boardState.currentTurn === 'white'
                    ? '흰색 기물(백 킹)을 움직일 수 있습니다.'
                    : '검은색 기물(흑 킹, 나이트)을 움직일 수 있습니다.'}
                </div>
              </div>

              {/* Current Step Indicator */}
              <div className='mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500'>
                <h3 className='font-medium text-sm text-blue-900'>
                  현재 단계 ({currentStep + 1}/{PROOF_STEPS.length}): {PROOF_STEPS[currentStep].title}
                </h3>
                <p className='text-sm text-blue-800 mt-1'>{PROOF_STEPS[currentStep].content}</p>
              </div>

              <div className='space-y-4'>
                <div className='text-sm'>
                  <span className='font-medium'>분석 결과:</span>
                  <p className={`mt-1 ${analysisResult.canCheckmate ? 'text-green-600' : 'text-red-600'}`}>
                    {analysisResult.reason}
                  </p>
                </div>

                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div>
                    <span className='font-medium'>공격 칸:</span> {analysisResult.attackedSquares.length}
                  </div>
                  <div>
                    <span className='font-medium'>탈출 칸:</span> {analysisResult.escapeSquares.length}
                  </div>
                  <div>
                    <span className='font-medium'>현재 턴:</span>{' '}
                    {chessEngine.getTurnDisplayName(boardState.currentTurn)}
                  </div>
                  <div>
                    <span className='font-medium'>체크 상태:</span>
                    <span
                      className={chessEngine.isCurrentPlayerInCheck(boardState) ? 'text-red-600' : 'text-green-600'}
                    >
                      {chessEngine.isCurrentPlayerInCheck(boardState) ? '체크' : '안전'}
                    </span>
                  </div>
                </div>

                {/* 시나리오 테스트 (체스판 섹션으로 이동) */}
                <div className='border-t pt-4'>
                  <h3 className='text-sm font-medium mb-3'>빠른 시나리오 테스트</h3>

                  {/* 보드 설정 */}
                  <div className='space-y-3'>
                    <div>
                      <div className='text-xs text-gray-600 mb-2'>보드 설정</div>
                      <div className='grid grid-cols-1 gap-2'>
                        <button
                          type='button'
                          onClick={handleRandomScenario}
                          className='px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs'
                        >
                          🎲 랜덤 배치 생성
                        </button>
                        <button
                          type='button'
                          onClick={handleOptimalAttack}
                          className='px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs'
                        >
                          ⚔️ 최적 공격 시도
                        </button>
                        <button
                          type='button'
                          onClick={handleCounterexample}
                          className='px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs'
                        >
                          🔍 반례 찾기
                        </button>
                      </div>
                    </div>

                    {/* 턴 제어 */}
                    <div>
                      <div className='text-xs text-gray-600 mb-2'>턴 제어</div>
                      <div className='grid grid-cols-1 gap-2'>
                        <button
                          type='button'
                          onClick={handleSwitchTurn}
                          className='px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs'
                        >
                          🔄 턴 넘기기 ({chessEngine.getTurnDisplayName(chessEngine.switchTurn(boardState.currentTurn))}
                          으로)
                        </button>
                        <button
                          type='button'
                          onClick={handleResetToWhiteTurn}
                          className='px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs'
                        >
                          ↻ 백 턴으로 리셋
                        </button>
                      </div>
                    </div>

                    {/* 증명 제어 */}
                    <div>
                      <div className='text-xs text-gray-600 mb-2'>증명 제어</div>
                      <button
                        type='button'
                        onClick={() => {
                          setCurrentStep(0);
                          setTimeRemaining(3);
                        }}
                        className='w-full px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs'
                      >
                        📊 증명 처음부터
                      </button>
                    </div>

                    {/* 체크 경고 */}
                    {chessEngine.isCurrentPlayerInCheck(boardState) && (
                      <div className='p-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium border border-red-200'>
                        ⚠️ 현재 플레이어가 체크 상태입니다!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Panel: Step-by-step Proof */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <div className='mb-4'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold'>단계별 증명 과정</h2>
                    <button
                      type='button'
                      onClick={() => {
                        setShowProofSteps(!showProofSteps);
                        if (showProofSteps) {
                          // 증명 과정을 끄면 자동재생도 끄기
                          setIsAutoPlaying(false);
                          setTimeRemaining(3);
                        }
                      }}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        showProofSteps
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {showProofSteps ? '증명 ON' : '증명 OFF'}
                    </button>
                  </div>

                  {showProofSteps && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>증명 단계 제어</span>
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={() => handleStepNavigation('prev')}
                          className='px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs'
                        >
                          ◀
                        </button>
                        <button
                          type='button'
                          onClick={toggleAutoPlay}
                          className={`px-3 py-1 rounded text-xs ${
                            isAutoPlaying
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {isAutoPlaying ? '정지' : '자동재생'}
                        </button>
                        <button
                          type='button'
                          onClick={() => handleStepNavigation('next')}
                          className='px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs'
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto-play Timer */}
                {showProofSteps && isAutoPlaying && (
                  <div className='bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-blue-900'>자동재생 중...</span>
                      <span className='text-sm font-bold text-blue-700'>{timeRemaining}초 후 다음 단계</span>
                    </div>
                    <div className='w-full bg-blue-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear'
                        style={{ width: `${((3 - timeRemaining) / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Move Highlights Info when proof steps are off */}
                {!showProofSteps && (
                  <div className='bg-green-50 p-3 rounded-lg border-l-4 border-green-500'>
                    <h3 className='text-sm font-medium text-green-900 mb-2'>이동 가능한 칸 표시</h3>
                    <div className='text-xs text-green-800 space-y-1'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded bg-blue-300 border border-blue-600'></div>
                        <span>백 킹 이동 가능 칸</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded bg-purple-300 border border-purple-600'></div>
                        <span>흑 킹 이동 가능 칸</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded bg-orange-300 border border-orange-600'></div>
                        <span>나이트 이동 가능 칸</span>
                      </div>
                      <div className='mt-2 text-xs'>
                        현재 턴: <strong>{chessEngine.getTurnDisplayName(boardState.currentTurn)}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {showProofSteps && (
                <div className='space-y-4'>
                  {PROOF_STEPS.map((step, index) => (
                    <button
                      key={step.id}
                      type='button'
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer text-left w-full ${
                        currentStep === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setIsAutoPlaying(false);
                        setTimeRemaining(3); // 수동 선택 시 타이머 리셋
                        setCurrentStep(index);
                      }}
                    >
                      <h3 className='font-medium text-sm mb-2'>
                        {index + 1}. {step.title}
                      </h3>
                      <p className='text-sm text-gray-600'>{step.content}</p>
                      {currentStep === index && (
                        <div className='mt-3 p-2 bg-white rounded border'>
                          <p className='text-xs text-gray-700 font-mono'>{step.algorithmExplanation}</p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Mathematical Analysis */}
              {proofData && (
                <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                  <h3 className='font-medium text-sm mb-3'>실시간 수학적 분석</h3>
                  <div className='text-xs space-y-2 font-mono'>
                    <div>
                      나이트 색상: {proofData.sameColorKnights ? '같음' : '다름'} (Knight1:{' '}
                      {proofData.knight1IsLight ? '밝음' : '어두움'}, Knight2:{' '}
                      {proofData.knight2IsLight ? '밝음' : '어두움'})
                    </div>
                    <div>왕 주변 총 칸수: {proofData.totalSquares}</div>
                    <div>
                      밝은 칸: {proofData.lightSquares}, 어두운 칸: {proofData.darkSquares}
                    </div>
                    <div>
                      공격 가능 - 밝은 칸: {proofData.attackedLightSquares}, 어두운 칸: {proofData.attackedDarkSquares}
                    </div>
                    <div className='text-red-600 font-bold'>
                      공격 불가능한 탈출 칸: {proofData.unattackableSquares.length}
                    </div>
                    <div>∴ 체크메이트 {proofData.unattackableSquares.length > 0 ? '불가능' : '가능'}</div>
                  </div>
                </div>
              )}

              {/* Bipartite Graph Visualization */}
              <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                <h3 className='font-medium text-sm mb-2'>이분 그래프 시각화</h3>
                <div className='grid grid-cols-8 gap-1 max-w-[200px]'>
                  {Array.from({ length: 64 }).map((_, i) => {
                    const file = i % 8;
                    const rank = Math.floor(i / 8);
                    const isLight = (file + rank) % 2 === 0;

                    return (
                      <div
                        key={`square-${file}-${rank}`}
                        className={`aspect-square rounded-sm ${isLight ? 'bg-amber-100' : 'bg-amber-800'}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Algorithm Code */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <h2 className='text-xl font-semibold mb-4'>알고리즘 분석</h2>

              <div className='space-y-4'>
                <div className='bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono'>
                  <div className='text-green-400'>{`// 현재 보드 상태 (턴제 시스템)`}</div>
                  <div>
                    currentTurn: "{boardState.currentTurn}" ({chessEngine.getTurnDisplayName(boardState.currentTurn)})
                  </div>
                  <div>isInCheck: {chessEngine.isCurrentPlayerInCheck(boardState).toString()}</div>
                  <div>
                    White King: {boardState.whiteKing ? chessEngine.squareFromPosition(boardState.whiteKing) : 'none'}
                  </div>
                  <div>
                    Black King: {boardState.blackKing ? chessEngine.squareFromPosition(boardState.blackKing) : 'none'}
                  </div>
                  <div>
                    Knight1 (검은색): {boardState.knight1 ? chessEngine.squareFromPosition(boardState.knight1) : 'none'}
                  </div>
                  <div>
                    Knight2 (검은색): {boardState.knight2 ? chessEngine.squareFromPosition(boardState.knight2) : 'none'}
                  </div>
                  <br />
                  <div className='text-green-400'>{`// 이분 그래프 분석`}</div>
                  {proofData && (
                    <>
                      <div>sameColorKnights: {proofData.sameColorKnights.toString()}</div>
                      <div>V₁ (light): {proofData.lightSquares} squares</div>
                      <div>V₂ (dark): {proofData.darkSquares} squares</div>
                      <div>attacked_V₁: {proofData.attackedLightSquares}</div>
                      <div>attacked_V₂: {proofData.attackedDarkSquares}</div>
                      <div>unattackable: {proofData.unattackableSquares.length}</div>
                    </>
                  )}
                  <br />
                  <div className='text-green-400'>{`// 체크메이트 검증`}</div>
                  <div>attackedSquares: {analysisResult.attackedSquares.length}</div>
                  <div>escapeSquares: {analysisResult.escapeSquares.length}</div>
                  <div>canCheckmate: {analysisResult.canCheckmate.toString()}</div>
                </div>

                <div className='text-sm space-y-3'>
                  <div>
                    <h3 className='font-medium mb-2'>알고리즘 복잡도 분석:</h3>
                    <div className='text-xs text-gray-600 space-y-1'>
                      <div>
                        <strong>시간 복잡도:</strong> O(1) - 상수 시간
                      </div>
                      <div>
                        <strong>공간 복잡도:</strong> O(1) - 고정된 64칸
                      </div>
                      <div>
                        <strong>이분 검증:</strong> O(8) - 왕 주변 8칸
                      </div>
                      <div>
                        <strong>나이트 공격:</strong> O(8) - 최대 8방향
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className='font-medium mb-2'>수학적 증명:</h3>
                    <div className='text-xs text-gray-600 space-y-1'>
                      <div>1. G = (V₁ ∪ V₂, E)는 이분 그래프</div>
                      <div>2. ∀ knight ∈ V₁ → attacks ⊆ V₂</div>
                      <div>3. |escape_routes| = |V₁ ∩ adjacent| + |V₂ ∩ adjacent|</div>
                      <div>4. same_color_knights → ∃ unattackable ≠ ∅</div>
                      <div>5. ∴ checkmate = false</div>
                    </div>
                  </div>

                  <div>
                    <h3 className='font-medium mb-2'>집합론적 접근:</h3>
                    <div className='text-xs text-gray-600 space-y-1'>
                      <div>D = dominating set of knights</div>
                      <div>S = king's adjacent squares</div>
                      <div>필요조건: D ⊇ S (완전 지배)</div>
                      <div>이분 제약: |D ∩ V₁| ≤ |knights ∩ V₁| × 8</div>
                      <div>same color → |D ∩ V₂| = 0 ∨ |D ∩ V₁| = 0</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
