import { useState, useEffect } from 'react';
import type { PracticeSet, WordItem, StepType, ScanResult } from './types/phonics';
import { storageService } from './services/storageService';
import { createWordItem } from './data/phonicsEngine';
import { MobileFrame } from './components/common/MobileFrame';
import { WordHeader } from './components/learn/WordHeader';
import { StepProgressBar } from './components/learn/StepProgressBar';
import { LearnStep } from './components/learn/LearnStep';
import { ReadStep } from './components/learn/ReadStep';
import { QuizStep } from './components/learn/QuizStep';
import { SplitStep } from './components/learn/SplitStep';
import { BlendStep } from './components/learn/BlendStep';
import { WriteStep } from './components/learn/WriteStep';
import { CameraScanner } from './components/scan/CameraScanner';
import { VisualWordPicker } from './components/scan/VisualWordPicker';
import { PracticeSetList } from './components/sets/PracticeSetList';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/auth/AuthModal';

function MainApp() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline');

  // Navigation screen
  const [currentScreen, setCurrentScreen] = useState<'sets' | 'scanner' | 'picker' | 'learn'>('sets');

  // Practice sets state
  const [sets, setSets] = useState<PracticeSet[]>(() => storageService.getPracticeSets());
  const [currentSet, setCurrentSet] = useState<PracticeSet | null>(() => {
    const loaded = storageService.getPracticeSets();
    return loaded.length > 0 ? loaded[0] : null;
  });
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<StepType>('learn');
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Sync / Load sets whenever the user login state changes
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      if (user?.id) {
        setSyncStatus('syncing');
        const cloudSets = await storageService.fetchCloudSets(user.id);
        if (!isCancelled) {
          setSets(cloudSets);
          if (cloudSets.length > 0) {
            setCurrentSet(cloudSets[0]);
          }
          setSyncStatus('synced');
        }
      } else {
        const localSets = storageService.getPracticeSets();
        if (!isCancelled) {
          setSets(localSets);
          if (localSets.length > 0) {
            setCurrentSet(localSets[0]);
          }
          setSyncStatus('offline');
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  const currentWord: WordItem | undefined = currentSet?.words[currentWordIndex];

  // Handlers for switching words
  const handleSelectWord = (index: number) => {
    setCurrentWordIndex(index);
    setCurrentStep('learn'); // Return to step 1 upon word switch
  };

  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setCurrentStep('learn');
    }
  };

  const handleNextWord = () => {
    if (currentSet && currentWordIndex < currentSet.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentStep('learn');
    }
  };

  const handleToggleFavorite = () => {
    if (!currentWord) return;
    const isFav = storageService.toggleWordFavorite(currentWord.id, user?.id);
    if (currentSet) {
      const updatedWords = currentSet.words.map((w) =>
        w.id === currentWord.id ? { ...w, isFavorite: isFav } : w
      );
      setCurrentSet({ ...currentSet, words: updatedWords });
    }
  };

  // Step advancement flow: 学 -> 读 -> 选 -> 拆 -> 拼 -> 写
  const handleStartPracticeFromLearn = () => {
    setCurrentStep('read');
  };

  const handleCompleteRead = () => {
    setCurrentStep('quiz');
  };

  const handleCompleteQuiz = () => {
    setCurrentStep('split');
  };

  const handleCompleteSplit = () => {
    setCurrentStep('blend');
  };

  const handleCompleteBlend = () => {
    setCurrentStep('write');
  };

  const handleFinishWrite = () => {
    // Return to sets or restart
    setCurrentScreen('sets');
  };

  // Scan & Picker flow
  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    setCurrentScreen('picker');
  };

  const handleCreatePracticeSet = (selectedWords: string[], title: string) => {
    // Enrich all words through Phonics Engine
    const wordItems = selectedWords.map((w) => createWordItem(w));
    const newSet = storageService.createPracticeSet(title, wordItems, undefined, undefined, user?.id);
    
    // Update local state
    setSets(storageService.getPracticeSets(user?.id));
    setCurrentSet(newSet);
    setCurrentWordIndex(0);
    setCurrentStep('learn');
    setCurrentScreen('learn');
  };

  return (
    <MobileFrame
      activeScreen={currentScreen}
      onScanClick={() => setCurrentScreen('scanner')}
      onHomeClick={() => setCurrentScreen('sets')}
    >
      {/* 1. Practice Sets Overview Screen */}
      {currentScreen === 'sets' && (
        <PracticeSetList
          sets={sets}
          onSelectSet={(set) => {
            setCurrentSet(set);
            setCurrentWordIndex(0);
            setCurrentStep('learn');
            setCurrentScreen('learn');
          }}
          onStartScan={() => setCurrentScreen('scanner')}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          syncStatus={syncStatus}
        />
      )}

      {/* 2. Camera Scanner Viewfinder Screen */}
      {currentScreen === 'scanner' && (
        <CameraScanner
          onBack={() => setCurrentScreen('sets')}
          onScanComplete={handleScanComplete}
        />
      )}

      {/* 3. Visual Word Picker on Scanned Image */}
      {currentScreen === 'picker' && scanResult && (
        <VisualWordPicker
          scanResult={scanResult}
          onBack={() => setCurrentScreen('scanner')}
          onCreatePracticeSet={handleCreatePracticeSet}
        />
      )}

      {/* 4. The 6-Step Phonics Practice Experience (Learn Screen) */}
      {currentScreen === 'learn' && currentSet && currentWord && (
        <div className="flex-1 flex flex-col justify-between h-full bg-[#f8f7fe]">
          {/* Top Word Carousel & Back Navigation */}
          <WordHeader
            words={currentSet.words}
            currentIndex={currentWordIndex}
            onSelectWord={handleSelectWord}
            onBack={() => setCurrentScreen('sets')}
            showTranslation={showTranslation}
            onToggleTranslation={() => setShowTranslation(!showTranslation)}
          />

          {/* 6-Step Flow Indicator: 学 - 读 - 选 - 拆 - 拼 - 写 */}
          <StepProgressBar
            currentStep={currentStep}
            onStepChange={(step) => setCurrentStep(step)}
          />

          {/* Step 1: 【学】(Learn) */}
          {currentStep === 'learn' && (
            <LearnStep
              key={currentWord.id}
              word={currentWord}
              showTranslation={showTranslation}
              onStartPractice={handleStartPracticeFromLearn}
              onPrevWord={handlePrevWord}
              onNextWord={handleNextWord}
              onToggleFavorite={handleToggleFavorite}
              hasPrev={currentWordIndex > 0}
              hasNext={currentWordIndex < currentSet.words.length - 1}
            />
          )}

          {/* Step 2: 【读】(Read) - Phonics Blending & Voice Recording */}
          {currentStep === 'read' && (
            <ReadStep
              key={currentWord.id}
              word={currentWord}
              onComplete={handleCompleteRead}
            />
          )}

          {/* Step 3: 【选】(Quiz) - Listen & Select */}
          {currentStep === 'quiz' && (
            <QuizStep
              key={currentWord.id}
              word={currentWord}
              allWords={currentSet.words}
              onComplete={handleCompleteQuiz}
            />
          )}

          {/* Step 4: 【拆】(Split) - Syllable Division */}
          {currentStep === 'split' && (
            <SplitStep
              key={currentWord.id}
              word={currentWord}
              onComplete={handleCompleteSplit}
            />
          )}

          {/* Step 5: 【拼】(Blend) - Phonics Tiles Puzzle */}
          {currentStep === 'blend' && (
            <BlendStep
              key={currentWord.id}
              word={currentWord}
              onComplete={handleCompleteBlend}
            />
          )}

          {/* Step 6: 【写】(Write) - Spelling Dictation & Celebration */}
          {currentStep === 'write' && (
            <WriteStep
              key={currentWord.id}
              word={currentWord}
              hasNextWord={currentWordIndex < currentSet.words.length - 1}
              onNextWord={handleNextWord}
              onFinishSet={handleFinishWrite}
            />
          )}
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </MobileFrame>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
