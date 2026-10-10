import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { VocabularyStatus } from '../types';
import { sampleStarterVocabulary } from '../data/initialData';

export const VocabularyScreen: React.FC = () => {
  const {
    vocabulary,
    toggleVocabularyStatus,
    speakWord,
    setIsAddVocabModalOpen,
    setSelectedVocabForEdit,
    addVocabulary,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | VocabularyStatus>('all');
  const [audioPlayingWord, setAudioPlayingWord] = useState<string | null>(null);

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isTranslationRevealed, setIsTranslationRevealed] = useState(false);
  const flashcardRef = useRef<HTMLDivElement>(null);

  const filteredWords = useMemo(() => {
    return vocabulary.filter((item) => {
      const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.word.toLowerCase().includes(query) ||
        item.translation.toLowerCase().includes(query) ||
        (item.exampleEn && item.exampleEn.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [vocabulary, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: vocabulary.length,
      review: vocabulary.filter((v) => v.status === 'review').length,
      learning: vocabulary.filter((v) => v.status === 'learning').length,
      learned: vocabulary.filter((v) => v.status === 'learned').length,
    };
  }, [vocabulary]);

  const handleAudioPlay = (word: string) => {
    setAudioPlayingWord(word);
    speakWord(word);
    setTimeout(() => {
      setAudioPlayingWord(null);
    }, 1000);
  };

  const handleAddSampleWords = async () => {
    for (const item of sampleStarterVocabulary) {
      await addVocabulary(item);
    }
  };

  // Deck for flashcards: uses user's own vocabulary if available, or sample
  const studyDeck = vocabulary.length > 0 ? vocabulary : sampleStarterVocabulary;
  const currentCard = studyDeck[flashcardIndex % studyDeck.length];

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-12 space-y-5 px-4 pt-4">
      {/* Header Section */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-lg bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
            </span>
            <span className="text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider">
              Caderno Pessoal
            </span>
          </div>
          <span className="text-xs text-[#94a3b8] bg-[#111726] border border-[#1e293b] px-2.5 py-0.5 rounded-full font-medium">
            Vocabulário
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-[#f1f5f9] tracking-tight font-bold">Vocabulary</h1>
          <button
            onClick={() => setIsAddVocabModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0284c7]/80 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-[#0284c7]/20"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Adicionar Palavra</span>
          </button>
        </div>
        <p className="text-xs text-[#94a3b8]">Palavras e expressões anotadas nos seus estudos.</p>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-4 gap-2">
        <div className="p-3 rounded-xl bg-[#111726] border border-[#1e293b] shadow-xl text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold block">Total</span>
          <span className="font-serif text-xl font-bold text-[#f1f5f9]">{counts.all}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#111726] border border-[#1e293b] shadow-xl text-center">
          <span className="text-[10px] text-[#38bdf8] uppercase font-bold block">Revisar</span>
          <span className="font-serif text-xl font-bold text-[#38bdf8]">{counts.review}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#111726] border border-[#1e293b] shadow-xl text-center">
          <span className="text-[10px] text-[#f59e0b] uppercase font-bold block">Estudo</span>
          <span className="font-serif text-xl font-bold text-[#f59e0b]">{counts.learning}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#111726] border border-[#1e293b] shadow-xl text-center">
          <span className="text-[10px] text-[#10b981] uppercase font-bold block">Aprendidas</span>
          <span className="font-serif text-xl font-bold text-[#10b981]">{counts.learned}</span>
        </div>
      </section>

      {/* Search & Filter Controls */}
      <section className="space-y-2.5">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar palavra, significado ou exemplo..."
            className="w-full h-10 pl-10 pr-4 bg-[#111726] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] placeholder:text-[#64748b] outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'review', 'learning', 'learned'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                activeFilter === status
                  ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                  : 'bg-[#111726] text-[#94a3b8] border-[#1e293b]'
              }`}
            >
              {status === 'all'
                ? `Todas (${counts.all})`
                : status === 'review'
                ? `Para revisar (${counts.review})`
                : status === 'learning'
                ? `Em aprendizado (${counts.learning})`
                : `Aprendidas (${counts.learned})`}
            </button>
          ))}
        </div>
      </section>

      {/* Word Cards Feed */}
      <section className="space-y-3">
        {filteredWords.map((item) => (
          <article
            key={item.id}
            className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-lg font-bold text-[#f1f5f9]">{item.word}</h2>
                  {item.phonetic && (
                    <span className="text-xs text-[#64748b]">{item.phonetic}</span>
                  )}
                  {item.category && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#182236] text-[#94a3b8] border border-[#1e293b]">
                      {item.category}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-[#38bdf8] mt-0.5">{item.translation}</span>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                  item.status === 'learned'
                    ? 'bg-[#10b981]/20 border-[#10b981]/40 text-[#10b981]'
                    : item.status === 'review'
                    ? 'bg-[#0284c7]/20 border-[#38bdf8]/40 text-[#38bdf8]'
                    : 'bg-[#f59e0b]/20 border-[#f59e0b]/40 text-[#f59e0b]'
                }`}
              >
                {item.status === 'learned'
                  ? 'Aprendida'
                  : item.status === 'review'
                  ? 'Para revisar'
                  : 'Em estudo'}
              </span>
            </div>

            {/* Example sentence */}
            {item.exampleEn && (
              <div className="p-3 rounded-xl bg-[#182236] border border-[#1e293b] space-y-1">
                <p className="text-xs text-[#f1f5f9]">&ldquo;{item.exampleEn}&rdquo;</p>
                {item.examplePt && (
                  <p className="text-[11px] text-[#94a3b8] italic">&ldquo;{item.examplePt}&rdquo;</p>
                )}
              </div>
            )}

            {/* Context Origin */}
            {item.contextSource && (
              <span className="text-[11px] text-[#64748b] block">
                Origem: {item.contextSource}
              </span>
            )}

            {/* Footer controls */}
            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAudioPlay(item.word)}
                  className={`w-8 h-8 rounded-full bg-[#182236] flex items-center justify-center transition-all ${
                    audioPlayingWord === item.word ? 'text-[#38bdf8] ring-1 ring-[#38bdf8]' : 'text-[#94a3b8] hover:text-[#38bdf8]'
                  }`}
                  title="Ouvir pronúncia"
                >
                  <span className="material-symbols-outlined text-[16px]">volume_up</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedVocabForEdit(item);
                    setIsAddVocabModalOpen(true);
                  }}
                  className="w-8 h-8 rounded-full bg-[#182236] text-[#94a3b8] hover:text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>

              <button
                onClick={() => toggleVocabularyStatus(item.id, item.status === 'learned' ? 'review' : 'learned')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  item.status === 'learned'
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                    : 'bg-[#182236] text-[#94a3b8] border border-[#1e293b] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {item.status === 'learned' ? 'check_circle' : 'check'}
                </span>
                <span>{item.status === 'learned' ? 'Memorizada' : 'Marcar Aprendida'}</span>
              </button>
            </div>
          </article>
        ))}

        {filteredWords.length === 0 && (
          <div className="bg-[#111726] border border-[#1e293b] rounded-2xl p-8 text-center space-y-3">
            <span className="material-symbols-outlined text-[#64748b] text-3xl">auto_stories</span>
            <h3 className="text-sm font-bold text-[#f1f5f9]">Caderno limpo para novos termos</h3>
            <p className="text-xs text-[#94a3b8] max-w-xs mx-auto">
              Adicione suas próprias expressões conforme aprende em podcasts, séries ou livros.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsAddVocabModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-[#0284c7] text-white text-xs font-semibold rounded-xl shadow-md"
              >
                + Adicionar Palavra
              </button>
              <button
                onClick={handleAddSampleWords}
                className="w-full sm:w-auto px-4 py-2 bg-[#182236] text-[#38bdf8] border border-[#38bdf8]/30 rounded-xl text-xs font-semibold hover:bg-[#1e293b]"
              >
                Carregar Exemplo Inicial
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quick Flashcard Widget */}
      {studyDeck.length > 0 && currentCard && (
        <section ref={flashcardRef} className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">bolt</span>
              <h3 className="text-sm font-bold text-[#f1f5f9]">Revisão Rápida (Flashcards)</h3>
            </div>
            <span className="text-[11px] text-[#64748b]">
              Cartão {(flashcardIndex % studyDeck.length) + 1} de {studyDeck.length}
            </span>
          </div>

          <div className="bg-[#111726] border border-[#1e293b] rounded-2xl p-5 shadow-2xl flex flex-col items-center justify-between min-h-[200px] text-center">
            <div className="w-full flex justify-between text-[11px] text-[#64748b]">
              <span>Toque para revelar significado</span>
              <span className="uppercase font-bold text-[#38bdf8]">ING → PT</span>
            </div>

            <div
              onClick={() => setIsTranslationRevealed(!isTranslationRevealed)}
              className="my-4 cursor-pointer select-none space-y-1 w-full"
            >
              <h4 className="font-serif text-3xl font-bold text-[#f1f5f9]">
                {currentCard.word}
              </h4>
              {currentCard.phonetic && (
                <span className="text-xs text-[#64748b] block">{currentCard.phonetic}</span>
              )}

              {isTranslationRevealed ? (
                <div className="mt-3 p-3 rounded-xl bg-[#182236] border border-[#38bdf8]/30 text-center animate-fade-in">
                  <p className="font-serif text-base text-[#38bdf8] font-bold">
                    &ldquo;{currentCard.translation}&rdquo;
                  </p>
                  {currentCard.exampleEn && (
                    <p className="text-[11px] text-[#94a3b8] mt-1 italic">{currentCard.exampleEn}</p>
                  )}
                </div>
              ) : (
                <div className="mt-3 py-2 text-xs text-[#64748b] border border-dashed border-[#1e293b] rounded-lg">
                  (Toque para revelar a tradução)
                </div>
              )}
            </div>

            <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-[#1e293b]">
              <button
                onClick={() => {
                  setIsTranslationRevealed(false);
                  setFlashcardIndex((prev) => prev + 1);
                }}
                className="py-2 rounded-xl bg-[#182236] text-[#94a3b8] hover:text-white text-xs font-semibold"
              >
                Revisar Novamente
              </button>
              <button
                onClick={() => {
                  setIsTranslationRevealed(false);
                  setFlashcardIndex((prev) => prev + 1);
                }}
                className="py-2 rounded-xl bg-[#10b981] text-white text-xs font-semibold hover:bg-[#059669]"
              >
                Acertei!
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
